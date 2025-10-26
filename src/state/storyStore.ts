import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Story, StoryEntry } from "../types/story";
import { supabase } from "../api/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useStreakStore } from "./streakStore";
import { useAuthStore } from "./authStore";

interface StoryState {
  stories: Story[];
  subscriptions: Map<string, RealtimeChannel>;
  isLoading: boolean;
  error: string | null;

  // Story actions
  createStory: (title?: string, prompt?: string, theme?: string, mode?: string) => Promise<string>;
  addWord: (storyId: string, word: string) => Promise<void>;
  finishStory: (storyId: string) => Promise<void>;
  deleteStory: (storyId: string) => Promise<void>;
  revealStory: (storyId: string) => void;

  // Story code functions
  generateStoryCode: (storyId: string) => string;
  joinWithCode: (code: string) => Promise<{ success: boolean; storyId?: string; error?: string }>;

  // Sync functions
  loadUserStories: () => Promise<void>;
  syncStoryFromDB: (storyId: string) => Promise<void>;
  subscribeToStory: (storyId: string) => void;
  unsubscribeFromStory: (storyId: string) => void;
  subscribeToAllStories: () => void;
  unsubscribeFromAll: () => void;

  // Helpers
  getActiveStories: () => Story[];
  getFinishedStories: () => Story[];
  getStoryById: (id: string) => Story | undefined;
  isMyTurn: (storyId: string) => boolean;
  getLastThreeWords: (storyId: string) => string[];
  clearError: () => void;
}

const DEFAULT_MAX_WORDS = 75;
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000;

// Debounce helper
const debounceMap = new Map<string, NodeJS.Timeout>();
function debounce(key: string, fn: () => void, delay: number) {
  const existing = debounceMap.get(key);
  if (existing) clearTimeout(existing);
  const timeout = setTimeout(fn, delay);
  debounceMap.set(key, timeout);
}

