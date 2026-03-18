import { X, Check, CheckCheck, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/store/appStore";
import { useState } from "react";
import { CreatePlaylistDialog } from "./CreatePlaylistDialog";

export function SelectionModeBar() {
  const selectedForPlaylist = useAppStore((state) => state.selectedForPlaylist);
  const exitSelectionMode = useAppStore((state) => state.exitSelectionMode);
  const selectAllForPlaylist = useAppStore((state) => state.selectAllForPlaylist);
  const deselectAllForPlaylist = useAppStore((state) => state.deselectAllForPlaylist);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const selectedCount = selectedForPlaylist.size;

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-accent/50 border-b animate-in fade-in slide-in-from-top-2 duration-300">
      <Badge variant="secondary" className="font-normal">
        {selectedCount} selected
      </Badge>

      <div className="flex-1" />

      <Button
        variant="outline"
        size="sm"
        onClick={selectAllForPlaylist}
        className="gap-1"
      >
        <CheckCheck className="w-4 h-4" />
        Select All
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={deselectAllForPlaylist}
        className="gap-1"
      >
        <Check className="w-4 h-4" />
        Deselect
      </Button>

      <Button
        variant="default"
        size="sm"
        onClick={() => setIsCreateDialogOpen(true)}
        disabled={selectedCount === 0}
        className="gap-1"
      >
        <Plus className="w-4 h-4" />
        Create Playlist
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={exitSelectionMode}
        className="gap-1"
      >
        <X className="w-4 h-4" />
        Cancel
      </Button>

      <CreatePlaylistDialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) {
            exitSelectionMode();
          }
        }}
        initialWallpaperIds={Array.from(selectedForPlaylist)}
      />
    </div>
  );
}