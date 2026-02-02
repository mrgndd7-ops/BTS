-- Improve GPS RLS policies with municipality_id
-- Date: 2026-02-02
-- Description: Use municipality_id for better tenant isolation in GPS tables

BEGIN;

-- ============================================
-- GPS_LOCATIONS POLICIES - Improved with municipality_id
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
-- GPS_TRACES POLICIES - Already handled in 00023
-- ============================================

COMMIT;

-- Verify
DO $$
BEGIN
  RAISE NOTICE '✅ GPS RLS policies improved with municipality isolation!';
  RAISE NOTICE '   - Personnel: INSERT own + SELECT own';
  RAISE NOTICE '   - Admins: SELECT all in municipality';
END $$;
