import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  soundEnabled: boolean;
  musicEnabled: boolean;
  soundVolume: number;
  musicVolume: number;
  actionNotificationDuration: number;
  
  // Actions
  setSoundEnabled: (enabled: boolean) => void;
  setMusicEnabled: (enabled: boolean) => void;
  setSoundVolume: (volume: number) => void;
  setMusicVolume: (volume: number) => void;
  setActionNotificationDuration: (duration: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      soundEnabled: true,
      musicEnabled: false,
      soundVolume: 0.7,
      musicVolume: 0.3,
      actionNotificationDuration: 3,

      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      setMusicEnabled: (enabled) => set({ musicEnabled: enabled }),
      setSoundVolume: (volume) => set({ soundVolume: volume }),
      setMusicVolume: (volume) => set({ musicVolume: volume }),
      setActionNotificationDuration: (duration) => set({ actionNotificationDuration: duration }),
    }),
    {
      name: 'plunder-settings',
    }
  )
);
