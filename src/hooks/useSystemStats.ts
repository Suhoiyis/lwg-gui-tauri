// src/hooks/useSystemStats.ts
import { useState, useEffect } from "react";
import { SystemStats, ScreenshotRecord, ChartDataPoint } from "@/types/performance";

export function useSystemStats() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [history, setHistory] = useState<ScreenshotRecord[]>([]);

  useEffect(() => {
    // 初始数据生成器
    const initData = (len: number): ChartDataPoint[] => 
      Array.from({ length: len }, (_, i) => ({ 
        time: `${len - i}s`, 
        value: 0 
      }));
    
    // 初始化截图历史
    setHistory([
      { id: 1, name: "Cyberpunk City", timestamp: "15:45:20", duration: 1.2, maxCpu: 45.2, maxMem: 600.5, path: "/tmp/s1.png" },
      { id: 2, name: "Ocean Waves", timestamp: "14:20:10", duration: 0.8, maxCpu: 20.1, maxMem: 450.2, path: "/tmp/s2.png" },
    ]);

    const timer = setInterval(() => {
      setStats(prev => {
        const nowStr = "Now";
        
        const updateArr = (arr: ChartDataPoint[] | undefined, val: number, maxLen = 30) => {
          const current = arr || initData(maxLen);
          // 移动时间轴标签 (简单模拟)
          const shifted = current.slice(1).map((p, i) => ({ ...p, time: `${maxLen - i}s` }));
          return [...shifted, { time: nowStr, value: val }];
        };

        const newCpu = Math.random() * 30 + 5;
        const newMem = Math.random() * 100 + 400;

        return {
          totalCpu: newCpu,
          totalMem: newMem,
          activeThreads: 31,
          cpuHistory: updateArr(prev?.cpuHistory, newCpu),
          memHistory: updateArr(prev?.memHistory, newMem),
          processes: {
            backend: {
              pid: 2722, name: "Backend", cmd: "wallpaper-engine-backend", status: "Running",
              cpu: Math.random() * 15, mem: 370 + Math.random() * 20,
              cpuHistory: updateArr(prev?.processes.backend.cpuHistory, Math.random() * 15),
              memHistory: updateArr(prev?.processes.backend.memHistory, 370 + Math.random() * 20),
              threads: ["render-loop", "video-decoder", "audio-processor", "ipc-worker", "steam-callback"]
            },
            frontend: {
              pid: 5459, name: "Frontend", cmd: "wallpaper-engine-gui", status: "Sleeping",
              cpu: Math.random() * 2, mem: 360 + Math.random() * 10,
              cpuHistory: updateArr(prev?.processes.frontend.cpuHistory, Math.random() * 2),
              memHistory: updateArr(prev?.processes.frontend.memHistory, 360 + Math.random() * 10),
              threads: ["gui-main", "event-loop", "dbus-worker"]
            },
            tray: {
              pid: 1233, name: "Tray", cmd: "wallpaper-tray", status: "Running",
              cpu: 0.1, mem: 65,
              cpuHistory: updateArr(prev?.processes.tray.cpuHistory, 0.1),
              memHistory: updateArr(prev?.processes.tray.memHistory, 65),
              threads: ["gtk-main"]
            }
          }
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const clearHistory = () => setHistory([]);

  return { stats, history, clearHistory };
}
