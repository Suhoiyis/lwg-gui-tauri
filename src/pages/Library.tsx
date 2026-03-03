import { useMemo, useCallback } from "react";
import { Play, Square, FolderOpen, Trash2 } from "lucide-react";
import { toast } from "sonner";

// Components
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyState } from "@/components/ui/empty";
import { WallpaperCard } from "@/components/library/WallpaperCard";
import { LibraryHeader } from "@/components/library/LibraryHeader";
import { WallpaperSidebar } from "@/components/library/WallpaperSidebar";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  ContextMenuShortcut,
} from "@/components/ui/context-menu";

// State & API
import { useAppStore } from "@/store/appStore";
import { applyWallpaper, stopWallpaper } from "@/api/wallpaper";

export function Library() {
  const wallpapers = useAppStore((state) => state.wallpapers);
  const searchQuery = useAppStore((state) => state.searchQuery);
  const selectedId = useAppStore((state) => state.selectedId);
  const setSelectedId = useAppStore((state) => state.setSelectedId);

  // 1. 搜索过滤逻辑 (保留)
  const filteredWallpapers = useMemo(() => {
    if (!searchQuery) return wallpapers;
    const lowerQ = searchQuery.toLowerCase();
    return wallpapers.filter(
      (w) => w.title.toLowerCase().includes(lowerQ) || w.id.includes(lowerQ),
    );
  }, [wallpapers, searchQuery]);

  // 2. 当前选中的壁纸 (保留)
  const selectedWallpaper = useMemo(() => {
    return wallpapers.find((w) => w.id === selectedId) || null;
  }, [wallpapers, selectedId]);

  // 3. 点击选中处理 (保留)
  const handleSelect = useCallback(
    (id: string) => {
      setSelectedId(id);
    },
    [setSelectedId],
  );

  // --- ✨ 新增：右键菜单的处理函数 ---
  const handleApply = async (id: string, title: string) => {
    toast.promise(applyWallpaper(id), {
      loading: `Applying ${title}...`,
      success: `Applied: ${title}`,
      error: "Failed to apply wallpaper",
    });
    setSelectedId(id); // 右键应用时，同时也选中它，符合直觉
  };

  const handleStop = async () => {
    await stopWallpaper();
    toast.success("Wallpaper stopped");
  };

  const handleOpenFolder = (path: string) => {
    // 这是一个 Mock 提示，直到后端实现了 show_in_folder
    console.log("Open folder request:", path);
    toast.info("Open Folder", {
      description: path ? `Path: ${path}` : "Path unknown (Mock)",
    });
  };

  const handleDelete = (id: string) => {
    // 这是一个 Mock 提示，直到后端实现了 delete_wallpaper
    toast.error("Delete Wallpaper", {
      description: `Feature coming soon. (ID: ${id})`,
    });
  };

  return (
    <div className="h-full flex w-full">
      <div className="flex-1 flex flex-col p-6 space-y-6 h-full overflow-hidden min-w-0">
        {/* 顶部状态栏 (保留) */}
        <LibraryHeader
          currentTitle={selectedWallpaper?.title || ""}
          totalCount={filteredWallpapers.length}
        />

        {/* 滚动列表 */}
        <ScrollArea className="flex-1">
          {filteredWallpapers.length === 0 ? (
            <div className="flex h-full min-h-[50vh] items-center justify-center">
              <EmptyState />
            </div>
          ) : (
            <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10 justify-items-center [&>*]:w-full [&>*]:max-w-[280px]">
              {/* 遍历壁纸 */}
              {filteredWallpapers.map((wp) => (
                // ✨ 这里的 ContextMenu 包裹了每一个卡片
                <ContextMenu key={wp.id}>
                  {/* 触发区域：原来的卡片 */}
                  <ContextMenuTrigger asChild>
                    {/* ✨ onDoubleClick ， select-none */}
                    <div
                      className="w-full h-full relative cursor-context-menu select-none"
                      onDoubleClick={() => handleApply(wp.id, wp.title)}
                    >
                      <WallpaperCard
                        wp={wp}
                        isSelected={selectedId === wp.id}
                        onSelect={() => handleSelect(wp.id)}
                      />
                    </div>
                  </ContextMenuTrigger>

                  {/* 菜单内容 */}
                  <ContextMenuContent className="w-56">
                    <ContextMenuItem
                      onClick={() => handleApply(wp.id, wp.title)}
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Apply Wallpaper
                    </ContextMenuItem>

                    <ContextMenuItem onClick={handleStop}>
                      <Square className="mr-2 h-4 w-4" />
                      Stop Wallpaper
                    </ContextMenuItem>

                    <ContextMenuSeparator />

                    <ContextMenuItem onClick={() => handleOpenFolder(wp.path)}>
                      <FolderOpen className="mr-2 h-4 w-4" />
                      Open Folder...
                    </ContextMenuItem>

                    <ContextMenuSeparator />

                    <ContextMenuItem
                      className="text-red-600 focus:text-red-600 focus:bg-red-100 dark:focus:bg-red-900/20"
                      onClick={() => handleDelete(wp.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                      <ContextMenuShortcut>Del</ContextMenuShortcut>
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* 侧边栏 */}
      <aside className="w-64 border-l bg-muted/30 h-full hidden md:block flex-shrink-0">
        <WallpaperSidebar />
      </aside>
    </div>
  );
}
