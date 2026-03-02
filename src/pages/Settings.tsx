import { useState, useEffect } from "react";
import {
  PlayCircle, Monitor, Settings2, FileText,
  Volume2, MousePointer2, Clock, Zap,
  FolderOpen, Power, Moon, Sun,
  RotateCw, Copy,
  Speaker, EyeOff, FileImage,
  Check, Filter, Save, Square
} from "lucide-react";

import { LogEntry } from "@/types";
import { useAppStore } from "@/store/appStore";

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

import { toast } from "sonner";
import { stopWallpaper } from "@/api/wallpaper";
import { invoke } from "@tauri-apps/api/core";

type SettingsTab = "playback" | "display" | "system" | "logs";

export function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("playback");
  const { settings, fetchSettings, saveSettings, restartWallpapers, settingsLoading } = useAppStore();

  useEffect(() => {
    if (!settings) {
      fetchSettings().catch(() => toast.error("Failed to load settings"));
    }
  }, [settings, fetchSettings]);

  const handleSave = async () => {
    try {
      await saveSettings();
      toast.success("Settings saved successfully");
    } catch (e) {
      toast.error("Failed to save settings");
    }
  };

  const handleReload = async () => {
    try {
      await restartWallpapers();
      toast.success("Wallpapers reloaded");
    } catch (e) {
      toast.error("Failed to reload wallpapers");
    }
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
      <aside className="w-64 border-r bg-muted/30 flex flex-col">
        <div className="p-6">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Settings2 className="w-6 h-6" /> Settings
          </h2>
        </div>
        <div className="px-3 space-y-1 flex-1">
          <NavButton active={activeTab === "playback"} onClick={() => setActiveTab("playback")} icon={<PlayCircle className="w-4 h-4" />} label="Playback & Perf" desc="FPS, Cycling, Interaction" />
          <NavButton active={activeTab === "display"} onClick={() => setActiveTab("display")} icon={<Monitor className="w-4 h-4" />} label="Audio & Display" desc="Monitor, Theme, Volume" />
          <NavButton active={activeTab === "system"} onClick={() => setActiveTab("system")} icon={<Zap className="w-4 h-4" />} label="System & Tools" desc="Paths, Root, Autostart" />
          <NavButton active={activeTab === "logs"} onClick={() => setActiveTab("logs")} icon={<FileText className="w-4 h-4" />} label="Log Monitor" desc="Debug & Filters" />
        </div>
        <div className="p-4 border-t bg-background/50 space-y-3 backdrop-blur-sm">
          <Button className="w-full gap-2 font-bold shadow-lg shadow-primary/20" onClick={handleSave} disabled={settingsLoading}>
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

function PlaybackSettings() {
  const { settings, updateSetting } = useAppStore();
  if (!settings) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <Header title="Playback & Performance" desc="Fine-tune rendering quality, automation, and system integration." />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Zap className="w-4 h-4 text-orange-500"/> Rendering Quality</CardTitle>
          <CardDescription>Optimize for battery life or visual fidelity.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Target FPS Limit</Label>
              <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{settings.fps} FPS</span>
            </div>
            <Slider value={[settings.fps]} onValueChange={(v) => updateSetting('fps', v[0])} max={144} min={10} step={1} className="py-2" />
          </div>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5"><Label>Disable Parallax</Label><p className="text-xs text-muted-foreground">Stop mouse movement effects</p></div>
              <Switch checked={settings.disableParallax} onCheckedChange={(v) => updateSetting('disableParallax', v)} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5"><Label>Disable Particles</Label><p className="text-xs text-muted-foreground">Turn off rain/fire effects</p></div>
              <Switch checked={settings.disableParticles} onCheckedChange={(v) => updateSetting('disableParticles', v)} />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Display Behavior</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Scaling Mode</Label>
              <Select value={settings.scaling} onValueChange={(v) => updateSetting('scaling', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="stretch">Stretch</SelectItem>
                  <SelectItem value="fit">Fit</SelectItem>
                  <SelectItem value="fill">Fill</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Texture Clamping</Label>
              <Select value={settings.clamping} onValueChange={(v) => updateSetting('clamping', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="clamp">Clamp</SelectItem>
                  <SelectItem value="border">Border</SelectItem>
                  <SelectItem value="repeat">Repeat</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5"><Label>No Fullscreen Pause</Label><p className="text-xs text-muted-foreground">Keep playing when games open</p></div>
            <Switch checked={settings.noFullscreenPause} onCheckedChange={(v) => updateSetting('noFullscreenPause', v)} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><MousePointer2 className="w-4 h-4 text-muted-foreground" /><div className="space-y-0.5"><Label>Disable Mouse Interaction</Label><p className="text-xs text-muted-foreground">Ignore mouse clicks</p></div></div>
            <Switch checked={settings.disableMouse} onCheckedChange={(v) => updateSetting('disableMouse', v)} />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="w-4 h-4 text-blue-500"/> Playlist Automation</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5"><Label className="text-base">Enable Auto-Cycle</Label><p className="text-xs text-muted-foreground">Automatically switch wallpapers</p></div>
            <Switch checked={settings.cycleEnabled} onCheckedChange={(v) => updateSetting('cycleEnabled', v)} />
          </div>
          {settings.cycleEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <Label>Cycle Interval (minutes)</Label>
                <Input type="number" min={1} value={settings.cycleInterval} onChange={(e) => updateSetting('cycleInterval', parseInt(e.target.value) || 15)} />
              </div>
              <div className="space-y-2">
                <Label>Cycle Order</Label>
                <Select value={settings.cycleOrder} onValueChange={(v) => updateSetting('cycleOrder', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="random">Random</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="size">Size</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardHeader><CardTitle className="flex items-center justify-between"><span>Wayland Tweaks</span><Badge variant="outline" className="text-xs font-normal border-blue-500/30 text-blue-500">Wayland</Badge></CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5"><Label>Pause Only When Active</Label><p className="text-xs text-muted-foreground">Only pause if app is focused</p></div>
            <Switch checked={settings.waylandOnlyActive} onCheckedChange={(v) => updateSetting('waylandOnlyActive', v)} />
          </div>
          <div className="space-y-2">
            <Label>Ignore Application IDs</Label>
            <Input placeholder="dock, bar, launcher..." value={settings.waylandIgnoreAppids} onChange={(e) => updateSetting('waylandIgnoreAppids', e.target.value)} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DisplaySettings() {
  const { theme, setTheme } = useTheme();
  const { settings, updateSetting } = useAppStore();
  if (!settings) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <Header title="Audio & Display" desc="Manage multi-monitor setup and audio processing." />
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Monitor className="w-4 h-4 text-blue-500"/> Display Output</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Target Monitor</Label>
            <Select value={settings.lastScreen || "all"} onValueChange={(v) => updateSetting('lastScreen', v === "all" ? null : v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Monitors</SelectItem>
                <SelectItem value="eDP-1">eDP-1</SelectItem>
                <SelectItem value="HDMI-1">HDMI-1</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Volume2 className="w-4 h-4 text-green-500"/> Audio Control</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Master Volume</Label>
              <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{settings.volume}%</span>
            </div>
            <Slider value={[settings.volume]} onValueChange={(v) => updateSetting('volume', v[0])} max={100} step={1} className="py-2" />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><Speaker className="w-4 h-4 text-muted-foreground" /><div className="space-y-0.5"><Label>Mute Audio</Label><p className="text-xs text-muted-foreground">Mute all audio</p></div></div>
            <Switch checked={settings.muteAudio} onCheckedChange={(v) => updateSetting('muteAudio', v)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between"><Label className="text-sm">Disable Auto Mute</Label><Switch checked={settings.noAutomute} onCheckedChange={(v) => updateSetting('noAutomute', v)} /></div>
              <p className="text-[10px] text-muted-foreground">Prevent muting when other apps play sound</p>
            </div>
            <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between"><Label className="text-sm">No Audio Processing</Label><Switch checked={settings.noAudioProcessing} onCheckedChange={(v) => updateSetting('noAudioProcessing', v)} /></div>
              <p className="text-[10px] text-muted-foreground">Disable spectrum analysis</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2">{theme === 'dark' ? <Moon className="w-4 h-4"/> : <Sun className="w-4 h-4"/>} Interface Theme</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between space-x-4">
            <div className="flex flex-col space-y-1"><Label>App Appearance</Label><p className="text-xs text-muted-foreground">Light or Dark mode</p></div>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
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

function SystemSettings() {
  const { settings, updateSetting } = useAppStore();
  const [autostart, setAutostart] = useState(false);
  const [startHidden, setStartHidden] = useState(false);

  useEffect(() => {
    invoke<boolean>('get_autostart_status').then(setAutostart).catch(() => {});
  }, []);

  const handleAutostartChange = async (enabled: boolean) => {
    try {
      await invoke('set_autostart', { enabled, hidden: startHidden });
      setAutostart(enabled);
      toast.success(enabled ? "Autostart enabled" : "Autostart disabled");
    } catch (e) {
      toast.error("Failed to change autostart");
    }
  };

  if (!settings) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <Header title="System & Tools" desc="Manage directories and screenshot utilities." />
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><FolderOpen className="w-4 h-4 text-yellow-500"/> Directories</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Steam Workshop Path</Label>
            <div className="flex space-x-2">
              <Input placeholder="/home/user/.local/share/Steam/..." value={settings.workshopPath || ""} onChange={(e) => updateSetting('workshopPath', e.target.value || null)} />
              <Button variant="secondary"><FolderOpen className="w-4 h-4"/></Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Assets Directory (Optional)</Label>
            <div className="flex space-x-2">
              <Input placeholder="Leave empty to auto-detect" value={settings.assetsPath || ""} onChange={(e) => updateSetting('assetsPath', e.target.value || null)} />
              <Button variant="secondary"><FolderOpen className="w-4 h-4"/></Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Power className="w-4 h-4 text-purple-500"/> Startup & Integration</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5"><Label>Run on Startup</Label><p className="text-xs text-muted-foreground">Launch automatically on login</p></div>
            <Switch checked={autostart} onCheckedChange={handleAutostartChange} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><EyeOff className="w-4 h-4 text-muted-foreground" /><div className="space-y-0.5"><Label>Start Hidden</Label><p className="text-xs text-muted-foreground">Minimize to tray on launch</p></div></div>
            <Switch checked={startHidden} onCheckedChange={setStartHidden} />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><FileImage className="w-4 h-4 text-pink-500"/> Screenshot Tools</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between"><Label>Capture Delay</Label><span className="text-xs text-muted-foreground">{settings.screenshotDelay} frames</span></div>
              <Slider value={[settings.screenshotDelay]} onValueChange={(v) => updateSetting('screenshotDelay', v[0])} max={600} min={1} step={1} />
            </div>
            <div className="space-y-2">
              <Label>Target Resolution</Label>
              <Input value={settings.screenshotRes} onChange={(e) => updateSetting('screenshotRes', e.target.value)} placeholder="1920x1080" />
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5"><Label>Prefer Silent Capture (Xvfb)</Label><p className="text-xs text-muted-foreground">Capture in background</p></div>
            <Switch checked={settings.preferXvfb} onCheckedChange={(v) => updateSetting('preferXvfb', v)} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function LogViewer() {
  const [filter, setFilter] = useState<string>("All");
  const [isCopied, setIsCopied] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  useEffect(() => {
    setLogs([
      { id: 1, timestamp: "10:00:01", level: "info", source: "GUI", message: "Application initialized" },
      { id: 2, timestamp: "10:00:02", level: "info", source: "Core", message: "Connected to Wallpaper Engine Core" },
      { id: 3, timestamp: "10:00:02", level: "warn", source: "Controller", message: "Steam API not detected" },
    ]);
  }, []);

  const filteredLogs = logs.filter(log => filter === "All" || log.source === filter);
  const getLevelColor = (level: string) => level === "info" ? "text-blue-500" : level === "warn" ? "text-amber-500" : "text-red-500";
  const handleCopy = () => { navigator.clipboard.writeText(filteredLogs.map(l => `[${l.timestamp}] [${l.level.toUpperCase()}] [${l.source}] ${l.message}`).join("\n")); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <Header title="Log Monitor" desc="Real-time debug information." />
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Sources</SelectItem>
              <SelectItem value="GUI">GUI Only</SelectItem>
              <SelectItem value="Core">Core Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex-1 rounded-lg border bg-[#0f0f12] font-mono text-xs overflow-hidden flex flex-col">
        <ScrollArea className="flex-1 p-4">
          {filteredLogs.map((log) => (
            <div key={log.id} className="flex gap-4 py-0.5">
              <span className="text-gray-500 w-16">{log.timestamp}</span>
              <span className={`w-10 font-bold ${getLevelColor(log.level)}`}>{log.level.toUpperCase()}</span>
              <span className="text-purple-500 w-20">[{log.source}]</span>
              <span className="text-gray-200 flex-1">{log.message}</span>
            </div>
          ))}
        </ScrollArea>
      </div>
      <div className="flex justify-between items-center pt-2">
        <span className="text-[10px] text-muted-foreground">{filteredLogs.length} entries</span>
        <Button variant="outline" size="sm" onClick={handleCopy} className="h-8 gap-2 text-xs">
          {isCopied ? <Check className="w-3 h-3 text-green-500"/> : <Copy className="w-3 h-3"/>}
          {isCopied ? "Copied!" : "Copy"}
        </Button>
      </div>
    </div>
  );
}

function Header({ title, desc }: { title: string, desc: string }) {
  return (<div><h3 className="text-lg font-medium">{title}</h3><p className="text-sm text-muted-foreground">{desc}</p><Separator className="mt-4" /></div>);
}

function NavButton({ active, onClick, icon, label, desc }: any) {
  return (
    <Button variant={active ? "secondary" : "ghost"} className={`w-full justify-start h-auto py-3 px-4 mb-1 ${active ? 'bg-secondary shadow-sm' : ''}`} onClick={onClick}>
      <div className={`mr-3 p-2 rounded-md ${active ? 'bg-background text-primary' : 'bg-muted text-muted-foreground'}`}>{icon}</div>
      <div className="text-left flex-1 min-w-0">
        <div className={`font-medium ${active ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</div>
        <div className="text-xs text-muted-foreground truncate opacity-70">{desc}</div>
      </div>
    </Button>
  );
}
