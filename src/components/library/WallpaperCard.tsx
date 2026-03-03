import { memo, useMemo } from "react";
import { Image as ImageIcon, Video } from "lucide-react";
import { Wallpaper } from "@/types";
import { convertFileSrc } from "@tauri-apps/api/core";

interface WallpaperCardProps {
  wp: Wallpaper;
  isSelected: boolean;
  onSelect: () => void;
}

/**
 * 将本地文件路径转换为浏览器可加载的 URL
 */
function getPreviewUrl(preview: string): string {
  if (preview.startsWith("http://") || preview.startsWith("https://")) {
    return preview;
  }
  return convertFileSrc(preview);
}

/**
 * 壁纸卡片组件 - 使用 memo 优化避免不必要的重渲染
 */
export const WallpaperCard = memo(function WallpaperCard({
  wp,
  isSelected,
  onSelect,
}: WallpaperCardProps) {
  // 使用 useMemo 缓存 URL，避免每次渲染重新计算
  const previewUrl = useMemo(() => getPreviewUrl(wp.preview), [wp.preview]);

  return (
    <div onClick={onSelect} className="cursor-pointer group">
      <div
        className={`
        relative overflow-hidden rounded-2xl border-2 transition-all duration-300
        ${
          isSelected
            ? "ring-2 ring-pink-500 ring-offset-4 ring-offset-background border-pink-500"
            : "border-border/50 hover:border-pink-500/50 hover:shadow-xl hover:shadow-pink-500/10"
        }
      `}
      >
        {/* 图片容器 - 正方形，短边裁剪 */}
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
          <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-md p-1.5 rounded-lg border border-white/10">
            {wp.type === "Video" ? (
              <Video className="w-3 h-3 text-pink-400" />
            ) : (
              <ImageIcon className="w-3 h-3 text-emerald-400" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
