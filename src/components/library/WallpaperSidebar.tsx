import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppStore } from "@/store/appStore";
import { applyWallpaper } from "@/api/wallpaper";
import { toast } from "sonner";
import { convertFileSrc } from "@tauri-apps/api/core";

/**
 * 将本地文件路径转换为浏览器可加载的 URL
 */
function getPreviewUrl(preview: string): string {
  if (preview.startsWith("http://") || preview.startsWith("https://")) {
    return preview;
  }
  return convertFileSrc(preview);
}
export function WallpaperSidebar() {
  const selectedWallpaper = useAppStore((state) =>
    state.getSelectedWallpaper(),
  );

  const handleApply = async () => {
    if (!selectedWallpaper) return;
    try {
      console.log("Applying:", selectedWallpaper.title);
      await applyWallpaper(selectedWallpaper.id);
      toast.success(`已应用: ${selectedWallpaper.title}`);
    } catch (error) {
      console.error(error);
      toast.error("应用失败，请检查后台日志");
    }
  };

  // 修正：不要返回 null，否则 Layout 右侧会塌陷。
  // 保持原版结构，如果 selectedWallpaper 为空，内容区域会显示为空白或占位符，但容器还在。

  return (
    <div className="h-full flex flex-col bg-card/30">
      <ScrollArea className="flex-1 p-6">
        {selectedWallpaper ? (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            {/* 图片容器 - 正方形，短边裁剪 */}
            <div className="aspect-square relative overflow-hidden border border-border shadow-2xl rounded-2xl bg-muted">
              <img
                src={getPreviewUrl(selectedWallpaper.preview)}
                className="absolute inset-0 w-full h-full object-cover"
                alt={selectedWallpaper.title}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src =
                    'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23374151" width="100" height="100"/><text x="50" y="55" text-anchor="middle" fill="%239ca3af" font-size="12">No Preview</text></svg>';
                }}
              />
            </div>
            <div className="space-y-3">
              <h1 className="text-xl font-bold leading-tight">
                {selectedWallpaper.title}
              </h1>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-pink-500/20 text-pink-500 border-pink-500/20">
                  {selectedWallpaper.id}
                </Badge>
                <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/20">
                  {selectedWallpaper.size || "0 MB"}
                </Badge>
              </div>
            </div>
            <div className="space-y-2 border-t pt-4">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Description
              </h3>
              <p className="text-sm text-muted-foreground/80 leading-relaxed italic">
                A high-quality live wallpaper for your desktop.
              </p>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground/50 space-y-4">
            <div className="w-16 h-16 rounded-xl bg-muted/50 border-2 border-dashed border-muted-foreground/20" />
            <p className="text-sm">Select a wallpaper to view details</p>
          </div>
        )}
      </ScrollArea>

      <div className="p-6 border-t bg-background/50">
        <Button
          onClick={handleApply}
          disabled={!selectedWallpaper}
          className="w-full h-12 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl shadow-lg shadow-pink-500/20 gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="w-5 h-5 fill-current" /> Apply Wallpaper
        </Button>
      </div>
    </div>
  );
}
