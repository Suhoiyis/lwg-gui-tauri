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

// ===== 最小化图标条 =====
function MinimizedIcons({ onExpand }: { onExpand: () => void }) {
  const playlists = useAppStore((state) => state.playlists);
  const activePlaylistId = useAppStore((state) => state.activePlaylistId);
  const setActivePlaylist = useAppStore((state) => state.setActivePlaylist);
  const favoriteIds = useAppStore((state) => state.favoriteIds);
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <>
      {/* 展开/悬浮按钮 */}
      <div className="shrink-0 px-1.5 pt-2">
        <button
          onClick={onExpand}
          className="w-9 h-9 rounded-md flex items-center justify-center text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-all duration-200"
          title="Open sidebar (floating)"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <Separator className="my-2 mx-2 w-8" />

      {/* 内容区域 */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col items-center gap-1 px-1.5 py-1">
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

          <Separator className="my-1 w-8" />

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

      {/* 新建播放列表 */}
      <Separator className="my-2 mx-2 w-8" />
      <div className="shrink-0 px-1.5 pb-2">
        <button
          onClick={() => setIsCreateDialogOpen(true)}
          className="w-9 h-9 rounded-md flex items-center justify-center text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-all duration-200"
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

// ===== 展开的侧栏内容 =====
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
      <div className="flex items-center justify-between p-3 border-b border-border/30 shrink-0">
        <div className="flex items-center gap-2">
          <ListMusic className="w-4 h-4 text-muted-foreground" />
          <span className="font-semibold text-sm">Playlists</span>
        </div>
        <div className="flex items-center gap-0.5">
          {/* Pin 按钮 */}
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
          {/* 关闭按钮 */}
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
          {/* ALL item */}
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

          {/* Playlist list with drag-drop */}
          <PlaylistList />
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-2 border-t border-border/30 shrink-0">
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

  // 悬浮模式的鼠标检测
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [isMouseInside, setIsMouseInside] = useState(false);
  const [closeTimer, setCloseTimer] = useState<NodeJS.Timeout | null>(null);
  
  // 关闭动画状态（仅在关闭到最小化时使用）
  const [isClosingToMinimized, setIsClosingToMinimized] = useState(false);
  
  // 从悬浮到锁定的过渡状态
  const [isPinning, setIsPinning] = useState(false);
  // 悬浮面板入场动画状态
  const [isOpening, setIsOpening] = useState(false);
  
  const prevIsFloating = usePrevious(isOpen && !isPinned);
  const prevWasMinimized = usePrevious(!isOpen);
  
  // 检测从最小化到悬浮的转换（入场动画）
  useEffect(() => {
    const wasMinimized = prevWasMinimized ?? false;
    const isNowFloating = isOpen && !isPinned;
    
    if (wasMinimized && isNowFloating) {
      setIsOpening(true);
      const timer = setTimeout(() => {
        setIsOpening(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isPinned, prevWasMinimized]);
  
  // 检测从悬浮到锁定的转换
  useEffect(() => {
    const wasFloating = prevIsFloating ?? false;
    const isNowLocked = isOpen && isPinned;
    
    if (wasFloating && isNowLocked) {
      // 从悬浮切换到锁定：开始过渡
      setIsPinning(true);
      // 等待主容器变宽完成后结束过渡
      const timer = setTimeout(() => {
        setIsPinning(false);
      }, 300); // 与主容器宽度动画时长一致
      return () => clearTimeout(timer);
    }
  }, [isOpen, isPinned, prevIsFloating]);

  // 关闭悬浮面板到最小化（带动画）
  const closeFloatingToMinimized = useCallback(() => {
    setIsClosingToMinimized(true);
    setTimeout(() => {
      togglePlaylistSidebar();
      setIsClosingToMinimized(false);
    }, 250);
  }, [togglePlaylistSidebar]);

  // 悬浮模式：鼠标离开后延迟关闭
  useEffect(() => {
    if (isOpen && !isPinned) {
      if (!isMouseInside) {
        const timer = setTimeout(() => {
          closeFloatingToMinimized();
        }, 500);
        setCloseTimer(timer);
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, isPinned, isMouseInside, closeFloatingToMinimized]);

  // 鼠标进入时取消关闭倒计时
  useEffect(() => {
    if (isMouseInside && closeTimer) {
      clearTimeout(closeTimer);
      setCloseTimer(null);
    }
  }, [isMouseInside, closeTimer]);

  const handleMouseEnter = useCallback(() => {
    setIsMouseInside(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsMouseInside(false);
  }, []);

  // 处理最小化栏的点击（打开悬浮）
  const handleExpandClick = useCallback(() => {
    openPlaylistSidebarFloating();
    setIsMouseInside(true);
  }, [openPlaylistSidebarFloating]);

  // FOUC prevention - show skeleton while hydrating
  if (!isHydrated) {
    return (
      <div className="w-[220px] h-full bg-sidebar border-r border-border/30 flex flex-col">
        <div className="p-4 border-b border-border/30">
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="flex-1 p-2 space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 w-full rounded-md" />
          ))}
        </div>
      </div>
    );
  }

// 计算当前状态
  const isFloating = isOpen && !isPinned;
  const isLocked = isOpen && isPinned;

  return (
    <>
      {/* 主容器 - 始终参与 flex 布局 */}
      <div
        className={cn(
          "h-full flex flex-col bg-sidebar border-r border-border/30 shrink-0",
          "transition-all duration-300 ease-in-out",
          // 锁定模式或 pinning 时占用 220px，其他情况 48px
          (isLocked || isPinning) ? "w-[220px]" : "w-12"
        )}
      >
        {/* 最小化模式内容（不在悬浮模式时渲染，因为会被悬浮面板覆盖） */}
        {!isOpen && !isFloating && (
          <MinimizedIcons onExpand={handleExpandClick} />
        )}
        
        {/* 锁定模式内容 */}
        {isLocked && (
          <ExpandedSidebarContent 
            onTogglePin={togglePlaylistSidebarPin} 
            isPinned={true}
            onClose={togglePlaylistSidebar}
          />
        )}
      </div>

      {/* 悬浮面板：悬浮模式或 pinning 时显示 */}
      {(isFloating || isPinning) && (
        <div
          ref={sidebarRef}
          className={cn(
            "absolute left-0 top-0 h-full w-[220px] z-30",
            "flex flex-col bg-sidebar border-r border-border/30",
            "transition-all duration-300 ease-out",
            // 入场动画（从最小化打开）
            isOpening && "animate-in slide-in-from-left fade-in",
            // 关闭到最小化：滑出 + 淡出
            isClosingToMinimized 
              ? "-translate-x-full opacity-0 shadow-2xl" 
              // 从悬浮到锁定：只淡出
              : isPinning
                ? "translate-x-0 opacity-0 shadow-none"
                // 正常显示
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

      {/* 悬浮模式的遮罩层（点击关闭到最小化） */}
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