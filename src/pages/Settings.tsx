import { useState } from "react";
import { 
  Monitor, Volume2, Cpu, FileText, 
  Layout, MousePointer2, Zap, FolderOpen, Shield 
} from "lucide-react";

// 1. 引入官方 Shadcn 组件
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// 定义子页面枚举
type SettingsTab = "general" | "audio" | "advanced" | "logs";

export function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

  return (
    <div className="flex h-full w-full bg-background text-foreground animate-in fade-in duration-300 rounded-xl overflow-hidden border border-border">
      
      {/* 1. 左侧导航 (使用 Sidebar 风格) */}
      <aside className="w-64 border-r bg-muted/30 p-4 flex flex-col gap-2">
        <h2 className="text-2xl font-bold px-4 mb-4 mt-2 tracking-tight">Settings</h2>
        
        <NavButton 
          active={activeTab === "general"} 
          onClick={() => setActiveTab("general")}
          icon={<Monitor className="w-4 h-4" />}
          label="General"
        />
        <NavButton 
          active={activeTab === "audio"} 
          onClick={() => setActiveTab("audio")}
          icon={<Volume2 className="w-4 h-4" />}
          label="Audio"
        />
        <NavButton 
          active={activeTab === "advanced"} 
          onClick={() => setActiveTab("advanced")}
          icon={<Cpu className="w-4 h-4" />}
          label="Advanced"
        />
        <NavButton 
          active={activeTab === "logs"} 
          onClick={() => setActiveTab("logs")}
          icon={<FileText className="w-4 h-4" />}
          label="Logs"
        />
      </aside>

      {/* 2. 右侧内容 (使用 ScrollArea 替换 overflow-auto) */}
      <ScrollArea className="flex-1">
        <div className="p-8 max-w-4xl space-y-8">
          {activeTab === "general" && <GeneralSettings />}
          {activeTab === "audio" && <AudioSettings />}
          {activeTab === "advanced" && <AdvancedSettings />}
          {activeTab === "logs" && <LogViewer />}
        </div>
      </ScrollArea>
    </div>
  );
}

// --- 子页面组件 ---

function GeneralSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">General</h3>
        <p className="text-sm text-muted-foreground">Configure basic behavior and appearance.</p>
      </div>
      <Separator />
      
      {/* 使用 Card 分组 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">System Behavior</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Setting Row: Switch */}
          <div className="flex items-center justify-between space-x-4">
            <div className="flex flex-col space-y-1">
              <Label className="text-base">Start with System</Label>
              <span className="text-sm text-muted-foreground">Launch automatically on login</span>
            </div>
            <Switch defaultChecked />
          </div>

          <Separator />

          {/* Setting Row: Select (Dropdown) */}
          <div className="flex items-center justify-between space-x-4">
            <div className="flex flex-col space-y-1">
              <Label className="text-base">Scaling Mode</Label>
              <span className="text-sm text-muted-foreground">How wallpapers fit your screen</span>
            </div>
            <Select defaultValue="cover">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cover">Cover</SelectItem>
                <SelectItem value="contain">Contain</SelectItem>
                <SelectItem value="stretch">Stretch</SelectItem>
              </SelectContent>
            </Select>
          </div>

        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Interaction</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4">
              <MousePointer2 className="w-5 h-5 text-muted-foreground" />
              <div className="flex flex-col space-y-1">
                <Label className="text-base">Disable Mouse</Label>
                <span className="text-sm text-muted-foreground">Ignore mouse interaction on wallpapers</span>
              </div>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between space-x-4">
             <div className="flex flex-col space-y-1">
                <Label className="text-base">Pause when Fullscreen</Label>
                <span className="text-sm text-muted-foreground">Stop playback when games are active</span>
              </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AudioSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Audio</h3>
        <p className="text-sm text-muted-foreground">Control wallpaper sound output.</p>
      </div>
      <Separator />

      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="flex items-center justify-between space-x-4">
            <Label className="text-base">Mute Wallpapers</Label>
            <Switch />
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <div className="flex justify-between">
              <Label className="text-base">Master Volume</Label>
              <span className="text-sm text-muted-foreground">50%</span>
            </div>
            {/* 使用官方 Slider 组件 */}
            <Slider defaultValue={[50]} max={100} step={1} className="w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AdvancedSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Advanced</h3>
        <p className="text-sm text-muted-foreground">System paths and developer options.</p>
      </div>
      <Separator />
      
      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-2">
            <Label>Workshop Directory</Label>
            <div className="flex w-full items-center space-x-2">
              <Input type="text" placeholder="/home/user/.local/share/Steam/..." disabled />
              <Button variant="secondary">Browse...</Button>
            </div>
            <p className="text-xs text-muted-foreground">Path to Steam Workshop content (431960)</p>
          </div>

          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4">
              <Shield className="w-5 h-5 text-destructive" />
              <div className="flex flex-col space-y-1">
                <Label className="text-base">Run as Root</Label>
                <span className="text-sm text-muted-foreground">Allow running backend with elevated privileges</span>
              </div>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function LogViewer() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">System Logs</h3>
        <p className="text-sm text-muted-foreground">View backend and UI logs for debugging.</p>
      </div>
      <div className="rounded-md border bg-black/50 p-4 h-[400px] overflow-y-auto font-mono text-xs text-muted-foreground">
        <p className="text-green-500">[INFO] Application started version 2.0.0</p>
        <p className="text-blue-500">[INFO] Loaded 20 wallpapers from mock data</p>
        <p>[DEBUG] Initializing IPC bridge...</p>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline">Clear Logs</Button>
        <Button>Copy to Clipboard</Button>
      </div>
    </div>
  );
}

// 辅助组件：导航按钮 (使用官方 Button 改装)
function NavButton({ active, onClick, icon, label }: any) {
  return (
    <Button
      variant={active ? "secondary" : "ghost"}
      className="w-full justify-start gap-3"
      onClick={onClick}
    >
      {icon}
      {label}
    </Button>
  );
}