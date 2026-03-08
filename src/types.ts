// src/types.ts
export interface Wallpaper {
  id: string;
  title: string;
  preview: string;
  type: "Video" | "Scene" | "Web";
  path: string;
  description?: string;  // 新增
  tags?: string[];
  size?: string;
}

export interface AppConfig {
  // --- 1. Playback & Performance ---
  fps: number;
  scaling: string;
  clamping: string;

  noFullscreenPause: boolean;
  disableMouse: boolean;
  disableParallax: boolean;
  disableParticles: boolean;

  // --- 2. Audio & Display ---
  volume: number;
  muteAudio: boolean; // silence -> muteAudio
  noAutomute: boolean; // no_auto_mute -> noAutomute
  noAudioProcessing: boolean;

  // --- 3. Monitor & Display ---
  lastScreen?: string | null;
  lastWallpaper?: string;
  activeMonitors: Record<string, string>;

  // --- 4. Automation (Cycling) ---
  cycleEnabled: boolean;
  cycleInterval: number;
  cycleOrder: string;

  // --- 5. Wayland Tweaks ---
  waylandOnlyActive: boolean;
  waylandIgnoreAppids: string;

  // --- 6. System & Storage ---
  assetsPath: string | null;
  workshopPath: string | null;

  startHidden: boolean;
  // --- 7. Screenshot Tools ---
  screenshotDelay: number;
  screenshotRes: string;
  preferXvfb: boolean;

  // --- 8. Wallpaper Properties ---
  wallpaperProperties: Record<string, any>;
  wallpaperNicknames: Record<string, string>;
  compactMode: boolean;
}

// System integration settings (not stored in AppConfig)
export interface SystemIntegration {
  autostart: boolean;
  startHidden: boolean;
}

export interface LogEntry {
  id: number; // 唯一标识，用于 React key
  timestamp: string; // "10:00:01"
  level: "info" | "warn" | "error" | "debug";
  source: "GUI" | "Core" | "Engine" | "Controller";
  message: string;
}
