import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronRight, ChevronLeft, Plus, ListMusic, Star, Pin, PinOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/appStore";
import { PlaylistList } from "./PlaylistList";
import { CreatePlaylistDialog } from "./CreatePlaylistDialog";
import { FAVORITES_PLAYLIST_ID } from "@/lib/constants";

// 自定义 hook：追踪上一个值
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

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

// ===== 图标列（仅最小化模式使用）=====
function IconColumn({ 
  isExpanded, 
  onToggle 
}: { 
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const playlists = useAppStore((state) => state.playlists);
  const activePlaylistId = useAppStore((state) => state.activePlaylistId);
  const setActivePlaylist = useAppStore((state) => state.setActivePlaylist);
  const favoriteIds = useAppStore((state) => state.favoriteIds);
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <>
      {/* 切换按钮 - Header 高度 52px */}
      <div className="shrink-0 h-[52px] flex items-center justify-center border-b border-border/30">
        <button
          onClick={onToggle}
          className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-all duration-200"
          title={isExpanded ? "Collapse sidebar" : "Open sidebar (floating)"}
        >
          {isExpanded ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* 内容区域 */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col items-center gap-1 p-2">
          {/* All Wallpapers */}
          <button
            onClick={() => setActivePlaylist(null)}
            className={cn(
              "w-9 h-9 rounded-md flex items-center justify-center transition-all duration-200",
              !activePlaylistId
                ? "bg-accent text-accent-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            )}
            title="All Wallpapers"
          >
            <ListMusic className="w-4 h-4" />
          </button>

          <Separator className="my-2 w-8" />

          {/* Favorites */}
          <button
            onClick={() => setActivePlaylist(FAVORITES_PLAYLIST_ID)}
            className={cn(
              "w-9 h-9 rounded-md flex items-center justify-center transition-all duration-200",
              activePlaylistId === FAVORITES_PLAYLIST_ID
                ? "bg-brand text-brand-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            )}
            title={`Favorites (${favoriteIds.size})`}
          >
            <Star className={cn(
              "w-4 h-4 transition-transform duration-200",
              activePlaylistId === FAVORITES_PLAYLIST_ID && "fill-current scale-110"
            )} />
          </button>

          {/* Playlists */}
          {playlists.map((playlist) => (
            <button
              key={playlist.id}
              onClick={() => setActivePlaylist(playlist.id)}
              className={cn(
                "w-9 h-9 rounded-md flex items-center justify-center transition-all duration-200",
                activePlaylistId === playlist.id
                  ? "ring-2 ring-accent ring-offset-1 ring-offset-sidebar"
                  : "hover:scale-105"
              )}
              title={playlist.name}
            >
              <span className={cn(
                "w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold text-white transition-transform duration-200",
                generateAvatarColor(playlist.name),
                activePlaylistId === playlist.id && "scale-110"
              )}>
                {getInitial(playlist.name)}
              </span>
            </button>
          ))}
        </div>
      </ScrollArea>

      {/* Footer 高度 48px */}
      <div className="shrink-0 h-[48px] flex items-center justify-center border-t border-border/30">
        <button
          onClick={() => setIsCreateDialogOpen(true)}
          className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-all duration-200"
          title="New Playlist"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <CreatePlaylistDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </>
  );
}

// ===== 锁定模式：单一 ScrollArea，使用 PlaylistList variant="locked" =====
function LockedSidebarLayout({
  onTogglePin,
  isPinned,
  onClose,
}: {
  onTogglePin: () => void;
  isPinned: boolean;
  onClose: () => void;
}) {
  const activePlaylistId = useAppStore((state) => state.activePlaylistId);
  const setActivePlaylist = useAppStore((state) => state.setActivePlaylist);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <div className="h-full flex flex-col">
      {/* ── Header（单行横跨两列）── */}
      <div className="shrink-0 h-[52px] flex items-center border-b border-border/30">
        {/* 左侧图标列（48px）*/}
        <div className="w-12 shrink-0 flex items-center justify-center border-r border-border/30 h-full">
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-all duration-200"
            title="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
        {/* 右侧文字列 */}
        <div className="flex-1 flex items-center justify-between px-3">
          <div className="flex items-center gap-2">
            <ListMusic className="w-4 h-4 text-muted-foreground" />
            <span className="font-semibold text-sm">Playlists</span>
          </div>
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 transition-transform duration-200 hover:scale-110"
              onClick={onTogglePin}
              title={isPinned ? "Unpin (floating mode)" : "Pin (locked mode)"}
            >
              {isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 transition-transform duration-200 hover:scale-110"
              onClick={onClose}
              title="Close sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* ── 单一 ScrollArea：每行同时渲染图标（左）和文字（右）── */}
      <ScrollArea className="flex-1">
        <div className="py-2">
          {/* All Wallpapers 行 */}
          <div className="flex items-center">
            <div className="w-12 shrink-0 flex items-center justify-center">
              <button
                onClick={() => setActivePlaylist(null)}
                className={cn(
                  "w-9 h-9 rounded-md flex items-center justify-center transition-all duration-200",
                  !activePlaylistId
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
                title="All Wallpapers"
              >
                <ListMusic className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 pr-2">
              <button
                onClick={() => setActivePlaylist(null)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all duration-200",
                  !activePlaylistId
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                <ListMusic className="w-4 h-4 shrink-0" />
                <span>All Wallpapers</span>
              </button>
            </div>
          </div>

          {/* Separator 行 */}
          <div className="flex items-center my-2">
            <div className="w-12 shrink-0 flex items-center justify-center">
              <div className="w-6 h-px bg-border/50" />
            </div>
            <div className="flex-1 pr-2 pl-3">
              <Separator />
            </div>
          </div>

          {/* PlaylistList variant="locked" - 包含 Favorites + Playlists，带拖拽排序 */}
          <PlaylistList variant="locked" />
        </div>
      </ScrollArea>

      {/* ── Footer（单行横跨两列）── */}
      <div className="shrink-0 h-[48px] flex items-center border-t border-border/30">
        <div className="w-12 shrink-0 flex items-center justify-center border-r border-border/30 h-full">
          <button
            onClick={() => setIsCreateDialogOpen(true)}
            className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-all duration-200"
            title="New Playlist"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 px-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 transition-all duration-200 hover:translate-x-0.5"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="w-4 h-4" />
            <span>New Playlist</span>
          </Button>
        </div>
      </div>

      <CreatePlaylistDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
}

// ===== 悬浮面板内容（不需要与图标列对齐，独立显示）=====
function ExpandedSidebarContent({ 
  onTogglePin, 
  isPinned,
  onClose 
}: { 
  onTogglePin: () => void; 
  isPinned: boolean;
  onClose: () => void;
}) {
  const activePlaylistId = useAppStore((state) => state.activePlaylistId);
  const setActivePlaylist = useAppStore((state) => state.setActivePlaylist);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <>
      {/* Header */}
      <div className="h-[52px] flex items-center justify-between px-3 border-b border-border/30 shrink-0">
        <div className="flex items-center gap-2">
          <ListMusic className="w-4 h-4 text-muted-foreground" />
          <span className="font-semibold text-sm">Playlists</span>
        </div>
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 transition-transform duration-200 hover:scale-110"
            onClick={onTogglePin}
            title={isPinned ? "Unpin (floating mode)" : "Pin (locked mode)"}
          >
            {isPinned ? (
              <PinOff className="w-4 h-4" />
            ) : (
              <Pin className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 transition-transform duration-200 hover:scale-110"
            onClick={onClose}
            title="Close sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          <button
            onClick={() => setActivePlaylist(null)}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all duration-200",
              !activePlaylistId
                ? "bg-accent text-accent-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            )}
          >
            <ListMusic className="w-4 h-4" />
            <span>All Wallpapers</span>
          </button>

          <Separator className="my-2" />

          <PlaylistList />
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="h-[48px] flex items-center px-2 border-t border-border/30 shrink-0">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2 transition-all duration-200 hover:translate-x-0.5"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <Plus className="w-4 h-4" />
          <span>New Playlist</span>
        </Button>
      </div>

      <CreatePlaylistDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </>
  );
}

// ===== 主组件 =====
export function PlaylistSidebar() {
  const isHydrated = useAppStore((state) => state.isHydrated);
  const isOpen = useAppStore((state) => state.isPlaylistSidebarOpen);
  const isPinned = useAppStore((state) => state.isPlaylistSidebarPinned);
  const togglePlaylistSidebar = useAppStore((state) => state.togglePlaylistSidebar);
  const togglePlaylistSidebarPin = useAppStore((state) => state.togglePlaylistSidebarPin);
  const openPlaylistSidebarFloating = useAppStore((state) => state.openPlaylistSidebarFloating);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const [isMouseInside, setIsMouseInside] = useState(false);
  const [closeTimer, setCloseTimer] = useState<NodeJS.Timeout | null>(null);
  
  const [isClosingToMinimized, setIsClosingToMinimized] = useState(false);
  const [isPinning, setIsPinning] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  
  const prevIsFloating = usePrevious(isOpen && !isPinned);
  const prevWasMinimized = usePrevious(!isOpen);
  
  useEffect(() => {
    const wasMinimized = prevWasMinimized ?? false;
    const isNowFloating = isOpen && !isPinned;
    
    if (wasMinimized && isNowFloating) {
      setIsOpening(true);
      const timer = setTimeout(() => setIsOpening(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isPinned, prevWasMinimized]);
  
  useEffect(() => {
    const wasFloating = prevIsFloating ?? false;
    const isNowLocked = isOpen && isPinned;
    
    if (wasFloating && isNowLocked) {
      setIsPinning(true);
      const timer = setTimeout(() => setIsPinning(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isPinned, prevIsFloating]);

  const closeFloatingToMinimized = useCallback(() => {
    setIsClosingToMinimized(true);
    setTimeout(() => {
      togglePlaylistSidebar();
      setIsClosingToMinimized(false);
    }, 250);
  }, [togglePlaylistSidebar]);

  useEffect(() => {
    if (isOpen && !isPinned) {
      if (!isMouseInside) {
        const timer = setTimeout(() => closeFloatingToMinimized(), 500);
        setCloseTimer(timer);
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, isPinned, isMouseInside, closeFloatingToMinimized]);

  useEffect(() => {
    if (isMouseInside && closeTimer) {
      clearTimeout(closeTimer);
      setCloseTimer(null);
    }
  }, [isMouseInside, closeTimer]);

  const handleMouseEnter = useCallback(() => setIsMouseInside(true), []);
  const handleMouseLeave = useCallback(() => setIsMouseInside(false), []);

  const handleExpandClick = useCallback(() => {
    openPlaylistSidebarFloating();
    setIsMouseInside(true);
  }, [openPlaylistSidebarFloating]);

  if (!isHydrated) {
    return (
      <div className="w-12 h-full bg-sidebar border-r border-border/30 flex">
        <div className="w-12 shrink-0 flex flex-col items-center py-4 gap-2">
          <Skeleton className="w-9 h-9 rounded-md" />
          <Skeleton className="w-9 h-9 rounded-md" />
          <Skeleton className="w-9 h-9 rounded-md" />
        </div>
      </div>
    );
  }

  const isFloating = isOpen && !isPinned;
  const isLocked = isOpen && isPinned;

  return (
    <>
      {/* 主容器 */}
      <div
        className={cn(
          "h-full bg-sidebar border-r border-border/30 shrink-0",
          "transition-all duration-300 ease-in-out",
          // 锁定模式：LockedSidebarLayout 占满 268px（内部自己划分 48+220）
          // 其他：仅图标列 48px
          (isLocked || isPinning) ? "w-[268px]" : "w-12"
        )}
      >
        {(isLocked || isPinning) ? (
          // ★ 锁定模式：统一布局，单一 ScrollArea，彻底消除两列错位
          <LockedSidebarLayout
            onTogglePin={togglePlaylistSidebarPin}
            isPinned={true}
            onClose={togglePlaylistSidebar}
          />
        ) : (
          // 最小化模式：仅图标列
          <div className="w-12 flex flex-col h-full">
            <IconColumn 
              isExpanded={isOpen}
              onToggle={isOpen ? togglePlaylistSidebar : handleExpandClick}
            />
          </div>
        )}
      </div>

      {/* 悬浮面板：位于图标列右侧 */}
      {(isFloating || isPinning) && (
        <div
          ref={sidebarRef}
          className={cn(
            "absolute left-12 top-0 h-full w-[220px] z-30",
            "flex flex-col bg-sidebar border-r border-border/30",
            "transition-all duration-300 ease-out",
            isOpening && "animate-in slide-in-from-left fade-in",
            isClosingToMinimized 
              ? "-translate-x-full opacity-0 shadow-2xl" 
              : isPinning
                ? "translate-x-0 opacity-0 shadow-none"
                : "translate-x-0 opacity-100 shadow-2xl"
          )}
          onMouseEnter={isFloating ? handleMouseEnter : undefined}
          onMouseLeave={isFloating ? handleMouseLeave : undefined}
        >
          <ExpandedSidebarContent 
            onTogglePin={togglePlaylistSidebarPin} 
            isPinned={false}
            onClose={closeFloatingToMinimized}
          />
        </div>
      )}

      {/* 悬浮模式遮罩 */}
      {isFloating && (
        <div
          className={cn(
            "absolute left-12 top-0 bottom-0 right-0 z-20 bg-black/5",
            "transition-opacity duration-300",
            isOpening && "animate-in fade-in duration-300",
            isClosingToMinimized ? "opacity-0" : "opacity-100"
          )}
          onClick={closeFloatingToMinimized}
        />
      )}
    </>
  );
}