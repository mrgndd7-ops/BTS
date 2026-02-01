-- DEBUG: Check current table structure and policies
-- Run this FIRST to see what's happening

-- Check if gps_locations table has municipality_id column
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'gps_locations'
ORDER BY ordinal_position;

-- Check current RLS policies
SELECT policyname, cmd, qual::text, with_check::text
FROM pg_policies 
WHERE tablename = 'gps_locations';

-- Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'gps_locations';
