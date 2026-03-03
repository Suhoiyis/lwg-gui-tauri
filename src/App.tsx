import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Shadcn UI 组件
import { Tabs } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/sonner";

// 项目自定义组件
import { Layout } from "./components/Layout";
import { AppNavbar } from "./components/AppnavBar";

// 页面组件
import { Library } from "./pages/Library";
import { Settings } from "./pages/Settings";
import { Performance } from "./pages/Performance";
import { CompactMode } from "./pages/Compact";

import { useAppStore } from "./store/appStore";

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
  const [isLoading, setIsLoading] = useState(false);
  const activeTab = useAppStore((state) => state.activeTab);
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const loadWallpapers = useAppStore((state) => state.loadWallpapers);
  const isCompactMode = useAppStore(s => s.isCompactMode);

  useEffect(() => {
    setIsLoading(true);
    loadWallpapers().finally(() => setIsLoading(false));
  }, [loadWallpapers]);

  if (isCompactMode) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="h-screen w-screen overflow-hidden"
        >
          <CompactMode />
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <>
      <Tabs value={activeTab}
      onValueChange={(value) => setActiveTab(value as "wallpapers" | "settings" | "performance")}
      >
      <Layout
          navbar={<AppNavbar />}
          sidebar={null}
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
      <Toaster />
    </>
  );
}