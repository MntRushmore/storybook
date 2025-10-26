-- Complete Migration for Branch Mode Support
-- This migration adds all required columns for Branch Mode and session codes

-- Step 0: Fix foreign key constraints (if they exist and are causing issues)
-- Remove overly restrictive foreign keys that reference profiles table
ALTER TABLE stories
DROP CONSTRAINT IF EXISTS stories_creator_id_fkey;

ALTER TABLE stories
DROP CONSTRAINT IF EXISTS stories_partner_id_fkey;

-- Step 1: Add session_code column (if not exists)
ALTER TABLE stories
ADD COLUMN IF NOT EXISTS session_code TEXT;

-- Step 2: Add collaboration_type column (classic or branch)
ALTER TABLE stories
ADD COLUMN IF NOT EXISTS collaboration_type TEXT DEFAULT 'classic';

-- Step 3: Add parent_prompt_id to link branch stories together
ALTER TABLE stories
ADD COLUMN IF NOT EXISTS parent_prompt_id TEXT;

-- Step 4: Add branch_author_id to identify which partner wrote this branch
ALTER TABLE stories
ADD COLUMN IF NOT EXISTS branch_author_id TEXT;

-- Step 5: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_stories_session_code
ON stories(session_code)
WHERE session_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_stories_parent_prompt_id
ON stories(parent_prompt_id)
WHERE parent_prompt_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_stories_collaboration_type
ON stories(collaboration_type);

-- Step 6: Add check constraint to ensure collaboration_type is valid
DO $$ BEGIN
  ALTER TABLE stories
  ADD CONSTRAINT check_collaboration_type
  CHECK (collaboration_type IN ('classic', 'branch'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Step 7: Update existing stories to have default collaboration_type
UPDATE stories
SET collaboration_type = 'classic'
WHERE collaboration_type IS NULL;

-- Step 8: Add comments for documentation
COMMENT ON COLUMN stories.session_code IS '6-digit code for joining stories';
COMMENT ON COLUMN stories.collaboration_type IS 'Type of collaboration: classic (turn-based) or branch (parallel writing)';
COMMENT ON COLUMN stories.parent_prompt_id IS 'For branch mode: links multiple story branches that started from the same prompt';
COMMENT ON COLUMN stories.branch_author_id IS 'For branch mode: user ID of the person writing this specific branch';

-- Verification query - run this to check that all columns were added
SELECT
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'stories'
  AND column_name IN ('session_code', 'collaboration_type', 'parent_prompt_id', 'branch_author_id')
ORDER BY column_name;
