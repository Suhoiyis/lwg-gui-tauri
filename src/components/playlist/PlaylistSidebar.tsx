import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronRight, Plus, ListMusic, Star, Pin, PinOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/appStore";
import { PlaylistList } from "./PlaylistList";
import { CreatePlaylistDialog } from "./CreatePlaylistDialog";
import { FAVORITES_PLAYLIST_ID } from "@/lib/constants";

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

// ===== 最小化图标条组件 =====
function MinimizedBar() {
  const playlists = useAppStore((state) => state.playlists);
  const activePlaylistId = useAppStore((state) => state.activePlaylistId);
  const setActivePlaylist = useAppStore((state) => state.setActivePlaylist);
  const openPlaylistSidebarFloating = useAppStore((state) => state.openPlaylistSidebarFloating);
  const favoriteIds = useAppStore((state) => state.favoriteIds);
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <div className="w-12 h-full flex flex-col bg-sidebar border-r border-border/30 items-center py-2">
      {/* 展开/锁定按钮 */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={openPlaylistSidebarFloating}
        title="Open sidebar"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>

      <Separator className="my-2 w-6" />

      {/* 内容区域 */}
      <ScrollArea className="flex-1 w-full">
        <div className="flex flex-col items-center gap-1 px-1">
          {/* All Wallpapers */}
          <button
            onClick={() => setActivePlaylist(null)}
            className={cn(
              "w-9 h-9 rounded-md flex items-center justify-center transition-colors",
              !activePlaylistId
                ? "bg-accent text-accent-foreground"
                : "hover:bg-accent/50 text-muted-foreground"
            )}
            title="All Wallpapers"
          >
            <ListMusic className="w-4 h-4" />
          </button>

          {/* Favorites */}
          <button
            onClick={() => setActivePlaylist(FAVORITES_PLAYLIST_ID)}
            className={cn(
              "w-9 h-9 rounded-md flex items-center justify-center transition-colors",
              activePlaylistId === FAVORITES_PLAYLIST_ID
                ? "bg-brand text-brand-foreground"
                : "hover:bg-accent/50 text-muted-foreground"
            )}
            title={`Favorites (${favoriteIds.size})`}
          >
            <Star className={cn(
              "w-4 h-4",
              activePlaylistId === FAVORITES_PLAYLIST_ID && "fill-current"
            )} />
          </button>

          <Separator className="my-1 w-6" />

          {/* Playlists */}
          {playlists.map((playlist) => (
            <button
              key={playlist.id}
              onClick={() => setActivePlaylist(playlist.id)}
              className={cn(
                "w-9 h-9 rounded-md flex items-center justify-center text-sm font-semibold transition-colors",
                activePlaylistId === playlist.id
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/50 text-muted-foreground"
              )}
              title={playlist.name}
            >
              <span className={cn(
                "w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold text-white",
                generateAvatarColor(playlist.name)
              )}>
                {getInitial(playlist.name)}
              </span>
            </button>
          ))}
        </div>
      </ScrollArea>

      {/* 新建播放列表 */}
      <Separator className="my-2 w-6" />
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={() => setIsCreateDialogOpen(true)}
        title="New Playlist"
      >
        <Plus className="w-4 h-4" />
      </Button>

      <CreatePlaylistDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
}

// ===== 展开的侧栏内容 =====
function ExpandedSidebarContent({ onTogglePin, isPinned }: { onTogglePin: () => void; isPinned: boolean }) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border/30 shrink-0">
        <div className="flex items-center gap-2">
          <ListMusic className="w-4 h-4 text-muted-foreground" />
          <span className="font-semibold text-sm">Playlists</span>
        </div>
        <div className="flex items-center gap-1">
          {/* Pin 按钮 */}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onTogglePin}
            title={isPinned ? "Unpin (floating mode)" : "Pin (locked mode)"}
          >
            {isPinned ? (
              <PinOff className="w-3.5 h-3.5" />
            ) : (
              <Pin className="w-3.5 h-3.5" />
            )}
          </Button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {/* ALL item */}
          <AllWallpapersItem />

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
          className="w-full justify-start gap-2"
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

// ===== All Wallpapers 按钮 =====
function AllWallpapersItem() {
  const activePlaylistId = useAppStore((state) => state.activePlaylistId);
  const setActivePlaylist = useAppStore((state) => state.setActivePlaylist);

  return (
    <button
      onClick={() => setActivePlaylist(null)}
      className={cn(
        "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
        !activePlaylistId
          ? "bg-accent text-accent-foreground"
          : "hover:bg-accent/50 text-muted-foreground"
      )}
    >
      <ListMusic className="w-4 h-4" />
      <span>All Wallpapers</span>
    </button>
  );
}

// ===== 主组件 =====
export function PlaylistSidebar() {
  const isHydrated = useAppStore((state) => state.isHydrated);
  const isOpen = useAppStore((state) => state.isPlaylistSidebarOpen);
  const isPinned = useAppStore((state) => state.isPlaylistSidebarPinned);
  const togglePlaylistSidebar = useAppStore((state) => state.togglePlaylistSidebar);
  const togglePlaylistSidebarPin = useAppStore((state) => state.togglePlaylistSidebarPin);

  // 悬浮模式的鼠标离开检测
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [isMouseInside, setIsMouseInside] = useState(false);

  // 悬浮模式：鼠标离开后关闭
  useEffect(() => {
    if (isOpen && !isPinned) {
      // 悬浮模式
      const timer = setTimeout(() => {
        if (!isMouseInside) {
          togglePlaylistSidebar();
        }
      }, 300); // 300ms 延迟

      return () => clearTimeout(timer);
    }
  }, [isOpen, isPinned, isMouseInside, togglePlaylistSidebar]);

  const handleMouseEnter = useCallback(() => {
    setIsMouseInside(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsMouseInside(false);
  }, []);

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

  // 最小化状态
  if (!isOpen) {
    return <MinimizedBar />;
  }

  // 锁定模式：正常布局，挤压内容
  if (isPinned) {
    return (
      <div className="w-[220px] h-full flex flex-col bg-sidebar border-r border-border/30 transition-all duration-200">
        <ExpandedSidebarContent onTogglePin={togglePlaylistSidebarPin} isPinned={true} />
      </div>
    );
  }

  // 悬浮模式：绝对定位，覆盖内容
  return (
    <div
      ref={sidebarRef}
      className="absolute left-0 top-0 bottom-0 w-[220px] z-20 flex flex-col bg-sidebar border-r border-border/30 shadow-xl transition-all duration-200"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <ExpandedSidebarContent onTogglePin={togglePlaylistSidebarPin} isPinned={false} />
    </div>
  );
}