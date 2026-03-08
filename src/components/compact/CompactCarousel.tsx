import { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Wallpaper } from "@/types";
import { convertFileSrc } from "@tauri-apps/api/core";

interface CompactCarouselProps {
  /** 壁纸列表 */
  wallpapers: Wallpaper[];
  /** 当前选中的壁纸 ID */
  selectedId: string | null;
  /** 选择壁纸回调 */
  onSelect: (id: string) => void;
}

/**
 * 获取预览图 URL
 * 处理本地文件路径和网络 URL 两种情况
 */
function getPreviewUrl(preview: string): string {
  if (preview.startsWith("http://") || preview.startsWith("https://")) {
    return preview;
  }
  return convertFileSrc(preview);
}

/**
 * Compact 模式底部缩略图轮播组件
 * 包含：缩略图轮播、选中状态同步
 */
export function CompactCarousel({
  wallpapers,
  selectedId,
  onSelect,
}: CompactCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();

  // 同步轮播状态与选中壁纸
  useEffect(() => {
    if (!api) return;

    const onSelect_ = () => {
      const snapIndex = api.selectedScrollSnap();
      const targetWp = wallpapers[snapIndex];

      if (targetWp && targetWp.id !== selectedId) {
        onSelect(targetWp.id);
      }
    };

    api.on("select", onSelect_);

    // 当外部 selectedId 变化时，同步轮播位置
    const index = wallpapers.findIndex((w) => w.id === selectedId);
    if (index !== -1 && api.selectedScrollSnap() !== index) {
      setTimeout(() => api.scrollTo(index), 20);
    }

    return () => {
      api.off("select", onSelect_);
    };
  }, [api, selectedId, wallpapers, onSelect]);

  return (
    <div className="p-2 border-t bg-muted/10 relative group">
      <Carousel
        setApi={setApi}
        opts={{ align: "center", loop: true }}
        className="w-full max-w-full"
      >
        <CarouselContent className="-ml-1">
          {wallpapers.map((wp, index) => (
            <CarouselItem key={wp.id} className="pl-1 basis-1/5 select-none">
              <div
                className={`
                  aspect-square rounded-md overflow-hidden cursor-pointer transition-all border-2
                  ${selectedId === wp.id ? "border-primary shadow-md scale-95" : "border-transparent opacity-60 hover:opacity-100"}
                `}
                onClick={() => api?.scrollTo(index)}
              >
                {wp.preview ? (
                  <img
                    src={getPreviewUrl(wp.preview)}
                    alt={wp.title}
                    className="w-full h-full object-cover"
                    draggable={false}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23374151" width="100" height="100"/><text x="50" y="55" text-anchor="middle" fill="%239ca3af" font-size="12">No Preview</text></svg>';
                    }}
                  />
                ) : (
                  <div className="bg-muted w-full h-full" />
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-1 h-6 w-6 opacity-0 group-hover:opacity-70 transition-opacity hover:!opacity-100" />
        <CarouselNext className="right-1 h-6 w-6 opacity-0 group-hover:opacity-70 transition-opacity hover:!opacity-100" />
      </Carousel>
    </div>
  );
}
