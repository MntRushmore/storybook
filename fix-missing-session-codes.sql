-- Fix Missing Session Codes
-- Run this in your Supabase SQL Editor to add session codes to existing stories

-- This script generates unique 6-digit codes for all stories that don't have one

-- Step 1: Create a function to generate a 6-digit code
CREATE OR REPLACE FUNCTION generate_six_digit_code() RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate a random 6-digit code
    new_code := LPAD(FLOOR(RANDOM() * 900000 + 100000)::TEXT, 6, '0');

    -- Check if this code already exists
    SELECT EXISTS(SELECT 1 FROM stories WHERE session_code = new_code) INTO code_exists;

    -- If code doesn't exist, return it
    IF NOT code_exists THEN
      RETURN new_code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Update all stories that don't have a session_code
UPDATE stories
SET session_code = generate_six_digit_code()
WHERE session_code IS NULL;

-- Step 3: Verify that all stories now have codes
SELECT
  COUNT(*) as total_stories,
  COUNT(session_code) as stories_with_codes,
  COUNT(*) - COUNT(session_code) as stories_missing_codes
FROM stories;

-- Step 4: Show some sample codes (for debugging)
SELECT id, title, session_code, collaboration_type
FROM stories
ORDER BY created_at DESC
LIMIT 10;
