import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
// 建议只从一处引入 Wallpaper 类型，以防冲突。这里我们统一使用 src/types 下的。
import { Wallpaper, AppConfig } from "../types";
import { scanWallpapers } from "../api/wallpaper";

interface AppState {
  // Wallpaper data
  wallpapers: Wallpaper[];
  selectedId: string | null;
  searchQuery: string;
  activeTab: "wallpapers" | "settings" | "performance";

  // ✨ 新增：排序状态
  sortBy: "name" | "id" | "size";

  // Favorites & nicknames
  favoriteIds: Set<string>;
  nicknames: Record<string, string>;

  // Settings data
  settings: AppConfig | null;
  settingsLoading: boolean;

  // Screen selection
  selectedScreen: string;

  // Actions
  loadWallpapers: () => Promise<void>;
  setSelectedId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setActiveTab: (tab: "wallpapers" | "settings" | "performance") => void;

  // ✨ 新增：设置排序方式的方法
  setSortBy: (sort: "name" | "id" | "size") => void;

  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  setNickname: (id: string, nickname: string) => void;
  getNickname: (id: string) => string | undefined;

  fetchSettings: () => Promise<void>;
  updateSetting: <K extends keyof AppConfig>(
    key: K,
    value: AppConfig[K],
  ) => void;
  saveSettings: () => Promise<void>;
  restartWallpapers: () => Promise<void>;
  setSelectedScreen: (screen: string) => void;

  // Computed properties
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
  sortBy: "name", // ✨ 默认按名称排序
  favoriteIds: new Set<string>(),
  nicknames: {},
  settings: null,
  settingsLoading: false,
  selectedScreen: "all",
  isCompactMode: false,

  // Wallpaper actions
  loadWallpapers: async () => {
    const data = await scanWallpapers();

    // 🛠️ 解决 TS 报错：
    // 方案 1 (强转): set({ wallpapers: data as unknown as Wallpaper[] });
    // 方案 2 (映射，更安全): 把来自 API 的小写 type 统统转成合规的类型
    const mappedWallpapers = data.map((w: any) => ({
      ...w,
      // 保证类型安全，将小写转大写，如果没有值就填 Unknown
      type: w.type
        ? w.type.charAt(0).toUpperCase() + w.type.slice(1).toLowerCase()
        : "Unknown",
    })) as Wallpaper[];

    set({ wallpapers: mappedWallpapers });

    if (mappedWallpapers.length > 0 && !get().selectedId) {
      set({ selectedId: mappedWallpapers[0].id });
    }
  },

  setSelectedId: (id) => set({ selectedId: id }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setActiveTab: (tab) => set({ activeTab: tab }),

  // ✨ 新增
  setSortBy: (sortBy) => set({ sortBy }),

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

  setSelectedScreen: (screen: string) => set({ selectedScreen: screen }),

  getFilteredWallpapers: () => {
    const { wallpapers, searchQuery, sortBy } = get();

    // 1. 过滤
    let filtered = wallpapers;
    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      filtered = wallpapers.filter(
        (w) =>
          (w.title || "").toLowerCase().includes(lowerQ) ||
          (w.id || "").includes(lowerQ),
      );
    }

    // 2. 排序 (浅拷贝防止修改原数组)
    return [...filtered].sort((a, b) => {
      if (sortBy === "name") {
        // 加上 || "" 防止 title 为 undefined 导致 localeCompare 报错
        return (a.title || "").localeCompare(b.title || "");
      } else if (sortBy === "id") {
        return (a.id || "").localeCompare(b.id || "");
      } else if (sortBy === "size") {
        // ✨ 修改这里：允许传入 string | undefined
        const parseSize = (sizeStr?: string) => {
          if (!sizeStr) return 0;
          const num = parseFloat(sizeStr);
          if (isNaN(num)) return 0; // 额外增加一道防线，防止 parseFloat 解析失败
          if (sizeStr.toUpperCase().includes("GB")) return num * 1024;
          if (sizeStr.toUpperCase().includes("KB")) return num / 1024;
          return num; // 默认按 MB 算
        };
        // 降序排列（体积大的在前面）
        return parseSize(b.size) - parseSize(a.size);
      }
      return 0;
    });
  },

  getSelectedWallpaper: () => {
    const { wallpapers, selectedId } = get();
    return wallpapers.find((w) => w.id === selectedId) || null;
  },

  toggleCompactMode: (enabled) => set({ isCompactMode: enabled }),
}));
