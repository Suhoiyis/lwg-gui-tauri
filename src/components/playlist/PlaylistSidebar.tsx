import { useState, useRef, useEffect, useCallback } from "react";
import {
  ChevronRight,
  ChevronLeft,
  Plus,
  ListMusic,
  Star,
  Pin,
  PinOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/appStore";
import { PlaylistList } from "./PlaylistList";
import { CreatePlaylistDialog } from "./CreatePlaylistDialog";
import { FAVORITES_PLAYLIST_ID } from "@/lib/constants";

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

function getInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

// ===== 图标列（仅最小化模式使用）=====
function IconColumn({
  isExpanded,
  onToggle,
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

      <ScrollArea className="flex-1">
        <div className="flex flex-col items-center gap-1 p-2">
          <button
            onClick={() => setActivePlaylist(null)}
            className={cn(
              "w-9 h-9 rounded-md flex items-center justify-center transition-all duration-200",
              !activePlaylistId
                ? "bg-accent text-accent-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
            )}
            title="All Wallpapers"
          >
            <ListMusic className="w-4 h-4" />
          </button>

          <Separator className="w-8" />

          <button
            onClick={() => setActivePlaylist(FAVORITES_PLAYLIST_ID)}
            className={cn(
              "w-9 h-9 rounded-md flex items-center justify-center transition-all duration-200",
              activePlaylistId === FAVORITES_PLAYLIST_ID
                ? "bg-brand text-brand-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
            )}
            title={`Favorites (${favoriteIds.size})`}
          >
            <Star
              className={cn(
                "w-4 h-4 transition-transform duration-200",
                activePlaylistId === FAVORITES_PLAYLIST_ID &&
                  "fill-current scale-110",
              )}
            />
          </button>

          {playlists.map((playlist) => (
            <button
              key={playlist.id}
              onClick={() => setActivePlaylist(playlist.id)}
              className={cn(
                "w-9 h-9 rounded-md flex items-center justify-center transition-all duration-200",
                activePlaylistId === playlist.id
                  ? "ring-2 ring-accent ring-offset-1 ring-offset-sidebar"
                  : "hover:scale-105",
              )}
              title={playlist.name}
            >
              <span
                className={cn(
                  "w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold text-white transition-transform duration-200",
                  generateAvatarColor(playlist.name),
                  activePlaylistId === playlist.id && "scale-110",
                )}
              >
                {getInitial(playlist.name)}
              </span>
            </button>
          ))}
        </div>
      </ScrollArea>

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

// ===== 锁定模式：单一 ScrollArea =====
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
      <div className="shrink-0 h-[52px] flex items-center border-b border-border/30">
        <div className="w-12 shrink-0 flex items-center justify-center border-r border-border/30 h-full">
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-all duration-200"
            title="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
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
      </div>

      <ScrollArea className="flex-1">
        <div className="py-2">
          <div className="flex items-center">
            <div className="w-12 shrink-0 flex items-center justify-center">
              <button
                onClick={() => setActivePlaylist(null)}
                className={cn(
                  "w-9 h-9 rounded-md flex items-center justify-center transition-all duration-200",
                  !activePlaylistId
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
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
                  "w-full flex items-center gap-2 px-3 h-9 rounded-md text-sm transition-all duration-200",
                  !activePlaylistId
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                )}
              >
                <span>All Wallpapers</span>
              </button>
            </div>
          </div>

          <div className="flex items-center my-2">
            <div className="w-12 shrink-0 flex items-center justify-center">
              <div className="w-6 h-px bg-border/50" />
            </div>
            <div className="flex-1 pr-2 pl-3">
              <Separator />
            </div>
          </div>

          <PlaylistList variant="locked" />
        </div>
      </ScrollArea>

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

// ===== 悬浮面板内容 =====
function ExpandedSidebarContent({
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
    <>
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

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          <button
            onClick={() => setActivePlaylist(null)}
            className={cn(
              "w-full flex items-center gap-2 px-3 h-9 rounded-md text-sm transition-all duration-200",
              !activePlaylistId
                ? "bg-accent text-accent-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
            )}
          >
            <ListMusic className="w-4 h-4" />
            <span>All Wallpapers</span>
          </button>

          <Separator />

          <PlaylistList />
        </div>
      </ScrollArea>

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

// ===== 悬浮面板组件：双 rAF 实现正确的挂载动画 =====
function FloatingPanel({
  isClosingToMinimized,
  isPinning,
  isFloating,
  onMouseEnter,
  onMouseLeave,
  onTogglePin,
  onClose,
}: {
  isClosingToMinimized: boolean;
  isPinning: boolean;
  isFloating: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onTogglePin: () => void;
  onClose: () => void;
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => setIsMounted(true));
      return () => cancelAnimationFrame(raf2);
    });
    return () => cancelAnimationFrame(raf1);
  }, []);

  const isOpen = isMounted && !isClosingToMinimized && !isPinning;

  return (
    <div
      className={cn(
        "absolute left-12 top-0 h-full w-[220px] z-30",
        "flex flex-col bg-sidebar border-r border-border/30",
        "transition-[transform,opacity] duration-300 ease-out",
        isOpen
          ? "translate-x-0 opacity-100 shadow-2xl"
          : "-translate-x-3 opacity-0 shadow-none",
        isPinning && "pointer-events-none",
      )}
      onMouseEnter={isFloating ? onMouseEnter : undefined}
      onMouseLeave={isFloating ? onMouseLeave : undefined}
    >
      <ExpandedSidebarContent
        onTogglePin={onTogglePin}
        isPinned={false}
        onClose={onClose}
      />
    </div>
  );
}

// ===== 主组件 =====
export function PlaylistSidebar() {
  const isHydrated = useAppStore((state) => state.isHydrated);
  const isOpen = useAppStore((state) => state.isPlaylistSidebarOpen);
  const isPinned = useAppStore((state) => state.isPlaylistSidebarPinned);
  const togglePlaylistSidebar = useAppStore(
    (state) => state.togglePlaylistSidebar,
  );
  const togglePlaylistSidebarPin = useAppStore(
    (state) => state.togglePlaylistSidebarPin,
  );
  const openPlaylistSidebarFloating = useAppStore(
    (state) => state.openPlaylistSidebarFloating,
  );

  const [isMouseInside, setIsMouseInside] = useState(false);
  const [closeTimer, setCloseTimer] = useState<NodeJS.Timeout | null>(null);

  // Transition states
  const [isClosingToMinimized, setIsClosingToMinimized] = useState(false);
  const [isClosingFromLocked, setIsClosingFromLocked] = useState(false);
  const [isPinning, setIsPinning] = useState(false);

  // 用 ref 追踪上一个状态，不触发 useEffect cleanup
  const wasFloatingRef = useRef(isOpen && !isPinned);
  const wasLockedRef = useRef(isOpen && isPinned);

  // 单一 effect 处理所有过渡，只用 [isOpen, isPinned] 作为依赖
  // setIsPinning 触发的重渲染不会导致 effect 重新执行
  useEffect(() => {
    const isNowFloating = isOpen && !isPinned;
    const isNowLocked = isOpen && isPinned;
    const isNowMinimized = !isOpen;

    // Floating -> Locked (Pinning)
    if (wasFloatingRef.current && isNowLocked) {
      setIsPinning(true);
      const timer = setTimeout(() => setIsPinning(false), 300);
      return () => clearTimeout(timer);
    }

    // Locked -> Minimized (Closing from Locked)
    if (wasLockedRef.current && isNowMinimized) {
      setIsClosingFromLocked(true);
      const timer = setTimeout(() => setIsClosingFromLocked(false), 300);
      return () => clearTimeout(timer);
    }

    // 更新 ref（在 effect 末尾，不影响当前判断）
    wasFloatingRef.current = isNowFloating;
    wasLockedRef.current = isNowLocked;
  }, [isOpen, isPinned]);

  const closeFloatingToMinimized = useCallback(() => {
    setIsClosingToMinimized(true);
    setTimeout(() => {
      togglePlaylistSidebar();
      setIsClosingToMinimized(false);
    }, 300);
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

  const handleTogglePin = useCallback(() => {
    if (isPinned) {
      setIsMouseInside(true);
    }
    togglePlaylistSidebarPin();
  }, [isPinned, togglePlaylistSidebarPin]);

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
          "transition-[width] duration-300 ease-in-out relative overflow-hidden",
          isLocked || isPinning ? "w-[268px]" : "w-12",
        )}
      >
        {isLocked || isPinning || isClosingFromLocked ? (
          <div className="w-[268px] h-full absolute left-0 top-0 flex flex-col">
            <LockedSidebarLayout
              onTogglePin={handleTogglePin}
              isPinned={true}
              onClose={togglePlaylistSidebar}
            />
          </div>
        ) : (
          <div className="w-12 h-full absolute left-0 top-0 flex flex-col">
            <IconColumn
              isExpanded={isOpen}
              onToggle={isOpen ? togglePlaylistSidebar : handleExpandClick}
            />
          </div>
        )}
      </div>

      {/* 悬浮面板 */}
      {(isFloating || isPinning) && (
        <FloatingPanel
          isClosingToMinimized={isClosingToMinimized}
          isPinning={isPinning}
          isFloating={isFloating}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTogglePin={handleTogglePin}
          onClose={closeFloatingToMinimized}
        />
      )}

      {/* 悬浮模式遮罩 */}
      {isFloating && (
        <div
          className={cn(
            "absolute left-12 top-0 bottom-0 right-0 z-20 bg-black/5",
            "transition-opacity duration-300",
            isClosingToMinimized ? "opacity-0" : "opacity-100",
          )}
          onClick={closeFloatingToMinimized}
        />
      )}
    </>
  );
}
