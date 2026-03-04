import { useMemo, useCallback, useState } from "react";
import { Play, Square, FolderOpen, Trash2 } from "lucide-react";
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

  // ✨ 新增：用于控制删除确认弹窗的状态
  // 存储当前要删除的壁纸对象，为 null 时表示弹窗关闭
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

  // ✨ 第一步：请求删除（只打开弹窗）
  const handleDeleteRequest = (id: string, title: string) => {
    setWallpaperToDelete({ id, title });
  };

  // ✨ 第二步：确认删除（执行逻辑）
  const handleDeleteConfirm = () => {
    if (!wallpaperToDelete) return;

    // TODO: 调用后端删除 API
    // await deleteWallpaper(wallpaperToDelete.id);

    // 模拟删除成功
    toast.error("Delete Wallpaper", {
      description: `Feature coming soon. (ID: ${wallpaperToDelete.id})`,
    });

    // 关闭弹窗
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
                      // ✨ 这里改为调用请求函数，传入 ID 和 标题
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

      {/* ✨ 全局删除确认弹窗 */}
      <AlertDialog
        open={!!wallpaperToDelete}
        onOpenChange={(open) => !open && setWallpaperToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              wallpaper
              <span className="font-bold text-foreground">
                {" "}
                "{wallpaperToDelete?.title}"{" "}
              </span>
              from your library.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            {/* 确认按钮使用红色样式 */}
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
