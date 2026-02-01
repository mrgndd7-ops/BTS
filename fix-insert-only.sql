-- QUICKEST FIX: Just fix the INSERT policy

-- Drop any existing INSERT policies
DO $$ 
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'gps_locations' AND cmd = 'INSERT'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON gps_locations', pol.policyname);
    END LOOP;
END $$;

-- Create simple INSERT policy that allows ANYONE to insert
CREATE POLICY "allow_traccar_insert"
  ON gps_locations 
  FOR INSERT 
  WITH CHECK (true);

-- Verify
SELECT 
  policyname, 
  cmd, 
  CASE WHEN with_check = 'true'::text THEN '✅ Allows all inserts' ELSE '❌ Still restricted' END as status
FROM pg_policies 
WHERE tablename = 'gps_locations' AND cmd = 'INSERT';
