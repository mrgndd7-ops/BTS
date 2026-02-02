-- Create device_mappings table for Traccar Client device → user mapping
-- Run this in Supabase SQL Editor

-- Step 1: Create the table
CREATE TABLE IF NOT EXISTS device_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  municipality_id UUID REFERENCES municipalities(id) ON DELETE SET NULL,
  mapped_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  mapped_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT device_mappings_device_id_key UNIQUE (device_id)
);

-- Step 2: Create indexes for fast lookups
CREATE INDEX idx_device_mappings_device_id ON device_mappings(device_id) WHERE is_active = true;
CREATE INDEX idx_device_mappings_user_id ON device_mappings(user_id) WHERE is_active = true;
CREATE INDEX idx_device_mappings_municipality_id ON device_mappings(municipality_id) WHERE is_active = true;

-- Step 3: Add updated_at trigger
CREATE OR REPLACE FUNCTION update_device_mappings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER device_mappings_updated_at
  BEFORE UPDATE ON device_mappings
  FOR EACH ROW
  EXECUTE FUNCTION update_device_mappings_updated_at();

-- Step 4: RLS Policies (şimdilik kapalı, sonra açarsın)
ALTER TABLE device_mappings DISABLE ROW LEVEL SECURITY;

-- Step 5: Comments
COMMENT ON TABLE device_mappings IS 'Maps Traccar Client device IDs to user profiles';
COMMENT ON COLUMN device_mappings.device_id IS 'Unique device identifier from Traccar Client (IMEI, phone number, etc)';
COMMENT ON COLUMN device_mappings.user_id IS 'User profile this device is assigned to';
COMMENT ON COLUMN device_mappings.municipality_id IS 'Municipality for filtering (denormalized from user profile)';
COMMENT ON COLUMN device_mappings.mapped_by IS 'Admin who created this mapping';
COMMENT ON COLUMN device_mappings.is_active IS 'Whether this mapping is currently active';
