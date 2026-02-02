-- Add task_id column to gps_locations table
-- This allows tracking which GPS points belong to which task

BEGIN;

-- Add task_id column with foreign key to tasks
ALTER TABLE gps_locations
ADD COLUMN IF NOT EXISTS task_id UUID REFERENCES tasks(id) ON DELETE SET NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_gps_locations_task_id ON gps_locations(task_id);

-- Add index for task+time queries (for trace generation)
CREATE INDEX IF NOT EXISTS idx_gps_locations_task_time ON gps_locations(task_id, recorded_at DESC);

-- Add comment
COMMENT ON COLUMN gps_locations.task_id IS 'Task ID that this GPS location belongs to';

COMMIT;

-- Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'gps_locations' 
AND column_name = 'task_id';
