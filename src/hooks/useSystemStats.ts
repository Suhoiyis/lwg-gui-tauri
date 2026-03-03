// src/hooks/useSystemStats.ts
import { useState, useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import {
  SystemStats,
  ScreenshotRecord,
  ProcessStats,
  ChartDataPoint,
} from "@/types/performance";

/**
 * Raw event structure from Rust backend (snake_case)
 * This matches what the Rust PerformanceMonitor::get_stats() emits
 */
interface RawPerformanceEvent {
  total_cpu: number;
  total_memory_mb: number;
  total_threads: number;
  cpu_history?: ChartDataPoint[];
  mem_history?: ChartDataPoint[];
  processes?: {
    [key: string]: RawProcessStats;
  };
  timestamp?: number;
}

interface RawProcessStats {
  pid: number;
  name: string;
  cmd: string;
  status: string;
  cpu: number;
  memory_mb: number;
  threads: number;
  cpu_history?: ChartDataPoint[];
  mem_history?: ChartDataPoint[];
  thread_names?: string[];
}

/**
 * Map raw Rust snake_case event to TypeScript camelCase format
 */
function mapEventToStats(raw: RawPerformanceEvent): SystemStats {
  const createDefaultProcess = (name: string): ProcessStats => ({
    pid: 0,
    name,
    cmd: "N/A",
    status: "Sleeping",
    cpu: 0,
    mem: 0,
    cpuHistory: [],
    memHistory: [],
    threads: [],
  });

  const mapProcess = (raw: RawProcessStats | undefined, name: string): ProcessStats => {
    if (!raw) return createDefaultProcess(name);
    return {
      pid: raw.pid,
      name: raw.name || name,
      cmd: raw.cmd,
      status: (raw.status || "Sleeping") as "Running" | "Sleeping" | "Idle",
      cpu: raw.cpu,
      mem: raw.memory_mb,
      cpuHistory: raw.cpu_history || [],
      memHistory: raw.mem_history || [],
      threads: raw.thread_names || [],
    };
  };

  return {
    totalCpu: raw.total_cpu ?? 0,
    totalMem: raw.total_memory_mb ?? 0,
    activeThreads: raw.total_threads ?? 0,
    cpuHistory: raw.cpu_history ?? [],
    memHistory: raw.mem_history ?? [],
    processes: {
      backend: mapProcess(raw.processes?.backend, "Backend"),
      frontend: mapProcess(raw.processes?.frontend, "Frontend"),
      tray: mapProcess(raw.processes?.tray, "Tray"),
    },
  };
}

export function useSystemStats() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [history, setHistory] = useState<ScreenshotRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let unlistenPerformance: (() => void) | null = null;

    const setupMonitoring = async () => {
      try {
        // Start the performance monitor on the backend
        await invoke("start_performance_monitor");

        // Subscribe to performance-update events
        unlistenPerformance = await listen<RawPerformanceEvent>(
          "performance-update",
          (event) => {
            const mappedStats = mapEventToStats(event.payload);
            setStats(mappedStats);
            setIsLoading(false);
          }
        );

        // Fetch initial screenshot history
        const screenshotHistory = await invoke<ScreenshotRecord[]>(
          "get_screenshot_history"
        );
        setHistory(screenshotHistory);
      } catch (error) {
        console.error("Failed to setup performance monitoring:", error);
        setIsLoading(false);
      }
    };

    setupMonitoring();

    // Cleanup: stop monitoring when component unmounts
    return () => {
      if (unlistenPerformance) {
        unlistenPerformance();
      }
      invoke("stop_performance_monitor").catch((err) => {
        console.error("Failed to stop performance monitor:", err);
      });
    };
  }, []);

  const clearHistory = async () => {
    try {
      await invoke("clear_screenshot_history");
      setHistory([]);
    } catch (error) {
      console.error("Failed to clear history:", error);
    }
  };

  return { stats, history, clearHistory, isLoading };
}
