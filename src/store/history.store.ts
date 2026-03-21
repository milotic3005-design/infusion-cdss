import { create } from 'zustand';
import type { SessionRecord } from '@/types/session.types';

interface HistoryState {
  sessions: SessionRecord[];
  addSession: (session: SessionRecord) => void;
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryState>((set) => ({
  sessions: [],

  addSession: (session) =>
    set((state) => ({
      sessions: [session, ...state.sessions].slice(0, 50), // keep last 50
    })),

  clearHistory: () => set({ sessions: [] }),
}));
