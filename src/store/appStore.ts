import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { Wallpaper, AppConfig } from "../types";
import { scanWallpapers } from "../api/wallpaper";

interface AppState {
  // Wallpaper data
  wallpapers: Wallpaper[];
  selectedId: string | null;
  searchQuery: string;
  activeTab: "wallpapers" | "settings" | "performance";

  // Favorites & nicknames
  favoriteIds: Set<string>;
  nicknames: Record<string, string>;

  // Settings data
  settings: AppConfig | null;
  settingsLoading: boolean;

  // Wallpaper actions
  loadWallpapers: () => Promise<void>;
  setSelectedId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setActiveTab: (tab: "wallpapers" | "settings" | "performance") => void;

  // Favorites & nicknames actions
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  setNickname: (id: string, nickname: string) => void;
  getNickname: (id: string) => string | undefined;

  // Settings actions
  fetchSettings: () => Promise<void>;
  updateSetting: <K extends keyof AppConfig>(
    key: K,
    value: AppConfig[K],
  ) => void;
  saveSettings: () => Promise<void>;
  restartWallpapers: () => Promise<void>;

  // Computed properties (Getter)
  getFilteredWallpapers: () => Wallpaper[];
  getSelectedWallpaper: () => Wallpaper | null;

  isCompactMode: boolean;
  toggleCompactMode: (enabled: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  wallpapers: [],
  selectedId: null,
  searchQuery: "",
  activeTab: "wallpapers",
  favoriteIds: new Set<string>(),
  nicknames: {},
  settings: null,
  settingsLoading: false,

  // Wallpaper actions
  loadWallpapers: async () => {
    const data = await scanWallpapers();
    set({ wallpapers: data });
    if (data.length > 0 && !get().selectedId) {
      set({ selectedId: data[0].id });
    }
  },

  setSelectedId: (id) => set({ selectedId: id }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Favorites & nicknames actions
  toggleFavorite: (id: string) => {
    const current = get().favoriteIds;
    const next = new Set(current);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    set({ favoriteIds: next });
  },
  isFavorite: (id: string) => get().favoriteIds.has(id),
  setNickname: (id: string, nickname: string) => {
    set({ nicknames: { ...get().nicknames, [id]: nickname } });
  },
  getNickname: (id: string) => get().nicknames[id],

  // Settings actions
  fetchSettings: async () => {
    set({ settingsLoading: true });
    try {
      const settings = await invoke<AppConfig>("get_settings");
      set({ settings, settingsLoading: false });
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      set({ settingsLoading: false });
      throw error;
    }
  },

  updateSetting: <K extends keyof AppConfig>(key: K, value: AppConfig[K]) => {
    const currentSettings = get().settings;
    if (currentSettings) {
      set({ settings: { ...currentSettings, [key]: value } });
    }
  },

  saveSettings: async () => {
    const settings = get().settings;
    if (!settings) {
      throw new Error("No settings to save");
    }
    try {
      await invoke("save_settings", { config: settings });
    } catch (error) {
      console.error("Failed to save settings:", error);
      throw error;
    }
  },

  restartWallpapers: async () => {
    try {
      await invoke("restart_wallpapers");
    } catch (error) {
      console.error("Failed to restart wallpapers:", error);
      throw error;
    }
  },

  getFilteredWallpapers: () => {
    const { wallpapers, searchQuery } = get();
    if (!searchQuery) return wallpapers;
    const lowerQ = searchQuery.toLowerCase();
    return wallpapers.filter(
      (w) => w.title.toLowerCase().includes(lowerQ) || w.id.includes(lowerQ),
    );
  },

  getSelectedWallpaper: () => {
    const { wallpapers, selectedId } = get();
    return wallpapers.find((w) => w.id === selectedId) || null;
  },

  isCompactMode: false,
  toggleCompactMode: (enabled) => set({ isCompactMode: enabled }),
}));
