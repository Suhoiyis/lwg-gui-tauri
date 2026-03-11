import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";


// 建议只从一处引入 Wallpaper 类型，以防冲突。这里我们统一使用 src/types 下的。
import { Wallpaper, AppConfig, AppState } from "../types";
import { scanWallpapers } from "../api/wallpaper";

// API Helper Functions
export const getState = async (): Promise<AppState> => {
  const isTauri = !!(window as any).__TAURI_INTERNALS__;
  if (!isTauri) {
    return {};
  }
  return await invoke<AppState>('get_state');
};

export const saveState = async (state: AppState): Promise<boolean> => {
  const isTauri = !!(window as any).__TAURI_INTERNALS__;
  if (!isTauri) return true;
  return await invoke<boolean>('save_state', { appState: state });
};







// Runtime settings: require explicit Save button (backend restart needed)
const RUNTIME_SETTINGS = new Set<keyof AppConfig>([
  "fps",
  "volume",
  "muteAudio",
  "scaling",
  "clamping",
  "disableParallax",
  "disableParticles",
  "noFullscreenPause",
  "disableMouse",
  "noAutomute",
  "noAudioProcessing",
  "assetsPath",
  "waylandOnlyActive",
  "waylandIgnoreAppids",
]);

// Non-runtime settings: immediate save with debounce
const NON_RUNTIME_SETTINGS = new Set<keyof AppConfig>([
  "workshopPath",
  "screenshotRes",
  "preferXvfb",
  "screenshotDelay",
  "cycleEnabled",
  "cycleInterval",
  "cycleOrder",
]);


const saveTimeouts: Record<string, ReturnType<typeof setTimeout>> = {};

// Highlight timeout for settings field focus
let highlightTimeout: ReturnType<typeof setTimeout> | undefined;

const isSliderOrInput = (key: keyof AppConfig): boolean => {
  const sliderInputKeys: Array<keyof AppConfig> = [
    "volume",
    "fps",
    "screenshotDelay",
    "cycleInterval",
    "waylandIgnoreAppids",
  ];
  return sliderInputKeys.includes(key);
};

interface AppStoreState {
  // App version
  appVersion: string;

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

  // Monitor detection
  monitors: string[];
  monitorsLoading: boolean;

  // Screen selection
  selectedScreen: string;

  // ✨✨ 新增：截图引导状态 ✨✨
  screenshotHintActive: boolean;

  // ✨✨ 新增：设置字段高亮状态（用于跨组件通信）✨✨
  highlightSettingField: string | null;
  // Runtime state (loaded from separate state endpoint)
  runtimeState: import('../types').AppState;




  // Actions
  fetchAppVersion: () => Promise<void>;
  loadWallpapers: () => Promise<void>;
  setSelectedId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setActiveTab: (tab: "wallpapers" | "settings" | "performance") => void;

  // ✨ 新增：设置排序方式的方法
  setSortBy: (sort: "name" | "id" | "size") => void;

  // ✨✨ 新增：设置截图引导状态的方法 ✨✨
  setScreenshotHintActive: (active: boolean) => void;

  // ✨✨ 新增：设置字段高亮方法 ✨✨
  setHighlightSettingField: (field: string | null) => void;

  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  setNickname: (id: string, nickname: string) => void;
  getNickname: (id: string) => string | undefined;

  fetchSettings: () => Promise<void>;
  initializeSettings: () => Promise<void>;
  getState: () => Promise<AppState>;
  saveRuntimeState: (state: AppState) => Promise<void>;
  fetchMonitors: () => Promise<void>;
  updateSetting: <K extends keyof AppConfig>(
    key: K,
    value: AppConfig[K],
  ) => void;
  saveSettings: () => Promise<void>;
  restartWallpapers: () => Promise<void>;

  // ✨✨ 新增全局壁纸控制方法（供托盘和快捷键调用）✨✨
  applyWallpaper: (id: string, screen?: string) => Promise<void>;
  stopWallpaper: () => Promise<void>;
  applyRandomWallpaper: () => Promise<void>;

