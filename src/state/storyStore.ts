import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Story, StoryEntry, UserProfile } from "../types/story";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../api/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useStreakStore } from "./streakStore";
import { scheduleYourTurnNotification } from "../services/pushNotifications";

interface StoryState {
  stories: Story[];
  userProfile: UserProfile | null;
  subscriptions: Map<string, RealtimeChannel>;

  // User actions
  createUserProfile: (name: string) => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;

  // Story actions
  createStory: (title?: string, prompt?: string) => Promise<string>;
  addWord: (storyId: string, word: string) => Promise<void>;
  finishStory: (storyId: string) => Promise<void>;
  deleteStory: (storyId: string) => Promise<void>;
  revealStory: (storyId: string) => void;

  // Session management
  generateSessionCode: () => string;
  joinSession: (sessionCode: string) => Promise<string | undefined>;

  // Sync functions
  subscribeToStory: (storyId: string) => void;
  unsubscribeFromStory: (storyId: string) => void;
  syncStoryFromDB: (storyId: string) => Promise<void>;
  loadUserStories: () => Promise<void>;

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
      subscriptions: new Map(),

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

      createStory: async (title?: string, prompt?: string) => {
        const userProfile = get().userProfile;
        if (!userProfile) throw new Error("User profile not found");

        const storyTitle = title || prompt || "Untitled Story";
        const sessionCode = Math.floor(100000 + Math.random() * 900000).toString();
        const storyId = uuidv4();

        const newStory: Story = {
          id: storyId,
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
          theme: 'romance',
          mode: 'standard',
          tags: [],
          reactions: {},
          isPremium: false,
        };

        // Save to Supabase
        const { error } = await supabase.from("stories").insert({
          id: storyId,
          title: storyTitle,
          session_code: sessionCode,
          creator_id: userProfile.userId,
          creator_name: userProfile.name,
          current_turn_user_id: userProfile.userId,
          max_words: DEFAULT_MAX_WORDS,
          is_finished: false,
          is_revealed: false,
          created_at: Date.now(),
          updated_at: Date.now(),
        });

        if (error) {
          console.error("Error creating story:", error);
          throw error;
        }

        // Add to local state
        set(state => ({
          stories: [newStory, ...state.stories],
        }));

        // If there's a prompt, add it as initial words
        if (prompt && prompt.trim()) {
          const words = prompt.trim().split(/\s+/).slice(0, 5); // Take first 5 words
          for (const word of words) {
            const entryId = uuidv4();
            await supabase.from("story_entries").insert({
              id: entryId,
              story_id: storyId,
              word: word,
              user_id: userProfile.userId,
              user_name: userProfile.name,
              timestamp: Date.now(),
            });
          }
        }

        // Subscribe to real-time updates
        get().subscribeToStory(storyId);

        return storyId;
      },

      addWord: async (storyId: string, word: string) => {
        const userProfile = get().userProfile;
        if (!userProfile) return;

        const story = get().getStoryById(storyId);
        if (!story) return;

        const entryId = uuidv4();

        // Save entry to Supabase
        const { error: entryError } = await supabase.from("story_entries").insert({
          id: entryId,
          story_id: storyId,
          word: word.trim(),
          user_id: userProfile.userId,
          user_name: userProfile.name,
          timestamp: Date.now(),
        });

        if (entryError) {
          console.error("Error adding word:", entryError);
          return;
        }

        // Update streak after successfully adding a word
        await useStreakStore.getState().updateStreak(userProfile.userId);

        // Calculate next turn and finish status
        const newEntryCount = story.entries.length + 1;
        const shouldFinish = newEntryCount >= story.maxWords;

        let nextTurnUserId: string;
        if (story.partnerId) {
          nextTurnUserId = story.currentTurnUserId === story.creatorId
            ? story.partnerId
            : story.creatorId;
        } else {
          nextTurnUserId = userProfile.userId;
        }

        // Update story metadata in Supabase
        const { error: updateError } = await supabase
          .from("stories")
          .update({
            current_turn_user_id: nextTurnUserId,
            is_finished: shouldFinish,
            updated_at: Date.now(),
          })
          .eq("id", storyId);

        if (updateError) {
          console.error("Error updating story:", updateError);
        }

        // Send notification to partner if it's now their turn and they're not the current user
        if (story.partnerId && nextTurnUserId !== userProfile.userId && !shouldFinish) {
          // Schedule local notification (for same device testing)
          // In production, you'd send push notification to partner's device
          try {
            await scheduleYourTurnNotification(story.title);
          } catch (error) {
            console.error("Error sending notification:", error);
          }
        }

        // Local state will be updated by realtime subscription
      },

      finishStory: async (storyId: string) => {
        const { error } = await supabase
          .from("stories")
          .update({
            is_finished: true,
            updated_at: Date.now(),
          })
          .eq("id", storyId);

        if (error) {
          console.error("Error finishing story:", error);
        }
      },

