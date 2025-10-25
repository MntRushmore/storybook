# WordChain Premium - The Ultimate Storytelling App ✨

A beautiful storytelling app where you can write stories with anyone, one word at a time - now with **premium features, themes, voice input, streaks, and easy story sharing**!

## 🎉 Latest Features!

### 🎓 Welcome Tutorial (NEW!)
- **Interactive Onboarding**: Beautiful 5-step tutorial for new users
- **App Overview**: Learn how to create, share, and join stories
- **One-Time Display**: Shows automatically after signup
- **Skip Option**: Jump straight to the app if you prefer

### 📲 Story Code Sharing
- **Share via Text/SMS**: Easily share story codes through any messaging app
- **6-Digit Join Codes**: Simple codes to join any story
- **One-Tap Sharing**: Share button built into story screen
- **No Partner Setup Required**: Anyone with the code can join your story

### ✨ Premium Subscription (Local Mode)
- **Easy Premium Toggle**: Enable premium directly in Settings
- **No RevenueCat Required**: Works with local state storage
- **Feature Gating**: Smart premium feature management
- **Instant Activation**: Toggle premium on/off anytime

### 🔥 Streak Tracking
- **Daily Writing Streaks**: Track consecutive days of writing
- **Milestone Celebrations**: See your longest streak
- **Activity Statistics**: Total stories and words written
- **Visual Display**: Beautiful streak UI on home screen

### 🎨 Story Themes & Templates
- **8 Unique Themes**: Romance, Adventure, Comedy, Mystery, Fantasy, Sci-Fi, Horror, Slice-of-Life
- **50+ Story Templates**: Pre-written prompts organized by theme
- **Custom Prompts**: Create your own story starters
- **Theme-Based Styling**: Each theme has unique colors and gradients

### 📏 Multiple Story Modes
- **Quick Mode** (25 words): 5-minute stories
- **Standard Mode** (75 words): Classic experience
- **Epic Mode** (150 words): Long-form storytelling (Premium)
- **Sentence Mode** (20 sentences): Full sentence turns (Premium)

### 🎤 Voice Input (Premium)
- Record words instead of typing
- More intimate and spontaneous
- Audio playback in story view

### 🏷️ Tags & Collections
- Organize stories with custom tags
- Filter by theme, date, or mood
- Better story management

### 💕 Partner Reactions
- React to completed stories with emojis
- 10 reaction options
- See partner reactions

## 💎 Premium Features

**Free Tier includes:**
- 3 active stories
- 3 themes (Romance, Comedy, Slice-of-Life)
- Quick & Standard modes
- Basic templates
- Story code sharing

**Premium Unlocks:**
- ✨ Unlimited active stories
- 🎨 All 8 themes
- 📚 50+ premium templates
- 🎤 Voice input
- 🏷️ Custom tags
- 🚀 Epic & Sentence modes
- 🔥 Streak tracking

## 🛠 Setup Instructions

### 1. Run Database Migration

The app requires new database tables. **Choose the migration that works for you:**

#### Option A: Simple Migration (Recommended - No Root Access Needed)
1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/sql
2. Copy and paste the SQL from `supabase-migration-simple.sql`
3. Click "Run"

This migration:
- Adds new columns to existing tables
- Creates user_stats table for streaks
- Works without special permissions
- Safe to run multiple times

#### Option B: Full Migration (If You Have Admin Access)
1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/sql
2. Copy and paste the SQL from `supabase-migration.sql`
3. Click "Run"

This includes everything in Option A plus:
- Full table recreation with all constraints
- Complete realtime setup
- Advanced indexing

**Note:** If you get permission errors, use Option A instead!

### 2. Enable Premium (Optional)

Premium works with local storage - no external setup needed!

To activate premium:
1. Open the app
2. Go to Settings
3. Tap "Go Premium"
4. Tap "Start Premium" button
5. Done! All premium features unlocked

**That's it!** No API keys, no payment setup, no RevenueCat account needed.

## 🎮 How to Use

### Start a New Story
1. Tap "New Story" on home
2. Choose a theme and mode
3. Select a template or create custom prompt
4. Start writing!

### Share Your Story
1. Open any story
2. Tap the share button in the header
3. Send the 6-digit code via text, SMS, or any messaging app
4. Anyone with the code can join and write with you!

