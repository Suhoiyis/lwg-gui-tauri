import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FolderOpen } from "lucide-react";

// ============================================================================
// Types
// ============================================================================

interface SwitchRowProps {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  icon?: React.ReactNode;
}

interface SliderRowProps {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  max: number;
  min?: number;
  step?: number;
  suffix?: string;
}

// ============================================================================
// Constants
// ============================================================================

export const SCALING_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "stretch", label: "Stretch" },
  { value: "fit", label: "Fit" },
  { value: "fill", label: "Fill" },
] as const;

export const CLAMPING_OPTIONS = [
  { value: "clamp", label: "Clamp" },
  { value: "border", label: "Border" },
  { value: "repeat", label: "Repeat" },
] as const;

export const CYCLE_ORDER_OPTIONS = [
  { value: "random", label: "Random" },
  { value: "title", label: "Title" },
  { value: "size", label: "Size" },
] as const;

export const MONITOR_OPTIONS = [
  { value: "all", label: "All Monitors" },
  { value: "eDP-1", label: "eDP-1" },
  { value: "HDMI-1", label: "HDMI-1" },
] as const;

export const THEME_OPTIONS = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
] as const;

export const LOG_FILTER_OPTIONS = [
  { value: "All", label: "All Sources" },
  { value: "GUI", label: "GUI Only" },
  { value: "Core", label: "Core Only" },
] as const;

export const LOG_LEVEL_COLORS: Record<string, string> = {
  info: "text-blue-500",
  warn: "text-amber-500",
  error: "text-red-500",
};

// ============================================================================
// Utility Functions
// ============================================================================

export const getLevelColor = (level: string): string => {
  return LOG_LEVEL_COLORS[level] || "text-gray-500";
};

export const formatLogEntry = (log: {
  timestamp: string;
  level: string;
  source: string;
  message: string;
}): string => {
  return `[${log.timestamp}] [${log.level.toUpperCase()}] [${log.source}] ${log.message}`;
};

// ============================================================================
// Reusable Components
// ============================================================================

export function Header({ title, desc }: { title: string; desc: string }) {
  return (
    <div>
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="text-sm text-muted-foreground">{desc}</p>
      <Separator className="mt-4" />
    </div>
  );
}

export function SwitchRow({
  label,
  description,
  checked,
  onCheckedChange,
  icon,
}: SwitchRowProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon}
        <div className="space-y-0.5">
          <Label>{label}</Label>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

export function SliderRow({
  label,
  value,
  onValueChange,
  max,
  min = 0,
  step = 1,
  suffix = "",
}: SliderRowProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label>{label}</Label>
        <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
          {value}
          {suffix}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={(v) => onValueChange(v[0])}
        max={max}
        min={min}
        step={step}
        className="py-2"
      />
    </div>
  );
}

export function SelectField({
  label,
  value,
  onValueChange,
  options,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: readonly { value: string; label: string }[];
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  min,
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  min?: number;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type={type}
        min={min}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export function PathInputField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string | null) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex space-x-2">
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value || null)}
        />
        <Button variant="secondary">
          <FolderOpen className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export function SwitchCard({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
      <div className="flex items-center justify-between">
        <Label className="text-sm">{label}</Label>
        <Switch checked={checked} onCheckedChange={onCheckedChange} />
      </div>
      <p className="text-[10px] text-muted-foreground">{description}</p>
    </div>
  );
}
