import { useMemo, useCallback, useState } from "react";
import { Play, Square, FolderOpen, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

// Components
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyState } from "@/components/ui/empty";
import { WallpaperCard } from "@/components/library/WallpaperCard";
import { LibraryHeader } from "@/components/library/LibraryHeader";
import { WallpaperSidebar } from "@/components/library/WallpaperSidebar";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

  // ✨ 状态：存储当前要删除的壁纸对象
  const [wallpaperToDelete, setWallpaperToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  // 1. 搜索过滤逻辑
  const filteredWallpapers = useMemo(() => {
    if (!searchQuery) return wallpapers;
    const lowerQ = searchQuery.toLowerCase();
    return wallpapers.filter(
      (w) => w.title.toLowerCase().includes(lowerQ) || w.id.includes(lowerQ),
    );
  }, [wallpapers, searchQuery]);

  // 2. 当前选中的壁纸
  const selectedWallpaper = useMemo(() => {
    return wallpapers.find((w) => w.id === selectedId) || null;
  }, [wallpapers, selectedId]);

  // 3. 点击选中处理
  const handleSelect = useCallback(
    (id: string) => {
      setSelectedId(id);
    },
    [setSelectedId],
  );

  // --- 动作处理 ---
  const handleApply = async (id: string, title: string) => {
    toast.promise(applyWallpaper(id), {
      loading: `Applying ${title}...`,
      success: `Applied: ${title}`,
      error: "Failed to apply wallpaper",
    });
    setSelectedId(id);
  };

  const handleStop = async () => {
    await stopWallpaper();
    toast.success("Wallpaper stopped");
  };

  const handleOpenFolder = (path: string) => {
    console.log("Open folder request:", path);
    toast.info("Open Folder", {
      description: path ? `Path: ${path}` : "Path unknown (Mock)",
    });
  };

  // 请求删除（打开弹窗）
  const handleDeleteRequest = (id: string, title: string) => {
    setWallpaperToDelete({ id, title });
  };

  // 确认删除（执行逻辑）
  const handleDeleteConfirm = () => {
    if (!wallpaperToDelete) return;

    // TODO: 这里接入后端 API await deleteWallpaper(wallpaperToDelete.id);
    toast.error("Wallpaper Deleted", {
      description: `"${wallpaperToDelete.title}" has been removed.`,
    });

    setWallpaperToDelete(null);
  };

  return (
    <div className="h-full flex w-full">
      {/* 右侧主内容区 */}
      <div className="flex-1 flex flex-col p-6 space-y-6 h-full overflow-hidden min-w-0">
        <LibraryHeader
          currentTitle={selectedWallpaper?.title || ""}
          totalCount={filteredWallpapers.length}
        />

        <ScrollArea className="flex-1">
          {filteredWallpapers.length === 0 ? (
            <div className="flex h-full min-h-[50vh] items-center justify-center">
              <EmptyState />
            </div>
          ) : (
            <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10 justify-items-center [&>*]:w-full [&>*]:max-w-[280px]">
              {filteredWallpapers.map((wp) => (
                <ContextMenu key={wp.id}>
                  <ContextMenuTrigger asChild>
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
                      onClick={() => handleDeleteRequest(wp.id, wp.title)}
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

      {/* ✨ 全局删除确认弹窗 (Destructive Style) */}
      <AlertDialog
        open={!!wallpaperToDelete}
        onOpenChange={(open) => !open && setWallpaperToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            {/* 模拟 AlertDialogMedia 效果 */}
            <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10 dark:bg-red-900/20">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="space-y-1 text-center sm:text-left">
                <AlertDialogTitle>Delete this wallpaper?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  <span className="font-bold text-foreground">
                    {" "}
                    "{wallpaperToDelete?.title}"{" "}
                  </span>
                  and remove it from your disk.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            {/* 使用 Destructive Variant */}
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-600"
            >
              Delete Wallpaper
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
