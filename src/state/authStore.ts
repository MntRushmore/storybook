import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../api/supabase";
import type { User, Session } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;

  // Auth actions
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;

  // Session management
  initialize: () => Promise<void>;
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: false,
      isInitialized: false,

      initialize: async () => {
        try {
          set({ isLoading: true });

          // Get the current session
          const { data: { session }, error } = await supabase.auth.getSession();

          if (error) {
            console.error("Error getting session:", error);
            set({ user: null, session: null, isInitialized: true, isLoading: false });
            return;
          }

          set({
            user: session?.user || null,
            session,
            isInitialized: true,
            isLoading: false
          });

          // Listen for auth changes
          supabase.auth.onAuthStateChange((_event, session) => {
            set({ user: session?.user || null, session });
          });
        } catch (error) {
          console.error("Error initializing auth:", error);
          set({ user: null, session: null, isInitialized: true, isLoading: false });
        }
      },

      signUp: async (email: string, password: string, name: string) => {
        try {
          set({ isLoading: true });

          console.log("Attempting sign up for:", email);

          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name,
              },
            },
          });

          console.log("Sign up response:", { data, error });

          if (error) {
            console.error("Supabase sign up error:", error);
            set({ isLoading: false });
            return { error: new Error(error.message) };
          }

          // Create profile in profiles table (handled by trigger)
          set({
            user: data.user,
            session: data.session,
            isLoading: false
          });

          return { error: null };
        } catch (error) {
          console.error("Sign up catch error:", error);
          set({ isLoading: false });
          const message = error instanceof Error ? error.message : "An unexpected error occurred";
          return { error: new Error(message) };
        }
      },

      signIn: async (email: string, password: string) => {
        try {
          set({ isLoading: true });

          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            set({ isLoading: false });
            return { error };
          }

          set({
            user: data.user,
            session: data.session,
            isLoading: false
          });

          return { error: null };
        } catch (error) {
          set({ isLoading: false });
          return { error: error as Error };
        }
      },

      signOut: async () => {
        try {
          set({ isLoading: true });

          await supabase.auth.signOut();

          set({
            user: null,
            session: null,
            isLoading: false
          });
        } catch (error) {
          console.error("Error signing out:", error);
          set({ isLoading: false });
        }
      },

      resetPassword: async (email: string) => {
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: "dearwe://reset-password",
          });

          if (error) {
            return { error };
          }

          return { error: null };
        } catch (error) {
          return { error: error as Error };
        }
      },

      setSession: (session: Session | null) => {
        set({ session, user: session?.user || null });
      },

      setUser: (user: User | null) => {
        set({ user });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Don't persist loading states
        user: state.user,
        session: state.session,
      }),
    }
  )
);
