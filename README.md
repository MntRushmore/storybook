# Dear We - The Ultimate Storytelling App ✨

A beautiful storytelling app where you can write stories with anyone, one word at a time - now with **Branch Mode, premium features, themes, voice input, streaks, and easy story sharing**!

## 🎉 Latest Features!

### 🌿 Branch Mode Storytelling (NEW!)
- **Parallel Stories**: Write your own version while your partner writes theirs
- **Same Prompt, Different Paths**: Start from the same beginning, create unique endings
- **Side-by-Side Comparison**: View both versions together or toggle between them
- **Merge Branches**: Combine elements from both stories into a new collaborative story
- **Beautiful Branch Cards**: Visual indicators show completion status for each version
- **Independent Writing**: No turn-taking - both partners write at their own pace

### 🎓 Welcome Tutorial (NEW!)
- **Interactive Onboarding**: Beautiful 5-step tutorial for new users
- **App Overview**: Learn how to create, share, and join stories
- **One-Time Display**: Shows automatically after signup
- **Skip Option**: Jump straight to the app if you prefer

### 📲 Story Code Sharing
- **Automatic Code Generation**: Every story gets a unique 6-digit code
- **Share Modal on Creation**: Code displays in a beautiful modal when you create a story
- **Share via Text/SMS**: Easily share story codes through any messaging app
- **One-Tap Sharing**: Share button built into story screen
- **Database Storage**: Codes are permanently stored and validated
- **No Partner Setup Required**: Anyone with the code can join your story

### ✨ Premium Subscription with RevenueCat
- **Real Payment Integration**: Full RevenueCat SDK implementation
- **Monthly & Annual Plans**: Choose your subscription
- **Restore Purchases**: Recover previous subscriptions
- **Feature Gating**: Smart premium feature management
- **Instant Activation**: Access premium features immediately after purchase

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

### 1. Run Database Migration (REQUIRED!)

**IMPORTANT:** The app requires database columns for Branch Mode and session codes to work.

#### Single Migration (Recommended - All-in-One)
1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/sql
2. Copy and paste the **entire SQL** from `supabase-complete-branch-migration.sql`
3. Click "Run"
4. Verify success by checking the output

This migration adds:
- ✅ `session_code` column (6-digit codes for joining)
- ✅ `collaboration_type` column (classic or branch)
- ✅ `parent_prompt_id` column (links branch stories)
- ✅ `branch_author_id` column (identifies branch author)
- ✅ Indexes for better query performance
- ✅ Constraints for data validation

**Migration is safe to run multiple times** - it uses `IF NOT EXISTS` checks.

#### Fixing Missing Session Codes (If Stories Cannot Be Joined)

If you created stories before running the migration, they may not have session codes. To fix this:

1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/sql
2. Copy and paste the **entire SQL** from `fix-missing-session-codes.sql`
3. Click "Run"
4. This will generate unique 6-digit codes for all existing stories

**Symptoms that indicate you need this fix:**
- Error message: "Story not found. The story you're trying to join may have been created before session codes were added."
- Cannot join branch mode stories even with the correct code
- Debug info shows "Available codes: []"

#### Alternative: Run Migrations Separately (Advanced)
If you prefer to run migrations in steps:
1. First run `supabase-migration-simple.sql` (base migration)
2. Then run `supabase-branch-mode-migration.sql` (Branch Mode specific)

**Note:** The single migration above includes everything you need!

### 2. RevenueCat Setup (Required for Premium)

**To enable real in-app purchases:**

1. **Create RevenueCat Account**
   - Sign up at https://www.revenuecat.com
   - Create a new project

2. **Configure App Store Connect**
   - Create your app in App Store Connect
   - Set up in-app purchase products (e.g., monthly, annual subscriptions)

3. **Connect RevenueCat to App Store**
   - In RevenueCat dashboard, add your iOS app
   - Connect to App Store Connect using API key
   - Configure your products and entitlements

4. **Add API Key**
   - Copy your RevenueCat public API key
   - Add to `.env` file:
     ```
     EXPO_PUBLIC_REVENUECAT_API_KEY=your_key_here
     ```

5. **Done!**
   - The app will automatically initialize RevenueCat
   - Users can now purchase premium subscriptions
   - Purchases are synced across devices

## 🎮 How to Use

### Start a New Story

**Classic Mode (Turn-Based):**
1. Tap "New Story" on home
2. Choose a theme and mode
3. Select a template or create custom prompt
4. Choose "Classic Mode" when prompted
5. Story code appears in a modal - share it with your partner!
6. Take turns adding words

**Branch Mode (Parallel Writing):**
1. Tap "New Story" on home
2. Choose a theme and mode
3. Select a template or create custom prompt
4. Choose "Branch Mode" when prompted
5. Both you and your partner get separate story branches
6. Write independently at your own pace
7. When both finish, compare versions in Memories!

### Share Your Story
**Option 1: Share when creating**
1. Create a new story
2. Story code modal appears automatically
3. Tap "Share Code" to send via text/SMS/messaging app

**Option 2: Share from story screen**
1. Open any story
2. Tap the share button in the header
3. Send the 6-digit code via text, SMS, or any messaging app

**Note:** Story codes are shown in a box on the story detail screen until a partner joins!

