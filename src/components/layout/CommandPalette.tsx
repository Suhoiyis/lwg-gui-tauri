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
  ImageIcon,
  Activity,
  Shuffle,
  Square,
  Camera,
  RefreshCw,
  Clock,
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
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  // Load recent wallpapers when dialog opens
  useEffect(() => {
    if (isCommandPaletteOpen) {
      getHistory().then(setRecentWallpapers);
      setSearch(""); // Clear search when opening
    }
  }, [isCommandPaletteOpen]);

  // ========== Action Handlers ==========

  const handleRandom = async () => {
    await applyRandomWallpaper();
    setCommandPaletteOpen(false);
  };

  const handleStop = async () => {
    await stopWallpaper();
    setCommandPaletteOpen(false);
  };

  const handleScreenshot = () => {
    setActiveTab("wallpapers");
    setScreenshotHintActive(true);
    setCommandPaletteOpen(false);
  };

  const handleRefresh = async () => {
    await loadWallpapers();
    setCommandPaletteOpen(false);
  };

  const handleSettingsNavigate = (field: string) => {
    setActiveTab("settings");
    setHighlightSettingField(field);
    setCommandPaletteOpen(false);
  };

  const handleMonitorNavigate = () => {
    setActiveTab("performance");
    setCommandPaletteOpen(false);
  };

  const handleApplyWallpaper = async (id: string) => {
    await applyWallpaper(id);
    setCommandPaletteOpen(false);
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
                  <Clock className="h-4 w-4 text-muted-foreground" />
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
              
              {/* User Playlists */}
              {playlists.length > 0 && playlists.map((playlist) => (
                <CommandItem
                  key={playlist.id}
                  value={`playlist-${playlist.id}`}
                  onSelect={() => handleViewPlaylist(playlist.id)}
                >
                  <ListMusic className="h-4 w-4 text-muted-foreground" />
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
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
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
                <Volume2 className="h-4 w-4" />
                <span>Volume: {settings?.volume ?? 50}%</span>
              </CommandItem>
              <CommandItem
                value="settings-fps"
                onSelect={() => handleSettingsNavigate("fps")}
              >
                <Gauge className="h-4 w-4" />
                <span>FPS: {settings?.fps ?? 30}</span>
              </CommandItem>
              <CommandItem
                value="settings-workshop"
                onSelect={() => handleSettingsNavigate("workshopPath")}
              >
                <FolderOpen className="h-4 w-4" />
                <span>Workshop Path</span>
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            {/* Monitor Group */}
            <CommandGroup heading="Monitor">
              <CommandItem value="monitor-open" onSelect={handleMonitorNavigate}>
                <Activity className="h-4 w-4" />
                <span>Open Performance Monitor</span>
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            {/* Quick Actions Group */}
            <CommandGroup heading="Quick Actions">
              <CommandItem value="action-random" onSelect={handleRandom}>
                <Shuffle className="h-4 w-4" />
                <span>Random Wallpaper</span>
                <CommandShortcut>Ctrl+R</CommandShortcut>
              </CommandItem>
              <CommandItem value="action-stop" onSelect={handleStop}>
                <Square className="h-4 w-4" />
                <span>Stop All</span>
                <CommandShortcut>Ctrl+S</CommandShortcut>
              </CommandItem>
              <CommandItem value="action-screenshot" onSelect={handleScreenshot}>
                <Camera className="h-4 w-4" />
                <span>Screenshot</span>
                <CommandShortcut>Ctrl+P</CommandShortcut>
              </CommandItem>
              <CommandItem value="action-refresh" onSelect={handleRefresh}>
                <RefreshCw className="h-4 w-4" />
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