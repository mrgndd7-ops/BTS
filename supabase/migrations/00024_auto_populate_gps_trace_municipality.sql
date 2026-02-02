-- Auto-populate municipality_id in gps_traces from task
-- Date: 2026-02-02
-- Description: Automatically set municipality_id when inserting GPS trace using a trigger

BEGIN;

-- Create trigger function to auto-populate municipality_id
CREATE OR REPLACE FUNCTION populate_gps_trace_municipality()
RETURNS TRIGGER AS $$
BEGIN
  -- If municipality_id not provided, get it from the task
  IF NEW.municipality_id IS NULL AND NEW.task_id IS NOT NULL THEN
    SELECT municipality_id INTO NEW.municipality_id
    FROM tasks
    WHERE id = NEW.task_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS gps_trace_municipality_trigger ON gps_traces;
CREATE TRIGGER gps_trace_municipality_trigger
  BEFORE INSERT ON gps_traces
  FOR EACH ROW
  EXECUTE FUNCTION populate_gps_trace_municipality();

-- Add comment
COMMENT ON FUNCTION populate_gps_trace_municipality() 
IS 'Auto-populates municipality_id from task when inserting GPS trace';

COMMIT;

-- Verify
DO $$
BEGIN
  RAISE NOTICE '✅ GPS trace municipality auto-population trigger created!';
  RAISE NOTICE '   - municipality_id will be set automatically from task';
END $$;
