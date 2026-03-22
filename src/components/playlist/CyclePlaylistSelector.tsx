import React from "react";
import { ListMusic, Star } from "lucide-react";
import { useAppStore } from "@/store/appStore";
import { FAVORITES_PLAYLIST_ID } from "@/lib/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CyclePlaylistSelectorProps {
  className?: string;
}

export function CyclePlaylistSelector({
  className,
}: CyclePlaylistSelectorProps) {
  const playlists = useAppStore((state) => state.playlists);
  const cyclePlaylistId = useAppStore((state) => state.cyclePlaylistId);
  const setCyclePlaylist = useAppStore((state) => state.setCyclePlaylist);
  const favoriteIds = useAppStore((state) => state.favoriteIds);

  const isSpecialPlaylist = (id: string | null): boolean => {
    return id === FAVORITES_PLAYLIST_ID;
  };

  React.useEffect(() => {
    if (cyclePlaylistId) {
      const isSpecial = isSpecialPlaylist(cyclePlaylistId);
      const exists = playlists.some((p) => p.id === cyclePlaylistId);
      if (!isSpecial && !exists) {
        setCyclePlaylist(null);
      }
    }
  }, [cyclePlaylistId, playlists, setCyclePlaylist]);

  const effectiveValue = React.useMemo(() => {
    if (!cyclePlaylistId) return "ALL";
    const isSpecial = isSpecialPlaylist(cyclePlaylistId);
    const exists = playlists.some((p) => p.id === cyclePlaylistId);
    return isSpecial || exists ? cyclePlaylistId : "ALL";
  }, [cyclePlaylistId, playlists]);

  const handleValueChange = (value: string) => {
    setCyclePlaylist(value === "ALL" ? null : value);
  };

  return (
    <Select value={effectiveValue} onValueChange={handleValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Select playlist for cycling" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ALL">
          <div className="flex items-center gap-2">
            <ListMusic className="w-4 h-4" />
            <span>All Wallpapers</span>
          </div>
        </SelectItem>
        <SelectItem value={FAVORITES_PLAYLIST_ID}>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            <span>Favorites</span>
            <span className="text-muted-foreground text-xs">
              ({favoriteIds.size})
            </span>
          </div>
        </SelectItem>
        {playlists.map((playlist) => (
          <SelectItem key={playlist.id} value={playlist.id}>
            <div className="flex items-center gap-2">
              <ListMusic className="w-4 h-4" />
              <span>{playlist.name}</span>
              <span className="text-muted-foreground text-xs">
                ({playlist.wallpaperIds.length})
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}