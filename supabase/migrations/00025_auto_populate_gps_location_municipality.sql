-- Auto-populate municipality_id in gps_locations
-- Date: 2026-02-02
-- Description: Automatically set municipality_id when inserting GPS location using a trigger

BEGIN;

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

COMMIT;

-- Verify
DO $$
BEGIN
  RAISE NOTICE '✅ GPS location municipality auto-population trigger created!';
  RAISE NOTICE '   - municipality_id will be set automatically from user profile';
END $$;
