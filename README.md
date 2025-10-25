# WordChain - Couple Scrapbook App

A cozy, emotional mobile app where couples write stories together, one word at a time. Built with Expo SDK 53 and React Native 0.76.7.

## Overview

WordChain is a shared scrapbook app for couples where two people take turns adding one word at a time to create unique stories together. Each person only sees the last 3 words before adding their own, leading to surprising and memorable narratives. When a story reaches 75 words, both partners get a beautiful Story Reveal animation showing what they created together.

## Features

### Core Gameplay
- **Turn-Based Writing**: Partners alternate adding one word at a time
- **Limited Context**: Only the last 3 words are visible during your turn, making stories unpredictable and fun
- **Progress Tracking**: Visual progress bar showing words remaining (75 word limit)
- **Turn Indicators**: Clear UI showing whose turn it is to write

### Pairing & Sessions
- **6-Digit Codes**: Create or join stories using simple session codes
- **Solo Mode**: Write stories on your own if no partner has joined yet
- **Join Session Screen**: Easy-to-use interface for partners to connect

### Story Management
- **Active Stories**: View and continue all in-progress stories
- **Memories Tab**: Browse completed stories saved as memories
- **Story Details**: See full story text with word count and timestamps

### Story Reveal
- **Beautiful Animation**: Animated reveal screen when stories are completed
- **Stats Display**: Shows total words and number of authors
- **Haptic Feedback**: Vibration on story completion

### Daily Prompts
- **Fresh Ideas**: New story prompt every day (e.g., "Our dream vacation", "How we met")
- **Quick Start**: Tap the prompt card to instantly create a story with that theme

### Design
- **Warm Aesthetic**: Soft paper textures and warm color palette (#FFF8F0, #8B7355, #D4A5A5)
- **Scrapbook Feel**: Rounded cards with subtle shadows mimicking notebook pages
- **Custom Modals**: All confirmations use custom modal designs (no native alerts)
- **Safe Area**: Proper handling of notches and home indicators

## Tech Stack

- **Framework**: Expo SDK 53 with React Native 0.76.7
- **Navigation**: React Navigation (Native Stack & Bottom Tabs)
- **State Management**: Zustand with AsyncStorage persistence
- **Styling**: Nativewind (TailwindCSS for React Native)
- **Animations**: react-native-reanimated v3
- **Icons**: @expo/vector-icons (Ionicons)
- **Dates**: date-fns
- **Haptics**: expo-haptics

## App Structure

### Screens
- **HomeScreen**: Main screen showing active stories, daily prompt, and action buttons
- **StoryDetailScreen**: Turn-based gameplay screen with word input and progress tracking
- **StoryRevealScreen**: Animated reveal when stories are finished
- **JoinSessionScreen**: Enter 6-digit code to join a partner's story
- **MemoriesScreen**: Browse completed stories
- **SettingsScreen**: User profile and pairing options

### State Management (Zustand)
- **User Profile**: Name, initials, color, optional couple code
- **Stories**: Array of all stories (active and finished)
- **Story Properties**:
  - `id`, `title`, `entries` (array of words)
  - `createdAt`, `updatedAt`, `isFinished`, `isRevealed`
  - `currentTurnUserId`: Tracks whose turn it is
  - `maxWords`: Default 75 words
  - `sessionCode`: 6-digit code for pairing
  - `creatorId`, `partnerId`: User IDs

### Key Functions
- `addWord(storyId, word)`: Add one word and switch turns
- `createStory(title?, prompt?)`: Create new story with session code
- `joinSession(sessionCode, partnerId)`: Join existing story
- `finishStory(storyId)`: Mark story as complete
- `revealStory(storyId)`: Mark reveal animation as shown
- `isMyTurn(storyId)`: Check if it's user's turn
- `getLastThreeWords(storyId)`: Get last 3 words for context

## How It Works

### Creating a Story
1. Tap "New Story" on home screen
2. Enter a title (or leave blank)
3. Story is created with a unique 6-digit session code
4. Share the code with your partner

### Joining a Story
1. Tap "Join" on home screen
2. Enter the 6-digit code from your partner
3. Navigate to the story and start writing together

### Playing
1. When it's your turn, you'll see "Your turn to add a word!"
2. View the last 3 words for context
3. Tap "Add Your Word" and type a single word
4. The turn automatically switches to your partner
5. Story auto-completes at 75 words

### Story Completion
1. Manual: Tap "Finish Story" button at any time
2. Auto: Story automatically finishes when reaching max words
3. Story Reveal animation plays with haptic feedback
4. Story moves to Memories tab

## Design Principles

1. **One Word at a Time**: Enforces single-word entries for the game mechanic
2. **Limited Context**: Only showing last 3 words creates surprises
3. **Visual Feedback**: Progress bars, turn indicators, and animations
4. **No Alerts**: Custom modals instead of native alerts for better UX
5. **Warm Colors**: Brown/beige palette for cozy scrapbook feel
6. **Safe Spacing**: Proper keyboard handling and safe area insets

## Daily Prompts

The app includes 30 rotating prompts that change daily based on the day of year:
- Our dream vacation
- How we met
- A perfect day together
- Our favorite memory
- If we were superheroes
- And 25 more...

## Future Enhancements (Not Implemented)

These features were planned but not built in this version:
- Real-time sync with Supabase/Firebase (currently local-only)
- Push notifications for turn alerts
- Decorate Mode (stickers, doodles, drawings)
- Photo attachments to stories
- AI-generated story summaries
- Paper textures and handwritten fonts
- Ambient paper sounds
- Widget showing current story
- Export/share stories

## Running the App

The app is pre-configured and running on the Vibecode platform. The development server runs automatically on port 8081. Users interact with the app through the Vibecode mobile app.

## Notes

- Stories are stored locally using AsyncStorage via Zustand persistence
- Session codes are generated randomly (6 digits, 100000-999999)
- Turn-based logic alternates between creatorId and partnerId
- Solo mode allows playing alone until a partner joins
- Type-safe navigation with TypeScript
- Follows Apple Human Interface Guidelines

---

Built with ❤️ using Expo and React Native
