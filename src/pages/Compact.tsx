import { useState, useMemo } from "react";
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
import { useAppStore } from "@/store/appStore";
import { WallpaperCard } from "@/components/library/WallpaperCard";
export function CompactMode() {
  const { wallpapers, selectedId, setSelectedId, toggleCompactMode } =
    useAppStore();

  const [jumpIndex, setJumpIndex] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  // 获取当前选中的壁纸对象
  const currentWallpaper = useMemo(
    () => wallpapers.find((w) => w.id === selectedId) || wallpapers[0],
    [wallpapers, selectedId],
  );

  // 获取当前壁纸的索引
  const currentIndex = useMemo(
    () => wallpapers.findIndex((w) => w.id === selectedId) + 1,
    [wallpapers, selectedId],
  );

  // 上一张/下一张逻辑
  const handleNavigate = (direction: -1 | 1) => {
    const currentIdx = wallpapers.findIndex((w) => w.id === selectedId);
    if (currentIdx === -1) return;

    let newIdx = currentIdx + direction;
    // 循环播放
    if (newIdx < 0) newIdx = wallpapers.length - 1;
    if (newIdx >= wallpapers.length) newIdx = 0;

    setSelectedId(wallpapers[newIdx].id);
  };

  // 随机壁纸
  const handleLucky = () => {
    const randomIdx = Math.floor(Math.random() * wallpapers.length);
    setSelectedId(wallpapers[randomIdx].id);
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground select-none">
      {/* 1. 顶部导航栏 (Navbar) */}
      <div className="flex items-center justify-between p-2 border-b bg-muted/20 drag-region">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => toggleCompactMode(false)}
        >
          <Maximize2 className="h-4 w-4" />
        </Button>

        {/* 屏幕选择器 (简化版) */}
        <Select defaultValue="all">
          <SelectTrigger className="h-7 w-[110px] text-xs">
            <SelectValue placeholder="Screen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Screens</SelectItem>
            <SelectItem value="1">Display 1</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="ghost" size="icon" className="h-8 w-8">
          <RotateCw className="h-4 w-4" />
        </Button>
      </div>

      {/* 2. 主内容滚动区 */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4 flex flex-col items-center">
          {/* 预览图区域 */}
          <div className="w-[200px] h-[200px] bg-muted rounded-lg shadow-sm border overflow-hidden relative group">
            {currentWallpaper?.preview ? (
              <img
                src={convertFileSrc(currentWallpaper.preview)}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                No Preview
              </div>
            )}

            {/* 悬浮控制层 */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                size="icon"
                variant="secondary"
                className="rounded-full h-10 w-10"
                onClick={handleLucky}
              >
                <Shuffle className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* 标题与信息 */}
          <div className="w-full text-center space-y-1">
            <h3 className="font-bold text-lg leading-tight line-clamp-2 px-4">
              {currentWallpaper?.title || "Select Wallpaper"}
            </h3>

            {/* ID Copy Chip */}
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

          {/* 跳转控制 */}
          <div className="flex items-center gap-2 w-full px-4 justify-center">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => handleNavigate(-1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1 bg-muted rounded-md px-2 h-8">
              <Input
                className="h-6 w-10 p-0 text-center border-none bg-transparent focus-visible:ring-0 text-xs"
                placeholder="#"
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

          {/* 操作大按钮 */}
          <Button
            className="w-full font-bold shadow-lg shadow-primary/20"
            size="lg"
          >
            Apply Wallpaper
          </Button>

          <Separator />

          {/* Tags */}
          <div className="w-full space-y-2">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Tags
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 h-5 font-normal"
              >
                Anime
              </Badge>
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 h-5 font-normal"
              >
                Cyberpunk
              </Badge>
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 h-5 font-normal"
              >
                4K
              </Badge>
            </div>
          </div>

          {/* Type Info */}
          <div className="w-full flex justify-between text-xs px-1">
            <span className="text-muted-foreground">Type</span>
            <span className="font-mono">Video (mp4)</span>
          </div>
        </div>
      </ScrollArea>

      {/* 3. 底部缩略图导航 (Thumb Grid) */}
      <div className="p-2 border-t bg-muted/10">
        <div className="flex justify-center gap-2">
          {/* 显示当前壁纸及其前后的缩略图 (这里简单模拟5个) */}
          {[-2, -1, 0, 1, 2].map((offset) => {
            const idx =
              (currentIndex - 1 + offset + wallpapers.length) %
              wallpapers.length;
            const wp = wallpapers[idx];
            const isActive = offset === 0;

            if (!wp) return null; // 防止数据未加载

            return (
              <div
                key={offset}
                onClick={() => setSelectedId(wp.id)}
                className={`
                     w-10 h-10 rounded-md overflow-hidden cursor-pointer transition-all border-2 
                     ${isActive ? "border-primary scale-110 shadow-md" : "border-transparent opacity-60 hover:opacity-100"}
                   `}
              >
                {wp.preview ? (
                  <img
                    src={convertFileSrc(wp.preview)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// 辅助函数：处理文件路径（Mock一下，防止报错）
const convertFileSrc = (path: string) => path;
