export interface User {
  id: string;
  name: string;
  initials: string;
  color: string;
}

export interface StoryEntry {
  id: string;
  text: string;
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
  coupleCode?: string;
}

export interface UserProfile {
  userId: string;
  name: string;
  initials: string;
  color: string;
  partnerId?: string;
  coupleCode?: string;
}
