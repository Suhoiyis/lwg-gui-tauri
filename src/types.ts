// src/types.ts
export interface Wallpaper {
  id: string;
  title: string;
  preview: string;
  type: "Video" | "Scene" | "Web";
  path: string;
  tags?: string[];
  size?: string;
}

export interface AppConfig {
  // --- 1. Playback & Performance ---
  fps: number;
  scaling: "default" | "stretch" | "fit" | "fill";
  clamping: "clamp" | "border" | "repeat";
  
  noFullscreenPause: boolean;
  disableMouse: boolean;
  disableParallax: boolean;
  disableParticles: boolean;
  
  // --- 2. Audio & Display ---
  volume: number;
  muteAudio: boolean;           // silence -> muteAudio
  noAutomute: boolean;          // no_auto_mute -> noAutomute
  noAudioProcessing: boolean;
  
  // --- 3. Monitor & Display ---
  lastScreen?: string;
  lastWallpaper?: string;
  activeMonitors: Record<string, string>;
  
  // --- 4. Automation (Cycling) ---
  cycleEnabled: boolean;
  cycleInterval: number;
  cycleOrder: "random" | "title" | "size" | "size_desc" | "type" | "id";

  // --- 5. Wayland Tweaks ---
  waylandOnlyActive: boolean;
  waylandIgnoreAppids: string;

  // --- 6. System & Storage ---
  assetsPath: string | null;
  workshopPath: string | null;
  
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
  id: number;           // 唯一标识，用于 React key
  timestamp: string;    // "10:00:01"
  level: "info" | "warn" | "error" | "debug";
  source: "GUI" | "Core" | "Engine" | "Controller";
  message: string;
}