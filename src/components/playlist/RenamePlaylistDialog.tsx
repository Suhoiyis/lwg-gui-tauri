import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/store/appStore";

interface RenamePlaylistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playlistId: string;
  currentName: string;
}

export function RenamePlaylistDialog({
  open,
  onOpenChange,
  playlistId,
  currentName,
}: RenamePlaylistDialogProps) {
  const renamePlaylist = useAppStore((state) => state.renamePlaylist);

  const [name, setName] = useState(currentName);
  const [isLoading, setIsLoading] = useState(false);

  // Update name when dialog opens with current name
  useEffect(() => {
    if (open) {
      setName(currentName);
    }
  }, [open, currentName]);

  const handleRename = async () => {
    if (!name.trim() || name === currentName) {
      onOpenChange(false);
      return;
    }

    setIsLoading(true);
    try {
      await renamePlaylist(playlistId, name.trim());
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the store
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rename Playlist</DialogTitle>
          <DialogDescription>
            Enter a new name for this playlist.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="playlist-rename">Name</Label>
            <Input
              id="playlist-rename"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Playlist name"
              maxLength={100}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleRename();
                }
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleRename} disabled={!name.trim() || isLoading}>
            {isLoading ? "Saving..." : "Rename"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}