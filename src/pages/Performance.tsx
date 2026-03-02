import { useState, useEffect } from "react";
import { 
  Activity, Cpu, MemoryStick, Server, Layout, 
  ArrowDownToLine, Camera, FolderOpen, Image as ImageIcon,
  ChevronDown, ChevronRight, Trash2, Clock, 
  Monitor, Layers // 新增图标
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { toast } from "sonner";

// ================= 类型定义 =================

interface ChartDataPoint {
  time: string; // 格式化后的时间字符串 (如 "10s")
  value: number;
}

interface ProcessStats {
  pid: number;
  name: string;
  cmd: string;
  status: "Running" | "Sleeping" | "Idle";
  cpu: number;      // %
  mem: number;      // MB
  cpuHistory: ChartDataPoint[];
  memHistory: ChartDataPoint[];
  threads: string[];
}

interface SystemStats {
  totalCpu: number;
  totalMem: number;
  activeThreads: number;
  cpuHistory: ChartDataPoint[];
  memHistory: ChartDataPoint[];
  processes: {
    backend: ProcessStats;
    frontend: ProcessStats;
    tray: ProcessStats;
  };
}

interface ScreenshotRecord {
  id: number;
  name: string;
  timestamp: string;
  preview?: string; 
  duration: number; // 秒
  maxCpu: number;
  maxMem: number;
  path: string;
}

// ================= 辅助组件：专业图表 (带坐标轴) =================

function PerformanceChart({ 
  data, color, unit, title, height = 120 
}: { 
  data: ChartDataPoint[], color: string, unit: string, title?: string, height?: number 
}) {
  return (
    <div style={{ height }} className="w-full">
      {title && <div className="text-[10px] uppercase text-muted-foreground font-semibold mb-1">{title}</div>}
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.2}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
          <XAxis 
            dataKey="time" 
            hide // 隐藏X轴文字以保持紧凑，或者设为 false 显示
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            hide={false} 
            width={30} // 给Y轴数值留出空间
            axisLine={false}
            tickLine={false}
            tick={{fontSize: 10, fill: "hsl(var(--muted-foreground))"}}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "hsl(var(--card))", 
              borderColor: "hsl(var(--border))", 
              borderRadius: "6px",
              fontSize: "12px",
              padding: "4px 8px"
            }}
            itemStyle={{ color: "hsl(var(--foreground))" }}
            formatter={(value: number) => [`${value.toFixed(1)}${unit}`, "Usage"]}
            labelStyle={{ display: 'none' }}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            strokeWidth={2} 
            fill={`url(#grad-${color})`} 
            isAnimationActive={false} // 关闭动画以提升性能
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ================= 主页面组件 =================

