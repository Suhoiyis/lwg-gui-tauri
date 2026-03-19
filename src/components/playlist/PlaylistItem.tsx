import { useEffect, useMemo, useRef, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, MoreHorizontal, Pencil, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/appStore";
import { Playlist } from "@/types";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RenamePlaylistDialog } from "./RenamePlaylistDialog";
import { DeletePlaylistDialog } from "./DeletePlaylistDialog";
import { Thumbnail } from "@/components/common/Thumbnail";

interface PlaylistItemProps {
  playlist: Playlist;
}

export function PlaylistItem({ playlist }: PlaylistItemProps) {
  const activePlaylistId = useAppStore((state) => state.activePlaylistId);
  const setActivePlaylist = useAppStore((state) => state.setActivePlaylist);
  const removeFromPlaylist = useAppStore((state) => state.removeFromPlaylist);
  const isActive = activePlaylistId === playlist.id;

  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: playlist.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const total = playlist.wallpaperIds.length;
  const thumbnailIds = playlist.wallpaperIds;

  const stripRef = useRef<HTMLDivElement | null>(null);
  const [stripWidth, setStripWidth] = useState<number>(0);

  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;

    const observer = new ResizeObserver(() => {
      setStripWidth(el.clientWidth);
    });
    observer.observe(el);
    setStripWidth(el.clientWidth);

    return () => {
      observer.disconnect();
    };
  }, []);

  const { shownIds, overflow, overflowThumbnailId } = useMemo(() => {
    const thumbnailSizePx = 32;
    const gapPx = 6; // matches gap-1.5

    // Avoid first-render jank: until we have a real measurement, just render a small, stable set.
    if (stripWidth <= 0) {
      const initialShown = thumbnailIds.slice(0, Math.min(3, total));
      return {
        shownIds: initialShown,
        overflow: 0,
        overflowThumbnailId: null as string | null,
      };
    }

    // How many slots fit in one row at current width.
    const slotCount = Math.max(
      1,
      Math.floor((stripWidth + gapPx) / (thumbnailSizePx + gapPx))
    );

    if (total === 0) {
      return {
        shownIds: [] as string[],
        overflow: 0,
        overflowThumbnailId: null as string | null,
      };
    }

    if (total <= slotCount) {
      return {
        shownIds: thumbnailIds.slice(0, slotCount),
        overflow: 0,
        overflowThumbnailId: null,
      };
    }

    // Reserve the last slot for "+X".
    const showCount = Math.max(0, slotCount - 1);
    const remaining = Math.max(1, total - showCount);
    const overflowThumb = thumbnailIds[showCount] ?? thumbnailIds[0] ?? null;
    return {
      shownIds: thumbnailIds.slice(0, showCount),
      overflow: remaining,
      overflowThumbnailId: overflowThumb,
    };
  }, [stripWidth, thumbnailIds, total]);

  const stopAccordionToggle: React.PointerEventHandler<HTMLElement> = (e) => {
    e.stopPropagation();
  };

  const stopAccordionToggleClick: React.MouseEventHandler<HTMLElement> = (e) => {
    e.stopPropagation();
  };

  const stopAccordionToggleKeyDown: React.KeyboardEventHandler<HTMLElement> = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleRemove = (wallpaperId: string) => {
    removeFromPlaylist(playlist.id, wallpaperId).catch((error) => {
      console.error("Failed to remove from playlist:", error);
    });
  };

  return (
    <>
      <AccordionItem
        ref={setNodeRef}
        style={style}
        value={playlist.id}
        className={cn(
          "border-0",
          isDragging && "opacity-50 shadow-lg z-50"
        )}
      >
        <div
          className={cn(
            "group flex items-center gap-1 px-2 py-1.5 rounded-md text-sm transition-colors",
            isActive
              ? "bg-accent text-accent-foreground"
              : "hover:bg-accent/50 text-muted-foreground"
          )}
        >
          {/* Drag handle */}
          <button
            type="button"
            className="cursor-grab active:cursor-grabbing p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Drag playlist"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="w-3.5 h-3.5" />
          </button>

          {/* Selection area (does not toggle accordion) */}
          <button
            type="button"
            className="flex-1 min-w-0 flex items-center gap-2 text-left"
            onClick={() => setActivePlaylist(playlist.id)}
            aria-current={isActive ? "page" : undefined}
          >
            <span className="truncate">{playlist.name}</span>
          </button>

          {/* Right-side cluster: badge + chevron + menu (right-aligned) */}
          <div className="ml-auto flex items-center gap-1">
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 h-4 font-normal"
            >
              {playlist.wallpaperIds.length}
            </Badge>

            {/* Chevron-only toggle */}
            <AccordionTrigger
              aria-label="Toggle playlist"
              className="py-0 px-1 hover:no-underline flex-none justify-end w-auto"
            />

          {/* Context menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onPointerDownCapture={stopAccordionToggle}
                onClickCapture={stopAccordionToggleClick}
                onKeyDownCapture={stopAccordionToggleKeyDown}
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => setIsRenameDialogOpen(true)}>
                <Pencil className="w-4 h-4 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setIsDeleteDialogOpen(true)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
        </div>

        <AccordionContent className="pt-1 pb-2 px-2">
          {total === 0 ? (
            <div className="text-xs text-muted-foreground px-1">
              No wallpapers in this playlist
            </div>
          ) : (
            <div ref={stripRef} className="flex items-center gap-1.5 overflow-hidden min-w-0">
              {shownIds.map((id) => (
                <div key={id} className="group relative w-8 h-8 shrink-0">
                  <Thumbnail wallpaperId={id} className="w-8 h-8" />
                  <button
                    type="button"
                    className="absolute top-0 right-0 h-4 w-4 rounded-sm bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    aria-label="Remove from playlist"
                    onPointerDownCapture={stopAccordionToggle}
                    onClickCapture={(e) => {
                      stopAccordionToggleClick(e);
                      handleRemove(id);
                    }}
                    onKeyDownCapture={stopAccordionToggleKeyDown}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {overflow > 0 && overflowThumbnailId && (
                <div className="relative w-8 h-8 shrink-0">
                  <Thumbnail
                    wallpaperId={overflowThumbnailId}
                    className="w-8 h-8"
                  />
                  <div className="absolute inset-0 rounded flex items-center justify-center bg-black/60 text-xs font-semibold text-white">
                    +{overflow}
                  </div>
                </div>
              )}
            </div>
          )}
        </AccordionContent>
      </AccordionItem>

      {/* Dialogs */}
      <RenamePlaylistDialog
        open={isRenameDialogOpen}
        onOpenChange={setIsRenameDialogOpen}
        playlistId={playlist.id}
        currentName={playlist.name}
      />
      <DeletePlaylistDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        playlistId={playlist.id}
        playlistName={playlist.name}
      />
    </>
  );
}
