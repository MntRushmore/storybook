# 🚀 WordChain Production Deployment Guide

## 📋 SQL Migration Script

Copy and paste this into your Supabase SQL Editor:

```sql
-- WordChain Production Migration
-- Run this in Supabase SQL Editor
-- Safe to run multiple times

-- Add new columns to existing stories table
ALTER TABLE stories ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'romance';
ALTER TABLE stories ADD COLUMN IF NOT EXISTS mode TEXT DEFAULT 'standard';
ALTER TABLE stories ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE stories ADD COLUMN IF NOT EXISTS reactions JSONB DEFAULT '{}';
ALTER TABLE stories ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE;

-- Add audio column to story_entries
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
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);

-- Enable Row Level Security (RLS) on user_stats
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for user_stats (allow all operations)
DROP POLICY IF EXISTS "Allow all operations on user_stats" ON user_stats;
CREATE POLICY "Allow all operations on user_stats" ON user_stats FOR ALL USING (true) WITH CHECK (true);

-- Enable realtime for user_stats
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE user_stats;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Could not enable realtime - app will still work';
END $$;
```

---

## 💳 RevenueCat Setup (Real Payments)

### Step 1: Create RevenueCat Account
1. Go to https://www.revenuecat.com/
2. Sign up (free tier available)
3. Create new project: "WordChain"

### Step 2: Create In-App Purchases in App Store Connect
1. Go to https://appstoreconnect.apple.com/
2. Select your app
3. Go to **Monetization → Subscriptions**
4. Create subscription group: "WordChain Premium"
5. Create 2 subscriptions:

**Monthly Subscription:**
- Product ID: `wordchain_premium_monthly`
- Reference Name: "WordChain Premium Monthly"
- Duration: 1 Month
- Price: $4.99

**Yearly Subscription:**
- Product ID: `wordchain_premium_yearly`
- Reference Name: "WordChain Premium Yearly"
- Duration: 1 Year
- Price: $29.99

### Step 3: Connect App Store to RevenueCat
1. In RevenueCat Dashboard → **Project Settings**
2. Click **Apple App Store**
3. Add:
   - **App Bundle ID**: Your app's bundle ID
   - **Shared Secret**: From App Store Connect → App Information
   - **App Store Connect API Key**: Create in App Store Connect → Users and Access → Keys

### Step 4: Configure RevenueCat Entitlements
1. In RevenueCat → **Entitlements**
2. Create entitlement: `premium`
3. Attach both products (monthly and yearly)

### Step 5: Create Offerings
1. In RevenueCat → **Offerings**
2. Create offering: `default`
3. Add packages:
   - `$rc_monthly` → `wordchain_premium_monthly`
   - `$rc_annual` → `wordchain_premium_yearly`

### Step 6: Install RevenueCat SDK

```bash
cd /home/user/workspace
bun add react-native-purchases
```

### Step 7: Get Your API Keys
1. In RevenueCat Dashboard → **API Keys**
2. Copy:
   - **iOS API Key** (starts with `appl_`)
   - **Android API Key** (starts with `goog_`)

### Step 8: Add API Keys to Vibecode

**Option A: Using Vibecode ENV Tab (Recommended)**
1. Open Vibecode app
2. Go to ENV tab
3. Add:
   - Key: `REVENUE_CAT_IOS_KEY`, Value: `appl_your_key_here`
   - Key: `REVENUE_CAT_ANDROID_KEY`, Value: `goog_your_key_here`

**Option B: Using .env file**
Create `.env` file in project root:
```
REVENUE_CAT_IOS_KEY=appl_your_key_here
REVENUE_CAT_ANDROID_KEY=goog_your_key_here
```

### Step 9: Update app.json

Add to your `app.json`:

```json
{
  "expo": {
    "extra": {
      "revenueCatIosKey": process.env.REVENUE_CAT_IOS_KEY,
      "revenueCatAndroidKey": process.env.REVENUE_CAT_ANDROID_KEY
    }
  }
}
```

### Step 10: Replace revenueCat.ts

Replace the contents of `src/services/revenueCat.ts` with the code from `src/services/revenueCat.production.example.ts` (uncomment it).

### Step 11: Initialize in App.tsx

Add this to your `App.tsx`:

```typescript
import { useEffect } from 'react';
import { initializeRevenueCat } from './src/services/revenueCat';
import { useStoryStore } from './src/state/storyStore';

export default function App() {
  const userProfile = useStoryStore(s => s.userProfile);

  useEffect(() => {
    if (userProfile?.userId) {
      initializeRevenueCat(userProfile.userId);
    }
  }, [userProfile?.userId]);

  // ... rest of your app code
}
```

---

## 🧪 Testing

### Test Subscriptions (Development)
1. Create sandbox tester in App Store Connect:
   - Users and Access → Sandbox Testers
   - Add new tester with unique email
2. Sign out of App Store on device
3. Run app: `bun ios`
4. Try purchasing - use sandbox account when prompted
5. Verify purchase completes
6. Test restore purchases

