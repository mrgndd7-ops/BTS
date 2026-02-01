-- Fix gps_locations table to allow null user_id
-- This allows Traccar devices to send GPS data before being mapped to a user

-- Step 1: Make user_id nullable
ALTER TABLE gps_locations 
ALTER COLUMN user_id DROP NOT NULL;

-- Step 2: Verify the change
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'gps_locations' 
  AND column_name = 'user_id';

-- Step 3: Add check constraint to ensure either user_id or device_id exists
-- (A GPS location must have at least one identifier)
ALTER TABLE gps_locations
DROP CONSTRAINT IF EXISTS gps_locations_identifier_check;

ALTER TABLE gps_locations
ADD CONSTRAINT gps_locations_identifier_check 
CHECK (user_id IS NOT NULL OR device_id IS NOT NULL);

-- Step 4: Add index for unmapped devices (for admin dashboard)
CREATE INDEX IF NOT EXISTS idx_gps_unmapped_devices 
ON gps_locations(device_id) 
WHERE user_id IS NULL;

-- Step 5: Add comment
COMMENT ON CONSTRAINT gps_locations_identifier_check ON gps_locations 
IS 'Ensures every GPS location has at least user_id or device_id for identification';

-- Verify
SELECT 
  'user_id is now nullable: ' || 
  CASE WHEN is_nullable = 'YES' THEN '✅ SUCCESS' ELSE '❌ FAILED' END as status
FROM information_schema.columns
WHERE table_name = 'gps_locations' AND column_name = 'user_id';
