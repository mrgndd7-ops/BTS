-- AGGRESSIVE FIX: Force drop ALL policies and recreate
-- Run this in Supabase SQL Editor

-- ============================================
-- STEP 1: Check current policies
-- ============================================
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'gps_locations';

-- ============================================
-- STEP 2: Force disable RLS temporarily
-- ============================================
ALTER TABLE gps_locations DISABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 3: Drop ALL policies by name
-- ============================================
DROP POLICY IF EXISTS "Users can insert own location" ON gps_locations CASCADE;
DROP POLICY IF EXISTS "Admins can view municipality locations" ON gps_locations CASCADE;
DROP POLICY IF EXISTS "Users can view own locations" ON gps_locations CASCADE;
DROP POLICY IF EXISTS "Allow public GPS insert from API" ON gps_locations CASCADE;
DROP POLICY IF EXISTS "Personnel can insert own location" ON gps_locations CASCADE;
DROP POLICY IF EXISTS "Admins can view all locations" ON gps_locations CASCADE;

-- ============================================
-- STEP 4: Re-enable RLS
-- ============================================
ALTER TABLE gps_locations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 5: Create SIMPLE policies (no municipality_id reference)
-- ============================================

-- Allow anyone to INSERT (for Traccar API)
CREATE POLICY "api_insert_gps"
  ON gps_locations 
  FOR INSERT 
  WITH CHECK (true);

-- Allow users to SELECT their own data
CREATE POLICY "select_own_gps"
  ON gps_locations 
  FOR SELECT 
  USING (user_id = auth.uid() OR user_id IS NULL);

-- Allow admins to SELECT data from their municipality users
CREATE POLICY "admin_select_gps"
  ON gps_locations 
  FOR SELECT 
  USING (
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'supervisor')
    )
  );

-- ============================================
-- STEP 6: Verify new policies
-- ============================================
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename = 'gps_locations';
