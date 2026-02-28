import { useState } from "react";
import { 
  Monitor, Volume2, Cpu, FileText, 
  MousePointer2, Shield, FolderOpen 
} from "lucide-react";

// 引入 Shadcn UI 组件
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Combobox } from "@/components/ui/combobox";
import { useTheme } from "@/components/theme-provider";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type SettingsTab = "general" | "audio" | "advanced" | "logs";

export function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

  return (
    <div className="flex h-full w-full bg-background text-foreground rounded-xl overflow-hidden border">
      
      {/* 左侧导航 */}
      <aside className="w-64 border-r bg-muted/30 flex flex-col">
        <div className="p-6">
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        </div>
        <div className="px-3 space-y-1">
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
        </div>
      </aside>

      {/* 右侧内容区 (使用 ScrollArea) */}
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
  // 模拟状态
  const [scaling, setScaling] = useState("cover");
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">General</h3>
        <p className="text-sm text-muted-foreground">Configure system behavior.</p>
      </div>
      <Separator />
      
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Theme Selector */}
          <div className="flex items-center justify-between space-x-4">
            <div className="flex flex-col space-y-1">
              <Label className="text-base">Theme</Label>
              <p className="text-sm text-muted-foreground">Select interface color scheme</p>
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

          <Separator />
          
          {/* ... 其他设置 (Start with System 等) ... */}
          
        </CardContent>
      </Card>


      <Card>
        <CardHeader>
          <CardTitle>System</CardTitle>
          <CardDescription>Manage how the application starts and behaves.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Start with System</Label>
              <p className="text-sm text-muted-foreground">Launch automatically on login</p>
            </div>
            <Switch defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Scaling Mode</Label>
              <p className="text-sm text-muted-foreground">How wallpapers fit your screen</p>
            </div>
            {/* 使用我们刚写的 Combobox */}
            <Combobox 
              value={scaling}
              onChange={setScaling}
              options={[
                { value: "cover", label: "Cover (Fill)" },
                { value: "contain", label: "Contain (Fit)" },
                { value: "stretch", label: "Stretch" },
              ]}
            />
          </div>

        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Interaction</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <MousePointer2 className="w-5 h-5 text-muted-foreground" />
              <div className="space-y-0.5">
                <Label className="text-base">Disable Mouse</Label>
                <p className="text-sm text-muted-foreground">Ignore interactions</p>
              </div>
            </div>
            <Switch />
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
        <p className="text-sm text-muted-foreground">Sound output controls.</p>
      </div>
      <Separator />
      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="flex items-center justify-between">
            <Label className="text-base">Mute All</Label>
            <Switch />
          </div>
          <Separator />
          <div className="space-y-4">
            <div className="flex justify-between">
              <Label>Master Volume</Label>
              <span className="text-sm text-muted-foreground">50%</span>
            </div>
            <Slider defaultValue={[50]} max={100} step={1} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AdvancedSettings() {
  return (
    <div className="space-y-6">
      <div><h3 className="text-lg font-medium">Advanced</h3></div>
      <Separator />
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label>Workshop Directory</Label>
            <div className="flex space-x-2">
              <Input placeholder="/path/to/steam/workshop" readOnly />
              <Button variant="outline"><FolderOpen className="w-4 h-4 mr-2"/> Browse</Button>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-orange-500" />
              <Label>Run as Root</Label>
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
      <div><h3 className="text-lg font-medium">Logs</h3></div>
      <div className="rounded-md border bg-muted p-4 h-[400px] font-mono text-xs overflow-auto">
        <p className="text-green-600">[INFO] Application initialized.</p>
        <p className="text-blue-600">[INFO] Components loaded successfully.</p>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline">Clear</Button>
        <Button>Export</Button>
      </div>
    </div>
  );
}

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