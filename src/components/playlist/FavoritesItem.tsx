import { useMemo } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/appStore";
import { FAVORITES_PLAYLIST_ID } from "@/lib/constants";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Thumbnail } from "@/components/common/Thumbnail";

// 固定显示最多 5 个缩略图
const MAX_THUMBNAILS = 5;

interface FavoritesItemProps {
  variant?: "floating" | "locked";
}

/**
 * FavoritesItem - 特殊的收藏播放列表项
 * - 固定显示，不可拖动
 * - 不可重命名、不可删除
 * - 使用 Star 图标
 */
export function FavoritesItem({ variant = "floating" }: FavoritesItemProps) {
  const activePlaylistId = useAppStore((state) => state.activePlaylistId);
  const setActivePlaylist = useAppStore((state) => state.setActivePlaylist);
  const favoriteIds = useAppStore((state) => state.favoriteIds);
  const wallpapers = useAppStore((state) => state.wallpapers);

  const isActive = activePlaylistId === FAVORITES_PLAYLIST_ID;

  // 从 favoriteIds 生成壁纸列表
  const favoriteWallpapers = useMemo(() => {
    return Array.from(favoriteIds)
      .map((id) => wallpapers.find((w) => w.id === id))
      .filter((w) => w !== undefined);
  }, [favoriteIds, wallpapers]);

  const total = favoriteWallpapers.length;
  const thumbnailIds = favoriteWallpapers.map((w) => w.id);

  // 固定数量计算
  const { shownIds, overflow, overflowThumbnailId } = useMemo(() => {
    if (total === 0) {
      return { shownIds: [], overflow: 0, overflowThumbnailId: null };
    }

    if (total <= MAX_THUMBNAILS) {
      return { shownIds: thumbnailIds, overflow: 0, overflowThumbnailId: null };
    }

    const showCount = MAX_THUMBNAILS - 1;
    const remaining = total - showCount;
    const overflowThumb = thumbnailIds[showCount] ?? thumbnailIds[0] ?? null;

    return {
      shownIds: thumbnailIds.slice(0, showCount),
      overflow: remaining,
      overflowThumbnailId: overflowThumb,
    };
  }, [thumbnailIds, total]);

  // locked 模式：带左侧图标槽的对齐布局
  if (variant === "locked") {
    return (
      <AccordionItem value={FAVORITES_PLAYLIST_ID} className="border-0">
        {/* 外层行容器：图标槽 + 内容 */}
        <div className="flex items-center">
          {/* 左侧图标槽 - 固定 48px 宽 */}
          <div className="w-12 shrink-0 flex items-center justify-center">
            <button
              onClick={() => setActivePlaylist(FAVORITES_PLAYLIST_ID)}
              className={cn(
                "w-9 h-9 rounded-md flex items-center justify-center transition-all duration-200",
                isActive
                  ? "bg-brand text-brand-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
              )}
              title={`Favorites (${total})`}
            >
              <Star
                className={cn(
                  "w-4 h-4 transition-transform duration-200",
                  isActive && "fill-current scale-110",
                )}
              />
            </button>
          </div>

          {/* 右侧内容槽 */}
          <div className="flex-1 pr-2 min-w-0">
            {/* Header */}
            <div
              className={cn(
                "group flex items-center gap-1 py-1.5 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-brand/10 text-brand font-medium"
                  : "hover:bg-accent/50 text-muted-foreground",
              )}
            >
              <div
                className="flex-1 min-w-0 flex items-center gap-2 cursor-pointer"
                onClick={() => setActivePlaylist(FAVORITES_PLAYLIST_ID)}
              >
                <span className="truncate">Favorites</span>
              </div>

              <div className="flex items-center gap-1">
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1.5 h-4 font-normal"
                >
                  {total}
                </Badge>

                <AccordionTrigger
                  aria-label="Toggle favorites"
                  className="py-0 px-1 hover:no-underline flex-none justify-end w-auto"
                />
              </div>
            </div>

            {/* Accordion Content - 缩略图预览 */}
            <AccordionContent className="pt-1 pb-2 px-0">
              {total === 0 ? (
                <div className="text-xs text-muted-foreground px-1">
                  No favorites yet. Click the star icon on any wallpaper to add
                  it.
                </div>
              ) : (
                <div className="flex items-center gap-1.5 overflow-hidden min-w-0">
                  {shownIds.map((id) => (
                    <Thumbnail
                      key={id}
                      wallpaperId={id}
                      className="w-8 h-8 shrink-0"
                    />
                  ))}
                  {overflow > 0 && overflowThumbnailId && (
                    <div className="relative w-8 h-8 shrink-0">
                      <Thumbnail
                        wallpaperId={overflowThumbnailId}
                        className="w-8 h-8"
                      />
                      <div className="absolute inset-0 rounded flex items-center justify-center bg-black/60 text-xs font-semibold text-white">
                        +{overflow}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </AccordionContent>
          </div>
        </div>
      </AccordionItem>
    );
  }

  // floating 模式：原始布局
  return (
    <AccordionItem value={FAVORITES_PLAYLIST_ID} className="border-0">
      {/* Header - 不可拖动，没有 cursor-grab */}
      <div
        className={cn(
          "group flex items-center gap-1 px-2 h-9 rounded-md text-sm transition-colors",
          isActive
            ? "bg-accent text-accent-foreground"
            : "hover:bg-accent/50 text-muted-foreground",
        )}
      >
        {/* Star icon + name */}
        <div
          className="flex-1 min-w-0 flex items-center gap-2 cursor-pointer"
          onClick={() => setActivePlaylist(FAVORITES_PLAYLIST_ID)}
        >
          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 shrink-0" />
          <span className="truncate">Favorites</span>
        </div>

        {/* Right-side cluster: badge + chevron */}
        <div className="flex items-center gap-1">
          <Badge
            variant="secondary"
            className="text-[10px] px-1.5 h-4 font-normal"
          >
            {total}
          </Badge>

          {/* Chevron-only toggle */}
          <AccordionTrigger
            aria-label="Toggle favorites"
            className="py-0 px-1 hover:no-underline flex-none justify-end w-auto"
          />
        </div>
      </div>

      <AccordionContent className="pt-1 pb-2 px-2">
        {total === 0 ? (
          <div className="text-xs text-muted-foreground px-1">
            No favorites yet. Click the star icon on any wallpaper to add it.
          </div>
        ) : (
          <div className="flex items-center gap-1.5 overflow-hidden min-w-0">
            {shownIds.map((id) => (
              <Thumbnail
                key={id}
                wallpaperId={id}
                className="w-8 h-8 shrink-0"
              />
            ))}
            {overflow > 0 && overflowThumbnailId && (
              <div className="relative w-8 h-8 shrink-0">
                <Thumbnail
                  wallpaperId={overflowThumbnailId}
                  className="w-8 h-8"
                />
                <div className="absolute inset-0 rounded flex items-center justify-center bg-black/60 text-xs font-semibold text-white">
                  +{overflow}
                </div>
              </div>
            )}
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
