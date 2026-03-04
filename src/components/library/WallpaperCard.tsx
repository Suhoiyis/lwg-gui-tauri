import { memo, useMemo } from "react";
import { Video, Monitor, Globe, Image as ImageIcon } from "lucide-react";
import { Wallpaper } from "@/types";
import { convertFileSrc } from "@tauri-apps/api/core";

interface WallpaperCardProps {
  wp: Wallpaper;
  isSelected: boolean;
  onSelect: () => void;
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
}: WallpaperCardProps) {
  const previewUrl = useMemo(() => getPreviewUrl(wp.preview), [wp.preview]);

  // ✨ 定义图标渲染逻辑
  const TypeIcon = useMemo(() => {
    // 1. 统一转为小写，并处理空值情况，确保 switch 匹配总是安全的
    const type = wp.type?.toLowerCase() ?? "";

    switch (type) {
      case "video":
        return <Video className="w-3.5 h-3.5 text-pink-400" />;
      case "web":
        return <Globe className="w-3.5 h-3.5 text-blue-400" />;
      case "scene":
        return <Monitor className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        // 如果是 image 类型或者其他未知类型，显示图片图标
        return <ImageIcon className="w-3.5 h-3.5 text-slate-400" />;
    }
  }, [wp.type]);

  return (
    <div onClick={onSelect} className="cursor-pointer group">
      <div
        className={`
        relative overflow-hidden rounded-2xl border-2 transition-all duration-300
        ${
          isSelected
            ? "ring-2 ring-pink-500 ring-offset-4 ring-offset-background border-pink-500 shadow-lg shadow-pink-500/20"
            : "border-border/50 hover:border-pink-500/50 hover:shadow-xl hover:shadow-pink-500/10"
        }
      `}
      >
        <div className="aspect-square relative overflow-hidden bg-muted">
          <img
            src={previewUrl}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            alt={wp.title}
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src =
                'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23374151" width="100" height="100"/><text x="50" y="55" text-anchor="middle" fill="%239ca3af" font-size="12">No Preview</text></svg>';
            }}
          />

          {/* 底部渐变标题 */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 pt-8">
            <p className="text-[11px] font-bold text-white truncate">
              {wp.title}
            </p>
          </div>

          {/* 右上角类型图标 */}
          <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md p-1.5 rounded-lg border border-white/5 shadow-2xl flex items-center justify-center">
            {TypeIcon}
          </div>
        </div>
      </div>
    </div>
  );
});
