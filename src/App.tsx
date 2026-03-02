import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Shadcn UI 组件
import { Tabs } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/sonner"; // 确保 Toast 正常工作

// 项目自定义组件
import { Layout } from "./components/Layout";
import { AppNavbar } from "./components/AppnavBar";
import { WallpaperSidebar } from "./components/WallpaperSidebar";

// 页面组件
import { Library } from "./pages/Library";
import { Settings } from "./pages/Settings";
import { Performance } from "./pages/Performance";

import { useAppStore } from "./store/appStore";

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
  // Local UI state
  const [isLoading, setIsLoading] = useState(false);
  
  // Zustand store state and actions
  const activeTab = useAppStore((state) => state.activeTab);
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const loadWallpapers = useAppStore((state) => state.loadWallpapers);
  
  useEffect(() => {
    setIsLoading(true);
    loadWallpapers().finally(() => setIsLoading(false));
  }, []); 

  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <Layout 
          navbar={<AppNavbar />} 
          // 只有在 Library (wallpapers) 标签页时才显示侧边栏
          sidebar={activeTab === "wallpapers" ? <WallpaperSidebar /> : null}
        >
          <AnimatePresence mode="wait">
            {activeTab === "wallpapers" && (
              <motion.div 
                key="wallpapers" 
                initial="initial" animate="in" exit="out" 
                variants={pageVariants} transition={pageTransition} 
                className="h-full"
              >
                <Library />
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
      </Tabs>
      {/* 确保 Sonner Toaster 位于最顶层，否则 Settings 页面的 toast 无法显示 */}
      <Toaster />
    </>
  );
}