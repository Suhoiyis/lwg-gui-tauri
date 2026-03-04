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
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

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

  // 删除确认状态
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

  const selectedWallpaper = useMemo(() => {
    return wallpapers.find((w) => w.id === selectedId) || null;
  }, [wallpapers, selectedId]);

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

  const handleDeleteRequest = (id: string, title: string) => {
    setWallpaperToDelete({ id, title });
  };

  const handleDeleteConfirm = () => {
    if (!wallpaperToDelete) return;
    toast.error("Wallpaper Deleted", {
      description: `"${wallpaperToDelete.title}" has been removed.`,
    });
    setWallpaperToDelete(null);
  };

  return (
    <div className="h-full w-full overflow-hidden">
      <ResizablePanelGroup
        orientation="horizontal"
        className="h-full w-full rounded-lg"
      >
        {/* 左侧：主内容区 */}
        <ResizablePanel defaultSize="75%" minSize="30%">
          <div className="flex flex-col h-full pl-6 pt-6 pb-6 space-y-6 overflow-hidden">
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
                <div className="pr-6 max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10 justify-items-center [&>*]:w-full [&>*]:max-w-[280px]">
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
                        <ContextMenuItem
                          onClick={() => handleOpenFolder(wp.path)}
                        >
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
        </ResizablePanel>

        {/* 拖拽手柄 - iOS/Notion 风格 */}
        <ResizableHandle
          withHandle={false}
          className="relative w-2 bg-transparent z-10 -ml-1 cursor-col-resize group outline-none"
        >
          {/* 1. 基础细线：平时很淡，鼠标放上去变深一点 */}
          <div className="h-full w-[1px] bg-border/40 mx-auto group-hover:bg-border transition-colors duration-300" />

          {/* 2. 中间的小胶囊：平时隐藏，鼠标放上去浮现 */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                  w-1 h-8 rounded-full bg-border
                  opacity-0 group-hover:opacity-100
                  group-hover:bg-primary group-active:bg-primary/80
                  transition-all duration-300 ease-in-out shadow-sm"
          />
        </ResizableHandle>

        {/* 右侧：侧边栏 */}
        {/* ✨ 见证奇迹的时刻：混合单位 */}
        <ResizablePanel
          defaultSize="25%"
          minSize={300}
          maxSize="50%"
          className="bg-muted/30"
        >
          <WallpaperSidebar />
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* 删除弹窗 */}
      <AlertDialog
        open={!!wallpaperToDelete}
        onOpenChange={(open) => !open && setWallpaperToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
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
