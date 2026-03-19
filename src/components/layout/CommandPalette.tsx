"use client";

import { useState, useEffect, useMemo } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  Activity,
  Shuffle,
  Square,
  Camera,
  RefreshCw,
  Star,
  Volume2,
  Gauge,
  FolderOpen,
  ListMusic,
} from "lucide-react";
import { useAppStore } from "@/store/appStore";
import { getHistory } from "@/api/wallpaper";
import { HistoryEntry } from "@/types";
import { getDisplayName } from "@/lib/utils";
import { FAVORITES_PLAYLIST_ID } from "@/lib/constants";
import { Thumbnail } from "@/components/common/Thumbnail";
import { toast } from "sonner";

// Valid settings fields for navigation (type safety)
const VALID_SETTINGS_FIELDS = [
  "volume",
  "fps",
  "scaling",
  "clamping",
  "workshopPath",
  "assetsPath",
  "screenshotDelay",
  "screenshotRes",
  "preferXvfb",
  "cycleEnabled",
  "cycleInterval",
  "cycleOrder",
] as const;

type SettingsField = (typeof VALID_SETTINGS_FIELDS)[number];

function isValidSettingsField(field: string): field is SettingsField {
  return VALID_SETTINGS_FIELDS.includes(field as SettingsField);
}

