import { Zap, MousePointer2, Clock } from "lucide-react";
import { useAppStore } from "@/store/appStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
// 引入公共组件
import {
  Header,
  SliderRow,
  SwitchRow,
  SelectField,
  InputField,
  SCALING_OPTIONS,
  CLAMPING_OPTIONS,
  CYCLE_ORDER_OPTIONS,
} from "./Shared";

export function PlaybackSettings() {
  const { settings, updateSetting } = useAppStore();

  if (!settings) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <Header
        title="Playback & Performance"
        desc="Fine-tune rendering quality, automation, and system integration."
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-orange-500" /> Rendering Quality
          </CardTitle>
          <CardDescription>
            Optimize for battery life or visual fidelity.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <SliderRow
            label="Target FPS Limit"
            value={settings.fps}
            onValueChange={(v) => updateSetting("fps", v)}
            max={144}
            min={10}
            step={1}
            suffix=" FPS"
          />
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SwitchRow
              label="Disable Parallax"
              description="Stop mouse movement effects"
              checked={settings.disableParallax}
              onCheckedChange={(v) => updateSetting("disableParallax", v)}
            />
            <SwitchRow
              label="Disable Particles"
              description="Turn off rain/fire effects"
              checked={settings.disableParticles}
              onCheckedChange={(v) => updateSetting("disableParticles", v)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Display Behavior</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectField
              label="Scaling Mode"
              value={settings.scaling}
              onValueChange={(v) => updateSetting("scaling", v)}
              options={SCALING_OPTIONS}
            />
            <SelectField
              label="Texture Clamping"
              value={settings.clamping}
              onValueChange={(v) => updateSetting("clamping", v)}
              options={CLAMPING_OPTIONS}
            />
          </div>
          <Separator />
          <SwitchRow
            label="No Fullscreen Pause"
            description="Keep playing when games open"
            checked={settings.noFullscreenPause}
            onCheckedChange={(v) => updateSetting("noFullscreenPause", v)}
          />
          <SwitchRow
            label="Disable Mouse Interaction"
            description="Ignore mouse clicks"
            checked={settings.disableMouse}
            onCheckedChange={(v) => updateSetting("disableMouse", v)}
            icon={<MousePointer2 className="w-4 h-4 text-muted-foreground" />}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" /> Playlist Automation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <SwitchRow
            label="Enable Auto-Cycle"
            description="Automatically switch wallpapers"
            checked={settings.cycleEnabled}
            onCheckedChange={(v) => updateSetting("cycleEnabled", v)}
          />
          {settings.cycleEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <InputField
                label="Cycle Interval (minutes)"
                value={settings.cycleInterval}
                onChange={(v) =>
                  updateSetting("cycleInterval", parseInt(v) || 15)
                }
                type="number"
                min={1}
              />
              <SelectField
                label="Cycle Order"
                value={settings.cycleOrder}
                onValueChange={(v) => updateSetting("cycleOrder", v)}
                options={CYCLE_ORDER_OPTIONS}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Wayland Tweaks</span>
            <Badge
              variant="outline"
              className="text-xs font-normal border-blue-500/30 text-blue-500"
            >
              Wayland
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <SwitchRow
            label="Pause Only When Active"
            description="Only pause if app is focused"
            checked={settings.waylandOnlyActive}
            onCheckedChange={(v) => updateSetting("waylandOnlyActive", v)}
          />
          <InputField
            label="Ignore Application IDs"
            value={settings.waylandIgnoreAppids}
            onChange={(v) => updateSetting("waylandIgnoreAppids", v)}
            placeholder="dock, bar, launcher..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
