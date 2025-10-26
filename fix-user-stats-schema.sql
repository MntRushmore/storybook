-- Fix user_stats table schema
-- The created_at and updated_at columns should be BIGINT for millisecond timestamps

-- Drop and recreate the table with correct types
DROP TABLE IF EXISTS user_stats CASCADE;

CREATE TABLE user_stats (
  user_id TEXT PRIMARY KEY,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date TEXT,
  total_stories INTEGER DEFAULT 0,
  total_words INTEGER DEFAULT 0,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

-- Enable Row Level Security
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Create RLS policy (allow all operations)
DROP POLICY IF EXISTS "Allow all operations on user_stats" ON user_stats;
CREATE POLICY "Allow all operations on user_stats" ON user_stats FOR ALL USING (true) WITH CHECK (true);

-- Create index
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);
