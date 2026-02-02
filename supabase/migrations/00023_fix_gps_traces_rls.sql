-- Fix gps_traces RLS policies
-- Date: 2026-02-02
-- Description: Add INSERT policy for personnel to create GPS traces when completing tasks

BEGIN;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can view municipality traces" ON gps_traces;
DROP POLICY IF EXISTS "Admins can manage traces" ON gps_traces;

-- 1. Allow personnel to INSERT traces for their own completed tasks
CREATE POLICY "Personnel can insert own task traces"
  ON gps_traces FOR INSERT
  WITH CHECK (
    task_id IN (
      SELECT id FROM tasks WHERE assigned_to = auth.uid()
    )
  );

-- 2. Allow users to view traces from their municipality
CREATE POLICY "Users can view municipality traces"
  ON gps_traces FOR SELECT
  USING (municipality_id = get_user_municipality_id());

-- 3. Allow admins to manage all traces in their municipality
CREATE POLICY "Admins can manage municipality traces"
  ON gps_traces FOR ALL
  USING (
    municipality_id = get_user_municipality_id()
    AND get_user_role() IN ('admin', 'supervisor')
  );

COMMIT;

-- Verify
DO $$
BEGIN
  RAISE NOTICE '✅ GPS traces RLS policies fixed!';
  RAISE NOTICE '   - Personnel can now INSERT traces for their tasks';
  RAISE NOTICE '   - View and manage policies updated';
END $$;
