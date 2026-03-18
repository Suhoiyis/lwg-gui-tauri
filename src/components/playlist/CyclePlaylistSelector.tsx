import React from "react";
import { ListMusic } from "lucide-react";
import { useAppStore } from "@/store/appStore";
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

  // Robustness check: if cyclePlaylistId doesn't exist in playlists, fallback to ALL
  React.useEffect(() => {
    if (cyclePlaylistId) {
      const exists = playlists.some((p) => p.id === cyclePlaylistId);
      if (!exists) {
        setCyclePlaylist(null);
      }
    }
  }, [cyclePlaylistId, playlists, setCyclePlaylist]);

  // Determine effective value
  const effectiveValue = React.useMemo(() => {
    if (!cyclePlaylistId) return "ALL";
    const exists = playlists.some((p) => p.id === cyclePlaylistId);
    return exists ? cyclePlaylistId : "ALL";
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