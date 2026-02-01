-- Add municipality_id column to gps_locations table
-- This will make it compatible with existing RLS policies

-- Step 1: Add the column
ALTER TABLE gps_locations 
ADD COLUMN IF NOT EXISTS municipality_id UUID REFERENCES municipalities(id);

-- Step 2: Create index for performance
CREATE INDEX IF NOT EXISTS idx_gps_municipality_id 
ON gps_locations(municipality_id);

-- Step 3: Add comment
COMMENT ON COLUMN gps_locations.municipality_id 
IS 'Municipality ID - denormalized from profiles.municipality_id for RLS performance';

-- Step 4: Backfill existing data (set municipality_id based on user_id)
UPDATE gps_locations
SET municipality_id = (
  SELECT municipality_id 
  FROM profiles 
  WHERE profiles.id = gps_locations.user_id
)
WHERE user_id IS NOT NULL AND municipality_id IS NULL;

-- Step 5: Verify
SELECT 
  COUNT(*) as total_records,
  COUNT(municipality_id) as records_with_municipality,
  COUNT(*) - COUNT(municipality_id) as records_without_municipality
FROM gps_locations;
