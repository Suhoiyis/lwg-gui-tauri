// src/pages/Performance.tsx
import React from "react";
import { Cpu, MemoryStick } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// Hooks
import { useSystemStats } from "@/hooks/useSystemStats";

// Components
import { OverviewCard, ThreadsCard } from "@/components/performance/OverviewCard";
import ProcessList from "@/components/performance/ProcessList";
import ScreenshotHistory from "@/components/performance/ScreenshotHistory";

export function Performance() {
  const { stats, history, clearHistory } = useSystemStats();

  if (!stats) return <div className="p-8 text-muted-foreground">Initializing Performance Monitor...</div>;

  return (
    <div className="flex flex-col h-full space-y-6 overflow-hidden">
      
      <div className="flex flex-col space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">System Monitor</h1>
        <p className="text-sm text-muted-foreground">Real-time resource usage of Wallpaper Engine components.</p>
      </div>

      <ScrollArea className="flex-1 -mx-6 px-6">
        <div className="space-y-8 pb-20">
          
          {/* 1. 总览卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <OverviewCard 
              title="Total CPU" 
              value={`${stats.totalCpu.toFixed(1)}%`} 
              sub="4 Cores Active"
              icon={<Cpu className="text-primary" />} 
              data={stats.cpuHistory} 
              color="#ef4444"
              unit="%"
            />
            <OverviewCard 
              title="Total Memory" 
              value={`${stats.totalMem.toFixed(0)} MB`} 
              sub="of 16 GB"
              icon={<MemoryStick className="text-blue-500" />} 
              data={stats.memHistory} 
              color="#3b82f6"
              unit=" MB"
            />
            <ThreadsCard count={stats.activeThreads} />
          </div>

          <Separator />

          {/* 2. 进程详情 */}
          <ProcessList processes={stats.processes} />

          <Separator />

          {/* 3. 截图历史 */}
          <ScreenshotHistory items={history} onClear={clearHistory} />
          
        </div>
      </ScrollArea>
    </div>
  );
}
