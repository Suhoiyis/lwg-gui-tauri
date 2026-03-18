// src/components/library/WallpaperGrid.tsx
import { memo, useState } from "react";
import { Play, Square, FolderOpen, Trash2, Edit3, Star } from "lucide-react";
import { WallpaperCard } from "@/components/library/WallpaperCard";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  ContextMenuShortcut,
} from "@/components/ui/context-menu";
import { EditNicknameDialog } from "@/components/dialogs/EditNicknameDialog";
import { useAppStore } from "@/store/appStore";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import { Wallpaper } from "@/types";

interface WallpaperGridProps {
  wallpapers: Wallpaper[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onApply: (id: string, title: string) => void;
  onStop: () => void;
  onOpenFolder: (path: string) => void;
  onDelete: (id: string, title: string, path: string) => void;
}

export const WallpaperGrid = memo(
  ({
    wallpapers,
    selectedId,
    onSelect,
    onApply,
    onStop,
    onOpenFolder,
    onDelete,
  }: WallpaperGridProps) => {
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editWallpaperId, setEditWallpaperId] = useState<string | null>(null);
    const [editWallpaperTitle, setEditWallpaperTitle] = useState("");

    const toggleFavorite = useAppStore((state) => state.toggleFavorite);
    const favoriteIds = useAppStore((state) => state.favoriteIds);

    const handleEditNickname = (id: string, title: string) => {
      setEditWallpaperId(id);
      setEditWallpaperTitle(title);
      setEditDialogOpen(true);
    };

    const handleToggleFavorite = (id: string, title: string) => {
      const wasFavorite = favoriteIds.has(id);
      toggleFavorite(id);
      toast.success(
        wasFavorite ? "Removed from favorites" : "Added to favorites",
        { description: title }
      );
    };

    return (
      <>
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center [&>*]:w-full [&>*]:max-w-[280px]">
          {wallpapers.map((wp) => (
            <ContextMenu key={wp.id}>
              <ContextMenuTrigger asChild>
                <div
                  className="w-full h-full relative cursor-context-menu select-none"
                  onDoubleClick={() => onApply(wp.id, wp.title)}
                >
                  <WallpaperCard
                    wp={wp}
                    isSelected={selectedId === wp.id}
                    onSelect={() => onSelect(wp.id)}
                  />
                </div>
              </ContextMenuTrigger>

              <ContextMenuContent className="w-56">
                <ContextMenuItem onClick={() => onApply(wp.id, wp.title)}>
                  <Play className="mr-2 h-4 w-4" />
                  Apply Wallpaper
                </ContextMenuItem>
                <ContextMenuItem onClick={onStop}>
                  <Square className="mr-2 h-4 w-4" />
                  Stop Wallpaper
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={() => handleEditNickname(wp.id, wp.title)}>
                  <Edit3 className="mr-2 h-4 w-4" />
                  Edit Nickname
                </ContextMenuItem>
                <ContextMenuItem onClick={() => handleToggleFavorite(wp.id, wp.title)}>
                  <Star className={cn(
                    "mr-2 h-4 w-4",
                    favoriteIds.has(wp.id) && "fill-yellow-500 text-yellow-500"
                  )} />
                  {favoriteIds.has(wp.id) ? "Remove from Favorites" : "Add to Favorites"}
                </ContextMenuItem>
                <ContextMenuItem onClick={() => onOpenFolder(wp.path)}>
                  <FolderOpen className="mr-2 h-4 w-4" />
                  Open Folder...
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem
                  className="text-red-600 focus:text-red-600 focus:bg-red-100 dark:focus:bg-red-900/20"
                  onClick={() => onDelete(wp.id, wp.title, wp.path)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                  <ContextMenuShortcut>Del</ContextMenuShortcut>
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))}
        </div>

        {/* Edit Nickname Dialog */}
        {editWallpaperId && (
          <EditNicknameDialog
            wallpaperId={editWallpaperId}
            wallpaperTitle={editWallpaperTitle}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
          />
        )}
      </>
    );
  },
);

WallpaperGrid.displayName = "WallpaperGrid";
