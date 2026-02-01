-- COMPREHENSIVE FIX: All potential GPS tracking issues
-- This migration fixes all known issues and prevents future errors

-- ============================================
-- PART 1: Fix user_id nullable constraint
-- ============================================
ALTER TABLE gps_locations 
ALTER COLUMN user_id DROP NOT NULL;

-- ============================================
-- PART 2: Add check constraints for data integrity
-- ============================================

-- Ensure at least device_id or user_id exists
ALTER TABLE gps_locations
DROP CONSTRAINT IF EXISTS gps_locations_identifier_check;

ALTER TABLE gps_locations
ADD CONSTRAINT gps_locations_identifier_check 
CHECK (user_id IS NOT NULL OR device_id IS NOT NULL);

-- Ensure valid coordinates
ALTER TABLE gps_locations
DROP CONSTRAINT IF EXISTS gps_locations_coordinates_check;

ALTER TABLE gps_locations
ADD CONSTRAINT gps_locations_coordinates_check 
CHECK (
  latitude BETWEEN -90 AND 90 AND 
  longitude BETWEEN -180 AND 180
);

-- Ensure valid percentages for battery
ALTER TABLE gps_locations
DROP CONSTRAINT IF EXISTS gps_locations_battery_check;

ALTER TABLE gps_locations
ADD CONSTRAINT gps_locations_battery_check 
CHECK (battery_level IS NULL OR (battery_level >= 0 AND battery_level <= 100));

-- Ensure valid speed (m/s, max ~120 m/s = ~432 km/h)
ALTER TABLE gps_locations
DROP CONSTRAINT IF EXISTS gps_locations_speed_check;

ALTER TABLE gps_locations
ADD CONSTRAINT gps_locations_speed_check 
CHECK (speed IS NULL OR (speed >= 0 AND speed < 120));

-- Ensure valid heading (0-360 degrees)
ALTER TABLE gps_locations
DROP CONSTRAINT IF EXISTS gps_locations_heading_check;

ALTER TABLE gps_locations
ADD CONSTRAINT gps_locations_heading_check 
CHECK (heading IS NULL OR (heading >= 0 AND heading < 360));

-- ============================================
-- PART 3: Add helpful indexes
-- ============================================

-- Index for unmapped devices (admin dashboard)
CREATE INDEX IF NOT EXISTS idx_gps_unmapped_devices 
ON gps_locations(device_id, recorded_at DESC) 
WHERE user_id IS NULL;

-- Index for device lookup (mapping)
CREATE INDEX IF NOT EXISTS idx_gps_device_latest 
ON gps_locations(device_id, recorded_at DESC);

-- Index for time-based queries
CREATE INDEX IF NOT EXISTS idx_gps_recorded_at 
ON gps_locations(recorded_at DESC);

-- Index for municipality queries
CREATE INDEX IF NOT EXISTS idx_gps_municipality_time 
ON gps_locations(municipality_id, recorded_at DESC)
WHERE municipality_id IS NOT NULL;

-- ============================================
-- PART 4: Add helpful views for admins
-- ============================================

-- View: Unmapped devices that need user assignment
CREATE OR REPLACE VIEW unmapped_devices AS
SELECT DISTINCT
  device_id,
  COUNT(*) as location_count,
  MAX(recorded_at) as last_seen,
  MIN(recorded_at) as first_seen,
  AVG(battery_level) as avg_battery,
  MAX(battery_level) as last_battery
FROM gps_locations
WHERE user_id IS NULL
GROUP BY device_id
ORDER BY last_seen DESC;

-- View: GPS activity summary
CREATE OR REPLACE VIEW gps_activity_summary AS
SELECT
  COALESCE(p.full_name, 'Unmapped: ' || g.device_id) as identifier,
  g.user_id,
  g.device_id,
  g.municipality_id,
  m.name as municipality_name,
  COUNT(*) as total_locations,
  MAX(g.recorded_at) as last_location_time,
  AVG(g.speed) as avg_speed,
  AVG(g.battery_level) as avg_battery
FROM gps_locations g
LEFT JOIN profiles p ON g.user_id = p.id
LEFT JOIN municipalities m ON g.municipality_id = m.id
GROUP BY g.user_id, g.device_id, g.municipality_id, p.full_name, m.name
ORDER BY last_location_time DESC;

-- ============================================
-- PART 5: Add comments for documentation
-- ============================================

COMMENT ON COLUMN gps_locations.user_id 
IS 'User ID (nullable) - NULL for unmapped devices';

COMMENT ON COLUMN gps_locations.device_id 
IS 'Traccar device ID - required for tracking before user mapping';

COMMENT ON COLUMN gps_locations.municipality_id 
IS 'Municipality ID (nullable) - NULL until device is mapped to user';

COMMENT ON CONSTRAINT gps_locations_identifier_check ON gps_locations 
IS 'Ensures every GPS location has at least user_id or device_id';

COMMENT ON CONSTRAINT gps_locations_coordinates_check ON gps_locations 
IS 'Validates latitude (-90 to 90) and longitude (-180 to 180)';

COMMENT ON VIEW unmapped_devices 
IS 'Lists devices sending GPS data but not yet mapped to users';

COMMENT ON VIEW gps_activity_summary 
IS 'GPS tracking activity summary per user/device';

-- ============================================
-- PART 6: Verify everything
-- ============================================

-- Check user_id is nullable
SELECT 
  column_name,
  is_nullable,
  CASE WHEN is_nullable = 'YES' THEN '✅' ELSE '❌' END as status
FROM information_schema.columns
WHERE table_name = 'gps_locations' AND column_name = 'user_id';

-- Check constraints exist
SELECT 
  constraint_name,
  '✅ Exists' as status
FROM information_schema.table_constraints
WHERE table_name = 'gps_locations' 
  AND constraint_type = 'CHECK'
ORDER BY constraint_name;

-- Check indexes exist
SELECT 
  indexname,
  '✅ Exists' as status
FROM pg_indexes
WHERE tablename = 'gps_locations'
ORDER BY indexname;

-- Check views exist
SELECT 
  table_name,
  '✅ Exists' as status
FROM information_schema.views
WHERE table_name IN ('unmapped_devices', 'gps_activity_summary');

-- Test query: Show any unmapped devices
SELECT * FROM unmapped_devices LIMIT 5;
