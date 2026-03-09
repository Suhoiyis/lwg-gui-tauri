import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/appStore";
import { applyWallpaper } from "@/api/wallpaper";
import { toast } from "sonner";

interface ApplyButtonProps {
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
}

export function ApplyButton({ className, size = "default" }: ApplyButtonProps) {
  const selectedWallpaper = useAppStore((state) => state.getSelectedWallpaper());

  const handleApply = async () => {
    if (!selectedWallpaper) return;
    try {
      console.log("Applying:", selectedWallpaper.title);
      const selectedScreen = useAppStore.getState().selectedScreen;
      const screen = selectedScreen === "all" ? undefined : selectedScreen;
      await applyWallpaper(selectedWallpaper.id, screen);
      toast.success(`已应用: ${selectedWallpaper.title}`);
    } catch (error) {
      console.error(error);
      toast.error("应用失败，请检查后台日志");
    }
  };

  return (
    <Button
      onClick={handleApply}
      disabled={!selectedWallpaper}
      size={size}
      className={className}
    >
      <Play className="w-5 h-5 fill-current" /> Apply Wallpaper
    </Button>
  );
}