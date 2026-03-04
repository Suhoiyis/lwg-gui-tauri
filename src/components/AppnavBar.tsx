import {
  Search,
  Settings as SettingsIcon,
  Activity,
  Square,
  Shuffle,
  Camera,
  ImageIcon,
  Minimize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
// ✨ 1. 引入 StatefulButton，重命名以避免冲突
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
import {
  applyWallpaper,
  stopWallpaper,
  takeScreenshot,
  getScreenshotHistory,
} from "@/api/wallpaper";
import { toast } from "sonner";
import { AppMenu } from "@/components/AppMenu";

// 引入 Tauri API
import { getCurrentWindow, LogicalSize } from "@tauri-apps/api/window";

export function AppNavbar() {
  const searchQuery = useAppStore((state) => state.searchQuery);
  const setSearchQuery = useAppStore((state) => state.setSearchQuery);
  const toggleCompactMode = useAppStore((state) => state.toggleCompactMode);

  const getFilteredWallpapers = useAppStore(
    (state) => state.getFilteredWallpapers,
  );
  const setSelectedId = useAppStore((state) => state.setSelectedId);
  const filteredWallpapers = getFilteredWallpapers();

  // --- 核心修复：安全的切换函数 ---
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

  // --- Actions ---
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

  // ✨ 2. 真实截图处理函数
  const handleScreenshot = async (): Promise<void> => {
    const selectedId = useAppStore.getState().selectedId;

    if (!selectedId) {
      toast.error("Screenshot failed", {
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
        description: String(error),
      });
      throw error; // 让 StatefulButton 知道失败
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

      <div className="no-drag flex-1 max-w-md">
        <InputGroup className="relative w-full">
          <InputGroupAddon align="inline-start">
            <Search className="w-4 h-4" />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search wallpapers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </InputGroup>
      </div>

      <div className="flex-1" />

      <TooltipProvider>
        <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border no-drag">
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

          {/* ✨ 3. 替换为 StatefulButton */}
          <Tooltip>
            <TooltipTrigger asChild>
              {/* 注意：StatefulButton 内部会自动处理 loading 状态的图标显示 */}
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
