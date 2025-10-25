-- WordChain Database Schema - Enhanced Version
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/qwafuwhkksaffmbzfqpq/sql/new

-- Table: stories
-- Stores story metadata and shared state
CREATE TABLE IF NOT EXISTS stories (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  session_code TEXT UNIQUE NOT NULL,
  creator_id TEXT NOT NULL,
  creator_name TEXT NOT NULL,
  partner_id TEXT,
  partner_name TEXT,
  current_turn_user_id TEXT NOT NULL,
  max_words INTEGER DEFAULT 75,
  is_finished BOOLEAN DEFAULT FALSE,
  is_revealed BOOLEAN DEFAULT FALSE,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,

  -- New fields for enhanced features
  theme TEXT DEFAULT 'romance',
  mode TEXT DEFAULT 'standard',
  tags TEXT[] DEFAULT '{}',
  cover_photo_url TEXT,
  reactions JSONB DEFAULT '{}',
  is_premium BOOLEAN DEFAULT FALSE
);

-- Table: story_entries
-- Stores individual words added to stories
CREATE TABLE IF NOT EXISTS story_entries (
  id TEXT PRIMARY KEY,
  story_id TEXT NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  timestamp BIGINT NOT NULL,

  -- New fields for voice and photos
  audio_url TEXT,
  photo_url TEXT
);

-- Table: user_stats
-- Stores user statistics and streaks
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

-- Table: story_photos
-- Stores photos attached to stories
CREATE TABLE IF NOT EXISTS story_photos (
  id TEXT PRIMARY KEY,
  story_id TEXT NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  caption TEXT,
  user_id TEXT NOT NULL,
  timestamp BIGINT NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_stories_session_code ON stories(session_code);
CREATE INDEX IF NOT EXISTS idx_stories_creator_id ON stories(creator_id);
CREATE INDEX IF NOT EXISTS idx_stories_partner_id ON stories(partner_id);
CREATE INDEX IF NOT EXISTS idx_stories_theme ON stories(theme);
CREATE INDEX IF NOT EXISTS idx_stories_tags ON stories USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_story_entries_story_id ON story_entries(story_id);
CREATE INDEX IF NOT EXISTS idx_story_entries_timestamp ON story_entries(timestamp);
CREATE INDEX IF NOT EXISTS idx_story_photos_story_id ON story_photos(story_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_photos ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow all users to read and write (since we're using anon key)
-- In production, you'd want proper auth and user-specific policies
CREATE POLICY "Allow all operations on stories" ON stories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on story_entries" ON story_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on user_stats" ON user_stats FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on story_photos" ON story_photos FOR ALL USING (true) WITH CHECK (true);

-- Enable Realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE stories;
ALTER PUBLICATION supabase_realtime ADD TABLE story_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE user_stats;
ALTER PUBLICATION supabase_realtime ADD TABLE story_photos;
