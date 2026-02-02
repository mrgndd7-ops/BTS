-- Fix RLS policies to use current column names
-- Date: 2026-02-02
-- Description: Update policies that still reference old column names (assigned_personnel, personnel_id)

BEGIN;

-- ============================================
-- TASKS POLICIES - Fix assigned_personnel → assigned_to
-- ============================================

-- Drop old policies with wrong column names
DROP POLICY IF EXISTS "Personnel can view assigned tasks" ON tasks;
DROP POLICY IF EXISTS "Personnel can update own tasks" ON tasks;

-- Recreate with correct column names
CREATE POLICY "Personnel can view assigned tasks"
  ON tasks FOR SELECT
  USING (assigned_to = auth.uid());

CREATE POLICY "Personnel can update own tasks"
  ON tasks FOR UPDATE
  USING (
    assigned_to = auth.uid()
    AND get_user_role() = 'personnel'
  )
  WITH CHECK (assigned_to = auth.uid());

-- ============================================
-- GPS_LOCATIONS POLICIES - Already fixed in 00026
-- ============================================
-- Note: These were already updated to use user_id in migration 00026
-- No action needed here

COMMIT;

-- Verify
DO $$
BEGIN
  RAISE NOTICE '✅ RLS policies updated to use current column names!';
  RAISE NOTICE '   - Tasks: assigned_personnel → assigned_to';
  RAISE NOTICE '   - GPS Locations: Already using user_id (from 00026)';
END $$;
