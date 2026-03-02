import { useState, useEffect } from "react";
import {
  PlayCircle, Monitor, Settings2, FileText,
  Volume2, MousePointer2, Clock, Zap,
  FolderOpen, Shield, Power, Moon, Sun,
  RotateCw, Copy, Trash2, Download, RefreshCw,
  Speaker, Activity, AlertCircle, Link,
  Camera, EyeOff, FileImage, CheckCircle2,
  Check, Filter,  XCircle, Save, Square
} from "lucide-react";

import { LogEntry } from "@/types";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/components/theme-provider";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"


import { toast } from "sonner";
import { stopWallpaper } from "@/api/wallpaper";

// 定义 4 大黄金分组
type SettingsTab = "playback" | "display" | "system" | "logs";

export function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("playback");

  // --- 全局操作处理 (占位逻辑) ---
  const handleSave = () => {
    // 未来这里会调用 Store 的 saveSettings
    toast.success("Settings saved successfully");
  };

  const handleReload = () => {
    // 未来这里调用 restart_wallpapers
    toast.info("Reloading wallpapers...");
  };

  const handleStop = async () => {
    try {
      await stopWallpaper();
      toast.success("Wallpaper stopped");
    } catch (e) {
      toast.error("Failed to stop wallpaper");
    }
  };

  return (
    <div className="flex h-full w-full bg-background text-foreground rounded-xl overflow-hidden border">

      {/* 1. 左侧导航栏 - 黄金分组 */}
      <aside className="w-64 border-r bg-muted/30 flex flex-col">
        {/* 标题 */}
        <div className="p-6">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Settings2 className="w-6 h-6" /> Settings
          </h2>
        </div>

        {/* 导航按钮 (添加 flex-1 让它占据剩余空间，把底部按钮顶下去) */}
        <div className="px-3 space-y-1 flex-1">
          <NavButton
            active={activeTab === "playback"}
            onClick={() => setActiveTab("playback")}
            icon={<PlayCircle className="w-4 h-4" />}
            label="Playback & Perf"
            desc="FPS, Cycling, Interaction"
          />
          <NavButton
            active={activeTab === "display"}
            onClick={() => setActiveTab("display")}
            icon={<Monitor className="w-4 h-4" />}
            label="Audio & Display"
            desc="Monitor, Theme, Volume"
          />
          <NavButton
            active={activeTab === "system"}
            onClick={() => setActiveTab("system")}
            icon={<Zap className="w-4 h-4" />}
            label="System & Tools"
            desc="Paths, Root, Autostart"
          />
          <NavButton
            active={activeTab === "logs"}
            onClick={() => setActiveTab("logs")}
            icon={<FileText className="w-4 h-4" />}
            label="Log Monitor"
            desc="Debug & Filters"
          />
        </div>

        {/* 👇 新增：底部全局操作栏 (Global Actions) */}
        <div className="p-4 border-t bg-background/50 space-y-3 backdrop-blur-sm">
          <Button className="w-full gap-2 font-bold shadow-lg shadow-primary/20" onClick={handleSave}>
            <Save className="w-4 h-4" /> Save Changes
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={handleReload}>
              <RotateCw className="w-3 h-3" /> Reload
            </Button>
            <Button variant="outline" size="sm" className="gap-2 text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={handleStop}>
              <Square className="w-3 h-3 fill-current" /> Stop
            </Button>
          </div>
        </div>
      </aside>

      {/* 2. 右侧内容区 */}
      <ScrollArea className="flex-1 bg-card/10">
        <div className="p-8 max-w-4xl space-y-8 pb-20">
          {activeTab === "playback" && <PlaybackSettings />}
          {activeTab === "display" && <DisplaySettings />}
          {activeTab === "system" && <SystemSettings />}
          {activeTab === "logs" && <LogViewer />}
        </div>
      </ScrollArea>
    </div>
  );
}

// ================= 子页面组件 =================

