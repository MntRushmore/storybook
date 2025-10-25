import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../api/supabase";
import { UserStats } from "../types/story";

interface StreakState {
  stats: UserStats | null;

  // Actions
  updateStreak: (userId: string) => Promise<void>;
  loadStats: (userId: string) => Promise<void>;
  getStats: () => UserStats | null;
}

// Helper function to get today's date in YYYY-MM-DD format
function getTodayDate(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

// Helper function to check if dates are consecutive days
function isConsecutiveDay(lastDate: string, currentDate: string): boolean {
  const last = new Date(lastDate);
  const current = new Date(currentDate);
  const diffTime = Math.abs(current.getTime() - last.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}

// Helper function to check if same day
function isSameDay(date1: string, date2: string): boolean {
  return date1 === date2;
}

export const useStreakStore = create<StreakState>()(
  persist(
    (set, get) => ({
      stats: null,

      updateStreak: async (userId: string) => {
        const today = getTodayDate();
        let currentStats = get().stats;

        // If no stats exist, create initial stats
        if (!currentStats || currentStats.userId !== userId) {
          currentStats = {
            userId,
            currentStreak: 1,
            longestStreak: 1,
            lastActivityDate: today,
            totalStories: 1,
            totalWords: 1,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
        } else {
          // Check if we need to update streak
          const lastActivity = currentStats.lastActivityDate;

          if (isSameDay(lastActivity, today)) {
            // Same day - just increment words
            currentStats = {
              ...currentStats,
              totalWords: currentStats.totalWords + 1,
              updatedAt: Date.now(),
            };
          } else if (isConsecutiveDay(lastActivity, today)) {
            // Consecutive day - increment streak
            const newStreak = currentStats.currentStreak + 1;
            currentStats = {
              ...currentStats,
              currentStreak: newStreak,
              longestStreak: Math.max(newStreak, currentStats.longestStreak),
              lastActivityDate: today,
              totalWords: currentStats.totalWords + 1,
              updatedAt: Date.now(),
            };
          } else {
            // Streak broken - reset to 1
            currentStats = {
              ...currentStats,
              currentStreak: 1,
              lastActivityDate: today,
              totalWords: currentStats.totalWords + 1,
              updatedAt: Date.now(),
            };
          }
        }

        // Update local state
        set({ stats: currentStats });

        // Save to Supabase
        try {
          const { error } = await supabase
            .from("user_stats")
            .upsert({
              user_id: userId,
              current_streak: currentStats.currentStreak,
              longest_streak: currentStats.longestStreak,
              last_activity_date: currentStats.lastActivityDate,
              total_stories: currentStats.totalStories,
              total_words: currentStats.totalWords,
              created_at: currentStats.createdAt,
              updated_at: currentStats.updatedAt,
            });

          if (error) {
            console.error("Error updating streak:", error);
          }
        } catch (error) {
          console.error("Error saving streak to DB:", error);
        }
      },

      loadStats: async (userId: string) => {
        try {
          const { data, error } = await supabase
            .from("user_stats")
            .select("*")
            .eq("user_id", userId)
            .single();

          if (error || !data) {
            // No stats found - will be created on first activity
            return;
          }

          const stats: UserStats = {
            userId: data.user_id,
            currentStreak: data.current_streak,
            longestStreak: data.longest_streak,
            lastActivityDate: data.last_activity_date,
            totalStories: data.total_stories,
            totalWords: data.total_words,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          };

          set({ stats });
        } catch (error) {
          console.error("Error loading streak stats:", error);
        }
      },

      getStats: () => {
        return get().stats;
      },
    }),
    {
      name: "streak-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
