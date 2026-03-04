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

interface RawPerformanceEvent {
  total_cpu: number;
  total_memory_mb: number;
  total_threads: number;
  processes?: {
    [key: string]: RawProcessStats;
  };
  timestamp?: number;
  cpu_cores?: number;
  total_memory_gb?: number;
  process_count?: number;
}

interface RawProcessStats {
  pid: number;
  name: string;
  cmd: string;
  status: string;
  cpu: number;
  memory_mb: number;
  threads: number;
  cpu_history?: number[];
  mem_history?: number[];
  thread_names?: string[];
}

const HISTORY_SIZE = 60;

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

  // Transform flat number array to ChartDataPoint[] with right-aligned data
  // When data is not full, pad with null on the left so data appears on the right
  const toChartData = (values: number[] | undefined): ChartDataPoint[] => {
    if (!values) return [];
    
    const result: ChartDataPoint[] = [];
    const dataLen = values.length;
    
    // Pad left side with empty data so actual data appears on the right
    for (let i = 0; i < HISTORY_SIZE - dataLen; i++) {
      result.push({ time: "", value: 0 }); // Empty time label, zero value (won't show line)
    }
    
    // Add actual data with time labels
    // values[0] = oldest, values[dataLen-1] = newest
    // We want: oldest on left (larger time number), newest on right (smaller time number)
    for (let i = 0; i < dataLen; i++) {
      result.push({
        time: `${dataLen - i}s`, // Newest (right) shows "1s", oldest shows "60s"
        value: values[i],
      });
    }
    
    return result;
  };

  const mapProcess = (raw: RawProcessStats | undefined, name: string): ProcessStats => {
    if (!raw) return createDefaultProcess(name);
    return {
      pid: raw.pid,
      name: raw.name || name,
      cmd: raw.cmd,
      status: (raw.status || "Sleeping") as "Running" | "Sleeping" | "Idle",
      cpu: raw.cpu,
      mem: raw.memory_mb,
      cpuHistory: toChartData(raw.cpu_history),
      memHistory: toChartData(raw.mem_history),
      threads: raw.thread_names || [],
    };
  };

  const allProcesses = raw.processes || {};
  const processValues = Object.values(allProcesses);
  
  // System-level history aggregation with right alignment
  const cpuHistory: ChartDataPoint[] = [];
  const memHistory: ChartDataPoint[] = [];
  
  // Calculate max history length among all processes
  let maxDataLen = 0;
  for (const p of processValues) {
    if (p?.cpu_history) {
      maxDataLen = Math.max(maxDataLen, p.cpu_history.length);
    }
  }
  maxDataLen = Math.min(maxDataLen, HISTORY_SIZE);
  
  // Pad left side
  for (let i = 0; i < HISTORY_SIZE - maxDataLen; i++) {
    cpuHistory.push({ time: "", value: 0 });
    memHistory.push({ time: "", value: 0 });
  }
  
  // Add actual aggregated data
  for (let i = 0; i < maxDataLen; i++) {
    let totalCpu = 0;
    let totalMem = 0;
    for (const p of processValues) {
      // Calculate offset: we want the newest data (highest index) to be at the end
      const processLen = p?.cpu_history?.length || 0;
      const idx = i - (maxDataLen - processLen);
      if (idx >= 0 && idx < processLen) {
        totalCpu += p.cpu_history?.[idx] || 0;
        totalMem += p.mem_history?.[idx] || 0;
      }
    }
    cpuHistory.push({ time: `${maxDataLen - i}s`, value: totalCpu });
    memHistory.push({ time: `${maxDataLen - i}s`, value: totalMem });
  }

  return {
    totalCpu: raw.total_cpu ?? 0,
    totalMem: raw.total_memory_mb ?? 0,
    activeThreads: raw.total_threads ?? 0,
    cpuHistory,
    memHistory,
    processes: {
      backend: mapProcess(raw.processes?.backend, "Backend"),
      frontend: mapProcess(raw.processes?.frontend, "Frontend"),
      tray: mapProcess(raw.processes?.tray, "Tray"),
    },
    cpuCores: raw.cpu_cores ?? 1,
    totalMemoryGb: raw.total_memory_gb ?? 16,
    processCount: raw.process_count ?? 1,
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
        await invoke("start_performance_monitor");

        unlistenPerformance = await listen<RawPerformanceEvent>(
          "performance-update",
          (event) => {
            const mappedStats = mapEventToStats(event.payload);
            setStats(mappedStats);
            setIsLoading(false);
          }
        );

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