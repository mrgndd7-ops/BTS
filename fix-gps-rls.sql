-- EMERGENCY FIX: Fix GPS RLS Policies for Traccar Client API
-- Run this directly in Supabase SQL Editor

-- Step 1: Drop ALL existing GPS location policies
DROP POLICY IF EXISTS "Users can insert own location" ON gps_locations;
DROP POLICY IF EXISTS "Admins can view municipality locations" ON gps_locations;
DROP POLICY IF EXISTS "Users can view own locations" ON gps_locations;
DROP POLICY IF EXISTS "Allow public GPS insert from API" ON gps_locations;

-- Step 2: Create new permissive INSERT policy for Traccar API
CREATE POLICY "Allow public GPS insert from API"
  ON gps_locations FOR INSERT
  WITH CHECK (true);

-- Step 3: Create SELECT policies that DON'T use municipality_id
-- (because gps_locations table doesn't have municipality_id column)

-- Workers can view their own locations
CREATE POLICY "Users can view own locations"
  ON gps_locations FOR SELECT
  USING (user_id = auth.uid());

-- Admins can view locations of users in their municipality
CREATE POLICY "Admins can view municipality locations"
  ON gps_locations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS viewer
      WHERE viewer.id = auth.uid()
        AND viewer.role IN ('admin', 'supervisor')
        AND viewer.municipality_id IN (
          SELECT municipality_id FROM profiles WHERE id = gps_locations.user_id
        )
    )
  );

-- Step 4: Add comments
COMMENT ON POLICY "Allow public GPS insert from API" ON gps_locations 
IS 'Allows Traccar Client to POST location data to /api/gps without authentication. Validation happens in API route.';

COMMENT ON POLICY "Users can view own locations" ON gps_locations 
IS 'Users can view their own GPS location history';

COMMENT ON POLICY "Admins can view municipality locations" ON gps_locations 
IS 'Admins/Supervisors can view GPS locations of users in their municipality';
