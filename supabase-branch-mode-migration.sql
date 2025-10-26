-- Branch Mode Migration for Stories Table
-- Add new columns to support Branch Mode storytelling

-- Add collaboration_type column (classic or branch)
ALTER TABLE stories
ADD COLUMN IF NOT EXISTS collaboration_type TEXT DEFAULT 'classic';

-- Add parent_prompt_id to link branch stories together
ALTER TABLE stories
ADD COLUMN IF NOT EXISTS parent_prompt_id TEXT;

-- Add branch_author_id to identify which partner wrote this branch
ALTER TABLE stories
ADD COLUMN IF NOT EXISTS branch_author_id TEXT;

-- Create index on parent_prompt_id for faster branch story queries
CREATE INDEX IF NOT EXISTS idx_stories_parent_prompt_id
ON stories(parent_prompt_id)
WHERE parent_prompt_id IS NOT NULL;

-- Create index on collaboration_type for filtering
CREATE INDEX IF NOT EXISTS idx_stories_collaboration_type
ON stories(collaboration_type);

-- Add check constraint to ensure collaboration_type is valid
ALTER TABLE stories
ADD CONSTRAINT check_collaboration_type
CHECK (collaboration_type IN ('classic', 'branch'));

-- Comments for documentation
COMMENT ON COLUMN stories.collaboration_type IS 'Type of collaboration: classic (turn-based) or branch (parallel writing)';
COMMENT ON COLUMN stories.parent_prompt_id IS 'For branch mode: links multiple story branches that started from the same prompt';
COMMENT ON COLUMN stories.branch_author_id IS 'For branch mode: user ID of the person writing this specific branch';

-- Update existing stories to have default collaboration_type
UPDATE stories
SET collaboration_type = 'classic'
WHERE collaboration_type IS NULL;
