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
  variant?: "floating" | "locked";
}

// 固定显示最多 5 个缩略图
const MAX_THUMBNAILS = 5;

// 生成随机但一致的颜色（基于字符串 hash）
function generateAvatarColor(name: string): string {
  const colors = [
    "bg-rose-500",
    "bg-pink-500",
    "bg-fuchsia-500",
    "bg-violet-500",
    "bg-indigo-500",
    "bg-blue-500",
    "bg-cyan-500",
    "bg-teal-500",
    "bg-emerald-500",
    "bg-lime-500",
    "bg-amber-500",
    "bg-orange-500",
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

// 获取首字母
function getInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

export function PlaylistItem({ playlist, variant = "floating" }: PlaylistItemProps) {
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

  // 限制拖动为垂直方向
  const style = {
    transform: CSS.Transform.toString(
      transform
        ? {
            ...transform,
            x: 0, // 限制水平方向
          }
        : null
    ),
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

  // locked 模式：带左侧图标槽的对齐布局
  if (variant === "locked") {
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
          {/* 外层行容器：图标槽 + 内容，整行可拖动 */}
          <div
            className="flex items-start cursor-grab active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            {/* 左侧图标槽 - 固定 48px 宽 */}
            <div className="w-12 shrink-0 flex items-center justify-center pt-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePlaylist(playlist.id);
                }}
                className={cn(
                  "w-9 h-9 rounded-md flex items-center justify-center transition-all duration-200",
                  isActive
                    ? "ring-2 ring-accent ring-offset-1 ring-offset-sidebar"
                    : "hover:scale-105"
                )}
                title={playlist.name}
              >
                <span className={cn(
                  "w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold text-white transition-transform duration-200",
                  generateAvatarColor(playlist.name),
                  isActive && "scale-110"
                )}>
                  {getInitial(playlist.name)}
                </span>
              </button>
            </div>
            
            {/* 右侧内容槽 */}
            <div className="flex-1 pr-2 min-w-0">
              {/* Header */}
              <div
                className={cn(
                  "group flex items-center gap-1 py-1.5 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent/50 text-muted-foreground"
                )}
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

                {/* Right-side cluster: badge + chevron + menu */}
                <div className="flex items-center gap-1">
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1.5 h-4 font-normal"
                  >
                    {playlist.wallpaperIds.length}
                  </Badge>

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

              {/* Accordion Content - 缩略图预览 */}
              <AccordionContent className="pt-1 pb-2 px-0">
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
            </div>
          </div>
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

  // floating 模式：原始布局
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