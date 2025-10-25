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
  createStory: (title: string) => string;
  addEntry: (storyId: string, text: string) => void;
  finishStory: (storyId: string) => void;
  deleteStory: (storyId: string) => void;

  // Couple pairing
  generateCoupleCode: () => string;
  pairWithPartner: (coupleCode: string) => void;

  // Helpers
  getActiveStories: () => Story[];
  getFinishedStories: () => Story[];
  getStoryById: (id: string) => Story | undefined;
}

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

      createStory: (title: string) => {
        const newStory: Story = {
          id: uuidv4(),
          title,
          entries: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          isFinished: false,
          coupleCode: get().userProfile?.coupleCode,
        };

        set(state => ({
          stories: [newStory, ...state.stories],
        }));

        return newStory.id;
      },

      addEntry: (storyId: string, text: string) => {
        const userProfile = get().userProfile;
        if (!userProfile) return;

        set(state => ({
          stories: state.stories.map(story =>
            story.id === storyId
              ? {
                  ...story,
                  entries: [
                    ...story.entries,
                    {
                      id: uuidv4(),
                      text,
                      userId: userProfile.userId,
                      timestamp: Date.now(),
                    },
                  ],
                  updatedAt: Date.now(),
                }
              : story
          ),
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

      generateCoupleCode: () => {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        get().updateUserProfile({ coupleCode: code });
        return code;
      },

      pairWithPartner: (coupleCode: string) => {
        get().updateUserProfile({ coupleCode });
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
    }),
    {
      name: "story-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
