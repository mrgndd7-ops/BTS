-- Migration: Add Traccar Integration Support
-- Description: Adds necessary fields for Traccar GPS integration and device mapping

-- Add Traccar-related columns to gps_locations table
ALTER TABLE gps_locations 
ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'browser' CHECK (source IN ('browser', 'traccar', 'hardware')),
ADD COLUMN IF NOT EXISTS device_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS battery_level NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS traccar_position_id BIGINT;

-- Note: Device to user mapping handled via gps_locations.device_id and user_id
-- No need for traccar_device_id in profiles table

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_gps_device_id ON gps_locations(device_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_gps_source ON gps_locations(source);
CREATE INDEX IF NOT EXISTS idx_gps_traccar_position ON gps_locations(traccar_position_id);

-- Add unique constraint to prevent duplicate Traccar positions
CREATE UNIQUE INDEX IF NOT EXISTS idx_gps_traccar_position_unique 
ON gps_locations(traccar_position_id) 
WHERE traccar_position_id IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN gps_locations.source IS 'Source of GPS data: browser (web geolocation), traccar (Traccar Client app), hardware (dedicated GPS device)';
COMMENT ON COLUMN gps_locations.device_id IS 'Traccar device ID or hardware device identifier - maps to user via user_id';
COMMENT ON COLUMN gps_locations.battery_level IS 'Battery level percentage (0-100) from mobile device';
COMMENT ON COLUMN gps_locations.traccar_position_id IS 'Traccar position ID for deduplication';