### Join a Story
1. Tap "Join" on home screen
2. Enter the 6-digit story code
3. Start writing together!

### Enable Premium
- Tap "Go Premium" in Settings
- Choose monthly or annual subscription
- Complete purchase through App Store
- Premium status syncs across devices
- Restore purchases if needed

### Track Your Streaks
- Write daily to maintain your streak
- View streak stats on home screen
- Premium users get advanced stats

### Take Turns

**Classic Mode:**
- Write one word (or sentence in Sentence mode)
- See last 3 words for context
- Wait for partner's turn
- Story completes at word limit

**Branch Mode:**
- Write at your own pace - no turn-taking
- Both partners write simultaneously
- Each creates their own complete story
- Compare versions when both finish
- Option to merge branches into new story

### Add Voice (Premium)
- Tap microphone icon to record word
- Audio saved with entry
- Play back in story timeline

## ✨ Complete Feature List

**Core Features:**
- Turn-based word writing (Classic Mode)
- Parallel storytelling (Branch Mode)
- Real-time cloud sync (Supabase)
- Automatic unique 6-digit story codes
- Story code modal on creation
- Story code sharing via SMS/text
- Simple join flow with validation
- Progress tracking
- Story reveal animations
- Branch comparison view
- Side-by-side and toggle viewing modes
- Merge branches functionality

**Premium Features:**
- 8 themed story modes
- 4 length modes (Quick/Standard/Epic/Sentence)
- 50+ curated templates
- Voice recording
- Streak tracking with stats
- Partner reactions
- Tags & collections
- Premium paywall
- Branch Mode (parallel writing)

## 🛠 Tech Stack

- **Frontend**: Expo SDK 53 + React Native 0.76.7
- **Backend**: Supabase (PostgreSQL + Real-time)
- **Payments**: RevenueCat + Apple In-App Purchase
- **State**: Zustand with AsyncStorage
- **Navigation**: React Navigation (Native Stack)
- **Styling**: Nativewind + TailwindCSS v3
- **Animations**: react-native-reanimated v3
- **Voice**: expo-av (audio recording)
- **TypeScript**: Full type safety

## 📱 App Structure

### Screens
- **HomeScreen**: Story list with streak display and daily prompt
- **TemplateSelectionScreen**: Theme/mode picker with templates + Branch Mode selection
- **StoryDetailScreen**: Writing interface with voice input, share button, and Branch Mode indicator
- **StoryRevealScreen**: Animated story completion
- **MemoriesScreen**: Finished stories with reactions + Branch story cards
- **BranchComparisonScreen**: Side-by-side branch viewing with merge functionality
- **JoinSessionScreen**: Simple story code entry
- **SettingsScreen**: Profile and premium management

### New Components
- **PaywallModal**: Beautiful subscription UI with real RevenueCat payments
- **BranchModeSelectionModal**: Choose Classic vs Branch Mode when creating stories
- **BranchStoryCard**: Display linked branch stories in Memories
- **StreakDisplay**: Daily streak visualization
- **TemplateCard**: Theme-styled template display
- **VoiceRecorder**: Audio recording interface
- **WelcomeModal**: Interactive 5-step tutorial for new users

### Services
- **revenueCat.ts**: Premium management with RevenueCat SDK
- **streakStore.ts**: Streak tracking state
- **storyStore.ts**: Enhanced with Branch Mode methods (createBranchStory, getBranchStories, mergeBranches)
- **storyConstants.ts**: Themes, templates, modes

### Database Schema
- **stories**: Enhanced with theme, mode, tags, reactions, collaboration_type, parent_prompt_id, branch_author_id
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
- ✅ RevenueCat integration (SDK installed, real payments enabled)
- ✅ Streak tracking
- ✅ App Store submission
- ✅ Real users

**Next Steps:**
1. Run the simple SQL migration
2. Complete RevenueCat setup in dashboard
3. Add your RevenueCat API key to .env
4. Test payment flow with sandbox account
5. Submit to App Store
6. Share with users!

## 📝 Changes from Original Template

**Removed:**
- ❌ Photo upload/attachments
- ❌ Story export (PDF/Image)
- ❌ Complex partner pairing system
- ❌ Old hash-based code generation
- ❌ Mock/demo payment system

**Added:**
- ✅ Branch Mode (parallel storytelling)
- ✅ Branch comparison screen
- ✅ Side-by-side and toggle view modes
- ✅ Merge branches functionality
- ✅ Branch story cards in Memories
- ✅ Mode selection modal
- ✅ Enhanced story types for branching
- ✅ Proper story code system with database storage
- ✅ Story code modal on creation
- ✅ Unique code generation with validation
- ✅ Share code button in modal
- ✅ Share via SMS/text functionality
- ✅ Interactive welcome tutorial
- ✅ First-time user onboarding
- ✅ Streak tracking system
- ✅ **Real RevenueCat payment integration**
- ✅ **react-native-purchases SDK**
- ✅ **Monthly & annual subscription packages**
- ✅ **Restore purchases functionality**
- ✅ Simplified database migration
- ✅ session_code column in database

---

**Built with ❤️ • Cloud-synced! • Streak Tracking! • Easy Sharing! • Beautiful Design!**

Dear We - Create memories together, one word at a time ✨