  setSelectedScreen: (screen: string) => void;
  flushPendingUpdates: () => void;

  // Computed properties
  getFilteredWallpapers: () => Wallpaper[];
  getSelectedWallpaper: () => Wallpaper | null;

  isCompactMode: boolean;
  toggleCompactMode: (enabled: boolean) => void;
}

export const useAppStore = create<AppStoreState>((set, get) => ({
  // Initial state
  appVersion: "0.0.0",
  wallpapers: [],
  selectedId: null,
  searchQuery: "",
  activeTab: "wallpapers",
  sortBy: "name", // ✨ 默认按名称排序
  favoriteIds: new Set<string>(),
  nicknames: {},
  settings: null,
  settingsLoading: false,
  monitors: [],
  monitorsLoading: false,
  selectedScreen: "all",
  isCompactMode: false,

  // ✨✨ 截图引导提示默认关闭 ✨✨
  screenshotHintActive: false,

  // ✨✨ 设置字段高亮默认为 null ✨✨
  highlightSettingField: null,

  // Runtime state from separate API endpoint
  runtimeState: {},


  // App version action
  fetchAppVersion: async () => {
    try {
      const isTauri = !!(window as any).__TAURI_INTERNALS__;
      if (isTauri) {
        const version = await invoke<string>("get_app_version");
        set({ appVersion: version });
      }
    } catch (error) {
      console.error("Failed to fetch app version:", error);
    }
  },

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

  // ✨✨ 新增截图动作 ✨✨
  setScreenshotHintActive: (active) => set({ screenshotHintActive: active }),

  // ✨✨ 新增设置字段高亮动作 ✨✨
  setHighlightSettingField: (field) => {
    // Clear previous timeout BEFORE setting new one (prevents race conditions)
    if (highlightTimeout) {
      clearTimeout(highlightTimeout);
    }

    set({ highlightSettingField: field });

    // Auto-clear highlight after 3 seconds
    if (field) {
      highlightTimeout = setTimeout(() => {
        set({ highlightSettingField: null });
      }, 3000);
    }
  },

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

  // Monitor detection
  fetchMonitors: async () => {
    set({ monitorsLoading: true });
    try {
      const isTauri = !!(window as any).__TAURI_INTERNALS__;
      if (!isTauri) {
        // Browser mode - return empty array
        set({ monitors: [], monitorsLoading: false });
        return;
      }

      // Use Rust backend command to get real monitor names via xrandr
      const monitors = await invoke<string[]>("get_connected_monitors");
      set({ monitors, monitorsLoading: false });
    } catch (error) {
      console.error("Failed to fetch monitors:", error);
      set({ monitors: [], monitorsLoading: false });
    }
  },

  // Settings actions
  fetchSettings: async () => {
    set({ settingsLoading: true });
    try {
      // ✨ 1. 检查是否在 Tauri 环境中
      const isTauri = !!(window as any).__TAURI_INTERNALS__;

      let settings;
      if (isTauri) {
        // 如果是 Tauri 客户端，正常调用 Rust 后端
        settings = await invoke<AppConfig>("get_settings");
      } else {
        // ✨ 2. 如果是纯浏览器环境，返回 Mock 数据
        console.warn("[Browser Mode] Fetching Mock Settings...");
        // 模拟一点网络延迟，更真实
        await new Promise((resolve) => setTimeout(resolve, 500));
        settings = {
          fps: 60,
          volume: 50,
          scaling: "fill",
          muteAudio: false, // 对应 Rust 侧的 #[serde(rename = "muteAudio")] pub silence: bool
          noFullscreenPause: false, // 驼峰命名
          disableMouse: false,
          noAutomute: false, // 对应 Rust 侧的 #[serde(rename = "noAutomute")] pub no_auto_mute: bool
          noAudioProcessing: false,
          disableParallax: false,
          disableParticles: false,
          clamping: "clamp",
          wallpaperProperties: {},
          screenshotDelay: 2,
          screenshotRes: "1920x1080",
          preferXvfb: true,
          cycleEnabled: true,
          cycleInterval: 30,
          cycleOrder: "random",
          assetsPath: "/mock/assets/path",
          workshopPath: "/mock/workshop/path",
          waylandOnlyActive: false,
          waylandIgnoreAppids: "firefox,steam",
          compactMode: false,
          wallpaperNicknames: {},
        } as unknown as AppConfig;
      }

      set({ settings, settingsLoading: false });
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      set({ settingsLoading: false });
      throw error;
    }
  },

  initializeSettings: async () => {
    set({ settingsLoading: true });
    try {
      const isTauri = !!(window as any).__TAURI_INTERNALS__;
      if (isTauri) {
        const settings = await invoke<AppConfig>("get_settings");
        set({ settings, settingsLoading: false });
        console.log("[App] Settings initialized from backend");
        // Also load runtime state
        const state = await getState();
        set({ runtimeState: state });


      } else {
        // Mock mode - use default settings
        const defaultSettings: AppConfig = {
          fps: 30,
          volume: 50,
          scaling: "default",
          clamping: "clamp",
          muteAudio: false,
          noFullscreenPause: false,
          disableMouse: false,
          noAutomute: false,
          noAudioProcessing: false,
          disableParallax: false,
          disableParticles: false,
          wallpaperProperties: {},
          screenshotDelay: 20,
          screenshotRes: "3840x2160",
          preferXvfb: true,
          cycleEnabled: false,
          cycleInterval: 15,
          cycleOrder: "random",
          assetsPath: null,
          workshopPath: null,
          waylandOnlyActive: false,
          waylandIgnoreAppids: "",
          wallpaperNicknames: {},
          compactMode: false,
          startHidden: false,
        };
        set({ settings: defaultSettings, settingsLoading: false });
        // Mock runtime state
        set({ runtimeState: {} });
        console.log("[App] Settings initialized with defaults (mock mode)");

      }
    } catch (error) {
      console.error("[App] Failed to initialize settings:", error);
      set({ settingsLoading: false });
      // Don't throw - app should still work with defaults
    }
  },

  updateSetting: <K extends keyof AppConfig>(key: K, value: AppConfig[K]) => {
    const currentSettings = get().settings;
    if (!currentSettings) return;

    const newSettings = { ...currentSettings, [key]: value };
    set({ settings: newSettings });

    const isTauri = !!(window as any).__TAURI_INTERNALS__;
    if (!isTauri) {
      console.log(`[Mock Mode] Updated ${String(key)}:`, value);
      return;
    }

    if (RUNTIME_SETTINGS.has(key)) {
      console.log(
        `[Runtime] ${String(key)} updated locally, waiting for Save button`,
      );
      return;
    }

    if (!NON_RUNTIME_SETTINGS.has(key)) {
      return;
    }

    if (saveTimeouts[key as string]) {
      clearTimeout(saveTimeouts[key as string]);
    }

    const debounceMs = isSliderOrInput(key) ? 500 : 0;

    saveTimeouts[key as string] = setTimeout(async () => {
      try {
        console.log(`[Non-Runtime] Saving ${String(key)} to backend...`);
        const result = await invoke<AppConfig>("update_config_value", {
          key: key as string,
          value: value,
        });
        set({ settings: result });
        console.log(`[Non-Runtime] ${String(key)} saved successfully`);
        toast.success("Setting saved", {
          description: `${String(key)} has been updated`,
          duration: 2000,
        });
      } catch (error) {
        console.error(`[Non-Runtime] Failed to save ${String(key)}:`, error);
        set({ settings: currentSettings });
        toast.error(`Failed to save ${String(key)}`, {
          description: String(error),
        });
      }
    }, debounceMs);
  },

  saveSettings: async () => {
    const settings = get().settings;
    if (!settings) {
      throw new Error("No settings to save");
    }
    try {
      const isTauri = !!(window as any).__TAURI_INTERNALS__;
      if (isTauri) {
        await invoke("save_settings", { config: settings });
      } else {
        console.warn("[Browser Mode] Mock saving settings:", settings);
        await new Promise((resolve) => setTimeout(resolve, 500));
        // 在浏览器里，数据实际上已经在 store 里更新了，所以不需要做什么，直接成功即可
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      throw error;
    }
  },

  getState: async () => {
    try {
      const isTauri = !!(window as any).__TAURI_INTERNALS__;
      if (!isTauri) {
        return {};
      }
      const state = await invoke<AppState>("get_state");
      set({ runtimeState: state });

      return state;
    } catch (error) {
      console.error("Failed to fetch state:", error);
      throw error;
    }
  },


  saveRuntimeState: async (state: AppState) => {
    try {
      const isTauri = !!(window as any).__TAURI_INTERNALS__;
      if (!isTauri) {
        set({ runtimeState: state });
        return;
      }
      await invoke("save_state", { appState: state });
      set({ runtimeState: state });
    } catch (error) {
      console.error("Failed to save runtime state:", error);
      throw error;
    }
  },



  flushPendingUpdates: () => {
    // Clear all pending timeouts
    Object.values(saveTimeouts).forEach(clearTimeout);
    // Clear the timeouts object
    Object.keys(saveTimeouts).forEach((k) => delete saveTimeouts[k]);
  },

  restartWallpapers: async () => {
    try {
      await invoke("restart_wallpapers");
    } catch (error) {
      console.error("Failed to restart wallpapers:", error);
      throw error;
    }
  },

  applyWallpaper: async (id: string, screen?: string) => {
    try {
      // Trigger backend to apply wallpaper
      const targetScreen = screen || (get().selectedScreen === "all" ? undefined : get().selectedScreen);
      await invoke("apply_wallpaper", { id, screen: targetScreen });

      // Update runtime state (not config) - optimistic update
      const currentRuntimeState = get().runtimeState;
      const newRuntimeState = {
        ...currentRuntimeState,
        ...(targetScreen ? { [targetScreen]: { wallpaperId: id, isPlaying: true } } : {}),
      };



      set({ runtimeState: newRuntimeState });
      // Persist runtime state to backend
      await get().saveRuntimeState(newRuntimeState);

      // Add to history
      const wallpaper = get().wallpapers.find(w => w.id === id);
      if (wallpaper) {
        await invoke("add_history", {
          id: wallpaper.id,
          title: wallpaper.title,
          preview: wallpaper.preview
        });
      }
    } catch (error) {
      console.error("Failed to apply wallpaper:", error);
      toast.error("Failed to apply wallpaper", { description: String(error) });
    }
  },



  stopWallpaper: async () => {
    try {
      await invoke("stop_wallpaper");
      
      // 更新 runtimeState：设置所有 isPlaying = false
      const currentRuntimeState = get().runtimeState;
      const newRuntimeState = Object.fromEntries(
        Object.entries(currentRuntimeState).map(([screen, aw]) => [
          screen,
          { ...aw, isPlaying: false }
        ])
      );
      set({ runtimeState: newRuntimeState });
      await get().saveRuntimeState(newRuntimeState);
      
      toast.success("Wallpaper stopped");
    } catch (error) {
      console.error("Failed to stop wallpaper:", error);
      toast.error("Failed to stop wallpaper", { description: String(error) });
    }
  },


  applyRandomWallpaper: async () => {
    const { wallpapers, applyWallpaper } = get();
    if (wallpapers.length === 0) {
      toast.warning("No wallpapers available");
      return;
    }
    const randomIndex = Math.floor(Math.random() * wallpapers.length);
    const randomWp = wallpapers[randomIndex];
    await applyWallpaper(randomWp.id);
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