export const useStoryStore = create<StoryState>()(
  persist(
    (set, get) => ({
      stories: [],
      subscriptions: new Map(),
      isLoading: false,
      error: null,

      clearError: () => set({ error: null }),

      createStory: async (title?: string, prompt?: string, theme = "romance", mode = "standard") => {
        const user = useAuthStore.getState().user;
        if (!user) throw new Error("User not authenticated");

        set({ isLoading: true, error: null });

        try {
          const storyTitle = title || prompt || "Untitled Story";

          // Determine max words based on mode
          let maxWords = DEFAULT_MAX_WORDS;
          if (mode === "quick") maxWords = 25;
          else if (mode === "epic") maxWords = 150;
          else if (mode === "sentence") maxWords = 20;

          // Generate a unique 6-digit session code
          let sessionCode = "";
          let isUnique = false;
          let attempts = 0;
          const maxAttempts = 10;

          while (!isUnique && attempts < maxAttempts) {
            sessionCode = Math.floor(100000 + Math.random() * 900000).toString();

            // Check if code already exists
            const { data: existing } = await supabase
              .from("stories")
              .select("id")
              .eq("session_code", sessionCode)
              .limit(1);

            if (!existing || existing.length === 0) {
              isUnique = true;
            }
            attempts++;
          }

          if (!isUnique) {
            throw new Error("Failed to generate unique story code");
          }

          // Create story in database
          const { data: story, error: createError } = await supabase
            .from("stories")
            .insert({
              title: storyTitle,
              creator_id: user.id,
              current_turn_user_id: user.id,
              max_words: maxWords,
              is_finished: false,
              is_revealed: false,
              theme,
              mode,
              is_premium: mode === "epic" || mode === "sentence",
              session_code: sessionCode,
            })
            .select()
            .single();

          if (createError || !story) {
            throw createError || new Error("Failed to create story");
          }

          // If there's a prompt, add first 5 words as entries
          if (prompt && prompt.trim()) {
            const words = prompt.trim().split(/\s+/).slice(0, 5);
            const entries = words.map((word, index) => ({
              story_id: story.id,
              word,
              user_id: user.id,
              user_name: user.user_metadata?.name || "User",
              user_color: "#D4A5A5",
              timestamp: Date.now() + index,
            }));

            await supabase.from("story_entries").insert(entries);

            // Update turn to partner if odd number of words
            if (words.length % 2 === 1 && story.partner_id) {
              await supabase
                .from("stories")
                .update({ current_turn_user_id: story.partner_id })
                .eq("id", story.id);
            }
          }

          // Load the complete story
          await get().syncStoryFromDB(story.id);

          // Subscribe to real-time updates
          get().subscribeToStory(story.id);

          set({ isLoading: false });
          return story.id;
        } catch (error) {
          console.error("Error creating story:", error);
          set({ isLoading: false, error: (error as Error).message });
          throw error;
        }
      },

      addWord: async (storyId: string, word: string) => {
        const user = useAuthStore.getState().user;
        if (!user) throw new Error("User not authenticated");

        const story = get().getStoryById(storyId);
        if (!story) throw new Error("Story not found");

        if (story.isFinished) throw new Error("Story is already finished");
        if (story.currentTurnUserId !== user.id) {
          throw new Error("It's not your turn");
        }

        set({ isLoading: true, error: null });

        // Optimistic update
        const newEntry: StoryEntry = {
          id: `temp-${Date.now()}`,
          word,
          userId: user.id,
          userName: user.user_metadata?.name || "User",
          timestamp: Date.now(),
        };

        set(state => ({
          stories: state.stories.map(s =>
            s.id === storyId
              ? { ...s, entries: [...s.entries, newEntry], updatedAt: Date.now() }
              : s
          ),
        }));

        try {
          // Determine next turn - switch to the OTHER person
          let nextTurnUserId = user.id; // Default to current user if no partner

          if (story.partnerId) {
            // If there's a partner, switch to the other person
            // Current user just added a word, so next turn goes to the other person
            nextTurnUserId = user.id === story.creatorId
              ? story.partnerId  // Current user is creator, give turn to partner
              : story.creatorId;  // Current user is partner, give turn to creator
          }

          console.log("Turn logic:", {
            currentUser: user.id,
            creatorId: story.creatorId,
            partnerId: story.partnerId,
            currentTurn: story.currentTurnUserId,
            nextTurn: nextTurnUserId
          });

          const shouldFinish = story.entries.length + 1 >= story.maxWords;

          // Insert entry with retry logic
          let attempts = 0;
          let success = false;
          let lastError: Error | null = null;

          while (attempts < MAX_RETRY_ATTEMPTS && !success) {
            const { error: insertError } = await supabase.from("story_entries").insert({
              story_id: storyId,
              word,
              user_id: user.id,
              user_name: user.user_metadata?.name || "User",
              user_color: "#D4A5A5",
              timestamp: Date.now(),
            });

            if (!insertError) {
              success = true;
            } else {
              lastError = insertError;
              attempts++;
              if (attempts < MAX_RETRY_ATTEMPTS) {
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempts));
              }
            }
          }

          if (!success) {
            throw lastError || new Error("Failed to add word after retries");
          }

          // Update story turn and finish status
          const { error: updateError } = await supabase
            .from("stories")
            .update({
              current_turn_user_id: nextTurnUserId,
              is_finished: shouldFinish,
              updated_at: new Date().toISOString(),
            })
            .eq("id", storyId);

          if (updateError) throw updateError;

          // Update streak
          const streakStore = useStreakStore.getState();
          await streakStore.updateStreak(user.id);

          // Call Edge Function to send push notification to partner
          if (story.partnerId && nextTurnUserId !== user.id) {
            debounce(
              `push-${storyId}`,
              async () => {
                try {
                  const { data: { session } } = await supabase.auth.getSession();
                  if (!session) return;

                  await supabase.functions.invoke("send-turn-notification", {
                    body: {
                      story_id: storyId,
                      story_title: story.title,
                      partner_id: story.partnerId,
                      partner_name: user.user_metadata?.name || "Your partner",
                    },
                  });
                } catch (error) {
                  console.error("Failed to send push notification:", error);
                }
              },
              500
            );
          }

          // Sync from DB to get real data
          await get().syncStoryFromDB(storyId);

          set({ isLoading: false });
        } catch (error) {
          console.error("Error adding word:", error);

          // Revert optimistic update
          await get().syncStoryFromDB(storyId);

          set({ isLoading: false, error: (error as Error).message });
          throw error;
        }
      },

      finishStory: async (storyId: string) => {
        const user = useAuthStore.getState().user;
        if (!user) throw new Error("User not authenticated");

        set({ isLoading: true, error: null });

        try {
          const { error } = await supabase
            .from("stories")
            .update({ is_finished: true, updated_at: new Date().toISOString() })
            .eq("id", storyId);

          if (error) throw error;

          await get().syncStoryFromDB(storyId);
          set({ isLoading: false });
        } catch (error) {
          console.error("Error finishing story:", error);
          set({ isLoading: false, error: (error as Error).message });
          throw error;
        }
      },

      deleteStory: async (storyId: string) => {
        const user = useAuthStore.getState().user;
        if (!user) throw new Error("User not authenticated");

        set({ isLoading: true, error: null });

        try {
          get().unsubscribeFromStory(storyId);

          const { error } = await supabase.from("stories").delete().eq("id", storyId);

          if (error) throw error;

          set(state => ({
            stories: state.stories.filter(s => s.id !== storyId),
            isLoading: false,
          }));
        } catch (error) {
          console.error("Error deleting story:", error);
          set({ isLoading: false, error: (error as Error).message });
          throw error;
        }
      },

      revealStory: (storyId: string) => {
        set(state => ({
          stories: state.stories.map(s =>
            s.id === storyId ? { ...s, isRevealed: true } : s
          ),
        }));

        // Update in database
        supabase
          .from("stories")
          .update({ is_revealed: true })
          .eq("id", storyId)
          .then(({ error }) => {
            if (error) console.error("Error updating reveal status:", error);
          });
      },

      generateStoryCode: (storyId: string) => {
        // Generate a simple 6-digit code from the story ID
        // In production, you might want to store this in the database
        const story = get().getStoryById(storyId);
        if (!story) return "000000";

        // Use session_code from database if available, otherwise generate from ID
        if (story.sessionCode) return story.sessionCode;

        // Create a numeric code from the story ID
        let hash = 0;
        for (let i = 0; i < storyId.length; i++) {
          hash = ((hash << 5) - hash) + storyId.charCodeAt(i);
          hash = hash & hash;
        }
        return Math.abs(hash).toString().slice(0, 6).padStart(6, "0");
      },

      joinWithCode: async (code: string) => {
        const user = useAuthStore.getState().user;
        if (!user) throw new Error("User not authenticated");

        set({ isLoading: true, error: null });

        try {
          // Trim and validate code
          const trimmedCode = code.trim();

          console.log("==== JOIN WITH CODE DEBUG ====");
          console.log("Attempting to join with code:", trimmedCode);
          console.log("Code length:", trimmedCode.length);
          console.log("Code type:", typeof trimmedCode);
          console.log("Current user ID:", user.id);

          // First, let's check if the column exists by trying to select it
          const { data: testQuery, error: testError } = await supabase
            .from("stories")
            .select("id, session_code, creator_id, partner_id")
            .not("session_code", "is", null)
            .limit(5);

          console.log("Test query (all stories with codes):", testQuery);
          console.log("Test query error:", testError);

          // Now try the actual search
          const { data: stories, error: searchError } = await supabase
            .from("stories")
            .select("*")
            .eq("session_code", trimmedCode);

          console.log("Search result - stories:", stories);
          console.log("Search result - error:", searchError);
          console.log("Search result - count:", stories?.length || 0);

          if (searchError) {
            console.error("Search error details:", JSON.stringify(searchError));
            set({ isLoading: false, error: `Database error: ${searchError.message}` });
            return { success: false, error: `Database error: ${searchError.message}` };
          }

          if (!stories || stories.length === 0) {
            console.log("❌ No story found with code:", trimmedCode);
            console.log("Available codes:", testQuery?.map(s => s.session_code));
            set({ isLoading: false, error: "Invalid or expired code" });
            return { success: false, error: "Invalid or expired code" };
          }

          const story = stories[0];
          console.log("✅ Found story:", {
            id: story.id,
            session_code: story.session_code,
            creator_id: story.creator_id,
            partner_id: story.partner_id,
            title: story.title
          });

          // Check if user is trying to join their own story
          if (story.creator_id === user.id) {
            console.log("❌ User trying to join own story");
            set({ isLoading: false, error: "You cannot join your own story" });
            return { success: false, error: "You cannot join your own story" };
          }

          // Check if story already has a partner
          if (story.partner_id && story.partner_id !== user.id) {
            console.log("❌ Story already has a partner:", story.partner_id);
            set({ isLoading: false, error: "This story already has a partner" });
            return { success: false, error: "This story already has a partner" };
          }

          console.log("✅ All checks passed, adding user as partner");

          // Add user as partner if not already
          if (story.partner_id !== user.id) {
            const { error: updateError } = await supabase
              .from("stories")
              .update({ partner_id: user.id })
              .eq("id", story.id);

            if (updateError) throw updateError;
          }

          // Reload stories to include newly joined story
          await get().loadUserStories();

          set({ isLoading: false });
          return { success: true, storyId: story.id };
        } catch (error) {
          console.error("Error joining with code:", error);
          set({ isLoading: false, error: (error as Error).message });
          return { success: false, error: (error as Error).message };
        }
      },

      loadUserStories: async () => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        set({ isLoading: true, error: null });

        try {
          // Fetch stories where user is creator or partner
          const { data: stories, error: storiesError } = await supabase
            .from("stories")
            .select("*")
            .or(`creator_id.eq.${user.id},partner_id.eq.${user.id}`)
            .order("updated_at", { ascending: false });

          if (storiesError) throw storiesError;

          if (!stories || stories.length === 0) {
            set({ stories: [], isLoading: false });
            return;
          }

          // Fetch all entries for these stories
          const storyIds = stories.map(s => s.id);
          const { data: entries, error: entriesError } = await supabase
            .from("story_entries")
            .select("*")
            .in("story_id", storyIds)
            .order("timestamp", { ascending: true });

          if (entriesError) throw entriesError;

          // Map entries to stories
          const storiesWithEntries: Story[] = stories.map(s => ({
            id: s.id,
            title: s.title,
            entries: (entries || [])
              .filter(e => e.story_id === s.id)
              .map(e => ({
                id: e.id,
                word: e.word,
                userId: e.user_id,
                userName: e.user_name,
                timestamp: e.timestamp,
                audioUrl: e.audio_url,
              })),
            createdAt: new Date(s.created_at).getTime(),
            updatedAt: new Date(s.updated_at).getTime(),
            isFinished: s.is_finished,
            currentTurnUserId: s.current_turn_user_id,
            maxWords: s.max_words,
            sessionCode: s.session_code,
            creatorId: s.creator_id,
            partnerId: s.partner_id,
            isRevealed: s.is_revealed,
            theme: s.theme || "romance",
            mode: s.mode || "standard",
            isPremium: s.is_premium || false,
          }));

          set({ stories: storiesWithEntries, isLoading: false });

          // Subscribe to all stories
          get().subscribeToAllStories();
        } catch (error) {
          console.error("Error loading stories:", error);
          set({ isLoading: false, error: (error as Error).message });
        }
      },

      syncStoryFromDB: async (storyId: string) => {
        try {
          const { data: story, error: storyError } = await supabase
            .from("stories")
            .select("*")
            .eq("id", storyId)
            .single();

          if (storyError || !story) return;

          const { data: entries, error: entriesError } = await supabase
            .from("story_entries")
            .select("*")
            .eq("story_id", storyId)
            .order("timestamp", { ascending: true });

          if (entriesError) return;

          const updatedStory: Story = {
            id: story.id,
            title: story.title,
            entries: (entries || []).map(e => ({
              id: e.id,
              word: e.word,
              userId: e.user_id,
              userName: e.user_name,
              timestamp: e.timestamp,
              audioUrl: e.audio_url,
            })),
            createdAt: new Date(story.created_at).getTime(),
            updatedAt: new Date(story.updated_at).getTime(),
            isFinished: story.is_finished,
            currentTurnUserId: story.current_turn_user_id,
            maxWords: story.max_words,
            sessionCode: story.session_code,
            creatorId: story.creator_id,
            partnerId: story.partner_id,
            isRevealed: story.is_revealed,
            theme: story.theme || "romance",
            mode: story.mode || "standard",
            isPremium: story.is_premium || false,
          };

          set(state => ({
            stories: [
              updatedStory,
              ...state.stories.filter(s => s.id !== storyId),
            ].sort((a, b) => b.updatedAt - a.updatedAt),
          }));
        } catch (error) {
          console.error("Error syncing story:", error);
        }
      },

      subscribeToStory: (storyId: string) => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        // Don't subscribe if already subscribed
        if (get().subscriptions.has(storyId)) return;

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
            () => {
              // Debounce to avoid too many syncs
              debounce(`sync-story-${storyId}`, () => {
                get().syncStoryFromDB(storyId);
              }, 300);
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
            () => {
              debounce(`sync-story-${storyId}`, () => {
                get().syncStoryFromDB(storyId);
              }, 300);
            }
          )
          .subscribe();

        const subscriptions = get().subscriptions;
        subscriptions.set(storyId, channel);
        set({ subscriptions: new Map(subscriptions) });
      },

      unsubscribeFromStory: (storyId: string) => {
        const subscriptions = get().subscriptions;
        const channel = subscriptions.get(storyId);
        if (channel) {
          supabase.removeChannel(channel);
          subscriptions.delete(storyId);
          set({ subscriptions: new Map(subscriptions) });
        }
      },

      subscribeToAllStories: () => {
        const stories = get().stories;
        stories.forEach(story => {
          get().subscribeToStory(story.id);
        });
      },

      unsubscribeFromAll: () => {
        const subscriptions = get().subscriptions;
        subscriptions.forEach(channel => {
          supabase.removeChannel(channel);
        });
        set({ subscriptions: new Map() });
      },

      getActiveStories: () => {
        return get().stories.filter(s => !s.isFinished);
      },

      getFinishedStories: () => {
        return get().stories.filter(s => s.isFinished);
      },

      getStoryById: (id: string) => {
        return get().stories.find(s => s.id === id);
      },

      isMyTurn: (storyId: string) => {
        const user = useAuthStore.getState().user;
        if (!user) return false;

        const story = get().getStoryById(storyId);
        return story?.currentTurnUserId === user.id;
      },

      getLastThreeWords: (storyId: string) => {
        const story = get().getStoryById(storyId);
        if (!story) return [];
        return story.entries.slice(-3).map(e => e.word);
      },
    }),
    {
      name: "story-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        stories: state.stories,
        // Don't persist subscriptions or loading states
      }),
    }
  )
);
