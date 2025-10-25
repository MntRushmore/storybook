import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Story, StoryEntry, UserProfile } from "../types/story";
import { v4 as uuidv4 } from "uuid";

interface StoryState {
  stories: Story[];
  userProfile: UserProfile | null;

  // User actions
  createUserProfile: (name: string) => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;

  // Story actions
  createStory: (title?: string, prompt?: string) => string;
  addWord: (storyId: string, word: string) => void;
  finishStory: (storyId: string) => void;
  deleteStory: (storyId: string) => void;
  revealStory: (storyId: string) => void;

  // Session management
  generateSessionCode: () => string;
  joinSession: (sessionCode: string, partnerId: string) => void;

  // Helpers
  getActiveStories: () => Story[];
  getFinishedStories: () => Story[];
  getStoryById: (id: string) => Story | undefined;
  isMyTurn: (storyId: string) => boolean;
  getLastThreeWords: (storyId: string) => string[];
}

const DEFAULT_MAX_WORDS = 75;

export const useStoryStore = create<StoryState>()(
  persist(
    (set, get) => ({
      stories: [],
      userProfile: null,

      createUserProfile: (name: string) => {
        const colors = ["#E8B4B8", "#D4A5A5", "#C98686", "#B87E7E", "#A67C8C"];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        const initials = name
          .split(" ")
          .map(word => word[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);

        set({
          userProfile: {
            userId: uuidv4(),
            name,
            initials,
            color: randomColor,
          },
        });
      },

      updateUserProfile: (profile: Partial<UserProfile>) => {
        const currentProfile = get().userProfile;
        if (currentProfile) {
          set({
            userProfile: { ...currentProfile, ...profile },
          });
        }
      },

      createStory: (title?: string, prompt?: string) => {
        const userProfile = get().userProfile;
        if (!userProfile) throw new Error("User profile not found");

        const storyTitle = title || prompt || "Untitled Story";
        const sessionCode = Math.floor(100000 + Math.random() * 900000).toString();

        const newStory: Story = {
          id: uuidv4(),
          title: storyTitle,
          entries: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          isFinished: false,
          currentTurnUserId: userProfile.userId,
          maxWords: DEFAULT_MAX_WORDS,
          sessionCode,
          creatorId: userProfile.userId,
          isRevealed: false,
        };

        set(state => ({
          stories: [newStory, ...state.stories],
        }));

        return newStory.id;
      },

      addWord: (storyId: string, word: string) => {
        const userProfile = get().userProfile;
        if (!userProfile) return;

        set(state => ({
          stories: state.stories.map(story => {
            if (story.id !== storyId) return story;

            const newEntry: StoryEntry = {
              id: uuidv4(),
              word: word.trim(),
              userId: userProfile.userId,
              timestamp: Date.now(),
            };

            const newEntries = [...story.entries, newEntry];

            // Determine next turn
            let nextTurnUserId: string;
            if (story.partnerId) {
              // Alternate between creator and partner
              nextTurnUserId = story.currentTurnUserId === story.creatorId
                ? story.partnerId
                : story.creatorId;
            } else {
              // Solo mode - always current user
              nextTurnUserId = userProfile.userId;
            }

            // Check if story should auto-finish
            const shouldFinish = newEntries.length >= story.maxWords;

            return {
              ...story,
              entries: newEntries,
              updatedAt: Date.now(),
              currentTurnUserId: nextTurnUserId,
              isFinished: shouldFinish,
            };
          }),
        }));
      },

      finishStory: (storyId: string) => {
        set(state => ({
          stories: state.stories.map(story =>
            story.id === storyId
              ? { ...story, isFinished: true, updatedAt: Date.now() }
              : story
          ),
        }));
      },

      deleteStory: (storyId: string) => {
        set(state => ({
          stories: state.stories.filter(story => story.id !== storyId),
        }));
      },

      revealStory: (storyId: string) => {
        set(state => ({
          stories: state.stories.map(story =>
            story.id === storyId
              ? { ...story, isRevealed: true }
              : story
          ),
        }));
      },

      generateSessionCode: () => {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        return code;
      },

      joinSession: (sessionCode: string, partnerId: string) => {
        set(state => ({
          stories: state.stories.map(story =>
            story.sessionCode === sessionCode
              ? { ...story, partnerId }
              : story
          ),
        }));
      },

      getActiveStories: () => {
        return get().stories.filter(story => !story.isFinished);
      },

      getFinishedStories: () => {
        return get().stories.filter(story => story.isFinished);
      },

      getStoryById: (id: string) => {
        return get().stories.find(story => story.id === id);
      },

      isMyTurn: (storyId: string) => {
        const userProfile = get().userProfile;
        const story = get().getStoryById(storyId);
        if (!userProfile || !story) return false;
        return story.currentTurnUserId === userProfile.userId;
      },

      getLastThreeWords: (storyId: string) => {
        const story = get().getStoryById(storyId);
        if (!story) return [];
        const lastThree = story.entries.slice(-3);
        return lastThree.map(entry => entry.word);
      },
    }),
    {
      name: "story-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
