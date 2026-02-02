-- Fix function column names to match current schema
-- Date: 2026-02-02
-- Description: Update functions to use 'assigned_to' instead of 'assigned_personnel' and new status values

BEGIN;

-- 1. Fix get_personnel_active_tasks function
CREATE OR REPLACE FUNCTION get_personnel_active_tasks(personnel_uuid UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM tasks
  WHERE assigned_to = personnel_uuid
    AND status IN ('assigned', 'in_progress')
$$ LANGUAGE SQL STABLE;

-- 2. Fix get_municipality_stats function
CREATE OR REPLACE FUNCTION get_municipality_stats(municipality_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'active_tasks', (
      SELECT COUNT(*) FROM tasks
      WHERE municipality_id = municipality_uuid
        AND status IN ('assigned', 'in_progress')
    ),
    'active_personnel', (
      SELECT COUNT(*) FROM profiles
      WHERE municipality_id = municipality_uuid
        AND role = 'personnel'
        AND status = 'active'
    ),
    'total_routes', (
      SELECT COUNT(*) FROM routes
      WHERE municipality_id = municipality_uuid
        AND active = true
    ),
    'completed_tasks_today', (
      SELECT COUNT(*) FROM tasks
      WHERE municipality_id = municipality_uuid
        AND status = 'completed'
        AND DATE(completed_at) = CURRENT_DATE
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE;

-- Add comments
COMMENT ON FUNCTION get_personnel_active_tasks(UUID) 
IS 'Returns count of active tasks for a personnel (using assigned_to column)';

COMMENT ON FUNCTION get_municipality_stats(UUID) 
IS 'Returns statistics for a municipality (using current status values)';

COMMIT;

-- Verify
DO $$
BEGIN
  RAISE NOTICE '✅ Database functions updated successfully!';
  RAISE NOTICE '   - get_personnel_active_tasks: assigned_to + new status';
  RAISE NOTICE '   - get_municipality_stats: new status values';
END $$;
