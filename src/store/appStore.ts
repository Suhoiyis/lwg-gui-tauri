import { create } from 'zustand';
import { Wallpaper } from '../types';
import { scanWallpapers } from '../api/wallpaper';

interface AppState {
  // 数据
  wallpapers: Wallpaper[];
  selectedId: string | null;
  searchQuery: string;
  activeTab: "wallpapers" | "settings" | "performance";
  
  // 动作
  loadWallpapers: () => Promise<void>;
  setSelectedId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setActiveTab: (tab: any) => void;
  
  // 计算属性 (Getter)
  getFilteredWallpapers: () => Wallpaper[];
  getSelectedWallpaper: () => Wallpaper | null;
}

export const useAppStore = create<AppState>((set, get) => ({
  wallpapers: [],
  selectedId: null,
  searchQuery: "",
  activeTab: "wallpapers",

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

  getFilteredWallpapers: () => {
    const { wallpapers, searchQuery } = get();
    if (!searchQuery) return wallpapers;
    const lowerQ = searchQuery.toLowerCase();
    return wallpapers.filter(w => 
      w.title.toLowerCase().includes(lowerQ) || w.id.includes(lowerQ)
    );
  },

  getSelectedWallpaper: () => {
    const { wallpapers, selectedId } = get();
    return wallpapers.find(w => w.id === selectedId) || null;
  }
}));