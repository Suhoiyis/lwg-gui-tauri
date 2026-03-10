import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { listen } from "@tauri-apps/api/event";

// Shadcn UI 组件
import { Tabs } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

// 项目自定义组件
import { Layout } from "./components/Layout";
import { AppNavbar } from "./components/AppnavBar";

// 页面组件
import { Library } from "./pages/Library";
import { Settings } from "./pages/Settings";
import { Performance } from "./pages/Performance";
import { CompactMode } from "./pages/Compact";

import { useAppStore } from "./store/appStore";

// 页面切换动画配置
const pageVariants = {
  initial: { opacity: 0, y: 10, scale: 0.99 },
  in: { opacity: 1, y: 0, scale: 1 },
  out: { opacity: 0, y: -10, scale: 0.99 },
};

const pageTransition = {
  type: "tween",
  ease: "circOut",
  duration: 0.25,
} as const;

export function App() {
  const [isLoading, setIsLoading] = useState(false);

  const activeTab = useAppStore((state) => state.activeTab);
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const loadWallpapers = useAppStore((state) => state.loadWallpapers);

  const isCompactMode = useAppStore((s) => s.isCompactMode);
  const toggleCompactMode = useAppStore((s) => s.toggleCompactMode);
  const initializeSettings = useAppStore((s) => s.initializeSettings);
  const fetchMonitors = useAppStore((s) => s.fetchMonitors);
  const fetchAppVersion = useAppStore((s) => s.fetchAppVersion);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const THRESHOLD = 500;
      if (width < THRESHOLD && !isCompactMode) {
        // 只有当不是 Compact Mode 时才切换，避免死循环
        toggleCompactMode(true);
      } else if (width >= THRESHOLD && isCompactMode) {
        // 只有当是 Compact Mode 时才切换回大窗
        toggleCompactMode(false);
      }
    };
    // 初始化时先检查一次
    handleResize();

    // 监听窗口变化
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isCompactMode, toggleCompactMode]); // 依赖项

  // 初始化加载壁纸
  useEffect(() => {
    setIsLoading(true);
    loadWallpapers().finally(() => setIsLoading(false));
    loadWallpapers();
  }, [loadWallpapers]); // 简化依赖

  // Initialize settings and monitors at app startup
  useEffect(() => {
    initializeSettings();
    fetchMonitors();
    fetchAppVersion();
  }, [initializeSettings, fetchMonitors, fetchAppVersion]);

  // 监听 Tauri System Tray 事件
  useEffect(() => {
    // 闭包中捕获 store 的最新方法
    const unlistenRandom = listen("tray-random-wallpaper", () => {
      // 通过 getState() 获取最新的方法，避免因为依赖导致的重新绑定
      useAppStore.getState().applyRandomWallpaper();
    });

    const unlistenStop = listen("tray-stop-wallpaper", () => {
      useAppStore.getState().stopWallpaper();
    });

    const unlistenApplyLast = listen("tray-apply-last", () => {
      // 为了安全起见，我们直接调用 loadWallpapers 后再尝试应用最后的壁纸（或者复用 store 里现有的 applyWallpaper 逻辑）
      // 这里简化的实现：
      const state = useAppStore.getState();
      const lastWp = state.runtimeState?.lastWallpaper;
      if (lastWp) {
        state.applyWallpaper(lastWp);
      }
    });

    return () => {
      unlistenRandom.then((f) => f());
      unlistenStop.then((f) => f());
      unlistenApplyLast.then((f) => f());
    };
  }, []);

  // --- 渲染逻辑 ---

  // 1. 如果是 Compact Mode
  if (isCompactMode) {
    return (
      // ✨ 2. 包裹 TooltipProvider
      <TooltipProvider delayDuration={300}>
        <motion.div
          key="compact"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="h-screen w-screen bg-background"
        >
          <CompactMode />
          <Toaster />
        </motion.div>
      </TooltipProvider>
    );
  }

  // 2. 正常大窗口模式
  return (
    // ✨ 2. 包裹 TooltipProvider (这里的 <> 也可以删掉直接包 Provider)
    <TooltipProvider delayDuration={300}>
      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          setActiveTab(value as "wallpapers" | "settings" | "performance")
        }
      >
        <Layout navbar={<AppNavbar />} sidebar={null}>
          <AnimatePresence mode="wait">
            {activeTab === "wallpapers" && (
              <motion.div
                key="wallpapers"
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
                className="h-full"
              >
                <Library />
              </motion.div>
            )}

            {activeTab === "settings" && (
              <motion.div
                key="settings"
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
                className="h-full"
              >
                <Settings />
              </motion.div>
            )}

            {activeTab === "performance" && (
              <motion.div
                key="performance"
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
                className="h-full"
              >
                <Performance />
              </motion.div>
            )}
          </AnimatePresence>
        </Layout>
      </Tabs>
      <Toaster />
    </TooltipProvider>
  );
}