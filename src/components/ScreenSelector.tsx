import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/store/appStore";

interface ScreenSelectorProps {
  /** 紧凑模式下的样式变体 */
  variant?: "default" | "compact";
  /** 自定义类名 */
  className?: string;
}

/**
 * 屏幕选择器组件
 * 用于选择壁纸应用的目标屏幕（All Screens / Display 1 等）
 * 直接连接 Zustand store 进行状态管理
 */
export function ScreenSelector({
  variant = "default",
  className,
}: ScreenSelectorProps) {
  const selectedScreen = useAppStore((state) => state.selectedScreen);
  const setSelectedScreen = useAppStore((state) => state.setSelectedScreen);

  const isCompact = variant === "compact";

  return (
    <Select value={selectedScreen} onValueChange={setSelectedScreen}>
      <SelectTrigger
        className={
          isCompact
            ? `h-7 w-[110px] text-xs border-none bg-transparent shadow-none focus:ring-0 ${className || ""}`
            : `h-8 w-[130px] text-xs ${className || ""}`
        }
      >
        <SelectValue placeholder="Screen" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Screens</SelectItem>
        <SelectItem value="1">Display 1</SelectItem>
      </SelectContent>
    </Select>
  );
}
