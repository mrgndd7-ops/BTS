-- ============================================
-- LATEST FIXES - Apply All Pending Migrations
-- Date: 2026-02-02
-- Description: Index and RLS policy fixes found during audit
-- ============================================

-- Migration 00028: Fix tasks index name
-- ============================================
BEGIN;

DROP INDEX IF EXISTS idx_tasks_assigned_personnel;
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);

COMMENT ON INDEX idx_tasks_assigned_to 
IS 'Index for filtering tasks by assigned personnel';

COMMIT;

-- Migration 00029: Fix RLS column names
-- ============================================
BEGIN;

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

COMMIT;

-- ============================================
-- VERIFICATION
-- ============================================

-- Show all indexes on critical tables
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('tasks', 'gps_locations', 'profiles')
ORDER BY tablename, indexname;

-- Show all RLS policies on critical tables
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('tasks', 'gps_locations', 'gps_traces', 'profiles')
ORDER BY tablename, policyname;

-- Summary
DO $$
BEGIN
  RAISE NOTICE '✅ All fixes applied successfully!';
  RAISE NOTICE '';
  RAISE NOTICE '📋 CHANGES:';
  RAISE NOTICE '  1. Index: idx_tasks_assigned_personnel → idx_tasks_assigned_to';
  RAISE NOTICE '  2. RLS: Tasks policies now use assigned_to column';
  RAISE NOTICE '';
  RAISE NOTICE '🔍 Review the verification queries above to confirm.';
END $$;
