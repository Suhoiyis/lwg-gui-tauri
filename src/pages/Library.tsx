// src/pages/Library.tsx
import { useMemo, useCallback, useState, useRef, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";

// Layout & UI Components
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyState } from "@/components/ui/empty";
import { TooltipProvider } from "@/components/ui/tooltip";
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
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

// Custom Components
import { LibraryHeader } from "@/components/library/LibraryHeader";
import { WallpaperSidebar } from "@/components/library/WallpaperSidebar";
import { WallpaperGrid } from "@/components/library/WallpaperGrid";
import { LibraryPagination } from "@/components/library/LibraryPagination";

// State & API
import { useAppStore } from "@/store/appStore";
import { applyWallpaper, stopWallpaper, openFolder } from "@/api/wallpaper";

const ITEMS_PER_PAGE = 24;

export function Library() {
  // Store State
  // ✨ 1. 把 wallpapers 的注释解开！组件必须订阅原始数据
  const wallpapers = useAppStore((state) => state.wallpapers);
  const searchQuery = useAppStore((state) => state.searchQuery);
  const selectedId = useAppStore((state) => state.selectedId);
  const setSelectedId = useAppStore((state) => state.setSelectedId);

  // ✨ 2. 订阅排序状态
  const sortBy = useAppStore((state) => state.sortBy);

  // Local State
  const [wallpaperToDelete, setWallpaperToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const scrollTopRef = useRef<HTMLDivElement>(null);

  // --- Logic Layers ---

  // ✨ 3. 将过滤和排序逻辑直接写在组件内部，确保 100% 响应！
  const filteredWallpapers = useMemo(() => {
    // 拷贝一份原数组，防止修改原始状态
    let result = [...wallpapers];

    // 1. 过滤搜索词
    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter(
        (w) =>
          (w.title || "").toLowerCase().includes(lowerQ) ||
          (w.id || "").includes(lowerQ),
      );
    }

    // 2. 实时排序
    result.sort((a, b) => {
      if (sortBy === "name") {
        return (a.title || "").localeCompare(b.title || "");
      } else if (sortBy === "id") {
        return (a.id || "").localeCompare(b.id || "");
      } else if (sortBy === "size") {
        // ✨ 修改：把参数类型改为 any，并且在内部做极其严密的容错处理
        const parseSize = (rawSize?: any) => {
          if (rawSize === null || rawSize === undefined) return 0;

          // 如果后端传过来的直接就是纯数字，那我们就直接用它！
          if (typeof rawSize === "number") return rawSize;

          // 强制转换为字符串，彻底杜绝 toUpperCase is not a function 报错
          const sizeStr = String(rawSize).toUpperCase();
          const num = parseFloat(sizeStr);

          if (isNaN(num)) return 0;

          if (sizeStr.includes("GB")) return num * 1024;
          if (sizeStr.includes("KB")) return num / 1024;
          return num; // 默认按 MB 算
        };

        // 降序排列（体积大的在前面）
        return parseSize(b.size) - parseSize(a.size);
      }
      return 0;
    });

    return result;
  }, [wallpapers, searchQuery, sortBy]); // 💡 关键：只要这三个状态任何一个变化，立刻重新计算！

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy]); // 搜索或改变排序时，自动回到第一页

  // 2. Pagination
  const totalItems = filteredWallpapers.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const paginatedWallpapers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredWallpapers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredWallpapers, currentPage]);

  const handlePageChange = useCallback(
    (page: number) => {
      if (page < 1 || page > totalPages) return;
      setCurrentPage(page);
      setTimeout(() => {
        scrollTopRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 10);
    },
    [totalPages],
  );

  // 3. Selection & Metadata
  const selectedWallpaper = useMemo(() => {
    return filteredWallpapers.find((w) => w.id === selectedId) || null;
  }, [filteredWallpapers, selectedId]);

  const currentIndex = useMemo(() => {
    if (!selectedId) return 0;
    const index = filteredWallpapers.findIndex((w) => w.id === selectedId);
    return index !== -1 ? index + 1 : 0;
  }, [filteredWallpapers, selectedId]);

  // --- Event Handlers ---

  const handleSelect = useCallback(
    (id: string) => setSelectedId(id),
    [setSelectedId],
  );

  const handleApply = async (id: string, title: string) => {
    const selectedScreen = useAppStore.getState().selectedScreen;
    const screen = selectedScreen === "all" ? undefined : selectedScreen;
    toast.promise(applyWallpaper(id, screen), {
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

  const handleOpenFolder = async (path: string) => {
    if (!path) {
      toast.error("Cannot open folder", {
        description: "Path is unknown",
      });
      return;
    }

    try {
      await openFolder(path);
    } catch (error) {
      toast.error("Failed to open folder", {
        description: String(error),
      });
    }
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
        {/* Left Panel: Main Content */}
        <ResizablePanel defaultSize="75%" minSize="30%">
          <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 shrink-0">
              <LibraryHeader
                currentTitle={selectedWallpaper?.title || ""}
                totalCount={filteredWallpapers.length}
                currentPage={currentPage}
                totalPages={totalPages}
                currentIndex={currentIndex}
                onPageChange={handlePageChange}
              />
            </div>

            {/* Content Area */}
            <TooltipProvider>
              <ScrollArea className="flex-1 w-full h-full">
                {filteredWallpapers.length === 0 ? (
                  <div className="flex h-full min-h-[50vh] items-center justify-center">
                    <EmptyState />
                  </div>
                ) : (
                  <div className="px-6 pb-10">
                    <div ref={scrollTopRef} />

                    {/* Grid Component */}
                    <WallpaperGrid
                      wallpapers={paginatedWallpapers}
                      selectedId={selectedId}
                      onSelect={handleSelect}
                      onApply={handleApply}
                      onStop={handleStop}
                      onOpenFolder={handleOpenFolder}
                      onDelete={handleDeleteRequest}
                    />

                    {/* Pagination Component */}
                    <LibraryPagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </ScrollArea>
            </TooltipProvider>
          </div>
        </ResizablePanel>

        {/* Handle */}
        <ResizableHandle
          withHandle={false}
          className="relative w-2 bg-transparent z-10 -ml-1 cursor-col-resize group outline-none"
        >
          <div className="h-full w-[1px] bg-border/40 mx-auto group-hover:bg-border transition-colors duration-300" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-8 rounded-full bg-border opacity-0 group-hover:opacity-100 group-hover:bg-primary group-active:bg-primary/80 transition-all duration-300 ease-in-out shadow-sm" />
        </ResizableHandle>

        {/* Right Panel: Sidebar */}
        <ResizablePanel
          defaultSize="25%"
          minSize={300}
          maxSize="50%"
          className="bg-muted/30"
        >
          <WallpaperSidebar />
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Delete Dialog */}
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
