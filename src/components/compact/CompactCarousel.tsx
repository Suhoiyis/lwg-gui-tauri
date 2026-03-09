import { useEffect, useRef, useCallback } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Wallpaper } from "@/types";
import { Thumbnail } from "@/components/ui/thumbnail";

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
 * 包含：缩略图轮播、选中状态同步、鼠标拖拽滚动
 */
export function CompactCarousel({
  wallpapers,
  selectedId,
  onSelect,
}: CompactCarouselProps) {
  const apiRef = useRef<CarouselApi | undefined>(undefined);

  // 使用 ref 保持回调最新，避免 useEffect 因 onSelect 变化重新注册
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  const selectedIdRef = useRef(selectedId);
  selectedIdRef.current = selectedId;

  const wallpapersRef = useRef(wallpapers);
  wallpapersRef.current = wallpapers;

  const handleSetApi = useCallback((api: CarouselApi) => {
    apiRef.current = api;
  }, []);

  // 监听 Embla 的 "select" 事件，同步选中状态
  useEffect(() => {
    const api = apiRef.current;
    if (!api) return;

    const handleSelect = () => {
      const snapIndex = api.selectedScrollSnap();
      const targetWp = wallpapersRef.current[snapIndex];
      if (targetWp && targetWp.id !== selectedIdRef.current) {
        onSelectRef.current(targetWp.id);
      }
    };

    api.on("select", handleSelect);
    return () => {
      api.off("select", handleSelect);
    };
  }, [apiRef.current]); // re-register when api becomes available

  // 当外部 selectedId 变化时，同步轮播位置
  useEffect(() => {
    const api = apiRef.current;
    if (!api) return;

    const index = wallpapers.findIndex((w) => w.id === selectedId);
    if (index !== -1 && api.selectedScrollSnap() !== index) {
      api.scrollTo(index);
    }
  }, [selectedId, wallpapers]);

  // 点击缩略图：直接选中 + 滚动
  const handleItemClick = useCallback(
    (wp: Wallpaper, index: number) => {
      // 直接触发选中，不依赖 Embla 的 "select" 事件
      onSelect(wp.id);
      // 同时滚动到该位置
      apiRef.current?.scrollTo(index);
    },
    [onSelect],
  );

  return (
    <div className="p-2 border-t bg-muted/10 relative group">
      <Carousel
        setApi={handleSetApi}
        opts={{
          align: "center",
          loop: true,
          dragFree: true, // 允许自由拖拽（惯性滚动）
        }}
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
                onClick={() => handleItemClick(wp, index)}
              >
                <Thumbnail 
                  wallpaperId={wp.id} 
                  className="w-full h-full rounded-none border-none"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-1 h-6 w-6 opacity-0 group-hover:opacity-70 transition-opacity hover:!opacity-100 disabled:hidden" />
        <CarouselNext className="right-1 h-6 w-6 opacity-0 group-hover:opacity-70 transition-opacity hover:!opacity-100 disabled:hidden" />
      </Carousel>
    </div>
  );
}
