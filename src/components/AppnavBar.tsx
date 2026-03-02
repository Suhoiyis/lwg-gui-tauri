import { 
  Search, Settings as SettingsIcon, Activity, Square, 
  Shuffle, Camera, ImageIcon 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppStore } from "@/store/appStore";
import { applyWallpaper, stopWallpaper } from "@/api/wallpaper";
import { toast } from "sonner";

export function AppNavbar() {
  const searchQuery = useAppStore((state) => state.searchQuery);
  const setSearchQuery = useAppStore((state) => state.setSearchQuery);
  // 修正：保持与原版一致的状态获取方式，确保响应式更新
  const getFilteredWallpapers = useAppStore((state) => state.getFilteredWallpapers);
  const setSelectedId = useAppStore((state) => state.setSelectedId);
  
  const filteredWallpapers = getFilteredWallpapers();

  // --- Stop Wallpaper Handler ---
  const handleStop = async () => {
    try {
      await stopWallpaper();
      toast.success("壁纸已停止");
    } catch (error) {
      console.error(error);
      toast.error("停止失败");
    }
  };

  // --- Shuffle Wallpaper Handler ---
  const handleShuffle = async () => {
    if (filteredWallpapers.length === 0) {
      toast.error("没有可用的壁纸");
      return;
    }
    const randomIndex = Math.floor(Math.random() * filteredWallpapers.length);
    const randomWallpaper = filteredWallpapers[randomIndex];
    try {
      await applyWallpaper(randomWallpaper.id);
      setSelectedId(randomWallpaper.id);
      toast.success(`随机应用: ${randomWallpaper.title}`);
    } catch (error) {
      console.error(error);
      toast.error("随机应用失败");
    }
  };

  return (
    <div className="flex w-full items-center gap-4 py-2">
      <TabsList className="bg-muted/40 border border-border h-auto p-1">
        <TabsTrigger value="wallpapers" className="gap-2 h-8 data-[state=active]:bg-secondary">
          <ImageIcon className="w-4 h-4" /> Library
        </TabsTrigger>
        <TabsTrigger value="settings" className="gap-2 h-8 data-[state=active]:bg-secondary">
          <SettingsIcon className="w-4 h-4" /> Settings
        </TabsTrigger>
        <TabsTrigger value="performance" className="gap-2 h-8 data-[state=active]:bg-secondary">
          <Activity className="w-4 h-4" /> Monitor
        </TabsTrigger>
      </TabsList>

      <Separator orientation="vertical" className="h-6 mx-2" />
      
      <InputGroup className="relative flex-1 max-w-md">
        <InputGroupAddon align="inline-start">
          <Search className="w-4 h-4" />
        </InputGroupAddon>
        <InputGroupInput 
          placeholder="Search..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <InputGroupAddon align="inline-end">
            <span className="text-xs">{filteredWallpapers.length} Results</span>
          </InputGroupAddon>
        )}
      </InputGroup>

      <div className="flex-1" />
      
      {/* 右侧快速操作区 */}
      <TooltipProvider>
        <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={handleStop}>
                <Square className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Stop Wallpaper</p></TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleShuffle}>
                <Shuffle className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Random Wallpaper</p></TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Camera className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Screenshot</p></TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
}