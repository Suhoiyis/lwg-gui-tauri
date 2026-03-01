import { useState, useEffect } from "react";
import { 
  Monitor, Search, Play, Image as ImageIcon, Video, 
  Settings as SettingsIcon, Activity, Square, 
  Shuffle, Camera
} from "lucide-react";

// 1. 动画与特效库
import { motion, AnimatePresence } from "framer-motion";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";

// 2. Shadcn UI 组件
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

// 3. 项目自定义组件
import { Layout } from "./components/Layout";
import { Settings } from "./pages/Settings";
import { Performance } from "./pages/Performance";

import { Wallpaper } from "./types";
import { useAppStore } from "./store/appStore";
import { applyWallpaper } from "./api/wallpaper";
import { toast } from "sonner";

// 页面切换动画配置
const pageVariants = {
  initial: { opacity: 0, y: 10, scale: 0.99 },
  in: { opacity: 1, y: 0, scale: 1 },
  out: { opacity: 0, y: -10, scale: 0.99 }
};

const pageTransition = {
  type: "tween",
  ease: "circOut",
  duration: 0.25
} as const;

export function App() {
  // Local UI state (not in store)
  const [isLoading, setIsLoading] = useState(false);
  
  // Zustand store state and actions
  const selectedId = useAppStore((state) => state.selectedId);
  const searchQuery = useAppStore((state) => state.searchQuery);
  const activeTab = useAppStore((state) => state.activeTab);
  
  const loadWallpapers = useAppStore((state) => state.loadWallpapers);
  const setSelectedId = useAppStore((state) => state.setSelectedId);
  const setSearchQuery = useAppStore((state) => state.setSearchQuery);
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const getFilteredWallpapers = useAppStore((state) => state.getFilteredWallpapers);
  const getSelectedWallpaper = useAppStore((state) => state.getSelectedWallpaper);

  useEffect(() => {
    setIsLoading(true);
    loadWallpapers().finally(() => setIsLoading(false));
  }, []);

  const selectedWallpaper = getSelectedWallpaper();
  const filteredWallpapers = getFilteredWallpapers();

  // --- Apply Wallpaper Handler ---
  const handleApply = async () => {
    if (!selectedWallpaper) return;
    
    try {
      console.log("Applying:", selectedWallpaper.title);
      await applyWallpaper(selectedWallpaper.id);
      toast.success(`已应用: ${selectedWallpaper.title}`);
    } catch (error) {
      console.error(error);
      toast.error("应用失败，请检查后台日志");
    }
  };

  // --- Navbar (包含切换按钮) ---
  const Navbar = (
    <div className="flex w-full items-center gap-4 py-2">
      <div className="flex items-center gap-2 mr-2 select-none">
        <Monitor className="text-primary w-6 h-6" />
        <span className="font-bold hidden md:block tracking-tight text-lg">Wallpaper Engine</span>
      </div>

      <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border">
        <Button 
          variant={activeTab === "wallpapers" ? "secondary" : "ghost"} 
          size="sm" 
          onClick={() => setActiveTab("wallpapers")}
          className="gap-2 h-8"
        >
          <ImageIcon className="w-4 h-4" /> Library
        </Button>
        <Button 
          variant={activeTab === "settings" ? "secondary" : "ghost"} 
          size="sm" 
          onClick={() => setActiveTab("settings")}
          className="gap-2 h-8"
        >
          <SettingsIcon className="w-4 h-4" /> Settings
        </Button>
        <Button 
          variant={activeTab === "performance" ? "secondary" : "ghost"} 
          size="sm" 
          onClick={() => setActiveTab("performance")}
          className="gap-2 h-8"
        >
          <Activity className="w-4 h-4" /> Monitor
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6 mx-2" />
      
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Search..." 
          className="pl-10 bg-muted/20 border-none h-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex-1" />
      
      {/* 右侧快速操作区 */}
      <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500"><Square className="w-4 h-4" /></Button>
        <Button variant="ghost" size="icon" className="h-8 w-8"><Shuffle className="w-4 h-4" /></Button>
        <Button variant="ghost" size="icon" className="h-8 w-8"><Camera className="w-4 h-4" /></Button>
      </div>
    </div>
  );

  // --- Sidebar ---
  const WallpaperSidebar = (
    <div className="h-full flex flex-col bg-card/30">
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6">
          <div className="aspect-[4/5] rounded-2xl overflow-hidden border border-border shadow-2xl">
            <img src={selectedWallpaper?.preview} className="w-full h-full object-cover" />
          </div>
          <div className="space-y-3">
            <h1 className="text-xl font-bold leading-tight">{selectedWallpaper?.title}</h1>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-pink-500/20 text-pink-500 border-pink-500/20">{selectedWallpaper?.id || "ID"}</Badge>
              <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/20">{selectedWallpaper?.size || "0 MB"}</Badge>
            </div>
          </div>
          <div className="space-y-2 border-t pt-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Description</h3>
            <p className="text-sm text-muted-foreground/80 leading-relaxed italic">
              A high-quality live wallpaper for your desktop.
            </p>
          </div>
        </div>
      </ScrollArea>
      <div className="p-6 border-t bg-background/50">
        <Button 
          onClick={handleApply}
          className="w-full h-12 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl shadow-lg shadow-pink-500/20 gap-2"
        >
          <Play className="w-5 h-5 fill-current" /> Apply Wallpaper
        </Button>
      </div>
    </div>
  );

  return (
    <Layout navbar={Navbar} sidebar={activeTab === "wallpapers" ? WallpaperSidebar : null}>
      <AnimatePresence mode="wait"> {/* 关键：处理切换动画 */}
        {activeTab === "wallpapers" && (
          <motion.div 
            key="wallpapers" 
            initial="initial" animate="in" exit="out" 
            variants={pageVariants} transition={pageTransition} 
            className="h-full flex flex-col p-6 space-y-6"
          >
            {/* 状态工具栏 */}
            <div className="flex items-center justify-between bg-muted/20 px-4 py-2 rounded-xl border border-border/50">
              <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground tracking-widest">
                <span className="text-pink-500 uppercase">Currently Using</span>
                <span className="text-foreground truncate max-w-[300px]">{selectedWallpaper?.title}</span>
              </div>
              <span className="text-xs font-mono text-muted-foreground/50">{filteredWallpapers.length} wallpapers</span>
            </div>

            <ScrollArea className="flex-1">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-6 pb-10">
                {filteredWallpapers.map((wp) => (
                   <WallpaperCard 
                     key={wp.id} 
                     wp={wp} 
                     isSelected={selectedId === wp.id} 
                     onSelect={() => setSelectedId(wp.id)} 
                   />
                ))}
              </div>
            </ScrollArea>
          </motion.div>
        )}

        {activeTab === "settings" && (
          <motion.div 
            key="settings" 
            initial="initial" animate="in" exit="out" 
            variants={pageVariants} transition={pageTransition} 
            className="h-full"
          >
            <Settings />
          </motion.div>
        )}

        {activeTab === "performance" && (
          <motion.div 
            key="performance" 
            initial="initial" animate="in" exit="out" 
            variants={pageVariants} transition={pageTransition} 
            className="h-full"
          >
            <Performance />
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}

function WallpaperCard({ wp, isSelected, onSelect }: { wp: Wallpaper; isSelected: boolean; onSelect: () => void }) {
  return (
    <div onClick={onSelect} className="cursor-pointer">
      <CardContainer className="inter-var w-full">
        <CardBody className={`
          relative group/card bg-card border-border/50 w-full rounded-2xl p-2 border transition-all
          ${isSelected ? 'ring-2 ring-pink-500 ring-offset-4 ring-offset-background bg-muted/50' : 'hover:border-pink-500/50'}
        `}>
          <CardItem translateZ="50" className="w-full aspect-square rounded-xl overflow-hidden relative">
            <img src={wp.preview} className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-110" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-3 pt-8">
              <p className="text-[11px] font-bold text-white truncate">{wp.title}</p>
            </div>
            <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-md p-1.5 rounded-lg border border-white/10">
              {wp.type === 'Video' ? <Video className="w-3 h-3 text-pink-400" /> : <ImageIcon className="w-3 h-3 text-emerald-400" />}
            </div>
          </CardItem>
        </CardBody>
      </CardContainer>
    </div>
  );
}