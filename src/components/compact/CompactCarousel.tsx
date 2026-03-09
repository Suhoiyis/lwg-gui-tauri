import { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Thumbnail } from "@/components/ui/thumbnail";
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
                  <CarouselContent className="-ml-1">
                    {wallpapers.map((wp, index) => (
                      <CarouselItem
                        key={wp.id}
                        className="pl-1 basis-1/5 select-none"
                      >
                        <div
                          className={`
                  aspect-square rounded-md overflow-hidden cursor-pointer transition-all border-2
                  ${selectedId === wp.id ? "border-primary shadow-md scale-95" : "border-transparent opacity-60 hover:opacity-100"}
                `}
                          onClick={() => api?.scrollTo(index)}
                        >
                          {/* ✨ 替换开始：使用通用 Thumbnail 组件，把宽度高度 100% 交给它 */}
                          <Thumbnail
                            wallpaperId={wp.id}
                            className="w-full h-full"
                          />
                          {/* ✨ 替换结束 */}
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
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
