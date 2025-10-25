export interface User {
  id: string;
  name: string;
  initials: string;
  color: string;
}

export interface StoryEntry {
  id: string;
  word: string; // Changed from text to word - one word at a time
  userId: string;
  timestamp: number;
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
}

export interface UserProfile {
  userId: string;
  name: string;
  initials: string;
  color: string;
  partnerId?: string;
  coupleCode?: string;
}
