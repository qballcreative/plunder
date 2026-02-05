import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Difficulty } from '@/types/game';

interface PlayerStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
}

interface PlayerState {
  // Preferences
  playerName: string;
  lastDifficulty: Difficulty;
  
  // Stats
  stats: PlayerStats;
  
  // Actions
  setPlayerName: (name: string) => void;
  setLastDifficulty: (difficulty: Difficulty) => void;
  recordGameResult: (won: boolean) => void;
  resetStats: () => void;
  resetAll: () => void;
}

const defaultStats: PlayerStats = {
  gamesPlayed: 0,
  wins: 0,
  losses: 0,
};

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set) => ({
      playerName: '',
      lastDifficulty: 'medium',
      stats: defaultStats,

      setPlayerName: (name) => set({ playerName: name }),
      
      setLastDifficulty: (difficulty) => set({ lastDifficulty: difficulty }),
      
      recordGameResult: (won) => set((state) => ({
        stats: {
          gamesPlayed: state.stats.gamesPlayed + 1,
          wins: state.stats.wins + (won ? 1 : 0),
          losses: state.stats.losses + (won ? 0 : 1),
        },
      })),
      
      resetStats: () => set({ stats: defaultStats }),
      
      resetAll: () => set({
        playerName: '',
        lastDifficulty: 'medium',
        stats: defaultStats,
      }),
    }),
    {
      name: 'plunder-player',
    }
  )
);
