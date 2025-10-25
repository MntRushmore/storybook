-- ==========================================
-- WordChain Complete Production Schema
-- ==========================================
-- Run this in Supabase SQL Editor
-- This creates a complete auth-integrated schema with proper RLS

-- Drop existing tables in correct order (respect foreign keys)
DROP TABLE IF EXISTS story_entries CASCADE;
DROP TABLE IF EXISTS stories CASCADE;
DROP TABLE IF EXISTS user_stats CASCADE;
DROP TABLE IF EXISTS pairing_codes CASCADE;
DROP TABLE IF EXISTS pairs CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ==========================================
-- 1. PROFILES TABLE (links to auth.users)
-- ==========================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  initials TEXT NOT NULL,
  color TEXT NOT NULL,
  push_token TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- ==========================================
-- 2. PAIRS TABLE (partner connections)
-- ==========================================
CREATE TABLE pairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_b UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT users_different CHECK (user_a != user_b),
  CONSTRAINT unique_pair UNIQUE (user_a, user_b)
);

-- Create index for reverse lookup
CREATE INDEX idx_pairs_user_b ON pairs(user_b);

-- Pairs RLS
ALTER TABLE pairs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their pairs" ON pairs
  FOR SELECT USING (auth.uid() = user_a OR auth.uid() = user_b);

CREATE POLICY "Users can create pairs" ON pairs
  FOR INSERT WITH CHECK (auth.uid() = user_a OR auth.uid() = user_b);

CREATE POLICY "Users can delete their pairs" ON pairs
  FOR DELETE USING (auth.uid() = user_a OR auth.uid() = user_b);

-- ==========================================
-- 3. PAIRING CODES TABLE (session codes)
-- ==========================================
CREATE TABLE pairing_codes (
  code TEXT PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  story_id UUID,
  expires_at TIMESTAMPTZ NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-cleanup expired codes
CREATE INDEX idx_pairing_codes_expires ON pairing_codes(expires_at) WHERE NOT is_used;

-- Pairing codes RLS
ALTER TABLE pairing_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view valid codes" ON pairing_codes
  FOR SELECT USING (NOT is_used AND expires_at > NOW());

CREATE POLICY "Users can create codes" ON pairing_codes
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update own codes" ON pairing_codes
  FOR UPDATE USING (auth.uid() = creator_id);

-- ==========================================
-- 4. STORIES TABLE
-- ==========================================
CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  current_turn_user_id UUID NOT NULL REFERENCES profiles(id),
  max_words INTEGER NOT NULL DEFAULT 75,
  is_finished BOOLEAN DEFAULT FALSE,
  is_revealed BOOLEAN DEFAULT FALSE,
  theme TEXT DEFAULT 'romance',
  mode TEXT DEFAULT 'standard',
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_stories_creator ON stories(creator_id);
CREATE INDEX idx_stories_partner ON stories(partner_id);
CREATE INDEX idx_stories_updated ON stories(updated_at DESC);

-- Stories RLS
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their stories" ON stories
  FOR SELECT USING (
    auth.uid() = creator_id OR
    auth.uid() = partner_id
  );

CREATE POLICY "Users can create stories" ON stories
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update their stories" ON stories
  FOR UPDATE USING (
    auth.uid() = creator_id OR
    auth.uid() = partner_id
  );

CREATE POLICY "Users can delete own stories" ON stories
  FOR DELETE USING (auth.uid() = creator_id);

-- ==========================================
-- 5. STORY ENTRIES TABLE (turns/words)
-- ==========================================
CREATE TABLE story_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  word TEXT NOT NULL,
  audio_url TEXT,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_entries_story ON story_entries(story_id, timestamp);
CREATE INDEX idx_entries_user ON story_entries(user_id);

-- Story entries RLS
ALTER TABLE story_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view entries for their stories" ON story_entries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = story_entries.story_id
      AND (stories.creator_id = auth.uid() OR stories.partner_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert entries for their turn" ON story_entries
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = story_entries.story_id
      AND stories.current_turn_user_id = auth.uid()
      AND NOT stories.is_finished
    )
  );

-- ==========================================
-- 6. USER STATS TABLE (streak tracking)
-- ==========================================
CREATE TABLE user_stats (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date TEXT,
  total_stories INTEGER DEFAULT 0,
  total_words INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User stats RLS
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all stats" ON user_stats
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own stats" ON user_stats
  FOR ALL USING (auth.uid() = user_id);

-- ==========================================
-- 7. REALTIME PUBLICATION
-- ==========================================
-- Enable realtime for all tables
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE pairs;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE stories;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE story_entries;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE user_stats;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ==========================================
-- 8. FUNCTIONS & TRIGGERS
-- ==========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stories_updated_at
  BEFORE UPDATE ON stories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_stats_updated_at
  BEFORE UPDATE ON user_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, initials, color)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    UPPER(LEFT(COALESCE(NEW.raw_user_meta_data->>'name', 'U'), 1)),
    '#D4A5A5'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on new auth user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- 9. CLEANUP & MAINTENANCE
-- ==========================================

-- Function to clean up expired pairing codes
CREATE OR REPLACE FUNCTION cleanup_expired_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM pairing_codes
  WHERE expires_at < NOW() AND NOT is_used;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- MIGRATION COMPLETE
-- ==========================================
-- Next steps:
-- 1. Deploy Supabase Edge Function for push notifications
-- 2. Configure your app's auth flow
-- 3. Test pairing and real-time updates
