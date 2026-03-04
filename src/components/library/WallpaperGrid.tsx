// src/components/library/WallpaperGrid.tsx
import { memo } from "react";
import { Play, Square, FolderOpen, Trash2 } from "lucide-react";
import { WallpaperCard } from "@/components/library/WallpaperCard";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  ContextMenuShortcut,
} from "@/components/ui/context-menu";

// 假设 Wallpaper 类型定义在 @/types，如果没有则需在此定义
import { Wallpaper } from "@/types";

interface WallpaperGridProps {
  wallpapers: Wallpaper[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onApply: (id: string, title: string) => void;
  onStop: () => void;
  onOpenFolder: (path: string) => void;
  onDelete: (id: string, title: string) => void;
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
    return (
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
              <ContextMenuItem onClick={() => onOpenFolder(wp.path)}>
                <FolderOpen className="mr-2 h-4 w-4" />
                Open Folder...
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem
                className="text-red-600 focus:text-red-600 focus:bg-red-100 dark:focus:bg-red-900/20"
                onClick={() => onDelete(wp.id, wp.title)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
                <ContextMenuShortcut>Del</ContextMenuShortcut>
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ))}
      </div>
    );
  },
);

WallpaperGrid.displayName = "WallpaperGrid";