export function CommandPalette() {
  // Local state for search query (filtering only)
  const [search, setSearch] = useState("");
  const [recentWallpapers, setRecentWallpapers] = useState<HistoryEntry[]>([]);

  // Global state from Zustand store
  const isCommandPaletteOpen = useAppStore((state) => state.isCommandPaletteOpen);
  const setCommandPaletteOpen = useAppStore((state) => state.setCommandPaletteOpen);
  
  // Store data
  const wallpapers = useAppStore((state) => state.wallpapers);
  const favoriteIds = useAppStore((state) => state.favoriteIds);
  const nicknames = useAppStore((state) => state.nicknames);
  const settings = useAppStore((state) => state.settings);
  const playlists = useAppStore((state) => state.playlists);
  const cyclePlaylistId = useAppStore((state) => state.cyclePlaylistId);
  
  // Store actions
  const applyWallpaper = useAppStore((state) => state.applyWallpaper);
  const stopWallpaper = useAppStore((state) => state.stopWallpaper);
  const applyRandomWallpaper = useAppStore((state) => state.applyRandomWallpaper);
  const loadWallpapers = useAppStore((state) => state.loadWallpapers);
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const setActivePlaylist = useAppStore((state) => state.setActivePlaylist);
  const setHighlightSettingField = useAppStore((state) => state.setHighlightSettingField);
  const setScreenshotHintActive = useAppStore((state) => state.setScreenshotHintActive);

  // Keyboard shortcut: Cmd+K (Mac) / Ctrl+K (Windows/Linux)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault(); // CRITICAL: Prevent browser default search behavior
        // Use getState() to avoid stale closure
        const currentState = useAppStore.getState().isCommandPaletteOpen;
        setCommandPaletteOpen(!currentState);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [setCommandPaletteOpen]);

  // Load recent wallpapers when dialog opens (with race condition protection)
  useEffect(() => {
    let ignore = false; // Prevent stale updates after unmount/close
    
    if (isCommandPaletteOpen) {
      setSearch(""); // Clear search when opening
      
      getHistory()
        .then((data) => {
          if (!ignore) {
            setRecentWallpapers(data);
          }
        })
        .catch((error) => {
          if (!ignore) {
            console.error("Failed to load recent wallpapers:", error);
            toast.error("Failed to load recent wallpapers", {
              description: String(error),
            });
          }
        });
    }
    
    return () => {
      ignore = true; // Cleanup: ignore pending responses
    };
  }, [isCommandPaletteOpen]);

  // ========== Action Handlers ==========

  const handleRandom = async () => {
    try {
      await applyRandomWallpaper();
      setCommandPaletteOpen(false);
    } catch (error) {
      console.error("Random wallpaper failed:", error);
      toast.error("Failed to apply random wallpaper", {
        description: String(error),
      });
      // Keep palette open so user can retry
    }
  };

  const handleStop = async () => {
    try {
      await stopWallpaper();
      setCommandPaletteOpen(false);
    } catch (error) {
      console.error("Stop wallpaper failed:", error);
      toast.error("Failed to stop wallpaper", {
        description: String(error),
      });
    }
  };

  const handleScreenshot = () => {
    setActiveTab("wallpapers");
    setScreenshotHintActive(true);
    setCommandPaletteOpen(false);
  };

  const handleRefresh = async () => {
    try {
      await loadWallpapers();
      setCommandPaletteOpen(false);
    } catch (error) {
      console.error("Refresh failed:", error);
      toast.error("Failed to refresh library", {
        description: String(error),
      });
    }
  };

  const handleSettingsNavigate = (field: string) => {
    if (!isValidSettingsField(field)) {
      console.warn(`Invalid settings field: ${field}`);
      return;
    }
    setActiveTab("settings");
    setHighlightSettingField(field);
    setCommandPaletteOpen(false);
  };

  const handleMonitorNavigate = () => {
    setActiveTab("performance");
    setCommandPaletteOpen(false);
  };

  const handleApplyWallpaper = async (id: string) => {
    try {
      await applyWallpaper(id);
      setCommandPaletteOpen(false);
    } catch (error) {
      console.error("Apply wallpaper failed:", error);
      toast.error("Failed to apply wallpaper", {
        description: String(error),
      });
    }
  };

  const handleViewFavorites = () => {
    setActiveTab("wallpapers");
    setActivePlaylist(FAVORITES_PLAYLIST_ID);
    setCommandPaletteOpen(false);
  };

  const handleViewPlaylist = (playlistId: string) => {
    setActiveTab("wallpapers");
    setActivePlaylist(playlistId);
    setCommandPaletteOpen(false);
  };

  // ========== Computed Data ==========

  // Filtered wallpapers for search
  const filteredWallpapers = useMemo(() => {
    if (!search.trim()) return [];
    const lowerSearch = search.toLowerCase();
    return wallpapers
      .filter((w) => {
        const title = (w.title || "").toLowerCase();
        const nick = (nicknames[w.id] || "").toLowerCase();
        return title.includes(lowerSearch) || w.id.includes(lowerSearch) || nick.includes(lowerSearch);
      })
      .slice(0, 8); // Limit to 8 results
  }, [search, wallpapers, nicknames]);

  // Format relative time
  const formatTimeAgo = (timestamp: string): string => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  // ========== Playlist Display Logic ==========
  
  // Select playlists to display (max 3)
  // Priority: 1) cyclePlaylistId 2) sortBy updatedAt (most recent)
  const displayedPlaylists = useMemo(() => {
    if (playlists.length === 0) return [];
    
    // 1. Find cycle playlist (if set)
    const cyclePlaylist = cyclePlaylistId 
      ? playlists.find(p => p.id === cyclePlaylistId) 
      : null;
    
    // 2. Other playlists sorted by updatedAt (most recent first)
    const otherPlaylists = playlists
      .filter(p => p.id !== cyclePlaylistId)
      .sort((a, b) => b.updatedAt - a.updatedAt);
    
    // 3. Combine: cycle playlist first, then recent ones
    const result: typeof playlists = [];
    
    if (cyclePlaylist) {
      result.push(cyclePlaylist);
    }
    
    // Fill remaining slots (max 3 total)
    const remaining = 3 - result.length;
    result.push(...otherPlaylists.slice(0, remaining));
    
    return result;
  }, [playlists, cyclePlaylistId]);

  // ========== Render ==========

  return (
    <CommandDialog open={isCommandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
      <CommandInput
        placeholder="Search wallpapers, settings, commands..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>
          {search ? `No results for "${search}"` : "Start typing to search..."}
        </CommandEmpty>

        {/* Library Group - Show when no search */}
        {!search && (
          <>
            <CommandGroup heading="Library">
              {/* Recent Wallpapers */}
              {recentWallpapers.slice(0, 3).map((entry) => (
                <CommandItem
                  key={entry.id}
                  value={`recent-${entry.id}`}
                  onSelect={() => handleApplyWallpaper(entry.id)}
                >
                  <Thumbnail wallpaperId={entry.id} className="w-5 h-5 rounded" />
                  <span className="truncate">{entry.title}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {formatTimeAgo(entry.timestamp)}
                  </span>
                </CommandItem>
              ))}
              
              {/* Favorites */}
              {favoriteIds.size > 0 && (
                <CommandItem value="view-favorites" onSelect={handleViewFavorites}>
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>Favorites</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {favoriteIds.size} items
                  </span>
                </CommandItem>
              )}
              
              {/* User Playlists (max 3, sorted by cycle + recent update) */}
              {displayedPlaylists.length > 0 && displayedPlaylists.map((playlist) => (
                <CommandItem
                  key={playlist.id}
                  value={`playlist-${playlist.id}`}
                  onSelect={() => handleViewPlaylist(playlist.id)}
                >
                  <ListMusic className="h-4 w-4 text-violet-500" />
                  <span className="truncate">{playlist.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
                    {cyclePlaylistId === playlist.id && (
                      <span className="text-primary font-medium">cycle</span>
                    )}
                    {playlist.wallpaperIds.length} items
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* Wallpaper Search Results - Show when search is active */}
        {filteredWallpapers.length > 0 && (
          <CommandGroup heading="Wallpapers">
            {filteredWallpapers.map((wp) => {
              const { displayName } = getDisplayName(nicknames, wp.id, wp.title);
              return (
                <CommandItem
                  key={wp.id}
                  value={`${wp.title} ${wp.id} ${nicknames[wp.id] || ""}`}
                  onSelect={() => handleApplyWallpaper(wp.id)}
                >
                  <Thumbnail wallpaperId={wp.id} className="w-5 h-5 rounded" />
                  <span className="truncate">{displayName}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {wp.type}
                  </span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}

        {/* Settings/Monitor/Quick Actions - Hide when searching */}
        {!search && (
          <>
            {/* Settings Group */}
            <CommandGroup heading="Settings">
              <CommandItem
                value="settings-volume"
                onSelect={() => handleSettingsNavigate("volume")}
              >
                <Volume2 className="h-4 w-4 text-blue-500" />
                <span>Volume: {settings?.volume ?? 50}%</span>
              </CommandItem>
              <CommandItem
                value="settings-fps"
                onSelect={() => handleSettingsNavigate("fps")}
              >
                <Gauge className="h-4 w-4 text-emerald-500" />
                <span>FPS: {settings?.fps ?? 30}</span>
              </CommandItem>
              <CommandItem
                value="settings-workshop"
                onSelect={() => handleSettingsNavigate("workshopPath")}
              >
                <FolderOpen className="h-4 w-4 text-amber-500" />
                <span>Workshop Path</span>
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            {/* Monitor Group */}
            <CommandGroup heading="Monitor">
              <CommandItem value="monitor-open" onSelect={handleMonitorNavigate}>
                <Activity className="h-4 w-4 text-purple-500" />
                <span>Open Performance Monitor</span>
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            {/* Quick Actions Group */}
            <CommandGroup heading="Quick Actions">
              <CommandItem value="action-random" onSelect={handleRandom}>
                <Shuffle className="h-4 w-4 text-pink-500" />
                <span>Random Wallpaper</span>
                <CommandShortcut>Ctrl+R</CommandShortcut>
              </CommandItem>
              <CommandItem value="action-stop" onSelect={handleStop}>
                <Square className="h-4 w-4 text-red-500" />
                <span>Stop All</span>
                <CommandShortcut>Ctrl+S</CommandShortcut>
              </CommandItem>
              <CommandItem value="action-screenshot" onSelect={handleScreenshot}>
                <Camera className="h-4 w-4 text-cyan-500" />
                <span>Screenshot</span>
                <CommandShortcut>Ctrl+P</CommandShortcut>
              </CommandItem>
              <CommandItem value="action-refresh" onSelect={handleRefresh}>
                <RefreshCw className="h-4 w-4 text-teal-500" />
                <span>Refresh Library</span>
                <CommandShortcut>Ctrl+L</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}