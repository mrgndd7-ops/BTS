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

-- Migration 00029: Fix RLS column names + Disable RLS for demo
-- ============================================
BEGIN;

-- Drop old policies with wrong column names
DROP POLICY IF EXISTS "Personnel can view assigned tasks" ON tasks;
DROP POLICY IF EXISTS "Personnel can update own tasks" ON tasks;

-- Recreate with correct column names (for future use)
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

-- ⚠️ DISABLE RLS FOR DEMO/DEVELOPMENT
-- Uncomment below to disable RLS on all tables (for demo purposes)
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE gps_locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE gps_traces DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE routes DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE municipalities DISABLE ROW LEVEL SECURITY;
ALTER TABLE inspections DISABLE ROW LEVEL SECURITY;
ALTER TABLE personnel_scores DISABLE ROW LEVEL SECURITY;
ALTER TABLE tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;

COMMIT;

-- ============================================
-- VERIFICATION
-- ============================================

-- Check if RLS is enabled on all critical tables
SELECT 
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE tablename IN ('tasks', 'gps_locations', 'gps_traces', 'profiles', 'routes', 'notifications')
  AND schemaname = 'public'
ORDER BY tablename;

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
  RAISE NOTICE '  1. Index: idx_tasks_assigned_personnel → idx_tasks_assigned_to ✅';
  RAISE NOTICE '  2. RLS: Tasks policies now use assigned_to column ✅';
  RAISE NOTICE '  3. RLS: ALL TABLES DISABLED (for demo/development) ⚠️';
  RAISE NOTICE '';
  RAISE NOTICE '🔍 Review the verification queries above to confirm:';
  RAISE NOTICE '  - Check RLS is DISABLED (rls_enabled = false) ⚠️';
  RAISE NOTICE '  - Check indexes exist';
  RAISE NOTICE '  - Check policies are defined (but inactive)';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️ WARNING: RLS is DISABLED - All data accessible to all users!';
  RAISE NOTICE '   Re-enable before production: ALTER TABLE xxx ENABLE ROW LEVEL SECURITY;';
END $$;