### Production Testing Checklist
- [ ] Sandbox purchases work
- [ ] Restore purchases works
- [ ] Premium features unlock after purchase
- [ ] Prices display correctly
- [ ] Purchase cancellation handled gracefully
- [ ] No crashes during purchase flow

---

## 📱 Download Your Project Files

Your project is located at: `/home/user/workspace/`

To download all files, you can:

### Option 1: Download from Vibecode
The Vibecode system should have an export or download option in the app.

### Option 2: Create a ZIP (via this chat)
Let me know if you want me to create a ZIP file of your project.

### Option 3: Push to GitHub
```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Production-ready WordChain app with streaks and premium"

# Add your GitHub repo
git remote add origin https://github.com/YOUR_USERNAME/wordchain.git

# Push
git push -u origin main
```

---

## ✅ Production Readiness Checklist

### Database
- [ ] SQL migration run successfully
- [ ] `user_stats` table created
- [ ] All indexes created
- [ ] RLS policies configured

### App Features
- [ ] Streak tracking working
- [ ] Premium toggle in Settings works
- [ ] Voice input functional (premium)
- [ ] All themes display correctly
- [ ] Story modes work (Quick, Standard, Epic, Sentence)
- [ ] Partner connection via codes works
- [ ] Real-time sync working

### RevenueCat (if using real payments)
- [ ] RevenueCat SDK installed
- [ ] API keys configured
- [ ] Products created in App Store Connect
- [ ] Entitlements configured
- [ ] Offerings created
- [ ] Tested with sandbox account
- [ ] initializeRevenueCat called on app start

### App Store Submission
- [ ] Bundle ID configured
- [ ] Version and build number set
- [ ] App icons added (1024x1024)
- [ ] Screenshots prepared
- [ ] Privacy policy created
- [ ] App description written
- [ ] Keywords optimized
- [ ] In-App Purchase capability enabled
- [ ] Signed with distribution certificate

### Legal
- [ ] Privacy policy mentions subscriptions
- [ ] Terms of service updated
- [ ] Refund policy stated
- [ ] Contact information provided

---

## 📊 Current App Status

**✅ Implemented:**
- Streak tracking with beautiful UI
- Local premium mode (no RevenueCat needed)
- All 8 themes
- Voice input support
- Multiple story modes
- 50+ templates
- Real-time Supabase sync
- Partner reactions
- Tags & collections

**⚡ Quick Start (Development Mode):**
1. Run SQL migration above
2. App works immediately with local premium toggle
3. No external services needed

**💰 Production Mode (Real Payments):**
1. Follow RevenueCat setup above
2. Users can purchase real subscriptions
3. Automatic subscription management

---

## 🆘 Support

**RevenueCat Issues:**
- Docs: https://docs.revenuecat.com/
- Dashboard: https://app.revenuecat.com/

**Supabase Issues:**
- Docs: https://supabase.com/docs
- Dashboard: https://supabase.com/dashboard

**Common Problems:**

**"No products found"**
- Wait 24 hours after creating products in App Store Connect
- Clear build and reinstall app
- Check Bundle ID matches exactly

**"Purchase fails"**
- Ensure using sandbox tester account
- Check agreements signed in App Store Connect
- Verify API keys are correct

**"Streaks not updating"**
- Check SQL migration ran successfully
- Verify `user_stats` table exists
- Check console for errors

---

## 💰 Monetization Tips

**Pricing Strategy:**
- Monthly: $4.99 (competitive)
- Yearly: $29.99 (40% savings = better conversion)

**Marketing:**
- Free tier is generous (3 stories, 3 themes)
- Clear value proposition in paywall
- Emphasize "unlimited" and exclusive themes
- Highlight couple-focused features

**Conversion Optimization:**
- Show paywall after 2-3 stories created
- Remind when hitting free tier limits
- Offer annual discount prominently
- Make premium features visible but locked

---

## 📁 Project Structure

```
/home/user/workspace/
├── src/
│   ├── api/                 # Supabase & AI integrations
│   ├── components/          # React components
│   │   ├── PaywallModal.tsx
│   │   ├── StreakDisplay.tsx
│   │   └── ...
│   ├── screens/             # App screens
│   │   ├── HomeScreen.tsx   # With streak display
│   │   ├── SettingsScreen.tsx # With premium toggle
│   │   └── ...
│   ├── services/
│   │   ├── revenueCat.ts    # Current (local mode)
│   │   └── revenueCat.production.example.ts # For real payments
│   ├── state/
│   │   ├── storyStore.ts    # Main app state
│   │   └── streakStore.ts   # Streak tracking
│   ├── types/               # TypeScript types
│   └── utils/               # Helpers
├── assets/                  # Images, fonts
├── supabase-migration-simple.sql  # SQL to run
├── PRODUCTION_REVENUECAT_SETUP.md # RevenueCat guide
├── README.md                # Full documentation
└── package.json
```

---

**You're production-ready!** 🎉

Current mode: Local premium (works out of the box)
To enable real payments: Follow RevenueCat setup above

Questions? Just ask!