      deleteStory: async (storyId: string) => {
        const { error } = await supabase.from("stories").delete().eq("id", storyId);

        if (error) {
          console.error("Error deleting story:", error);
          return;
        }

        set(state => ({
          stories: state.stories.filter(story => story.id !== storyId),
        }));

        get().unsubscribeFromStory(storyId);
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

      joinSession: async (sessionCode: string) => {
        const userProfile = get().userProfile;
        if (!userProfile) return;

        // Find story by session code
        const { data: storyData, error } = await supabase
          .from("stories")
          .select("*")
          .eq("session_code", sessionCode)
          .single();

        if (error || !storyData) {
          console.error("Story not found:", error);
          return;
        }

        // Check if already joined
        const existingStory = get().stories.find(s => s.sessionCode === sessionCode);
        if (existingStory) {
          return existingStory.id;
        }

        // Update story with partner info
        const { error: updateError } = await supabase
          .from("stories")
          .update({
            partner_id: userProfile.userId,
            partner_name: userProfile.name,
          })
          .eq("id", storyData.id);

        if (updateError) {
          console.error("Error joining story:", updateError);
        }

        // Load the story and subscribe
        await get().syncStoryFromDB(storyData.id);
        get().subscribeToStory(storyData.id);

        return storyData.id;
      },

      subscribeToStory: (storyId: string) => {
        const existingSub = get().subscriptions.get(storyId);
        if (existingSub) return; // Already subscribed

        const channel = supabase
          .channel(`story:${storyId}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "stories",
              filter: `id=eq.${storyId}`,
            },
            async () => {
              await get().syncStoryFromDB(storyId);
            }
          )
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "story_entries",
              filter: `story_id=eq.${storyId}`,
            },
            async () => {
              await get().syncStoryFromDB(storyId);
            }
          )
          .subscribe();

        set(state => {
          const newSubs = new Map(state.subscriptions);
          newSubs.set(storyId, channel);
          return { subscriptions: newSubs };
        });
      },

      unsubscribeFromStory: (storyId: string) => {
        const sub = get().subscriptions.get(storyId);
        if (sub) {
          supabase.removeChannel(sub);
          set(state => {
            const newSubs = new Map(state.subscriptions);
            newSubs.delete(storyId);
            return { subscriptions: newSubs };
          });
        }
      },

      syncStoryFromDB: async (storyId: string) => {
        // Fetch story metadata
        const { data: storyData, error: storyError } = await supabase
          .from("stories")
          .select("*")
          .eq("id", storyId)
          .single();

        if (storyError || !storyData) {
          console.error("Error fetching story:", storyError);
          return;
        }

        // Fetch story entries
        const { data: entriesData, error: entriesError } = await supabase
          .from("story_entries")
          .select("*")
          .eq("story_id", storyId)
          .order("timestamp", { ascending: true });

        if (entriesError) {
          console.error("Error fetching entries:", entriesError);
          return;
        }

        // Convert to local format
        const story: Story = {
          id: storyData.id,
          title: storyData.title,
          entries: (entriesData || []).map(e => ({
            id: e.id,
            word: e.word,
            userId: e.user_id,
            userName: e.user_name,
            timestamp: e.timestamp,
            audioUrl: e.audio_url,
          })),
          createdAt: storyData.created_at,
          updatedAt: storyData.updated_at,
          isFinished: storyData.is_finished,
          currentTurnUserId: storyData.current_turn_user_id,
          maxWords: storyData.max_words,
          sessionCode: storyData.session_code,
          creatorId: storyData.creator_id,
          partnerId: storyData.partner_id || undefined,
          isRevealed: storyData.is_revealed,
          theme: storyData.theme || 'romance',
          mode: storyData.mode || 'standard',
          tags: storyData.tags || [],
          reactions: storyData.reactions || {},
          isPremium: storyData.is_premium || false,
        };

        // Update local state
        set(state => ({
          stories: [
            story,
            ...state.stories.filter(s => s.id !== storyId),
          ],
        }));
      },

      loadUserStories: async () => {
        const userProfile = get().userProfile;
        if (!userProfile) return;

        // Load user streak stats
        await useStreakStore.getState().loadStats(userProfile.userId);

        // Fetch stories where user is creator or partner
        const { data: storiesData, error } = await supabase
          .from("stories")
          .select("*")
          .or(`creator_id.eq.${userProfile.userId},partner_id.eq.${userProfile.userId}`)
          .order("updated_at", { ascending: false });

        if (error) {
          console.error("Error loading stories:", error);
          return;
        }

        if (!storiesData) return;

        // Load each story with its entries
        for (const storyData of storiesData) {
          await get().syncStoryFromDB(storyData.id);
          get().subscribeToStory(storyData.id);
        }
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
      partialize: (state) => ({
        userProfile: state.userProfile,
        // Don't persist stories - they'll be loaded from Supabase
      }),
    }
  )
);
