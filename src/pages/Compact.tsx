import { useState, useMemo, useEffect } from "react";
import {
  Maximize2,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
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

// ✨ 引入 Tauri Window API
import { getCurrentWindow, LogicalSize } from "@tauri-apps/api/window";

export function CompactMode() {
  const { wallpapers, selectedId, setSelectedId, toggleCompactMode } =
    useAppStore();

  const [isCopied, setIsCopied] = useState(false);
  const [api, setApi] = useState<CarouselApi>();

  // 1. 获取当前选中的壁纸对象
  const currentWallpaper = useMemo(
    () => wallpapers.find((w) => w.id === selectedId) || wallpapers[0],
    [wallpapers, selectedId],
  );

  const currentIndex = useMemo(
    () => wallpapers.findIndex((w) => w.id === selectedId) + 1,
    [wallpapers, selectedId],
  );

  // --- 🔄 核心：Carousel 双向同步逻辑 ---
  useEffect(() => {
    if (!api) return;

    // A. 监听 Carousel 滚动结束 (select) 事件，同步更新选中的 ID
    const onSelect = () => {
      const snapIndex = api.selectedScrollSnap();
      const targetWp = wallpapers[snapIndex];

      if (targetWp && targetWp.id !== selectedId) {
        setSelectedId(targetWp.id);
      }
    };

    api.on("select", onSelect);

    // B. 当外部（或大箭头）改变 ID 时，同步滚动 Carousel
    const index = wallpapers.findIndex((w) => w.id === selectedId);
    if (index !== -1 && api.selectedScrollSnap() !== index) {
      // 微小延迟确保布局稳定后再滚动
      setTimeout(() => api.scrollTo(index), 20);
    }

    return () => {
      api.off("select", onSelect);
    };
  }, [api, selectedId, wallpapers, setSelectedId]);

  // --- 窗口切换逻辑 ---
  const handleSwitchToNormal = async () => {
    // 检测是否在 Tauri 环境中
    const isTauri = !!(window as any).__TAURI_INTERNALS__;

    if (!isTauri) {
      console.warn("Detected non-Tauri environment. Skipping window resize.");
      toggleCompactMode(false);
      return;
    }

    try {
      const appWindow = getCurrentWindow();
      // 只有环境正确时才执行
      if (appWindow) {
        await appWindow.setSize(new LogicalSize(1200, 800));
      }
      toggleCompactMode(false);
    } catch (err) {
      console.error("Failed to resize window:", err);
      // 即使报错，也要确保模式切换成功
      toggleCompactMode(false);
    }
  };

  // --- 导航与随机逻辑 ---
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
      {/* 1. 顶部状态栏 (Navbar) */}
      <div className="flex items-center justify-between p-2 border-b bg-muted/20 drag-region">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 no-drag"
          onClick={handleSwitchToNormal} // ✨ 绑定调整窗口大小的函数
        >
          <Maximize2 className="h-4 w-4" />
        </Button>

        <div className="no-drag">
          <Select defaultValue="all">
            <SelectTrigger className="h-7 w-[110px] text-xs border-none bg-transparent shadow-none focus:ring-0">
              <SelectValue placeholder="Screen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Screens</SelectItem>
              <SelectItem value="1">Display 1</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="no-drag">
          <AppMenu />
        </div>
      </div>

      {/* 2. 主内容滚动区 */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4 flex flex-col items-center">
          {/* 预览图区域 */}
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
                className="rounded-full shadow-lg h-10 w-10"
                onClick={handleLucky}
              >
                <Shuffle className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* 标题与 ID 复制 */}
          <div className="w-full text-center space-y-1">
            <h3 className="font-bold text-lg leading-tight line-clamp-2 px-4">
              {currentWallpaper?.title || "Select Wallpaper"}
            </h3>
            <div
              className="inline-flex items-center gap-1 text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground cursor-pointer hover:bg-muted/80 transition-colors"
              onClick={() => {
                navigator.clipboard.writeText(currentWallpaper?.id || "");
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 1500);
              }}
            >
              <span>{currentWallpaper?.id || "---"}</span>
              {isCopied ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </div>
          </div>

          {/* 控制按钮（上一张/下一张/索引显示） */}
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
            className="w-full font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
            size="lg"
          >
            Apply Wallpaper
          </Button>

          <Separator />

          {/* Tags 标签 */}
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

          {/* 详情信息 */}
          <div className="w-full flex justify-between text-xs px-1">
            <span className="text-muted-foreground">Type</span>
            <span className="font-mono">{currentWallpaper?.type}</span>
          </div>
        </div>
      </ScrollArea>

      {/* 3. 底部 Carousel 轮播导航 */}
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
                  onClick={() => api?.scrollTo(index)} // ✨ 点击缩略图自动滚动并选中
                >
                  {wp.preview ? (
                    <img
                      src={convertFileSrc(wp.preview)}
                      alt={wp.title}
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

          {/* 内部箭头控制 */}
          <CarouselPrevious className="left-1 h-6 w-6 opacity-0 group-hover:opacity-70 transition-opacity hover:!opacity-100" />
          <CarouselNext className="right-1 h-6 w-6 opacity-0 group-hover:opacity-70 transition-opacity hover:!opacity-100" />
        </Carousel>
      </div>
    </div>
  );
}

// 辅助函数
const convertFileSrc = (path: string) => path;
