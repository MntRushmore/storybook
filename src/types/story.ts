export interface User {
  id: string;
  name: string;
  initials: string;
  color: string;
}

export type StoryTheme = 'romance' | 'adventure' | 'comedy' | 'mystery' | 'fantasy' | 'scifi' | 'horror' | 'slice-of-life';
export type StoryMode = 'quick' | 'standard' | 'epic' | 'sentence';

export interface StoryEntry {
  id: string;
  word: string; // Changed from text to word - one word at a time
  userId: string;
  userName: string; // Store name for display
  timestamp: number;
  audioUrl?: string; // Voice recording URL
  photoUrl?: string; // Photo URL
}

export interface Story {
  id: string;
  title: string;
  entries: StoryEntry[];
  createdAt: number;
  updatedAt: number;
  isFinished: boolean;
  currentTurnUserId: string; // Tracks whose turn it is
  maxWords: number; // Story finishes when this many words reached
  sessionCode?: string; // Code for partner to join
  creatorId: string; // Who created the story
  partnerId?: string; // Partner's user ID
  isRevealed: boolean; // Has the story reveal animation been shown
  theme: StoryTheme; // Story theme
  mode: StoryMode; // Story mode
  tags: string[]; // Story tags
  coverPhotoUrl?: string; // Cover photo
  reactions: { [userId: string]: string }; // User reactions (emoji)
  isPremium: boolean; // Premium features used
}

export interface UserProfile {
  userId: string;
  name: string;
  initials: string;
  color: string;
  partnerId?: string;
  coupleCode?: string;
  isPremium?: boolean; // RevenueCat premium status
}

export interface UserStats {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
  totalStories: number;
  totalWords: number;
  createdAt: number;
  updatedAt: number;
}

export interface StoryPhoto {
  id: string;
  storyId: string;
  photoUrl: string;
  caption?: string;
  userId: string;
  timestamp: number;
}

export interface StoryTemplate {
  id: string;
  title: string;
  theme: StoryTheme;
  prompt: string;
  isPremium: boolean;
}

export interface Reaction {
  emoji: string;
  label: string;
}
