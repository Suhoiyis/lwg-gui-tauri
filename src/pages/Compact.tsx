import { useState, useMemo, useEffect } from "react";
import {
  ArrowLeft,
  Maximize2,
  RotateCw,
  Power,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Monitor,
} from "lucide-react";
import { AppMenu } from "@/components/AppMenu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useAppStore } from "@/store/appStore";
import { WallpaperCard } from "@/components/library/WallpaperCard";
export function CompactMode() {
  const { wallpapers, selectedId, setSelectedId, toggleCompactMode } =
    useAppStore();

  const [isCopied, setIsCopied] = useState(false);
  const [api, setApi] = useState<CarouselApi>();

  // 1. 获取当前壁纸数据
  const currentWallpaper = useMemo(
    () => wallpapers.find((w) => w.id === selectedId) || wallpapers[0],
    [wallpapers, selectedId],
  );

  const currentIndex = useMemo(
    () => wallpapers.findIndex((w) => w.id === selectedId) + 1,
    [wallpapers, selectedId],
  );

  // --- 核心修复：双向同步逻辑 ---
  useEffect(() => {
    if (!api) return;

    // A. 监听 Carousel 滚动结束事件 (select)
    const onSelect = () => {
      const snapIndex = api.selectedScrollSnap();
      const targetWp = wallpapers[snapIndex];

      if (targetWp && targetWp.id !== selectedId) {
        setSelectedId(targetWp.id);
      }
    };

    api.on("select", onSelect);

    // B. 当外部 selectedId 变化时，同步 Carousel
    const index = wallpapers.findIndex((w) => w.id === selectedId);
    if (index !== -1 && api.selectedScrollSnap() !== index) {
      setTimeout(() => api.scrollTo(index), 20);
    }

    return () => {
      api.off("select", onSelect);
    };
  }, [api, selectedId, wallpapers, setSelectedId]);

  // 2. 导航逻辑
  const handleNavigate = (direction: -1 | 1) => {
    const currentIdx = wallpapers.findIndex((w) => w.id === selectedId);
    if (currentIdx === -1) return;
    let newIdx = currentIdx + direction;
    if (newIdx < 0) newIdx = wallpapers.length - 1;
    if (newIdx >= wallpapers.length) newIdx = 0;
    setSelectedId(wallpapers[newIdx].id);
  };

  const handleLucky = () => {
    const randomIdx = Math.floor(Math.random() * wallpapers.length);
    setSelectedId(wallpapers[randomIdx].id);
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground select-none">
      {/* Navbar */}
      <div className="flex items-center justify-between p-2 border-b bg-muted/20 drag-region">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 no-drag"
          onClick={() => toggleCompactMode(false)}
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
        <Select defaultValue="all">
          <SelectTrigger className="h-7 w-[110px] text-xs border-none bg-transparent shadow-none focus:ring-0 no-drag">
            <SelectValue placeholder="Screen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Screens</SelectItem>
            <SelectItem value="1">Display 1</SelectItem>
          </SelectContent>
        </Select>
        <div className="no-drag">
          <AppMenu />
        </div>
      </div>

      {/* Main Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4 flex flex-col items-center">
          {/* Preview Image */}
          <div className="w-[200px] h-[200px] bg-muted rounded-lg shadow-sm border overflow-hidden relative group">
            {currentWallpaper?.preview ? (
              <img
                src={convertFileSrc(currentWallpaper.preview)}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                No Preview
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                size="icon"
                variant="secondary"
                className="rounded-full shadow-lg"
                onClick={handleLucky}
              >
                <Shuffle className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Title & Info */}
          <div className="w-full text-center space-y-1">
            <h3 className="font-bold text-lg leading-tight line-clamp-2 px-4">
              {currentWallpaper?.title}
            </h3>
            <div
              className="inline-flex items-center gap-1 text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground cursor-pointer hover:bg-muted/80 transition-colors"
              onClick={() => {
                navigator.clipboard.writeText(currentWallpaper?.id || "");
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 1500);
              }}
            >
              <span>{currentWallpaper?.id}</span>
              {isCopied ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 w-full px-4 justify-center">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => handleNavigate(-1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1 bg-muted rounded-md px-2 h-8 font-mono">
              <Input
                className="h-6 w-10 p-0 text-center border-none bg-transparent focus-visible:ring-0 text-xs"
                value={currentIndex || "-"}
                readOnly
              />
              <span className="text-xs text-muted-foreground">
                / {wallpapers.length}
              </span>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => handleNavigate(1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Button
            className="w-full font-bold shadow-lg shadow-primary/20"
            size="lg"
          >
            Apply Wallpaper
          </Button>
          <Separator />

          <div className="w-full space-y-2">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Tags
            </div>
            <div className="flex flex-wrap gap-1.5">
              {currentWallpaper?.tags?.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-[10px] px-1.5 h-5 font-normal"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div className="w-full flex justify-between text-xs px-1">
            <span className="text-muted-foreground">Type</span>
            <span className="font-mono">{currentWallpaper?.type}</span>
          </div>
        </div>
      </ScrollArea>

      {/* 3. Bottom Carousel (Fixed) */}
      <div className="p-2 border-t bg-muted/10 relative">
        <Carousel
          setApi={setApi}
          opts={{ align: "center", loop: true }}
          className="w-full max-w-full"
        >
          <CarouselContent className="-ml-1">
            {/* ✨ 修复点 1：这里增加了 index 参数 */}
            {wallpapers.map((wp, index) => (
              <CarouselItem key={wp.id} className="pl-1 basis-1/5 select-none">
                <div
                  className={`aspect-square rounded-md overflow-hidden cursor-pointer transition-all border-2 ${selectedId === wp.id ? "border-primary shadow-md scale-95" : "border-transparent opacity-60 hover:opacity-100"}`}
                  // ✨ 修复点 2：把点击事件加回来了
                  // 点击时命令 Carousel 滚到这一张，随后会自动触发 onSelect 更新壁纸
                  onClick={() => api?.scrollTo(index)}
                >
                  {wp.preview ? (
                    <img
                      src={convertFileSrc(wp.preview)}
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                  ) : (
                    <div className="bg-muted w-full h-full" />
                  )}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious className="left-1 h-6 w-6 opacity-70 hover:opacity-100" />
          <CarouselNext className="right-1 h-6 w-6 opacity-70 hover:opacity-100" />
        </Carousel>
      </div>
    </div>
  );
}

const convertFileSrc = (path: string) => path;
