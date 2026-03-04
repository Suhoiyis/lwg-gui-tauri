// src/components/library/WallpaperCard.tsx
import { memo, useMemo } from "react";
import { Star, Video, Monitor, Globe, Image as ImageIcon } from "lucide-react";
import { Wallpaper } from "@/types";
import { convertFileSrc } from "@tauri-apps/api/core";
import { useAppStore } from "@/store/appStore";
import { toast } from "sonner";
import { Toggle } from "@/components/ui/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface WallpaperCardProps {
  wp: Wallpaper;
  isSelected: boolean;
  onSelect: () => void;

  // ✨ 细粒度显示控制
  showTitle?: boolean;
  showIcons?: boolean;
  className?: string;
  children?: React.ReactNode;
}

function getPreviewUrl(preview: string): string {
  if (preview.startsWith("http://") || preview.startsWith("https://")) {
    return preview;
  }
  return convertFileSrc(preview);
}

export const WallpaperCard = memo(function WallpaperCard({
  wp,
  isSelected,
  onSelect,
  showTitle = true,
  showIcons = true,
  className,
  children,
}: WallpaperCardProps) {
  const isFavorite = useAppStore((state) => state.isFavorite(wp.id));
  const toggleFavorite = useAppStore((state) => state.toggleFavorite);

  const handleToggleFavorite = () => {
    toggleFavorite(wp.id);
    toast.success(
      isFavorite ? "Removed from favorites" : "Added to favorites",
      { description: wp.title },
    );
  };

  const previewUrl = useMemo(() => getPreviewUrl(wp.preview), [wp.preview]);

  const TypeIcon = useMemo(() => {
    const type = wp.type?.toLowerCase() ?? "";
    switch (type) {
      case "video":
        return <Video className="w-3.5 h-3.5 text-pink-400" />;
      case "web":
        return <Globe className="w-3.5 h-3.5 text-blue-400" />;
      case "scene":
        return <Monitor className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <ImageIcon className="w-3.5 h-3.5 text-slate-400" />;
    }
  }, [wp.type]);

  return (
    // 1. 最外层容器：负责响应点击、布局位置和传入的 className
    <div
      onClick={onSelect}
      className={cn(
        "group relative cursor-pointer select-none",
        // 这里不要强制写 aspect-square，让外部 className 决定形状（比如 Compact 可能是固定 px）
        className,
      )}
    >
      {/* 2. 视觉容器：负责圆角、边框、阴影和 hover 效果 */}
      <div
        className={cn(
          "relative w-full h-full overflow-hidden rounded-2xl border-2 bg-muted transition-all duration-300",
          isSelected
            ? "border-pink-500 ring-2 ring-pink-500 ring-offset-4 ring-offset-background shadow-lg shadow-pink-500/20"
            : "border-border/50 hover:border-pink-500/50 hover:shadow-xl hover:shadow-pink-500/10",
        )}
      >
        {/* 3. 内容层：图片和叠加元素 */}

        {/* 图片 */}
        <img
          src={previewUrl}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          alt={wp.title}
          loading="lazy"
          draggable={false}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src =
              'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23374151" width="100" height="100"/><text x="50" y="55" text-anchor="middle" fill="%239ca3af" font-size="12">No Preview</text></svg>';
          }}
        />

        {/* 收藏按钮 (左上) */}
        {showIcons && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="absolute top-2 left-2 z-20"
                onClick={(e) => e.stopPropagation()} // 再次确保阻断点击
              >
                <Toggle
                  pressed={isFavorite}
                  onPressedChange={handleToggleFavorite}
                  size="sm"
                  className={cn(
                    "h-7 w-7 p-0 rounded-full border border-white/10 backdrop-blur-sm transition-all",
                    // 未选中时半透明黑底，选中时淡黄底
                    isFavorite
                      ? "bg-yellow-500/20 border-yellow-500/50 opacity-100"
                      : "bg-black/40 hover:bg-black/60 opacity-0 group-hover:opacity-100",
                  )}
                >
                  <Star
                    className={cn(
                      "h-3.5 w-3.5 transition-colors",
                      isFavorite
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-transparent text-white/90",
                    )}
                  />
                </Toggle>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>{isFavorite ? "Remove from favorites" : "Add to favorites"}</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* 类型图标 (右上) */}
        {showIcons && (
          <div className="absolute top-2 right-2 z-20 bg-black/50 backdrop-blur-md p-1.5 rounded-lg border border-white/5 shadow-sm flex items-center justify-center pointer-events-none">
            {TypeIcon}
          </div>
        )}

        {/* 底部标题 (渐变层) */}
        {showTitle && (
          <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 pt-8 pointer-events-none">
            <p className="text-[11px] font-bold text-white truncate">
              {wp.title}
            </p>
          </div>
        )}

        {/* 子元素插槽 (覆盖在最上层) */}
        {children && (
          <div className="absolute inset-0 z-30 pointer-events-none">
            {children}
          </div>
        )}
      </div>
    </div>
  );
});
