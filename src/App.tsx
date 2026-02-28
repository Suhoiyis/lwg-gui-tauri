import { useState, useEffect, useMemo } from "react";
import { scanWallpapers } from "./api/wallpaper";
import { Wallpaper } from "./types"; // 👈 从 types 文件导入类型
import { MOCK_WALLPAPERS } from "./mock/wallpapers"; // 👈 从 mock 文件只导入数据
import { 
  Image as ImageIcon, Video, Globe, Search, Play, 
  Monitor, Settings as SettingsIcon, Activity, 
  RefreshCw, Check
} from "lucide-react";

// 1. 动画与特效库
import { motion, AnimatePresence } from "framer-motion";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card"; // Aceternity 3D Card

// 2. Shadcn UI 组件
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton"; // 加载时用

import { Layout } from "./components/Layout";
import { Settings } from "./pages/Settings";
import { Performance } from "./pages/Performance";
import { WallpaperContextMenu } from "./components/WallpaperContextMenu";

type ActiveTab = "wallpapers" | "settings" | "performance";

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

function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("wallpapers");
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentMonitor] = useState("eDP-1");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setIsLoading(true);
    const data = await scanWallpapers();
    setWallpapers(data);
    if (data.length > 0 && !selectedId) setSelectedId(data[0].id);
    setIsLoading(false);
  };

  const filteredWallpapers = useMemo(() => {
    if (!searchQuery) return wallpapers;
    const lowerQ = searchQuery.toLowerCase();
    return wallpapers.filter(w => w.title.toLowerCase().includes(lowerQ) || w.id.includes(lowerQ));
  }, [wallpapers, searchQuery]);

  const selectedWallpaper = wallpapers.find(w => w.id === selectedId);

  // --- 顶部导航栏 (Navbar) ---
  const Navbar = (
    <div className="flex w-full items-center gap-4 py-1">
      <div className="flex items-center gap-2 mr-2 select-none">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/25">
          <Monitor className="text-primary-foreground w-5 h-5" />
        </div>
        <span className="font-bold hidden md:block tracking-tight text-lg">Wallpaper Engine</span>
      </div>
      
      {/* 显示器指示器 */}
      <div className="hidden md:flex items-center px-3 py-1.5 bg-muted/50 rounded-md border border-border text-xs font-medium text-muted-foreground gap-2">
        <Monitor className="w-3.5 h-3.5" />
        {currentMonitor}
        <span className="flex h-2 w-2 rounded-full bg-green-500 shadow-[0_0_4px_#22c55e]" />
      </div>

      <Separator orientation="vertical" className="h-6 mx-2" />

      {/* 导航按钮组 */}
      <div className="flex items-center gap-1">
        <Button 
          variant={activeTab === "wallpapers" ? "secondary" : "ghost"} 
          size="sm" 
          onClick={() => setActiveTab("wallpapers")}
          className="gap-2 h-9"
        >
          <ImageIcon className="w-4 h-4" />
          Library
        </Button>
        <Button 
          variant={activeTab === "settings" ? "secondary" : "ghost"} 
          size="sm" 
          onClick={() => setActiveTab("settings")}
          className="gap-2 h-9"
        >
          <SettingsIcon className="w-4 h-4" />
          Settings
        </Button>
        <Button 
          variant={activeTab === "performance" ? "secondary" : "ghost"} 
          size="sm" 
          onClick={() => setActiveTab("performance")}
          className="gap-2 h-9"
        >
          <Activity className="w-4 h-4" />
          Monitor
        </Button>
      </div>

      <div className="flex-1" />
      
      {/* 搜索框 (仅在 Library 页显示) */}
      <AnimatePresence>
        {activeTab === "wallpapers" && (
          <motion.div 
            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
            className="flex items-center gap-2"
          >
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search wallpapers..." 
                className="pl-9 h-9 bg-muted/50 border-muted focus-visible:bg-background transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="ghost" size="icon" onClick={loadData} className="h-9 w-9">
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // --- 右侧详情栏 (Sidebar) ---
  const WallpaperSidebar = (
    <div className="p-6 flex flex-col h-full animate-in slide-in-from-right-4 duration-500 bg-muted/20 border-l border-border backdrop-blur-sm">
      {selectedWallpaper ? (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Properties</h2>
            <Badge variant="outline" className="text-[10px] h-5">{selectedWallpaper.type}</Badge>
          </div>
          
          {/* 详情页的大图不需要太复杂的 3D，用简单的 Card 包裹即可 */}
          <div className="aspect-video bg-muted rounded-xl overflow-hidden border border-border shadow-sm mb-6 relative group">
            <img src={selectedWallpaper.preview} className="w-full h-full object-cover" alt="Preview" />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Play className="w-12 h-12 text-white/80 fill-current drop-shadow-lg" />
            </div>
          </div>
          
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2 leading-tight tracking-tight">{selectedWallpaper.title}</h1>
            <div className="flex items-center gap-2">
               <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-mono select-all">
                 {selectedWallpaper.id}
               </code>
            </div>
          </div>
          
          <div className="space-y-4 mb-8">
            <InfoRow label="Resolution" value="3840 x 2160" />
            <InfoRow label="Size" value="32.5 MB" />
            <InfoRow label="Format" value={selectedWallpaper.type} />
            <InfoRow label="Content Rating" value="Everyone" />
          </div>

          <div className="flex-1" />
          
          <Button size="lg" className="w-full gap-2 shadow-lg shadow-primary/20 text-base font-semibold">
            <Play className="w-4 h-4 fill-current" /> Apply Wallpaper
          </Button>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground space-y-4">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
            <ImageIcon className="w-8 h-8 opacity-50" />
          </div>
          <p className="text-sm font-medium">Select a wallpaper to view details</p>
        </div>
      )}
    </div>
  );

  return (
    <Layout navbar={Navbar} sidebar={activeTab === "wallpapers" ? WallpaperSidebar : null}>
      
      <AnimatePresence mode="wait">
        
        {activeTab === "wallpapers" && (
          <motion.div
            key="wallpapers"
            initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}
            className="h-full"
          >
            {/* 内容区域内边距 */}
            <div className="p-1">
              
              {/* 如果正在加载，显示骨架屏 */}
              {isLoading ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="space-y-3">
                        <Skeleton className="h-[200px] w-full rounded-xl" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[250px]" />
                          <Skeleton className="h-4 w-[200px]" />
                        </div>
                      </div>
                    ))}
                 </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 pb-20">
                  {filteredWallpapers.map((wp) => (
                    <WallpaperContextMenu key={wp.id} onOpenFolder={() => console.log(wp.id)} onDelete={() => console.log(wp.id)}>
                      
                      {/* === Aceternity 3D Card === */}
                      <CardContainer className="inter-var w-full h-full">
                        <CardBody className={`
                          relative group/card hover:shadow-2xl hover:shadow-primary/[0.2] 
                          bg-card  /* 👈 关键：统一使用 bg-card，不要写死 bg-black */
                          border-border/50 /* 柔和的边框 */
                          w-full h-auto rounded-xl p-4 border
                          transition-all duration-200
                          ${selectedId === wp.id ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}
                        `}>
                          
                          {/* 图片层：设置 translateZ 实现悬浮 */}
                          <CardItem translateZ="50" className="w-full mt-2">
                            <div 
                              onClick={() => setSelectedId(wp.id)}
                              className="aspect-video w-full rounded-xl overflow-hidden cursor-pointer relative"
                            >
                              <img 
                                src={wp.preview} 
                                className="h-full w-full object-cover group-hover/card:scale-110 transition-transform duration-500" 
                                alt="thumbnail" 
                                loading="lazy"
                              />
                              {/* 类型角标 */}
                              <div className="absolute top-2 right-2">
                                <Badge variant="secondary" className="bg-black/60 hover:bg-black/70 backdrop-blur-md text-white border-none shadow-sm gap-1 pl-1.5">
                                  {wp.type === 'Video' && <Video className="w-3 h-3 text-blue-400" />}
                                  {wp.type === 'Scene' && <ImageIcon className="w-3 h-3 text-green-400" />}
                                  {wp.type === 'Web' && <Globe className="w-3 h-3 text-orange-400" />}
                                  {wp.type}
                                </Badge>
                              </div>
                              
                              {/* 选中时的覆盖层 */}
                              {selectedId === wp.id && (
                                <div className="absolute inset-0 bg-primary/10 flex items-center justify-center backdrop-blur-[1px]">
                                  <div className="bg-primary text-primary-foreground rounded-full p-2 shadow-lg">
                                    <Check className="w-5 h-5" />
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardItem>
                          
                          {/* 标题和标签层 */}
                          <div className="flex justify-between items-start mt-6 gap-2">
                            <CardItem translateZ="60" className="text-base font-bold text-card-foreground line-clamp-1 flex-1 text-left" as="h3">
                              {wp.title}
                            </CardItem>
                            
                            <CardItem translateZ="40">
                               <Badge variant="outline" className="text-xs font-normal text-muted-foreground whitespace-nowrap">
                                 Re-Logic
                               </Badge>
                            </CardItem>
                          </div>
                          
                          <CardItem translateZ="30" className="w-full mt-3">
                             <p className="text-xs text-muted-foreground text-left line-clamp-2">
                               A beautiful animated wallpaper scene with dynamic lighting effects.
                             </p>
                          </CardItem>
                          
                        </CardBody>
                      </CardContainer>
                      {/* === End Aceternity === */}

                    </WallpaperContextMenu>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === "settings" && (
          <motion.div
            key="settings"
            initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}
            className="h-full"
          >
            <Settings />
          </motion.div>
        )}

        {activeTab === "performance" && (
          <motion.div
            key="performance"
            initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}
            className="h-full"
          >
            <Performance />
          </motion.div>
        )}

      </AnimatePresence>
    </Layout>
  );
}

// 简单的详情行组件
function InfoRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

export default App;