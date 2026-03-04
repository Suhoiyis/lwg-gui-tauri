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
import { WallpaperCard } from "@/components/WallpaperCard";
import { useAppStore } from "@/store/appStore";
import { cn } from "@/lib/utils"; // 引入 cn

import { getCurrentWindow, LogicalSize } from "@tauri-apps/api/window";

// ✨ 辅助函数：根据标签内容生成固定的颜色类名
const getColorForTag = (tag: string) => {
  const colors = [
    "bg-blue-100 text-blue-700 hover:bg-blue-100/80 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
    "bg-green-100 text-green-700 hover:bg-green-100/80 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
    "bg-purple-100 text-purple-700 hover:bg-purple-100/80 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
    "bg-pink-100 text-pink-700 hover:bg-pink-100/80 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800",
    "bg-yellow-100 text-yellow-700 hover:bg-yellow-100/80 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800",
    "bg-indigo-100 text-indigo-700 hover:bg-indigo-100/80 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800",
    "bg-red-100 text-red-700 hover:bg-red-100/80 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
    "bg-orange-100 text-orange-700 hover:bg-orange-100/80 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
    "bg-teal-100 text-teal-700 hover:bg-teal-100/80 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800",
  ];

  // 简单的哈希算法：计算字符串 ASCII 码之和
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash += tag.charCodeAt(i);
  }

  return colors[hash % colors.length];
};

export function CompactMode() {
  const { wallpapers, selectedId, setSelectedId, toggleCompactMode } =
    useAppStore();

  const [isCopied, setIsCopied] = useState(false);
  const [api, setApi] = useState<CarouselApi>();

  const [inputValue, setInputValue] = useState("");

  const currentWallpaper = useMemo(
    () => wallpapers.find((w) => w.id === selectedId) || wallpapers[0],
    [wallpapers, selectedId],
  );

  const currentIndex = useMemo(
    () => wallpapers.findIndex((w) => w.id === selectedId) + 1,
    [wallpapers, selectedId],
  );

  useEffect(() => {
    setInputValue(currentIndex.toString());
  }, [currentIndex]);

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      const snapIndex = api.selectedScrollSnap();
      const targetWp = wallpapers[snapIndex];

      if (targetWp && targetWp.id !== selectedId) {
        setSelectedId(targetWp.id);
      }
    };

    api.on("select", onSelect);

    const index = wallpapers.findIndex((w) => w.id === selectedId);
    if (index !== -1 && api.selectedScrollSnap() !== index) {
      setTimeout(() => api.scrollTo(index), 20);
    }

    return () => {
      api.off("select", onSelect);
    };
  }, [api, selectedId, wallpapers, setSelectedId]);

  const handleSwitchToNormal = async () => {
    const isTauri = !!(window as any).__TAURI_INTERNALS__;
    if (!isTauri) {
      console.warn("Detected non-Tauri environment. Skipping window resize.");
      toggleCompactMode(false);
      return;
    }

    try {
      const appWindow = getCurrentWindow();
      if (appWindow) {
        await appWindow.setSize(new LogicalSize(1200, 800));
      }
      toggleCompactMode(false);
    } catch (err) {
      console.error("Failed to resize window:", err);
      toggleCompactMode(false);
    }
  };

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

  const handleJumpToPage = () => {
    const targetPage = parseInt(inputValue);
    // 验证输入是否合法：必须是数字，且在 1 到 总数 之间
    if (
      !isNaN(targetPage) &&
      targetPage >= 1 &&
      targetPage <= wallpapers.length
    ) {
      const targetIndex = targetPage - 1;
      setSelectedId(wallpapers[targetIndex].id);
    } else {
      // 如果输入非法（比如乱填或者超出范围），重置回当前页码
      setInputValue(currentIndex.toString());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleJumpToPage();
      e.currentTarget.blur(); // 按回车后让输入框失去焦点
    }
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground select-none">
      {/* Navbar */}
      <div className="flex items-center justify-between p-2 border-b bg-muted/20 drag-region">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 no-drag"
          onClick={handleSwitchToNormal}
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

      {/* Main Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4 flex flex-col items-center">
          {/* Preview Image */}
          <WallpaperCard
            wp={currentWallpaper || wallpapers[0]}
            isSelected={false}
            onSelect={() => {}}
            showTitle={false} // ❌ 隐藏标题（下方已有）
            showIcons={true} // ✅ 显示图标（方便点收藏）
            className="w-[200px] h-[200px] shadow-sm" // 自定义尺寸
          >
            {/* ✨ 利用 children 插入 Shuffle 按钮 */}
            {/* 注意：因为父级有 pointer-events-none，这里按钮需要加 pointer-events-auto */}
            {/* <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-auto">
              <Button
                size="icon"
                variant="secondary"
                className="rounded-full shadow-lg h-10 w-10"
                onClick={(e) => {
                  e.stopPropagation(); // 防止冒泡
                  handleLucky();
                }}
              >
                <Shuffle className="h-4 w-4" />
              </Button>
            </div> */}
          </WallpaperCard>

          {/* Title & ID */}
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

          {/* Navigation */}
          <div className="flex items-center gap-2 w-full px-4 justify-center">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => handleNavigate(-1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* ✨ 4. 可编辑的页码输入框 */}
            <div className="flex items-center gap-1 bg-muted rounded-md px-2 h-8 font-mono">
              <Input
                // 去掉了 spinner 样式，使其看起来更像纯文本
                className="h-6 w-10 p-0 text-center border-none bg-transparent focus-visible:ring-0 text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onBlur={handleJumpToPage} // 失去焦点时（点别处）也尝试跳转
                onKeyDown={handleKeyDown} // 回车跳转
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

          {/* Tags & Type Grid */}
          <div className="w-full grid grid-cols-2 gap-4">
            {/* Left: Tags with Colors */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Tags
              </div>
              <div className="flex flex-wrap gap-1.5 content-start">
                {currentWallpaper?.tags?.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline" // 使用 outline 配合自定义颜色
                    // ✨ 动态计算颜色
                    className={cn(
                      "text-[10px] px-1.5 h-5 font-normal border shadow-sm",
                      getColorForTag(tag),
                    )}
                  >
                    {tag}
                  </Badge>
                ))}
                {!currentWallpaper?.tags?.length && (
                  <span className="text-[10px] text-muted-foreground italic">
                    No tags
                  </span>
                )}
              </div>
            </div>

            {/* Right: Type */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Type
              </div>
              <div className="flex flex-wrap content-start">
                {/* 这里修改了 className */}
                <Badge
                  variant="secondary"
                  className="text-[10px] h-5 px-1.5 font-mono font-normal bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                >
                  {currentWallpaper?.type || "Unknown"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Carousel */}
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
          <CarouselPrevious className="left-1 h-6 w-6 opacity-0 group-hover:opacity-70 transition-opacity hover:!opacity-100" />
          <CarouselNext className="right-1 h-6 w-6 opacity-0 group-hover:opacity-70 transition-opacity hover:!opacity-100" />
        </Carousel>
      </div>
    </div>
  );
}

const convertFileSrc = (path: string) => path;
