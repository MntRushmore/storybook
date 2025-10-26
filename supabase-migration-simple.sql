-- WordChain Simplified Migration (No Root Access Required)
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new
-- This version only creates/updates tables without requiring special permissions

-- Add new columns to existing stories table (if they don't exist)
ALTER TABLE stories ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'romance';
ALTER TABLE stories ADD COLUMN IF NOT EXISTS mode TEXT DEFAULT 'standard';
ALTER TABLE stories ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE stories ADD COLUMN IF NOT EXISTS reactions JSONB DEFAULT '{}';
ALTER TABLE stories ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS session_code TEXT;

-- Add audio column to story_entries (if it doesn't exist)
ALTER TABLE story_entries ADD COLUMN IF NOT EXISTS audio_url TEXT;

-- Create user_stats table for streak tracking
CREATE TABLE IF NOT EXISTS user_stats (
  user_id TEXT PRIMARY KEY,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date TEXT,
  total_stories INTEGER DEFAULT 0,
  total_words INTEGER DEFAULT 0,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stories_theme ON stories(theme);
CREATE INDEX IF NOT EXISTS idx_stories_tags ON stories USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_stories_session_code ON stories(session_code);
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);

-- Enable Row Level Security (RLS) on user_stats
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for user_stats (allow all operations)
DROP POLICY IF EXISTS "Allow all operations on user_stats" ON user_stats;
CREATE POLICY "Allow all operations on user_stats" ON user_stats FOR ALL USING (true) WITH CHECK (true);

-- Try to enable realtime for user_stats (may fail without permissions, but app will still work)
-- If this fails, the app will still function but without real-time updates for stats
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE user_stats;
EXCEPTION
  WHEN duplicate_object THEN
    -- Table already added to publication
    NULL;
  WHEN insufficient_privilege THEN
    -- No permission to modify publication, app will work without realtime for stats
    RAISE NOTICE 'Could not enable realtime for user_stats - insufficient privileges';
END $$;
