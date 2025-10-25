# WordChain - Real-Time Cloud Sync! ☁️✨

A beautiful couple scrapbook app where partners write stories together, one word at a time - now with **Supabase real-time sync**!

## 🎉 Latest Updates - Cloud Database Added!

### ✅ Supabase Integration COMPLETE
- **Real-Time Sync**: Stories sync instantly between partners
- **Cloud Storage**: All stories saved in Supabase database
- **No More Local-Only**: Stories persist across devices
- **Auto-Reload**: Stories load automatically on app start
- **Live Updates**: See partner's words appear in real-time

### ✅ Setup Required (One Time Only)
Before using the app, you need to set up the database tables:

1. Go to your Supabase project: https://supabase.com/dashboard/project/qwafuwhkksaffmbzfqpq
2. Click "SQL Editor" in the left sidebar
3. Copy and paste the SQL from `supabase-migration.sql` (in project root)
4. Click "Run" to create the tables

That's it! The app will now sync stories between all devices.

### ✅ Partner Connection NOW WORKS
- **True Multi-Device**: Create story on one device, join on another
- **Session Codes**: Share 6-digit code with your partner
- **Real-Time Turns**: Both users see updates instantly
- **Automatic Sync**: No manual refresh needed

### ✅ Shuffle Prompt Added
- **Shuffle Button**: Tap the shuffle icon to get random prompts
- **30 Prompts**: Rotating collection of creative story ideas
- **Quick Start**: Tap prompt to instantly create story

### ✅ Improved UI/UX
- **Larger Buttons**: Better tap targets with py-4 and py-5
- **Elegant Word Input**: Large, centered text input (text-2xl)
- **Better Shadows**: Professional depth with improved elevation
- **Error Messages**: Clear warnings with icons
- **Polished Design**: Production-quality throughout

## 🎮 How to Use

### Create & Share Story
1. Tap "New Story" or use daily prompt
2. Story gets a 6-digit code (shown in story detail)
3. Share code with your partner

### Join Partner's Story
1. Tap "Join" button on home
2. Enter partner's 6-digit code
3. Start writing together!

### Take Turns
- Only add words on your turn
- See "Your turn" vs "Waiting for partner"
- Last 3 words visible for context
- Story completes at 75 words

## ✨ Features

- **Turn-Based Gameplay**: One word at a time
- **Limited Context**: Only see last 3 words
- **Progress Tracking**: Visual progress bar
- **Story Reveal**: Beautiful animation when complete
- **Daily Prompts**: Fresh ideas with shuffle
- **Memories**: Browse finished stories
- **Production Design**: Warm, cozy scrapbook aesthetic

## 🛠 Tech Stack

- Expo SDK 53 + React Native 0.76.7
- **Supabase** (PostgreSQL + Real-time subscriptions)
- Zustand (local state only for user profile)
- React Navigation
- Nativewind + TailwindCSS
- react-native-reanimated
- TypeScript

## 📱 App Structure

### Database (Supabase)
- **stories** table: Story metadata (title, session code, turn info)
- **story_entries** table: Individual words with timestamps
- Real-time subscriptions for instant sync

### Local State (Zustand)
- **storyStore**: Cached stories + user profile (syncs with Supabase)

### Screens
- HomeScreen (with shuffleable prompt)
- StoryDetailScreen (improved UI)
- JoinSessionScreen (now working!)
- StoryRevealScreen
- MemoriesScreen
- SettingsScreen

## 🎨 Design Highlights

- Warm color palette (#FFF8F0, #8B7355, #D4A5A5)
- Paper-like rounded cards
- Custom modals (no native alerts)
- Smooth animations
- Professional shadows and spacing

## Production Ready! 🚀

All core features working with **real-time cloud sync**! Partners can now truly write stories together across devices. Just run the SQL migration once and start creating memories!

---

Built with ❤️ • **Cloud-synced!** • **Real-time updates!** • **Beautiful design!**
