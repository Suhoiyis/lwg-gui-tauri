import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Cpu, MemoryStick, Activity, Smartphone } from "lucide-react";

// Mock Data generation
const generateData = () => Array.from({ length: 30 }, (_, i) => ({
  time: i,
  cpu: Math.floor(Math.random() * 30) + 5,
  mem: 200 + Math.floor(Math.random() * 50),
}));

export function Performance() {
  const data = generateData();

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

        <h1 className="text-3xl font-bold">System Monitor</h1>

        {/* 1. 顶部数据卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Total CPU" value="12.5%" sub="4 Cores Active" icon={<Cpu className="text-primary" />} />
          <StatCard title="Memory Usage" value="807.1 MB" sub="of 32 GB" icon={<MemoryStick className="text-blue-400" />} />
          <StatCard title="Active Threads" value="31" sub="Across 3 processes" icon={<Activity className="text-green-400" />} />
        </div>

        {/* 2. 主图表 (Recharts) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Total CPU History" data={data} dataKey="cpu" color="#f87171" unit="%" />
          <ChartCard title="Total Memory History" data={data} dataKey="mem" color="#3b82f6" unit=" MB" />
        </div>

        {/* 3. 详细进程列表 (复刻原版 Process Details) */}
        <div>
          <h2 className="text-xl font-bold mb-4">Process Details</h2>
          <div className="space-y-4">
            <ProcessRow name="Frontend (GUI)" pid={5459} cpu="0.7%" mem="368.9 MB" status="Sleeping" />
            <ProcessRow name="Backend (Engine)" pid={2722} cpu="0.3%" mem="372.7 MB" status="Running" />
            <ProcessRow name="Tray Icon" pid={1233} cpu="0.1%" mem="65.4 MB" status="Sleeping" />
          </div>
        </div>

      </div>
  );
}

// --- 组件 ---

function StatCard({ title, value, sub, icon }: any) {
  return (
    <div className="bg-surface p-6 rounded-xl border border-white/5 flex flex-col justify-between hover:border-white/10 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <span className="text-gray-400 text-sm font-medium">{title}</span>
        <div className="p-2 bg-white/5 rounded-lg">{icon}</div>
      </div>
      <div>
        <div className="text-3xl font-bold text-white mb-1">{value}</div>
        <div className="text-xs text-gray-500">{sub}</div>
      </div>
    </div>
  );
}

function ChartCard({ title, data, dataKey, color, unit }: any) {
  return (
    <div className="bg-surface p-6 rounded-xl border border-white/5 shadow-lg">
      <h3 className="text-sm font-medium text-gray-400 mb-4">{title}</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`color${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
            <XAxis dataKey="time" hide />
            <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}`} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e1e2e', borderColor: '#313244', borderRadius: '8px', fontSize: '12px' }}
              itemStyle={{ color: '#cdd6f4' }}
              formatter={(val: any) => [`${val}${unit}`, title]}
            />
            <Area 
              type="monotone" 
              dataKey={dataKey} 
              stroke={color} 
              strokeWidth={2}
              fillOpacity={1} 
              fill={`url(#color${dataKey})`} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ProcessRow({ name, pid, cpu, mem, status }: any) {
  return (
    <div className="bg-surface p-4 rounded-xl border border-white/5 flex items-center justify-between group hover:border-primary/50 transition-all">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">
          <Smartphone size={20} className="text-gray-400 group-hover:text-primary transition-colors" />
        </div>
        <div>
          <div className="font-bold text-white">{name}</div>
          <div className="text-xs text-gray-500 font-mono">PID: {pid}</div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-12 text-right">
        <div>
          <div className="text-xs text-gray-500">CPU</div>
          <div className="font-mono text-green-400">{cpu}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Memory</div>
          <div className="font-mono text-blue-400">{mem}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Status</div>
          <div className="text-gray-300">{status}</div>
        </div>
      </div>
    </div>
  );
}