// Group 1: 播放与性能
function PlaybackSettings() {
  // 模拟本地状态 (真实开发时应从 useAppStore 获取)
  const [fps, setFps] = useState([30]);
  const [cycleEnabled, setCycleEnabled] = useState(false);

  return (
    <div className="space-y-6">
      <Header
        title="Playback & Performance"
        desc="Fine-tune rendering quality, automation, and system integration."
      />

      {/* 1. 渲染与质量 (Rendering Quality) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-orange-500"/> Rendering Quality
          </CardTitle>
          <CardDescription>Optimize for battery life or visual fidelity.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* FPS Slider */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Target FPS Limit</Label>
              <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{fps[0]} FPS</span>
            </div>
            <Slider 
              value={fps} 
              onValueChange={setFps} 
              max={144} min={10} step={1} 
              className="py-2"
            />
          </div>

          <Separator />

          {/* 特效开关组 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Disable Parallax</Label>
                <p className="text-xs text-muted-foreground">Stop mouse movement effects</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Disable Particles</Label>
                <p className="text-xs text-muted-foreground">Turn off rain/fire effects</p>
              </div>
              <Switch />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. 显示行为 (Display Behavior) */}
      <Card>
        <CardHeader>
          <CardTitle>Display Behavior</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 缩放与夹持 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Scaling Mode</Label>
              <Select defaultValue="default">
                <SelectTrigger>
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="stretch">Stretch (Fill Screen)</SelectItem>
                  <SelectItem value="fit">Fit (Keep Aspect)</SelectItem>
                  <SelectItem value="fill">Fill (Crop)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Texture Clamping</Label>
              <Select defaultValue="clamp">
                <SelectTrigger>
                  <SelectValue placeholder="Select clamping" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clamp">Clamp (Edge)</SelectItem>
                  <SelectItem value="border">Border (Black)</SelectItem>
                  <SelectItem value="repeat">Repeat (Tile)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* 全屏暂停与鼠标交互 */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>No Fullscreen Pause</Label>
              <p className="text-xs text-muted-foreground">Keep playing even when games are open</p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MousePointer2 className="w-4 h-4 text-muted-foreground" />
              <div className="space-y-0.5">
                <Label>Disable Mouse Interaction</Label>
                <p className="text-xs text-muted-foreground">Ignore all mouse clicks and movements</p>
              </div>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* 3. 播放列表与循环 (Playlist & Automation) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500"/> Playlist Automation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Enable Auto-Cycle</Label>
              <p className="text-xs text-muted-foreground">Automatically switch wallpapers</p>
            </div>
            <Switch 
              checked={cycleEnabled} 
              onCheckedChange={setCycleEnabled}
            />
          </div>

          {cycleEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 animate-in fade-in slide-in-from-top-2">
              <div className="space-y-2">
                <Label>Cycle Interval (minutes)</Label>
                <Input type="number" min={1} defaultValue={15} />
              </div>
              <div className="space-y-2">
                <Label>Cycle Order</Label>
                <Select defaultValue="random">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="random">Random Shuffle</SelectItem>
                    <SelectItem value="title">Title (A-Z)</SelectItem>
                    <SelectItem value="size">Size (Smallest)</SelectItem>
                    <SelectItem value="size_desc">Size (Largest)</SelectItem>
                    <SelectItem value="type">Type</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 4. Wayland 特调 (Wayland Tweaks) */}
      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Wayland Tweaks</span>
            {/* 模拟 Session 检测 */}
            <Badge variant="outline" className="text-xs font-normal border-blue-500/30 text-blue-500">
              Wayland Detected
            </Badge>
          </CardTitle>
          <CardDescription>Advanced settings for Wayland compositors.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Pause Only When Active</Label>
              <p className="text-xs text-muted-foreground">Only pause if the fullscreen app is focused</p>
            </div>
            <Switch />
          </div>
          
          <div className="space-y-2">
            <Label>Ignore Application IDs</Label>
            <Input placeholder="e.g. dock, bar, launcher (comma separated)" />
            <p className="text-[10px] text-muted-foreground">Prevent these apps from triggering fullscreen pause.</p>
          </div>
        </CardContent>
      </Card>

      {/* 底部按钮 */}
      <Card>
        <CardContent className="pt-6 flex justify-between items-center">
           <div>
              <Label>Wallpaper Nicknames</Label>
              <p className="text-xs text-muted-foreground">Set custom names for ID-based wallpapers</p>
           </div>
           <Button variant="outline">Manage Nicknames</Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Group 2: 音频与显示
function DisplaySettings() {
  const { theme, setTheme } = useTheme();
  // 模拟状态
  const [vol, setVol] = useState([50]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshScreens = () => {
    setIsRefreshing(true);
    // 模拟刷新过程
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="space-y-6">
      <Header 
        title="Audio & Display" 
        desc="Manage multi-monitor setup and advanced audio processing." 
      />

      {/* 1. 显示输出 (Display Output) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-blue-500"/> Display Output
          </CardTitle>
          <CardDescription>Select the target screen for wallpaper rendering.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Target Monitor</Label>
              {/* 刷新按钮 (原版功能: Refresh Screens) */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRefreshScreens}
                className="h-6 px-2 text-xs text-muted-foreground hover:text-primary gap-1"
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`} />
                {isRefreshing ? "Detecting..." : "Refresh List"}
              </Button>
            </div>
            
            <Select defaultValue="all">
              <SelectTrigger>
                <SelectValue placeholder="Select monitor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Monitors (Span)</SelectItem>
                <SelectItem value="0">Display 0 (1920x1080 @ 60Hz)</SelectItem>
                <SelectItem value="1">Display 1 (2560x1440 @ 144Hz)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground">
              Tip: Click refresh if you recently connected a new display.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 2. 音频控制 (Audio Control) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-green-500"/> Audio Control
          </CardTitle>
          <CardDescription>Global volume and processing settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* 主音量 */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Master Volume</Label>
              <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{vol[0]}%</span>
            </div>
            <Slider value={vol} onValueChange={setVol} max={100} step={1} className="py-2" />
          </div>

          <Separator />

          {/* 静音开关 (Silence Wallpaper) - 默认 True */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Speaker className="w-4 h-4 text-muted-foreground" />
              <div className="space-y-0.5">
                <Label>Silence Wallpaper</Label>
                <p className="text-xs text-muted-foreground">Mute all audio output</p>
              </div>
            </div>
            <Switch defaultChecked /> 
          </div>

          {/* 高级音频选项 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* 禁用自动静音 (Disable Auto Mute) */}
            <div className="space-y-3 p-3 bg-muted/30 rounded-lg border border-transparent hover:border-border transition-colors">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Disable Auto Mute</Label>
                <Switch />
              </div>
              <p className="text-[10px] text-muted-foreground leading-tight">
                Prevent muting when other apps play sound.
              </p>
            </div>

            {/* 禁用音频处理 (Disable Audio Processing) */}
            <div className="space-y-3 p-3 bg-muted/30 rounded-lg border border-transparent hover:border-border transition-colors">
              <div className="flex items-center justify-between">
                <Label className="text-sm">No Audio Processing</Label>
                <Switch />
              </div>
              <p className="text-[10px] text-muted-foreground leading-tight">
                Disable spectrum analysis to save CPU.
              </p>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* 3. 界面外观 (Interface Theme - 新版特性) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
             {theme === 'dark' ? <Moon className="w-4 h-4"/> : <Sun className="w-4 h-4"/>} 
             Interface Theme
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between space-x-4">
            <div className="flex flex-col space-y-1">
              <Label>App Appearance</Label>
              <p className="text-xs text-muted-foreground">Light or Dark mode</p>
            </div>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Group 3: 系统与工具
function SystemSettings() {
  // 模拟状态 (实际应从 Store 获取)
  const [xvfbInstalled] = useState(true); // 假设后端检测到了 xvfb
  const [scDelay, setScDelay] = useState(20);
  const [scRes, setScRes] = useState("3840x2160");

  const handleCreateShortcut = () => {
    // 调用后端 create_desktop_entry
    console.log("Creating desktop shortcut...");
  };

  return (
    <div className="space-y-6">
      <Header 
        title="System & Tools" 
        desc="Manage directories, system integration and screenshot utilities." 
      />

      {/* 1. 路径配置 (Paths & Storage) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-yellow-500"/> Directories
          </CardTitle>
          <CardDescription>Configure where wallpapers and assets are stored.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Workshop Path */}
          <div className="space-y-2">
            <Label>Steam Workshop Path</Label>
            <div className="flex space-x-2">
              <Input placeholder="/home/user/.local/share/Steam/..." defaultValue="Auto-detected" />
              <Button variant="secondary" title="Browse Folder">
                <FolderOpen className="w-4 h-4"/>
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Changing this triggers an immediate library scan.
            </p>
          </div>

          {/* Assets Path */}
          <div className="space-y-2">
            <Label>Assets Directory (Optional)</Label>
            <div className="flex space-x-2">
              <Input placeholder="Leave empty to auto-detect" />
              <Button variant="secondary" title="Browse Folder">
                <FolderOpen className="w-4 h-4"/>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. 系统集成 (Startup & Integration) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Power className="w-4 h-4 text-purple-500"/> Startup & Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* 开机自启 */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Run on Startup</Label>
              <p className="text-xs text-muted-foreground">Launch automatically on system login</p>
            </div>
            <Switch defaultChecked />
          </div>

          {/* 启动时最小化 (Start Hidden) */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-muted-foreground" />
              <div className="space-y-0.5">
                <Label>Start Hidden</Label>
                <p className="text-xs text-muted-foreground">Minimize to tray on launch</p>
              </div>
            </div>
            <Switch defaultChecked />
          </div>

          <Separator />

          {/* 创建桌面快捷方式 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link className="w-4 h-4 text-muted-foreground" />
              <div className="space-y-0.5">
                <Label>Desktop Shortcut</Label>
                <p className="text-xs text-muted-foreground">Create a launcher entry for your desktop</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleCreateShortcut}>
              Create Shortcut
            </Button>
          </div>
          
          {/* Root 权限 (保留项) */}
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-red-500" />
              <div className="space-y-0.5">
                <Label>Run as Root</Label>
                <p className="text-xs text-muted-foreground">Not recommended unless necessary</p>
              </div>
            </div>
            <Switch />
          </div>

        </CardContent>
      </Card>

      {/* 3. 截图工具 (Screenshot Tools) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
               <Camera className="w-4 h-4 text-pink-500"/> Screenshot Tools
            </div>
            {/* 后端状态检测: Capture Backend */}
            <Badge variant={xvfbInstalled ? "default" : "destructive"} className="gap-1 font-normal">
              {xvfbInstalled ? <CheckCircle2 className="w-3 h-3"/> : <XCircle className="w-3 h-3"/>}
              {xvfbInstalled ? "Xvfb Detected" : "Window Mode Only"}
            </Badge>
          </CardTitle>
          <CardDescription>Configure the built-in wallpaper capture utility.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* 延迟与分辨率 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <div className="flex justify-between">
                   <Label>Capture Delay</Label>
                   <span className="text-xs text-muted-foreground">{scDelay} frames</span>
                </div>
                {/* 1-600 帧 */}
                <Slider 
                  value={[scDelay]} 
                  onValueChange={(v) => setScDelay(v[0])} 
                  max={600} min={1} step={1} 
                />
                <p className="text-[10px] text-muted-foreground">Wait for web wallpapers to load.</p>
             </div>

             <div className="space-y-2">
                <Label className="flex items-center gap-2"><FileImage className="w-3 h-3"/> Target Resolution</Label>
                <Input 
                   value={scRes} 
                   onChange={(e) => setScRes(e.target.value)} 
                   placeholder="e.g. 1920x1080" 
                />
             </div>
          </div>

          <Separator />

          {/* 优先静默捕获 (Prefer Silent Capture) */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Prefer Silent Capture (Xvfb)</Label>
              <p className="text-xs text-muted-foreground">
                Capture in background without showing a window.
              </p>
            </div>
            <Switch 
              defaultChecked 
              disabled={!xvfbInstalled} // 如果没装 xvfb，直接禁用
              title={!xvfbInstalled ? "Xvfb not installed" : ""}
            />
          </div>

        </CardContent>
      </Card>
    </div>
  );
}

// Group 4: 日志监控
function LogViewer() {
  // 1. 状态管理
  const [filter, setFilter] = useState<string>("All");
  const [isCopied, setIsCopied] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  // 模拟初始化加载一些日志
  useEffect(() => {
    const mockLogs: LogEntry[] = [
      { id: 1, timestamp: "10:00:01", level: "info", source: "GUI", message: "Application initialized" },
      { id: 2, timestamp: "10:00:02", level: "info", source: "Core", message: "Connected to Wallpaper Engine Core" },
      { id: 3, timestamp: "10:00:02", level: "warn", source: "Controller", message: "Steam API not detected, using local mode" },
      { id: 4, timestamp: "10:05:23", level: "info", source: "Engine", message: "Rendering pipeline started" },
      { id: 5, timestamp: "10:05:24", level: "error", source: "GUI", message: "Failed to load thumbnail: 404 Not Found" },
    ];
    setLogs(mockLogs);
  }, []);

  // 2. 过滤逻辑
  const filteredLogs = logs.filter(log => {
    if (filter === "All") return true;
    // 原版逻辑：选 GUI 时只看 GUI (即排除 Controller/Engine)
    // 这里简化为直接匹配 source，效果是一样的
    return log.source === filter;
  });

  // 3. 颜色映射 (Hex -> Tailwind 类)
  const getLevelColor = (level: string) => {
    switch (level) {
      case "info": return "text-blue-500";    // #3b82f6
      case "warn": return "text-amber-500";   // #f59e0b
      case "error": return "text-red-500";    // #ef4444
      default: return "text-gray-400";
    }
  };

  // 4. 操作处理
  const handleCopy = () => {
    const text = filteredLogs.map(l => `[${l.timestamp}] [${l.level.toUpperCase()}] [${l.source}] ${l.message}`).join("\n");
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000); // 2秒后恢复
  };

  const handleClear = () => setLogs([]);
  
  const handleRefresh = () => {
    // 模拟刷新：加一条新日志
    const newLog: LogEntry = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      level: "info",
      source: "GUI",
      message: "Manual refresh triggered."
    };
    setLogs(prev => [...prev, newLog]);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* 顶部栏：标题与过滤器 */}
      <div className="flex items-center justify-between">
        <Header 
          title="Log Monitor" 
          desc="Real-time debug information and system events." 
        />
        
        <div className="flex items-center gap-2">
           <Filter className="w-4 h-4 text-muted-foreground" />
           <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <SelectValue placeholder="Filter Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Sources</SelectItem>
                <SelectItem value="GUI">GUI Only</SelectItem>
                <SelectItem value="Core">Core Only</SelectItem>
                <SelectItem value="Engine">Engine Only</SelectItem>
                <SelectItem value="Controller">Controller Only</SelectItem>
              </SelectContent>
            </Select>
        </div>
      </div>

      {/* 核心：日志视图 (Monospace Terminal) */}
      <div className="flex-1 rounded-lg border bg-[#0f0f12] font-mono text-xs overflow-hidden flex flex-col shadow-inner select-text">
        {/* 终端头部 */}
        <div className="px-4 py-2 border-b border-white/5 bg-white/5 flex gap-4 text-muted-foreground/50 text-[10px] uppercase tracking-wider font-semibold">
            <span className="w-16">Time</span>
            <span className="w-10">Level</span>
            <span className="w-20">Source</span>
            <span className="flex-1">Message</span>
        </div>

        {/* 滚动区域 */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-1">
            {filteredLogs.length === 0 ? (
              <div className="text-muted-foreground/30 italic text-center py-10">No logs to display.</div>
            ) : (
              filteredLogs.map((log) => (
                <div key={log.id} className="flex gap-4 hover:bg-white/5 px-2 py-0.5 rounded transition-colors group">
                  {/* Time: #6b7280 */}
                  <span className="text-gray-500 w-16 shrink-0">{log.timestamp}</span>
                  
                  {/* Level (Colored) */}
                  <span className={`w-10 shrink-0 font-bold ${getLevelColor(log.level)}`}>
                    {log.level.toUpperCase()}
                  </span>
                  
                  {/* Source: #a855f7 */}
                  <span className="text-purple-500 w-20 shrink-0 truncate" title={log.source}>
                    [{log.source}]
                  </span>
                  
                  {/* Message: #e5e7eb */}
                  <span className="text-gray-200 flex-1 break-all whitespace-pre-wrap">
                    {log.message}
                  </span>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* 底部操作栏 */}
      <div className="flex justify-between items-center pt-2">
         {/* 状态指示 */}
         <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>Live Monitoring</span>
            <span className="mx-1">•</span>
            <span>{filteredLogs.length} entries</span>
         </div>

         {/* 按钮组 */}
         <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} className="h-8 gap-2 text-xs">
              <RotateCw className="w-3 h-3"/> Refresh
            </Button>
            
            <Button variant="outline" size="sm" onClick={handleCopy} className="h-8 gap-2 text-xs min-w-[80px]">
              {isCopied ? <Check className="w-3 h-3 text-green-500"/> : <Copy className="w-3 h-3"/>}
              {isCopied ? "Copied!" : "Copy"}
            </Button>
            
            <Button variant="outline" size="sm" onClick={handleClear} className="h-8 gap-2 text-xs hover:text-red-400 hover:border-red-400/50 transition-colors">
              <Trash2 className="w-3 h-3"/> Clear
            </Button>
            
            <Separator orientation="vertical" className="h-8 mx-1" />
            
            <Button size="sm" className="h-8 gap-2 text-xs bg-primary/80 hover:bg-primary">
              <Download className="w-3 h-3"/> Export
            </Button>
         </div>
      </div>
    </div>
  );
}

// --- 辅助组件 ---

function Header({ title, desc }: { title: string, desc: string }) {
  return (
    <div>
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="text-sm text-muted-foreground">{desc}</p>
      <Separator className="mt-4" />
    </div>
  );
}

function NavButton({ active, onClick, icon, label, desc }: any) {
  return (
    <Button
      variant={active ? "secondary" : "ghost"}
      className={`w-full justify-start h-auto py-3 px-4 mb-1 transition-all ${active ? 'bg-secondary shadow-sm' : ''}`}
      onClick={onClick}
    >
      <div className={`mr-3 p-2 rounded-md ${active ? 'bg-background text-primary' : 'bg-muted text-muted-foreground'}`}>
        {icon}
      </div>
      <div className="text-left flex-1 min-w-0">
        <div className={`font-medium ${active ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</div>
        <div className="text-xs text-muted-foreground truncate opacity-70">{desc}</div>
      </div>
    </Button>
  );
}