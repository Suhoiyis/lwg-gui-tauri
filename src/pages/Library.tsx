import { useMemo, useCallback, useState, useRef, useEffect } from "react";
import { Play, Square, FolderOpen, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

// Components
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyState } from "@/components/ui/empty";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WallpaperCard } from "@/components/library/WallpaperCard";
import { LibraryHeader } from "@/components/library/LibraryHeader";
import { WallpaperSidebar } from "@/components/library/WallpaperSidebar";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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

const ITEMS_PER_PAGE = 24; // 每页显示 24 张 (可被 2,3,4 整除，适配网格)

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

  // 收藏状态（本地页面级）
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  // ✨ 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  // 用于切换分页后滚动回顶部
  const scrollTopRef = useRef<HTMLDivElement>(null);

  // 1. 搜索过滤逻辑
  const filteredWallpapers = useMemo(() => {
    if (!searchQuery) return wallpapers;
    const lowerQ = searchQuery.toLowerCase();
    return wallpapers.filter(
      (w) => w.title.toLowerCase().includes(lowerQ) || w.id.includes(lowerQ),
    );
  }, [wallpapers, searchQuery]);

  // ✨ 当搜索条件改变时，重置回第一页
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // ✨ 计算分页数据
  const totalItems = filteredWallpapers.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const paginatedWallpapers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredWallpapers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredWallpapers, currentPage]);

  // ✨ 切换页码处理
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    // 稍微延迟一点滚动，等待渲染完成
    setTimeout(() => {
      scrollTopRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 10);
  };

  // ✨ 智能页码生成逻辑 (1 ... 4 5 6 ... 20)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5; // 最多显示的页码数（不含首尾）

    if (totalPages <= 7) {
      // 页数很少，直接全显示
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // 页数很多，需要省略号
      if (currentPage <= 4) {
        // 靠近开头: 1 2 3 4 5 ... 20
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // 靠近结尾: 1 ... 16 17 18 19 20
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        // 在中间: 1 ... 4 5 6 ... 20
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const selectedWallpaper = useMemo(() => {
    return wallpapers.find((w) => w.id === selectedId) || null;
  }, [wallpapers, selectedId]);

  const currentIndex = useMemo(() => {
    if (!selectedId) return 0;
    // 在过滤后的列表中查找位置，这样序号才符合当前视图
    const index = filteredWallpapers.findIndex((w) => w.id === selectedId);
    return index !== -1 ? index + 1 : 0;
  }, [filteredWallpapers, selectedId]);

  const handleSelect = useCallback(
    (id: string) => {
      setSelectedId(id);
    },
    [setSelectedId],
  );

  const handleToggleFavorite = useCallback(
    (id: string, title: string) => {
      const isCurrentlyFavorite = favoriteIds.has(id);

      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (isCurrentlyFavorite) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });

      toast.success(
        isCurrentlyFavorite ? "Removed from favorites" : "Added to favorites",
        {
          description: title,
        },
      );
    },
    [favoriteIds],
  );

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

  const handleJumpToPage = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const target = parseInt(e.currentTarget.value);
      if (!isNaN(target) && target >= 1 && target <= totalPages) {
        handlePageChange(target);
        e.currentTarget.value = ""; // 清空输入框
      } else {
        toast.error("Invalid Page", {
          description: `Please enter a number between 1 and ${totalPages}`,
        });
      }
    }
  };

  return (
    <div className="h-full w-full overflow-hidden">
      <ResizablePanelGroup
        orientation="horizontal"
        className="h-full w-full rounded-lg"
      >
        {/* 左侧：主内容区 */}
        <ResizablePanel defaultSize="75%" minSize="30%">
          {/* ✨ 优化 1：去掉了外层的 padding 和 space-y，只保留 flex 布局结构 */}
          <div className="flex flex-col h-full overflow-hidden">
            {/* Header 区域：自己控制 Padding */}
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

            {/* ScrollArea 区域：撑满剩余空间 */}
            <TooltipProvider>
              <ScrollArea className="flex-1 w-full h-full">
                {filteredWallpapers.length === 0 ? (
                  <div className="flex h-full min-h-[50vh] items-center justify-center">
                    <EmptyState />
                  </div>
                ) : (
                  // ✨ 优化 2：内容区域控制内边距，确保滚动条在最右侧，内容不贴边
                  <div className="px-6 pb-10">
                    {/* 用于回顶的锚点 */}
                    <div ref={scrollTopRef} />

                    {/* 壁纸网格 */}
                    <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center [&>*]:w-full [&>*]:max-w-[280px]">
                      {paginatedWallpapers.map((wp) => (
                        <ContextMenu key={wp.id}>
                          <ContextMenuTrigger asChild>
                            <div
                              className="w-full h-full relative cursor-context-menu select-none"
                              onDoubleClick={() => handleApply(wp.id, wp.title)}
                            >
                              <WallpaperCard
                                wp={wp}
                                isSelected={selectedId === wp.id}
                                isFavorite={favoriteIds.has(wp.id)}
                                onSelect={() => handleSelect(wp.id)}
                                onToggleFavorite={() =>
                                  handleToggleFavorite(wp.id, wp.title)
                                }
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
                              onClick={() =>
                                handleDeleteRequest(wp.id, wp.title)
                              }
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                              <ContextMenuShortcut>Del</ContextMenuShortcut>
                            </ContextMenuItem>
                          </ContextMenuContent>
                        </ContextMenu>
                      ))}
                    </div>

                    {/* 分页器 */}
                    {totalPages > 1 && (
                      <div className="mt-8 pb-4 flex items-center justify-center gap-4">
                        {/* 1. 分页条本身 (去掉 mx-auto，改由父容器控制居中) */}
                        <Pagination className="mx-0 w-auto">
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handlePageChange(currentPage - 1);
                                }}
                                className={
                                  currentPage === 1
                                    ? "pointer-events-none opacity-50"
                                    : "cursor-pointer"
                                }
                              />
                            </PaginationItem>

                            {getPageNumbers().map((page, index) => (
                              <PaginationItem key={index}>
                                {page === "..." ? (
                                  <PaginationEllipsis />
                                ) : (
                                  <PaginationLink
                                    href="#"
                                    isActive={page === currentPage}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handlePageChange(page as number);
                                    }}
                                    className="cursor-pointer"
                                  >
                                    {page}
                                  </PaginationLink>
                                )}
                              </PaginationItem>
                            ))}

                            <PaginationItem>
                              <PaginationNext
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handlePageChange(currentPage + 1);
                                }}
                                className={
                                  currentPage === totalPages
                                    ? "pointer-events-none opacity-50"
                                    : "cursor-pointer"
                                }
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>

                        {/* 2. 放在 Next 右侧的跳转框 */}
                        {totalPages > 7 && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground ml-2 border-l pl-4 h-5">
                            <span>Go to</span>
                            <div className="relative">
                              <Input
                                type="number"
                                min={1}
                                max={totalPages}
                                // ✨ 样式优化：极简风格，h-8 高度与按钮对齐
                                className="h-8 w-14 text-center px-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus-visible:ring-1"
                                onKeyDown={handleJumpToPage}
                                placeholder={currentPage.toString()}
                              />
                            </div>
                            <span>of {totalPages}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>
            </TooltipProvider>
          </div>
        </ResizablePanel>

        {/* 拖拽手柄 */}
        <ResizableHandle
          withHandle={false}
          className="relative w-2 bg-transparent z-10 -ml-1 cursor-col-resize group outline-none"
        >
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
