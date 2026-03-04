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

    // Also listen for performance updates to refresh the wallpaper info
    const setupListener = async () => {
      const unlisten = await listen("performance-update", () => {
        fetchActiveWallpapers();
      });
      return unlisten;
    };

    let unlisten: (() => void) | null = null;
    setupListener().then((fn) => {
      unlisten = fn;
    });

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, []);

  return { activeWallpapers, isLoading };
}
