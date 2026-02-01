-- MIGRATION: 00015_comprehensive_gps_fixes.sql
-- Date: 2024-01-30
-- Description: Fixes all GPS tracking issues including nullable user_id

BEGIN;

-- 1. Make user_id nullable (allows unmapped devices)
ALTER TABLE gps_locations ALTER COLUMN user_id DROP NOT NULL;

-- 2. Add safety constraints
ALTER TABLE gps_locations ADD CONSTRAINT gps_locations_identifier_check 
  CHECK (user_id IS NOT NULL OR device_id IS NOT NULL);

ALTER TABLE gps_locations ADD CONSTRAINT gps_locations_coordinates_check 
  CHECK (latitude BETWEEN -90 AND 90 AND longitude BETWEEN -180 AND 180);

ALTER TABLE gps_locations ADD CONSTRAINT gps_locations_battery_check 
  CHECK (battery_level IS NULL OR (battery_level >= 0 AND battery_level <= 100));

-- 3. Add performance indexes
CREATE INDEX IF NOT EXISTS idx_gps_unmapped_devices 
  ON gps_locations(device_id, recorded_at DESC) WHERE user_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_gps_device_latest 
  ON gps_locations(device_id, recorded_at DESC);

-- 4. Create admin helper view
CREATE OR REPLACE VIEW unmapped_devices AS
  SELECT DISTINCT device_id, COUNT(*) as location_count, MAX(recorded_at) as last_seen
  FROM gps_locations WHERE user_id IS NULL GROUP BY device_id;

COMMIT;

-- Verify
SELECT 'Migration completed successfully!' as status;
