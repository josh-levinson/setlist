-- SQL script to remove the total_duration column from the setlists table
-- Run this in your Supabase SQL editor

-- Remove the total_duration column from the setlists table
ALTER TABLE setlists DROP COLUMN IF EXISTS total_duration;

-- Verify the change
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'setlists' 
ORDER BY ordinal_position; 