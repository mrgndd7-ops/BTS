-- ============================================
-- BTS MIGRATION APPLICATION SCRIPT
-- Date: 2026-02-02
-- Description: Apply migrations 22-27 in correct order
-- ============================================

-- ============================================
-- MIGRATION 22: Add missing columns to gps_locations
-- ============================================

-- 1. Add device_id column (required for Radar.io tracking)
ALTER TABLE gps_locations
ADD COLUMN IF NOT EXISTS device_id TEXT NOT NULL DEFAULT 'unknown';

-- 2. Add municipality_id column (for multi-tenant data isolation)
ALTER TABLE gps_locations
ADD COLUMN IF NOT EXISTS municipality_id UUID REFERENCES municipalities(id) ON DELETE CASCADE;

-- 3. Remove default from device_id (was only for migration safety)
ALTER TABLE gps_locations 
ALTER COLUMN device_id DROP DEFAULT;

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_gps_device_id ON gps_locations(device_id);
CREATE INDEX IF NOT EXISTS idx_gps_municipality ON gps_locations(municipality_id);
CREATE INDEX IF NOT EXISTS idx_gps_device_time ON gps_locations(device_id, recorded_at DESC);

-- 5. Add municipality_id to existing records (from user's profile)
UPDATE gps_locations gl
SET municipality_id = p.municipality_id
FROM profiles p
WHERE gl.user_id = p.id
AND gl.municipality_id IS NULL;

-- 6. Add comments
COMMENT ON COLUMN gps_locations.device_id IS 'Device unique identifier for GPS tracking (Radar.io web SDK)';
COMMENT ON COLUMN gps_locations.municipality_id IS 'Municipality ID for multi-tenant data isolation';

-- ============================================
-- MIGRATION 23: Fix gps_traces RLS policies
-- ============================================

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can view municipality traces" ON gps_traces;
DROP POLICY IF EXISTS "Admins can manage traces" ON gps_traces;

-- 1. Allow personnel to INSERT traces for their own completed tasks
CREATE POLICY "Personnel can insert own task traces"
  ON gps_traces FOR INSERT
  WITH CHECK (
    task_id IN (
      SELECT id FROM tasks WHERE assigned_to = auth.uid()
    )
  );

-- 2. Allow users to view traces from their municipality
CREATE POLICY "Users can view municipality traces"
  ON gps_traces FOR SELECT
  USING (municipality_id = get_user_municipality_id());

-- 3. Allow admins to manage all traces in their municipality
CREATE POLICY "Admins can manage municipality traces"
  ON gps_traces FOR ALL
  USING (
    municipality_id = get_user_municipality_id()
    AND get_user_role() IN ('admin', 'supervisor')
  );

-- ============================================
-- MIGRATION 24: Auto-populate gps_trace municipality
-- ============================================

-- Create trigger function to auto-populate municipality_id
CREATE OR REPLACE FUNCTION populate_gps_trace_municipality()
RETURNS TRIGGER AS $$
BEGIN
  -- If municipality_id not provided, get it from the task
  IF NEW.municipality_id IS NULL AND NEW.task_id IS NOT NULL THEN
    SELECT municipality_id INTO NEW.municipality_id
    FROM tasks
    WHERE id = NEW.task_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS gps_trace_municipality_trigger ON gps_traces;
CREATE TRIGGER gps_trace_municipality_trigger
  BEFORE INSERT ON gps_traces
  FOR EACH ROW
  EXECUTE FUNCTION populate_gps_trace_municipality();

-- Add comment
COMMENT ON FUNCTION populate_gps_trace_municipality() 
IS 'Auto-populates municipality_id from task when inserting GPS trace';

-- ============================================
-- MIGRATION 25: Auto-populate gps_location municipality
-- ============================================

-- Create trigger function to auto-populate municipality_id
CREATE OR REPLACE FUNCTION populate_gps_location_municipality()
RETURNS TRIGGER AS $$
BEGIN
  -- If municipality_id not provided, get it from the user's profile
  IF NEW.municipality_id IS NULL AND NEW.user_id IS NOT NULL THEN
    SELECT municipality_id INTO NEW.municipality_id
    FROM profiles
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS gps_location_municipality_trigger ON gps_locations;
CREATE TRIGGER gps_location_municipality_trigger
  BEFORE INSERT ON gps_locations
  FOR EACH ROW
  EXECUTE FUNCTION populate_gps_location_municipality();

-- Add comment
COMMENT ON FUNCTION populate_gps_location_municipality() 
IS 'Auto-populates municipality_id from user profile when inserting GPS location';

-- ============================================
-- MIGRATION 26: Improve GPS RLS with municipality
-- ============================================

DROP POLICY IF EXISTS "Users can insert own location" ON gps_locations;
DROP POLICY IF EXISTS "Admins can view municipality locations" ON gps_locations;
DROP POLICY IF EXISTS "Users can view own locations" ON gps_locations;

-- 1. Personnel can insert their own locations (municipality_id auto-populated by trigger)
CREATE POLICY "Personnel can insert own location"
  ON gps_locations FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- 2. Users can view their own locations
CREATE POLICY "Personnel can view own locations"
  ON gps_locations FOR SELECT
  USING (user_id = auth.uid());

-- 3. Admins can view all locations in their municipality
CREATE POLICY "Admins can view municipality locations"
  ON gps_locations FOR SELECT
  USING (
    municipality_id = get_user_municipality_id()
    AND get_user_role() IN ('admin', 'supervisor')
  );

-- ============================================
-- MIGRATION 27: Fix function column names
-- ============================================

-- 1. Fix get_personnel_active_tasks function
CREATE OR REPLACE FUNCTION get_personnel_active_tasks(personnel_uuid UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM tasks
  WHERE assigned_to = personnel_uuid
    AND status IN ('assigned', 'in_progress')
$$ LANGUAGE SQL STABLE;

-- 2. Fix get_municipality_stats function
CREATE OR REPLACE FUNCTION get_municipality_stats(municipality_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'active_tasks', (
      SELECT COUNT(*) FROM tasks
      WHERE municipality_id = municipality_uuid
        AND status IN ('assigned', 'in_progress')
    ),
    'active_personnel', (
      SELECT COUNT(*) FROM profiles
      WHERE municipality_id = municipality_uuid
        AND role = 'personnel'
        AND status = 'active'
    ),
    'total_routes', (
      SELECT COUNT(*) FROM routes
      WHERE municipality_id = municipality_uuid
        AND active = true
    ),
    'completed_tasks_today', (
      SELECT COUNT(*) FROM tasks
      WHERE municipality_id = municipality_uuid
        AND status = 'completed'
        AND DATE(completed_at) = CURRENT_DATE
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE;

-- Add comments
COMMENT ON FUNCTION get_personnel_active_tasks(UUID) 
IS 'Returns count of active tasks for a personnel (using assigned_to column)';

COMMENT ON FUNCTION get_municipality_stats(UUID) 
IS 'Returns statistics for a municipality (using current status values)';

-- ============================================
-- FINAL VERIFICATION
-- ============================================

-- Check gps_locations schema
SELECT 'GPS LOCATIONS SCHEMA:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'gps_locations'
ORDER BY ordinal_position;

-- Check policies
SELECT 'GPS RLS POLICIES:' as info;
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename IN ('gps_locations', 'gps_traces')
ORDER BY tablename, policyname;

-- Check triggers
SELECT 'GPS TRIGGERS:' as info;
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE event_object_table IN ('gps_locations', 'gps_traces')
ORDER BY event_object_table, trigger_name;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '🎉 ===================================';
  RAISE NOTICE '🎉 ALL MIGRATIONS APPLIED SUCCESSFULLY!';
  RAISE NOTICE '🎉 ===================================';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Migration 22: gps_locations columns added';
  RAISE NOTICE '✅ Migration 23: gps_traces RLS fixed';
  RAISE NOTICE '✅ Migration 24: GPS trace auto-population trigger';
  RAISE NOTICE '✅ Migration 25: GPS location auto-population trigger';
  RAISE NOTICE '✅ Migration 26: GPS RLS improved';
  RAISE NOTICE '✅ Migration 27: Database functions updated';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Database ready for deployment!';
END $$;
