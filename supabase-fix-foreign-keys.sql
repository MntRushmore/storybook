-- Fix Foreign Key Constraint Issues for Stories Table
-- This removes the foreign key constraint that's causing issues with Branch Mode

-- Option 1: Drop the foreign key constraint (Recommended for flexibility)
-- This allows stories to be created even if the user isn't in profiles table yet
ALTER TABLE stories
DROP CONSTRAINT IF EXISTS stories_creator_id_fkey;

-- Option 2: If you want to keep the constraint but make it more flexible
-- Uncomment the lines below instead of using Option 1

-- ALTER TABLE stories
-- DROP CONSTRAINT IF EXISTS stories_creator_id_fkey;
--
-- ALTER TABLE stories
-- ADD CONSTRAINT stories_creator_id_fkey
-- FOREIGN KEY (creator_id)
-- REFERENCES auth.users(id)
-- ON DELETE CASCADE;

-- Also check and fix partner_id foreign key if it exists
ALTER TABLE stories
DROP CONSTRAINT IF EXISTS stories_partner_id_fkey;

-- Verify the changes
SELECT
  conname AS constraint_name,
  contype AS constraint_type
FROM pg_constraint
WHERE conrelid = 'stories'::regclass
  AND conname LIKE '%creator_id%' OR conname LIKE '%partner_id%';
