-- Fix tasks table index name after column rename
-- Date: 2026-02-02
-- Description: Rename index from assigned_personnel to assigned_to

BEGIN;

-- Drop old index with old column name
DROP INDEX IF EXISTS idx_tasks_assigned_personnel;

-- Create new index with current column name
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);

-- Add comment
COMMENT ON INDEX idx_tasks_assigned_to 
IS 'Index for filtering tasks by assigned personnel';

COMMIT;

-- Verify
DO $$
BEGIN
  RAISE NOTICE '✅ Tasks index updated: idx_tasks_assigned_personnel → idx_tasks_assigned_to';
END $$;
