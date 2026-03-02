import { Image as ImageIcon, Video } from "lucide-react";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import { Wallpaper } from "@/types";
import { convertFileSrc } from "@tauri-apps/api/core";

interface WallpaperCardProps {
  wp: Wallpaper;
  isSelected: boolean;
  onSelect: () => void;
}

/**
 * 将本地文件路径转换为浏览器可加载的 URL
 * - Linux: 使用 Tauri 的 convertFileSrc 转换为 asset:// 协议
 * - Windows Mock: 直接返回网络 URL
 */
function getPreviewUrl(preview: string): string {
  // 检测是否为网络 URL (Mock 数据)
  if (preview.startsWith('http://') || preview.startsWith('https://')) {
    return preview;
  }
  // Linux: 本地文件路径 -> asset:// URL
  return convertFileSrc(preview);
}

export function WallpaperCard({ wp, isSelected, onSelect }: WallpaperCardProps) {
  const previewUrl = getPreviewUrl(wp.preview);
  
  return (
    <div onClick={onSelect} className="cursor-pointer">
      <CardContainer className="inter-var w-full">
        <CardBody className={`
          relative group/card bg-card border-border/50 w-full rounded-2xl p-2 border transition-all
          ${isSelected ? 'ring-2 ring-pink-500 ring-offset-4 ring-offset-background bg-muted/50' : 'hover:border-pink-500/50'}
        `}>
          <CardItem translateZ="50" className="w-full aspect-square rounded-xl overflow-hidden relative">
            <img 
              src={previewUrl} 
              className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-110" 
              alt={wp.title}
              loading="lazy"
              onError={(e) => {
                // 加载失败时显示占位图
                const target = e.target as HTMLImageElement;
                target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23374151" width="100" height="100"/><text x="50" y="55" text-anchor="middle" fill="%239ca3af" font-size="12">No Preview</text></svg>';
              }}
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-3 pt-8">
              <p className="text-[11px] font-bold text-white truncate">{wp.title}</p>
            </div>
            <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-md p-1.5 rounded-lg border border-white/10">
              {wp.type === 'Video' ? <Video className="w-3 h-3 text-pink-400" /> : <ImageIcon className="w-3 h-3 text-emerald-400" />}
            </div>
          </CardItem>
        </CardBody>
      </CardContainer>
    </div>
  );
}