import { Monitor, Volume2, Moon, Sun, Speaker } from "lucide-react";
import { useAppStore } from "@/store/appStore";
import { useTheme } from "@/components/theme-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SelectItem } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Header,
  SliderRow,
  SwitchRow,
  SwitchCard,
  SelectField,
  MONITOR_OPTIONS,
  THEME_OPTIONS,
} from "./Shared";


export function DisplaySettings() {
  const { theme, setTheme } = useTheme();
  const { settings, updateSetting } = useAppStore();

  if (!settings) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <Header title="Audio & Display" desc="Manage multi-monitor setup and audio processing." />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-blue-500" /> Display Output
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SelectField
            label="Target Monitor"
            value={settings.lastScreen || "all"}
            onValueChange={(v) => updateSetting("lastScreen", v === "all" ? null : v)}
            options={MONITOR_OPTIONS}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-green-500" /> Audio Control
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <SliderRow
            label="Master Volume"
            value={settings.volume}
            onValueChange={(v) => updateSetting("volume", v)}
            max={100}
            step={1}
            suffix="%"
          />
          <Separator />
          <SwitchRow
            label="Mute Audio"
            description="Mute all audio"
            checked={settings.muteAudio}
            onCheckedChange={(v) => updateSetting("muteAudio", v)}
            icon={<Speaker className="w-4 h-4 text-muted-foreground" />}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <SwitchCard
              label="Disable Auto Mute"
              description="Prevent muting when other apps play sound"
              checked={settings.noAutomute}
              onCheckedChange={(v) => updateSetting("noAutomute", v)}
            />
            <SwitchCard
              label="No Audio Processing"
              description="Disable spectrum analysis"
              checked={settings.noAudioProcessing}
              onCheckedChange={(v) => updateSetting("noAudioProcessing", v)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {theme === "dark" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />} Interface Theme
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between space-x-4">
            <div className="flex flex-col space-y-1">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">App Appearance</label>
              <p className="text-xs text-muted-foreground">Light or Dark mode</p>
            </div>
            {/* 为了保持原 UI 样式（w-[180px]），这里稍微变通使用 SelectField 或直接内联 */}
             <SelectField
              label=""
              value={theme}
              onValueChange={(v) => setTheme(v as "light" | "dark" | "system")}
              options={THEME_OPTIONS}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
