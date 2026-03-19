import { useMemo, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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

// 固定显示最多 5 个缩略图
const MAX_THUMBNAILS = 5;

export function PlaylistItem({ playlist }: PlaylistItemProps) {
  const activePlaylistId = useAppStore((state) => state.activePlaylistId);
  const setActivePlaylist = useAppStore((state) => state.setActivePlaylist);
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

  // 固定数量计算，不再动态测量
  const { shownIds, overflow, overflowThumbnailId } = useMemo(() => {
    if (total === 0) {
      return { shownIds: [], overflow: 0, overflowThumbnailId: null };
    }

    if (total <= MAX_THUMBNAILS) {
      return { shownIds: thumbnailIds, overflow: 0, overflowThumbnailId: null };
    }

    // 超过 MAX_THUMBNAILS：显示 (MAX_THUMBNAILS - 1) 个普通 + 1 个带 +X
    const showCount = MAX_THUMBNAILS - 1;
    const remaining = total - showCount;
    const overflowThumb = thumbnailIds[showCount] ?? thumbnailIds[0] ?? null;

    return {
      shownIds: thumbnailIds.slice(0, showCount),
      overflow: remaining,
      overflowThumbnailId: overflowThumb,
    };
  }, [thumbnailIds, total]);

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
        {/* 整个 header 区域可拖动 */}
        <div
          className={cn(
            "group flex items-center gap-1 px-2 py-1.5 rounded-md text-sm transition-colors cursor-grab active:cursor-grabbing",
            isActive
              ? "bg-accent text-accent-foreground"
              : "hover:bg-accent/50 text-muted-foreground"
          )}
          {...attributes}
          {...listeners}
        >
          {/* Playlist name - 点击选择 */}
          <span
            className="flex-1 min-w-0 truncate cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setActivePlaylist(playlist.id);
            }}
          >
            {playlist.name}
          </span>

          {/* Right-side cluster: badge + chevron + menu (right-aligned) */}
          <div className="flex items-center gap-1">
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

            {/* Context menu - 阻止拖动 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
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
            <div className="flex items-center gap-1.5 overflow-hidden min-w-0">
              {shownIds.map((id) => (
                <Thumbnail key={id} wallpaperId={id} className="w-8 h-8 shrink-0" />
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