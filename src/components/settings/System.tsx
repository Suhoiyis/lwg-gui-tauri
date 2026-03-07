// src/components/settings/System.tsx
import { useState, useEffect, useCallback } from "react";
import { Power, EyeOff, FileImage, FolderOpen } from "lucide-react"; // 修正：FolderOpen 必须在此导入
import { invoke } from "@tauri-apps/api/core";
import { useAppStore } from "@/store/appStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// 引入公共组件
import {
  Header,
  SwitchRow,
  InputField,
  PathInputField,
  SliderRow,
  EditableComboboxField,
  RESOLUTION_OPTIONS,
} from "./Shared";

export function SystemSettings() {
  const { settings, updateSetting } = useAppStore();
  const [autostart, setAutostart] = useState(false);

  useEffect(() => {
    // 获取自启动状态
    invoke<boolean>("get_autostart_status")
      .then(setAutostart)
      .catch(() => {});
  }, []);

  const handleAutostartChange = useCallback(
    async (enabled: boolean) => {
      try {
        await invoke("set_autostart", { enabled, hidden: settings.startHidden ?? false });
        setAutostart(enabled);
        toast.success(enabled ? "Autostart enabled" : "Autostart disabled");
      } catch {
        toast.error("Failed to change autostart");
      }
    },
    [settings.startHidden],
  );

  if (!settings) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <Header
        title="System & Tools"
        desc="Manage directories and screenshot utilities."
      />

      {/* Directories Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-yellow-500" /> Directories
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <PathInputField
            label="Steam Workshop Path"
            value={settings.workshopPath || ""}
            onChange={(v) => updateSetting("workshopPath", v)}
            placeholder="/home/user/.local/share/Steam/..."
          />
          <PathInputField
            label="Assets Directory (Optional)"
            value={settings.assetsPath || ""}
            onChange={(v) => updateSetting("assetsPath", v)}
            placeholder="Leave empty to auto-detect"
          />
        </CardContent>
      </Card>

      {/* Startup & Integration Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Power className="w-4 h-4 text-purple-500" /> Startup & Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <SwitchRow
            label="Run on Startup"
            description="Launch automatically on login"
            checked={autostart}
            onCheckedChange={handleAutostartChange}
          />

          <SwitchRow
            label="Start Hidden"
            description="Minimize to tray on launch"
            checked={settings.startHidden ?? false}
            onCheckedChange={(v) => updateSetting("startHidden", v)}
            icon={<EyeOff className="w-4 h-4 text-muted-foreground" />}
          />
        </CardContent>
      </Card>

      {/* Screenshot Tools Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileImage className="w-4 h-4 text-pink-500" /> Screenshot Tools
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Target Resolution */}
          <div className="max-w-md">
            <EditableComboboxField
              label="Target Resolution"
              value={settings.screenshotRes}
              onChange={(v) => updateSetting("screenshotRes", v)}
              options={RESOLUTION_OPTIONS}
              placeholder="Select or type..."
            />
          </div>

          <Separator />

          <SwitchRow
            label="Prefer Silent Capture (Xvfb)"
            description="Capture in background"
            checked={settings.preferXvfb}
            onCheckedChange={(v) => updateSetting("preferXvfb", v)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
