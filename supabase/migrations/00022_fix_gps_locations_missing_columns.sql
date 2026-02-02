-- CRITICAL FIX: Add missing device_id and municipality_id columns to gps_locations
-- Date: 2026-02-02
-- Description: These columns are required by frontend but were never added to the schema

BEGIN;

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

COMMIT;

-- Verify the changes
DO $$
DECLARE
  device_id_exists BOOLEAN;
  municipality_id_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gps_locations' AND column_name = 'device_id'
  ) INTO device_id_exists;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gps_locations' AND column_name = 'municipality_id'
  ) INTO municipality_id_exists;

  IF device_id_exists AND municipality_id_exists THEN
    RAISE NOTICE '✅ GPS locations table structure fixed successfully!';
    RAISE NOTICE '   - device_id: %', device_id_exists;
    RAISE NOTICE '   - municipality_id: %', municipality_id_exists;
  ELSE
    RAISE WARNING '❌ Migration may have failed!';
  END IF;
END $$;

-- Show final schema
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'gps_locations'
ORDER BY ordinal_position;
