-- FINAL FIX: Allow anonymous INSERT for Traccar API
-- This will solve the RLS policy violation

-- Step 1: Check current INSERT policies
SELECT policyname, cmd, with_check::text
FROM pg_policies 
WHERE tablename = 'gps_locations' AND cmd = 'INSERT';

-- Step 2: Drop ALL INSERT policies
DROP POLICY IF EXISTS "Users can insert own location" ON gps_locations;
DROP POLICY IF EXISTS "Allow public GPS insert from API" ON gps_locations;
DROP POLICY IF EXISTS "api_insert_gps" ON gps_locations;
DROP POLICY IF EXISTS "allow_all_insert" ON gps_locations;

-- Step 3: Create PERMISSIVE INSERT policy (no auth required)
CREATE POLICY "traccar_public_insert"
  ON gps_locations 
  FOR INSERT 
  WITH CHECK (true);

-- Step 4: Verify the policy was created
SELECT policyname, cmd, permissive, with_check::text
FROM pg_policies 
WHERE tablename = 'gps_locations' AND cmd = 'INSERT';

-- Step 5: Test - this should return true
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'gps_locations' 
        AND cmd = 'INSERT' 
        AND permissive = 'PERMISSIVE'
        AND with_check = 'true'::text
    ) THEN '✅ INSERT policy is PERMISSIVE (allows anonymous inserts)'
    ELSE '❌ INSERT policy is still RESTRICTIVE'
  END as policy_status;
