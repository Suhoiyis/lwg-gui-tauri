import {
  Search,
  Settings as SettingsIcon,
  Activity,
  Square,
  Shuffle,
  Camera,
  ImageIcon,
  Minimize2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Button as StatefulButton } from "@/components/ui/stateful-button";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppStore } from "@/store/appStore";
import { applyWallpaper, stopWallpaper, takeScreenshot } from "@/api/wallpaper";
import { toast } from "sonner";
import { AppMenu } from "@/components/AppMenu";
import { ScreenSelector } from "@/components/ScreenSelector";

import { getCurrentWindow, LogicalSize } from "@tauri-apps/api/window";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";

export function AppNavbar() {
  const searchQuery = useAppStore((state) => state.searchQuery);
  const setSearchQuery = useAppStore((state) => state.setSearchQuery);
  const toggleCompactMode = useAppStore((state) => state.toggleCompactMode);

  const getFilteredWallpapers = useAppStore(
    (state) => state.getFilteredWallpapers,
  );
  const setSelectedId = useAppStore((state) => state.setSelectedId);
  const filteredWallpapers = getFilteredWallpapers();

  // 搜索框的焦点状态与引用
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 判断搜索框是否应该处于“展开”状态
  // 只要获得焦点，或者里面有字，就保持展开
  const isSearchActive = isSearchFocused || searchQuery.trim().length > 0;

  const handleSwitchToCompact = async () => {
    const isTauri = !!(window as any).__TAURI_INTERNALS__;

    if (!isTauri) {
      console.warn("[Browser Mode] Skipping window resize, toggling UI only.");
      toggleCompactMode(true);
      return;
    }

    try {
      const appWindow = getCurrentWindow();
      if (appWindow) {
        await appWindow.setSize(new LogicalSize(360, 600));
      }
      toggleCompactMode(true);
    } catch (err) {
      console.error("Resize failed:", err);
      toggleCompactMode(true);
    }
  };

  const handleStop = async () => {
    try {
      await stopWallpaper();
      toast.success("Wallpaper stopped");
    } catch (error) {
      console.error(error);
      toast.error("Failed to stop");
    }
  };

  const handleShuffle = async () => {
    if (filteredWallpapers.length === 0) {
      toast.error("No wallpapers available");
      return;
    }
    const randomIndex = Math.floor(Math.random() * filteredWallpapers.length);
    const randomWallpaper = filteredWallpapers[randomIndex];
    try {
      await applyWallpaper(randomWallpaper.id);
      setSelectedId(randomWallpaper.id);
      toast.success(`Applied: ${randomWallpaper.title}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to apply");
    }
  };

  const handleScreenshot = async (): Promise<void> => {
    const selectedId = useAppStore.getState().selectedId;

    if (!selectedId) {
      toast.error("Screenshot failed", {
        icon: <AlertCircle className="w-5 h-5 text-red-500" />,
        description: "Please select a wallpaper first",
      });
      throw new Error("No wallpaper selected");
    }

    try {
      const result = await takeScreenshot(selectedId);
      toast.success("Screenshot saved", {
        description: `Saved to ${result.outputPath}\nDuration: ${result.duration.toFixed(1)}s | Max CPU: ${result.maxCpu.toFixed(1)}% | Max Mem: ${result.maxMem.toFixed(1)}MB`,
      });
    } catch (error) {
      toast.error("Screenshot failed", {
        icon: <AlertCircle className="w-5 h-5 text-red-500" />,
        description: String(error),
      });
      throw error;
    }
  };

  return (
    <div className="flex w-full items-center gap-4 py-2 px-4 drag-region select-none">
      <div className="no-drag flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary hover:bg-primary/10"
                onClick={handleSwitchToCompact}
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Compact Mode</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TabsList className="bg-muted/40 border border-border h-auto p-1">
          <TabsTrigger
            value="wallpapers"
            className="gap-2 h-8 data-[state=active]:bg-secondary"
          >
            <ImageIcon className="w-4 h-4" /> Library
          </TabsTrigger>
          <TabsTrigger
            value="performance"
            className="gap-2 h-8 data-[state=active]:bg-secondary"
          >
            <Activity className="w-4 h-4" /> Monitor
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="gap-2 h-8 data-[state=active]:bg-secondary"
          >
            <SettingsIcon className="w-4 h-4" /> Settings
          </TabsTrigger>
        </TabsList>
      </div>

      <Separator orientation="vertical" className="h-6 mx-2" />

      <div
        className={cn(
          "no-drag relative flex items-center rounded-md border transition-all duration-300 ease-out overflow-hidden cursor-text",
          isSearchActive
            ? "flex-1 max-w-xl border-input bg-background px-3 h-9 shadow-sm" // 展开时的样式：占据空间、有边框背景
            : "w-8 h-8 border-transparent bg-transparent px-0 hover:bg-muted/60 justify-center cursor-pointer shadow-none", // 收起时的样式：像个透明按钮
        )}
        onClick={() => {
          // 点击容器的任何位置，都触发焦点
          setIsSearchFocused(true);
          setTimeout(() => searchInputRef.current?.focus(), 50);
        }}
      >
        <Search
          className={cn(
            "shrink-0 transition-colors duration-300",
            isSearchActive
              ? "w-4 h-4 text-muted-foreground"
              : "w-4 h-4 text-foreground",
          )}
        />

        {/* 原生 Input，配合外层 div 模拟 Shadcn Input */}
        <input
          ref={searchInputRef}
          className={cn(
            "bg-transparent text-sm outline-none placeholder:text-muted-foreground transition-all duration-300",
            // 宽度从 0 到 w-full 的过渡，同时带透明度渐变
            isSearchActive
              ? "w-full ml-2 opacity-100"
              : "w-0 ml-0 opacity-0 pointer-events-none",
          )}
          placeholder="Search wallpapers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setSearchQuery(""); // 按 ESC 清空内容
              searchInputRef.current?.blur(); // 失去焦点，触发折叠动画
            }
          }}
        />

        {/* 动态显示的 Results 数量标签 */}
        <div
          className={cn(
            "transition-all duration-300 ease-out overflow-hidden whitespace-nowrap shrink-0",
            isSearchActive && searchQuery.trim().length > 0
              ? "max-w-[100px] opacity-100 ml-2"
              : "max-w-0 opacity-0 ml-0",
          )}
        >
          <span className="text-xs text-muted-foreground font-mono">
            {filteredWallpapers.length} results
          </span>
        </div>
      </div>

      {/* 这是一个弹簧占位符，会把右侧的图标推到最右边 */}
      <div className="flex-1" />

      <TooltipProvider>
        <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border no-drag">
          <ScreenSelector variant="default" />

          <Separator orientation="vertical" className="h-4 mx-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-500 hover:bg-red-500/10"
                onClick={handleStop}
              >
                <Square className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Stop</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleShuffle}
              >
                <Shuffle className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Shuffle</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <StatefulButton
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleScreenshot}
              >
                <Camera className="w-4 h-4" />
              </StatefulButton>
            </TooltipTrigger>
            <TooltipContent>
              <p>Screenshot</p>
            </TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-4 mx-1" />
          <AppMenu />
        </div>
      </TooltipProvider>
    </div>
  );
}
