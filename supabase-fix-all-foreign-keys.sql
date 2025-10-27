-- Complete Foreign Key Fix for Stories Table
-- This fixes all foreign key constraints that are causing issues

-- 1. Drop ALL foreign key constraints on stories table
ALTER TABLE stories
DROP CONSTRAINT IF EXISTS stories_creator_id_fkey;

ALTER TABLE stories
DROP CONSTRAINT IF EXISTS stories_partner_id_fkey;

ALTER TABLE stories
DROP CONSTRAINT IF EXISTS stories_current_turn_user_id_fkey;

ALTER TABLE stories
DROP CONSTRAINT IF EXISTS stories_branch_author_id_fkey;

-- 2. Drop foreign key constraints on story_entries table
ALTER TABLE story_entries
DROP CONSTRAINT IF EXISTS story_entries_user_id_fkey;

-- 3. Verify all foreign key constraints are removed
SELECT
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(c.oid) AS constraint_definition
FROM pg_constraint c
JOIN pg_namespace n ON n.oid = c.connamespace
WHERE conrelid = 'stories'::regclass
  AND contype = 'f'
ORDER BY conname;

-- 4. Verify story_entries foreign keys
SELECT
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(c.oid) AS constraint_definition
FROM pg_constraint c
JOIN pg_namespace n ON n.oid = c.connamespace
WHERE conrelid = 'story_entries'::regclass
  AND contype = 'f'
ORDER BY conname;