### Join a Story
1. Tap "Join" on home screen
2. Enter the 6-digit story code
3. Start writing together!

### Enable Premium
- Tap "Go Premium" in Settings
- Subscribe to unlock all features
- Premium status syncs locally

### Track Your Streaks
- Write daily to maintain your streak
- View streak stats on home screen
- Premium users get advanced stats

### Take Turns
- Write one word (or sentence in Sentence mode)
- See last 3 words for context
- Wait for partner's turn
- Story completes at word limit

### Add Voice (Premium)
- Tap microphone icon to record word
- Audio saved with entry
- Play back in story timeline

## ✨ Complete Feature List

**Core Features:**
- Turn-based word writing
- Real-time cloud sync (Supabase)
- Story code sharing via SMS/text
- Simple 6-digit join codes
- Progress tracking
- Story reveal animations

**Premium Features:**
- 8 themed story modes
- 4 length modes (Quick/Standard/Epic/Sentence)
- 50+ curated templates
- Voice recording
- Streak tracking with stats
- Partner reactions
- Tags & collections
- Premium paywall

## 🛠 Tech Stack

- **Frontend**: Expo SDK 53 + React Native 0.76.7
- **Backend**: Supabase (PostgreSQL + Real-time)
- **Payments**: Local storage (no external service needed)
- **State**: Zustand with AsyncStorage
- **Navigation**: React Navigation (Native Stack)
- **Styling**: Nativewind + TailwindCSS v3
- **Animations**: react-native-reanimated v3
- **Voice**: expo-av (audio recording)
- **TypeScript**: Full type safety

## 📱 App Structure

### Screens
- **HomeScreen**: Story list with streak display and daily prompt
- **TemplateSelectionScreen**: Theme/mode picker with templates
- **StoryDetailScreen**: Writing interface with voice input and share button
- **StoryRevealScreen**: Animated story completion
- **MemoriesScreen**: Finished stories with reactions
- **JoinSessionScreen**: Simple story code entry
- **SettingsScreen**: Profile and premium management

### New Components
- **PaywallModal**: Beautiful subscription UI (local mode)
- **StreakDisplay**: Daily streak visualization
- **TemplateCard**: Theme-styled template display
- **VoiceRecorder**: Audio recording interface
- **WelcomeModal**: Interactive 5-step tutorial for new users

### Services
- **revenueCat.ts**: Premium management (local storage)
- **streakStore.ts**: Streak tracking state
- **storyConstants.ts**: Themes, templates, modes

### Database Schema
- **stories**: Enhanced with theme, mode, tags, reactions
- **story_entries**: Enhanced with audio_url
- **user_stats**: New table for streak tracking

## 🎨 Design System

**Colors:**
- Background: #FFF8F0 (warm paper)
- Primary: #D4A5A5 (rose)
- Text: #8B7355 (brown)
- Accent: #A0927D (muted gold)
- Premium: #FFD700 (gold)
- Streak: #FF6B35 (flame orange)

**Theme Colors:**
- Romance: Pink gradients
- Adventure: Green gradients
- Comedy: Yellow gradients
- Mystery: Purple gradients
- Fantasy: Violet gradients
- Sci-Fi: Blue gradients
- Horror: Dark red gradients
- Slice-of-Life: Cyan gradients

## 🚀 Production Ready!

All features implemented and ready for:
- ✅ Database migration (simple version available)
- ✅ Local premium mode (no external setup)
- ✅ Streak tracking
- ✅ App Store submission
- ✅ Real users

**Next Steps:**
1. Run the simple SQL migration
2. Test all features
3. Enable premium in Settings
4. Submit to App Store
5. Share with users!

## 📝 Changes from Original Template

**Removed:**
- ❌ Photo upload/attachments
- ❌ Story export (PDF/Image)
- ❌ RevenueCat integration requirement
- ❌ Complex partner pairing system

**Added:**
- ✅ Simple story code sharing
- ✅ Share via SMS/text functionality
- ✅ Interactive welcome tutorial
- ✅ First-time user onboarding
- ✅ Streak tracking system
- ✅ Local premium mode
- ✅ Simplified database migration
- ✅ Premium toggle in Settings
- ✅ One-tap story code generation

---

**Built with ❤️ • Cloud-synced! • Streak Tracking! • Easy Sharing! • Beautiful Design!**

WordChain - Create memories together, one word at a time ✨

