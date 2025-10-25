import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface SharedSession {
  sessionCode: string;
  storyId: string;
  creatorId: string;
  creatorName: string;
  title: string;
  createdAt: number;
}

interface SharedSessionState {
  sessions: SharedSession[];
  addSession: (session: SharedSession) => void;
  getSessionByCode: (code: string) => SharedSession | undefined;
  removeSession: (code: string) => void;
}

// This store acts as a "global registry" of session codes
// In a real app, this would be on a backend server
export const useSharedSessionStore = create<SharedSessionState>()(
  persist(
    (set, get) => ({
      sessions: [],

      addSession: (session: SharedSession) => {
        set(state => ({
          sessions: [...state.sessions.filter(s => s.sessionCode !== session.sessionCode), session],
        }));
      },

      getSessionByCode: (code: string) => {
        return get().sessions.find(s => s.sessionCode === code);
      },

      removeSession: (code: string) => {
        set(state => ({
          sessions: state.sessions.filter(s => s.sessionCode !== code),
        }));
      },
    }),
    {
      name: "shared-sessions-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
