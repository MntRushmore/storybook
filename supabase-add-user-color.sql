-- Add user_color column to story_entries table
-- This column stores the color associated with each user's contributions

ALTER TABLE story_entries
ADD COLUMN IF NOT EXISTS user_color TEXT DEFAULT '#D4A5A5';

-- Verify the column was added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'story_entries'
ORDER BY ordinal_position;
