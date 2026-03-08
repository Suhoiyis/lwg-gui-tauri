// src/hooks/useActiveWallpapers.ts
import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

export interface ActiveWallpaper {
  screen: string;
  wallpaperId: string;
}

export function useActiveWallpapers() {
  const [activeWallpapers, setActiveWallpapers] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActiveWallpapers = async () => {
      try {
        const result = await invoke<Record<string, string>>("get_active_wallpapers");
        setActiveWallpapers(new Map(Object.entries(result)));
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to get active wallpapers:", error);
        setIsLoading(false);
      }
    };

    fetchActiveWallpapers();

    // 监听两个事件：performance-update 和 wallpaper-changed
    const setupListeners = async () => {
      const unlistenPerf = await listen("performance-update", () => {
        fetchActiveWallpapers();
      });
      const unlistenWp = await listen("wallpaper-changed", () => {
        fetchActiveWallpapers();
      });
      return [unlistenPerf, unlistenWp];
    };

    let unlisteners: (() => void)[] = [];
    setupListeners().then((fns) => {
      unlisteners = fns;
    });

    return () => {
      unlisteners.forEach((fn) => fn());
    };
  }, []);

  return { activeWallpapers, isLoading };
}
