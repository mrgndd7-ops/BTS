-- Migration: Remove Traccar-specific fields
-- Description: Clean up unused Traccar integration fields from gps_locations table
-- Date: 2026-02-02
-- WARNING: Bu migration geri alınamaz! Traccar verileri silinecek.

BEGIN;

-- STEP 1: Drop views that depend on tables/columns
DROP VIEW IF EXISTS unmapped_devices;

-- STEP 2: Drop indexes before dropping columns
DROP INDEX IF EXISTS idx_gps_source;
DROP INDEX IF EXISTS idx_gps_traccar_position;
DROP INDEX IF EXISTS idx_gps_traccar_position_unique;
DROP INDEX IF EXISTS idx_gps_unmapped_devices;

-- STEP 3: Drop device mapping table if exists
DROP TABLE IF EXISTS device_mappings CASCADE;

-- STEP 4: Drop Traccar-specific columns from gps_locations
ALTER TABLE gps_locations 
  DROP COLUMN IF EXISTS source,
  DROP COLUMN IF EXISTS traccar_position_id;

-- STEP 5: Remove Traccar-related constraints (if any)
ALTER TABLE gps_locations 
  DROP CONSTRAINT IF EXISTS gps_locations_source_check;

-- STEP 6: Update comments
COMMENT ON COLUMN gps_locations.device_id 
IS 'Device unique identifier - used for GPS tracking (Radar.io compatible)';

COMMENT ON TABLE gps_locations 
IS 'Real-time GPS location data from mobile devices. Compatible with Radar.io SDK.';

COMMIT;

-- Verify
DO $$
BEGIN
  RAISE NOTICE '✅ Traccar cleanup migration completed successfully!';
  RAISE NOTICE '   - Dropped: source, traccar_position_id columns';
  RAISE NOTICE '   - Dropped: device_mappings table';
  RAISE NOTICE '   - Dropped: unmapped_devices view';
  RAISE NOTICE '   - Dropped: 4 indexes';
END $$;
