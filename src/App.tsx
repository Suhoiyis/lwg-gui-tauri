import { useState, useEffect, useMemo } from "react";
import { scanWallpapers } from "./api/wallpaper";
import { Wallpaper } from "./mock/wallpapers";
import { 
  Image, Video, Globe, Filter, Search, Play, 
  Monitor, Settings as SettingsIcon, Activity, 
  FolderOpen, RefreshCw 
} from "lucide-react";

// 1. 引入动画库
import { motion, AnimatePresence } from "framer-motion";
import Tilt from "react-parallax-tilt";

import { Layout } from "./components/Layout";
import { Settings } from "./pages/Settings";
import { Performance } from "./pages/Performance";
import { WallpaperContextMenu } from "./components/WallpaperContextMenu";

type ActiveTab = "wallpapers" | "settings" | "performance";

// 定义页面切换动画参数
const pageVariants = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  in: { opacity: 1, y: 0, scale: 1 },
  out: { opacity: 0, y: -20, scale: 0.98 }
};

const pageTransition = {
  type: "tween",
  ease: "circOut",
  duration: 0.3
};

function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("wallpapers");
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentMonitor, setCurrentMonitor] = useState("eDP-1");

  useEffect(() => { loadData(); }, []);

  const loadData = () => {
    scanWallpapers().then((data) => {
      setWallpapers(data);
      if (data.length > 0 && !selectedId) setSelectedId(data[0].id);
    });
  };

  const filteredWallpapers = useMemo(() => {
    if (!searchQuery) return wallpapers;
    const lowerQ = searchQuery.toLowerCase();
    return wallpapers.filter(w => w.title.toLowerCase().includes(lowerQ) || w.id.includes(lowerQ));
  }, [wallpapers, searchQuery]);

  const selectedWallpaper = wallpapers.find(w => w.id === selectedId);

  // --- Navbar ---
  const Navbar = (
    <div className="flex w-full items-center gap-4">
      <div className="flex items-center gap-2 mr-2 select-none">
        <Monitor className="text-primary w-6 h-6" />
        <span className="font-bold hidden md:block tracking-tight text-lg">Wallpaper Engine</span>
      </div>
      
      <div className="relative group">
        <button className="flex items-center gap-2 bg-surface hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 transition-colors active:scale-95">
          <Monitor size={14} className="text-gray-400" />
          <span className="text-sm font-medium">{currentMonitor}</span>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-1 shadow-[0_0_8px_#22c55e]"></div>
        </button>
      </div>

      <div className="w-px h-6 bg-white/10 mx-2"></div>

      {/* 这里的 Tab 切换现在会触发动画 */}
      <div className="flex items-center gap-1 bg-black/20 p-1 rounded-lg border border-white/5">
        <NavButton active={activeTab === "wallpapers"} onClick={() => setActiveTab("wallpapers")} icon={<Image size={16} />} label="Library" />
        <NavButton active={activeTab === "settings"} onClick={() => setActiveTab("settings")} icon={<SettingsIcon size={16} />} label="Settings" />
        <NavButton active={activeTab === "performance"} onClick={() => setActiveTab("performance")} icon={<Activity size={16} />} label="Monitor" />
      </div>

      <div className="flex-1" />
      
      {activeTab === "wallpapers" && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} 
          className="flex items-center gap-2"
        >
          <div className="group flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-full border border-white/10 w-64 transition-all focus-within:border-primary/50 focus-within:bg-black/40 focus-within:w-72">
            <Search size={16} className="text-gray-400 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-gray-500"
            />
             {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-gray-500 hover:text-white">✕</button>
            )}
          </div>
          <button onClick={loadData} className="p-2 hover:bg-white/10 rounded-full transition text-gray-400 hover:text-white active:rotate-180 duration-500"><RefreshCw size={18} /></button>
        </motion.div>
      )}
    </div>
  );

  // --- Sidebar ---
  const WallpaperSidebar = (
    <div className="p-6 flex flex-col h-full animate-in slide-in-from-right-8 duration-500">
      {selectedWallpaper ? (
        <>
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Selected Properties</h2>
          
          {/* 给侧边栏的大图也加一个轻微的 3D 效果 */}
          <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5} scale={1.02} transitionSpeed={2000} className="mb-5">
            <div className="aspect-video bg-black/50 rounded-lg overflow-hidden border border-white/10 shadow-2xl relative group">
              <img src={selectedWallpaper.preview} className="w-full h-full object-cover" alt="Preview" />
            </div>
          </Tilt>
          
          <div className="mb-6">
            <h1 className="text-xl font-bold mb-2 leading-tight text-white">{selectedWallpaper.title}</h1>
            <div className="flex items-center gap-2 text-xs text-gray-400 font-mono bg-white/5 w-fit px-2 py-1 rounded border border-white/5 select-all">
              <span>ID: {selectedWallpaper.id}</span>
            </div>
          </div>
          
          <div className="space-y-px bg-white/10 rounded-xl border border-white/10 overflow-hidden mb-8">
            <PropertyRow label="Type" value={selectedWallpaper.type} />
            <PropertyRow label="Size" value="32.5 MB" />
            <PropertyRow label="Resolution" value="3840 x 2160" />
            <PropertyRow label="Rating" value={<span className="text-yellow-400">★★★★☆</span>} />
          </div>

          <div className="flex-1" />
          <button className="w-full bg-primary hover:bg-blue-400 hover:scale-[1.02] text-background font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary/20">
            <Play size={20} fill="currentColor" /> Apply Wallpaper
          </button>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-600 space-y-4">
          <Image size={32} className="opacity-20" />
          <p className="text-sm font-medium">Select a wallpaper</p>
        </div>
      )}
    </div>
  );

  return (
    <Layout navbar={Navbar} sidebar={activeTab === "wallpapers" ? WallpaperSidebar : null}>
      
      {/* 2. AnimatePresence: 负责处理组件卸载时的动画 */}
      <AnimatePresence mode="wait">
        
        {activeTab === "wallpapers" && (
          <motion.div
            key="wallpapers" // 必须有唯一的 key
            initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}
            className="h-full"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 pb-20">
              {filteredWallpapers.map((wp) => (
                <WallpaperContextMenu key={wp.id} onOpenFolder={() => console.log(wp.id)} onDelete={() => console.log(wp.id)}>
                  
                  {/* 3. Tilt 组件: 包裹卡片实现 3D 效果 */}
                  <Tilt
                    glareEnable={true}         // 开启反光
                    glareMaxOpacity={0.3}      // 反光强度
                    glareColor="#ffffff"       // 反光颜色
                    glarePosition="all"        // 反光位置
                    scale={1.05}               // 悬停放大比例
                    tiltMaxAngleX={10}         // X轴最大倾斜角度
                    tiltMaxAngleY={10}         // Y轴最大倾斜角度
                    transitionSpeed={400}      // 动画速度
                    className="h-full"         // 确保 Tilt 容器占满高度
                  >
                    <div 
                      onClick={() => setSelectedId(wp.id)}
                      className={`
                        relative bg-surface rounded-xl p-3 cursor-pointer h-full border transition-colors duration-200
                        ${selectedId === wp.id 
                          ? 'border-primary bg-white/10' 
                          : 'border-white/5 hover:border-white/20 hover:bg-white/5'
                        }
                      `}
                    >
                      <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-black/50 relative">
                        <img src={wp.preview} className="w-full h-full object-cover" loading="lazy" />
                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md p-1.5 rounded-md text-white shadow-sm border border-white/10">
                           {wp.type === 'Video' && <Video size={12} className="text-blue-400" />}
                           {wp.type === 'Scene' && <Image size={12} className="text-green-400" />}
                           {wp.type === 'Web' && <Globe size={12} className="text-orange-400" />}
                        </div>
                      </div>
                      <h3 className={`font-medium text-sm truncate ${selectedId === wp.id ? 'text-primary' : 'text-gray-300'}`}>
                        {wp.title}
                      </h3>
                    </div>
                  </Tilt>

                </WallpaperContextMenu>
              ))}
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

// ... 辅助组件 (NavButton, PropertyRow) 保持不变 ...
function NavButton({ active, onClick, icon, label }: any) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${active ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>{icon}{label}</button>
  );
}

function PropertyRow({ label, value }: any) {
  return (
    <div className="flex justify-between items-center p-3 bg-white/5 border-b border-white/5 last:border-0 hover:bg-white/10 transition-colors">
      <span className="text-gray-500 text-xs font-medium">{label}</span>
      <span className="text-gray-200 text-sm">{value}</span>
    </div>
  );
}

export default App;