export function Performance() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [history, setHistory] = useState<ScreenshotRecord[]>([]);

  // 模拟数据流
  useEffect(() => {
    // 初始数据生成器
    const initData = (len: number) => Array.from({ length: len }, (_, i) => ({ 
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

  if (!stats) return <div className="p-8 text-muted-foreground">Initializing Performance Monitor...</div>;

  return (
    <div className="flex flex-col h-full space-y-6 overflow-hidden">
      
      <div className="flex flex-col space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">System Monitor</h1>
        <p className="text-sm text-muted-foreground">Real-time resource usage of Wallpaper Engine components.</p>
      </div>

      <ScrollArea className="flex-1 -mx-6 px-6">
        <div className="space-y-8 pb-20">
          
          {/* 1. 总览卡片 (Top Overview) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <OverviewCard 
              title="Total CPU" 
              value={`${stats.totalCpu.toFixed(1)}%`} 
              sub="4 Cores Active"
              icon={<Cpu className="text-primary" />} 
              data={stats.cpuHistory} 
              color="#ef4444" // Red
              unit="%"
            />
            <OverviewCard 
              title="Total Memory" 
              value={`${stats.totalMem.toFixed(0)} MB`} 
              sub="of 16 GB"
              icon={<MemoryStick className="text-blue-500" />} 
              data={stats.memHistory} 
              color="#3b82f6" // Blue
              unit=" MB"
            />
            <Card>
              <CardContent className="p-6 flex flex-col justify-between h-full">
                 <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-muted-foreground">Active Threads</span>
                    <div className="p-2 bg-muted/50 rounded-lg"><Activity className="w-4 h-4 text-green-500" /></div>
                 </div>
                 <div>
                    <div className="text-3xl font-bold">{stats.activeThreads}</div>
                    <div className="text-xs text-muted-foreground mt-1">Across 3 processes</div>
                 </div>
                 {/* 装饰性条形图 */}
                 <div className="h-[100px] flex items-end gap-1 mt-2 opacity-30">
                    {[40, 60, 30, 80, 50, 90, 20, 60].map((h, i) => (
                      <div key={i} className="flex-1 bg-green-500 rounded-t-sm" style={{ height: `${h}%` }}></div>
                    ))}
                 </div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* 2. 进程详情 (Process Details) */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Server className="w-5 h-5" /> Process Details
            </h2>
            
            <ProcessRow 
              type="backend" 
              data={stats.processes.backend} 
              icon={<Cpu className="text-orange-500" />}
            />
            <ProcessRow 
              type="frontend" 
              data={stats.processes.frontend} 
              icon={<Layout className="text-blue-500" />}
            />
            <ProcessRow 
              type="tray" 
              data={stats.processes.tray} 
              icon={<ArrowDownToLine className="text-purple-500" />}
            />
          </div>

          <Separator />

          {/* 3. 截图历史 (Screenshot History) */}
          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <div>
                   <h2 className="text-lg font-semibold flex items-center gap-2">
                     <Camera className="w-5 h-5" /> Screenshot History
                   </h2>
                   <p className="text-xs text-muted-foreground">Recent performance snapshots.</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setHistory([])} disabled={history.length === 0}>
                   <Trash2 className="w-4 h-4 mr-2" /> Clear
                </Button>
             </div>

             <div className="rounded-xl border bg-card/50 overflow-hidden">
                {history.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">No screenshots taken yet.</div>
                ) : (
                  <div className="divide-y">
                     {history.map((record) => (
                        <ScreenshotRow key={record.id} record={record} />
                     ))}
                  </div>
                )}
             </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

// ================= 子组件：总览卡片 =================

function OverviewCard({ title, value, sub, icon, data, color, unit }: any) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-6 pb-2">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-medium text-muted-foreground">{title}</span>
            <div className="p-2 bg-muted/50 rounded-lg">{icon}</div>
          </div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-xs text-muted-foreground">{sub}</div>
        </div>
        <div className="h-[100px] w-full mt-2 pr-4">
           {/* 使用带坐标轴的图表 */}
           <PerformanceChart data={data} color={color} unit={unit} height={100} />
        </div>
      </CardContent>
    </Card>
  );
}

// ================= 子组件：进程行 (Process Row) =================

function ProcessRow({ type, data, icon }: { type: string, data: ProcessStats, icon: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  // 颜色逻辑：CPU < 20 绿, < 40 橙, > 40 红
  const cpuColor = data.cpu < 20 ? "#22c55e" : data.cpu < 40 ? "#f97316" : "#ef4444";
  
  return (
    <Card className="overflow-hidden transition-all hover:border-primary/50">
      <div className="p-4 flex flex-col gap-4">
        {/* Header Row */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center shrink-0">
            {icon}
          </div>
          
          <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Info */}
            <div className="col-span-3">
               <div className="font-bold text-base flex items-center gap-2">
                 {data.name} 
                 <Badge variant="outline" className="text-[10px] h-5 px-1 font-mono text-muted-foreground">
                   PID: {data.pid}
                 </Badge>
               </div>
               <div className="text-xs text-muted-foreground truncate" title={data.cmd}>{data.cmd}</div>
            </div>

            {/* Stats Numbers */}
            <div className="col-span-3 flex gap-6">
               <div>
                  <div className={`font-mono font-bold ${data.cpu > 20 ? 'text-orange-500' : 'text-green-500'}`}>
                    {data.cpu.toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase">CPU</div>
               </div>
               <div>
                  <div className="font-mono font-bold text-blue-500">
                    {data.mem.toFixed(0)} MB
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase">Mem</div>
               </div>
               <div>
                  <div className="font-mono text-muted-foreground">{data.status}</div>
                  <div className="text-[10px] text-muted-foreground uppercase">Status</div>
               </div>
            </div>

            {/* Charts with Axes (Hidden on small screens) */}
            <div className="col-span-4 hidden md:flex gap-4 items-center">
               <div className="flex-1">
                  <PerformanceChart data={data.cpuHistory} color={cpuColor} unit="%" height={60} title="CPU Trend" />
               </div>
               <div className="flex-1">
                  <PerformanceChart data={data.memHistory} color="#3b82f6" unit=" MB" height={60} title="Mem Trend" />
               </div>
            </div>

            {/* Expander Trigger */}
            <div className="col-span-2 flex justify-end">
               <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)}>
                  {isOpen ? "Hide" : "Details"}
                  {isOpen ? <ChevronDown className="ml-2 w-4 h-4"/> : <ChevronRight className="ml-2 w-4 h-4"/>}
               </Button>
            </div>
          </div>
        </div>

        {/* Expandable Content */}
        <Collapsible open={isOpen} className="space-y-2">
          <CollapsibleContent>
             <div className="pt-2 pl-[64px] pr-4 space-y-4">
                
                {/* 1. Wallpaper Info (Backend Only) - 你的核心需求 */}
                {type === 'backend' && (
                  <div className="rounded-lg bg-secondary/30 border p-4 flex gap-4">
                     <div className="w-32 h-20 bg-black/40 rounded-md overflow-hidden border border-white/10 shrink-0 relative group">
                        {/* 模拟缩略图 */}
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
                            <ImageIcon className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[10px] text-white p-1 text-center truncate">
                            Preview
                        </div>
                     </div>
                     <div className="flex flex-col justify-center space-y-1">
                        <div className="flex items-center gap-2">
                            <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/20 hover:bg-blue-500/30">Video</Badge>
                            <span className="text-sm font-bold">Cyberpunk City 2077</span>
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-4">
                            <span className="flex items-center gap-1"><Monitor className="w-3 h-3"/> Display 1 (2560x1440)</span>
                            <span className="flex items-center gap-1"><Layers className="w-3 h-3"/> ID: 2849204</span>
                        </div>
                        <div className="text-xs text-muted-foreground pt-1">
                            Rendering at 60 FPS • Hardware Acceleration: On
                        </div>
                     </div>
                  </div>
                )}

                {/* 2. Thread Details */}
                <div className="rounded-lg bg-muted/30 border p-4">
                   <h4 className="text-xs font-bold uppercase text-muted-foreground mb-3 flex items-center gap-2">
                     <Activity className="w-3 h-3" /> Active Threads ({data.threads.length})
                   </h4>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {data.threads.map((t, i) => (
                        <div key={i} className="text-xs font-mono text-muted-foreground flex items-center gap-2 hover:text-foreground transition-colors cursor-default">
                           <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                           {t}
                        </div>
                      ))}
                   </div>
                </div>

             </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </Card>
  );
}

// ================= 子组件：截图历史行 =================

function ScreenshotRow({ record }: { record: ScreenshotRecord }) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors group">
       <div className="flex items-center gap-4">
          {/* 缩略图占位 */}
          <div className="w-16 h-10 bg-muted rounded overflow-hidden border group-hover:border-primary/50 transition-colors flex items-center justify-center relative">
             <Camera className="w-4 h-4 text-muted-foreground absolute" />
             {/* 如果有真实图片，这里显示 <img src={record.preview} /> */}
          </div>
          <div>
             <div className="text-sm font-medium">{record.name}</div>
             <div className="text-xs text-muted-foreground flex items-center gap-2">
                <Clock className="w-3 h-3" /> {record.timestamp}
             </div>
          </div>
       </div>

       <div className="flex items-center gap-8">
          <div className="text-right w-20">
             <div className="text-xs font-bold">{record.duration}s</div>
             <div className="text-[10px] text-muted-foreground uppercase">Duration</div>
          </div>
          <div className="text-right w-20">
             <div className="text-xs font-bold text-orange-500">{record.maxCpu}%</div>
             <div className="text-[10px] text-muted-foreground uppercase">Max CPU</div>
          </div>
          <div className="text-right w-20">
             <div className="text-xs font-bold text-blue-500">{record.maxMem} MB</div>
             <div className="text-[10px] text-muted-foreground uppercase">Max Mem</div>
          </div>
       </div>

       <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast.success(`Opening ${record.path}...`)}>
             <FolderOpen className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast.success(`Viewing image...`)}>
             <ImageIcon className="w-4 h-4" />
          </Button>
       </div>
    </div>
  );
}