import React from "react";
import { Play, Star, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WallpaperCard } from "@/components/WallpaperCard";
import { useAppStore } from "@/store/appStore";
import { applyWallpaper } from "@/api/wallpaper";
import { toast } from "sonner";
import { convertFileSrc } from "@tauri-apps/api/core";
import { cn } from "@/lib/utils";

/**
 * 将本地文件路径转换为浏览器可加载的 URL
 */
function getPreviewUrl(preview: string): string {
  if (preview.startsWith("http://") || preview.startsWith("https://")) {
    return preview;
  }
  return convertFileSrc(preview);
}

// 辅助函数：生成标签颜色
const getColorForTag = (tag: string) => {
  const colors = [
    "bg-blue-100 text-blue-700 hover:bg-blue-100/80 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
    "bg-green-100 text-green-700 hover:bg-green-100/80 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
    "bg-purple-100 text-purple-700 hover:bg-purple-100/80 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
    "bg-pink-100 text-pink-700 hover:bg-pink-100/80 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800",
    "bg-yellow-100 text-yellow-700 hover:bg-yellow-100/80 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800",
    "bg-indigo-100 text-indigo-700 hover:bg-indigo-100/80 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800",
    "bg-red-100 text-red-700 hover:bg-red-100/80 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
    "bg-orange-100 text-orange-700 hover:bg-orange-100/80 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
    "bg-teal-100 text-teal-700 hover:bg-teal-100/80 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800",
  ];

  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash += tag.charCodeAt(i);
  }
  return colors[hash % colors.length];
};

export function WallpaperSidebar() {
  const selectedWallpaper = useAppStore((state) =>
    state.getSelectedWallpaper(),
  );
  const isFavorite = useAppStore((state) =>
    selectedWallpaper ? state.isFavorite(selectedWallpaper.id) : false,
  );
  const toggleFavorite = useAppStore((state) => state.toggleFavorite);
  const nickname = useAppStore((state) =>
    selectedWallpaper ? state.getNickname(selectedWallpaper.id) : undefined,
  );
  const setNickname = useAppStore((state) => state.setNickname);

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [nicknameInput, setNicknameInput] = React.useState("");

  React.useEffect(() => {
    if (selectedWallpaper && isDialogOpen) {
      setNicknameInput(nickname || "");
    }
  }, [selectedWallpaper, nickname, isDialogOpen]);

  const handleSaveNickname = () => {
    if (selectedWallpaper) {
      setNickname(selectedWallpaper.id, nicknameInput);
      toast.success("Nickname updated", {
        description: nicknameInput || "(Cleared)",
      });
      setIsDialogOpen(false);
    }
  };

  const handleToggleFavorite = () => {
    if (selectedWallpaper) {
      toggleFavorite(selectedWallpaper.id);
      toast.success(
        isFavorite ? "Removed from favorites" : "Added to favorites",
        { description: selectedWallpaper.title },
      );
    }
  };

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

  return (
    <div className="h-full flex flex-col bg-card/30">
      <ScrollArea className="flex-1 p-6">
        {selectedWallpaper ? (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            {/* 1. 图片容器 */}
            <div className="w-full">
              <WallpaperCard
                wp={selectedWallpaper}
                isSelected={false} // 侧边栏不需要选中框
                onSelect={() => {}} // 也不需要点击事件
                showTitle={false} // ❌ 隐藏底部标题
                showIcons={false} // ❌ 隐藏右上角图标和收藏
                className="w-full aspect-square shadow-2xl" // 强制正方形并加深阴影
              />
            </div>

            {/* 2. 标题与基础信息 */}
            <div className="space-y-3">
              <h1 className="text-xl font-bold leading-tight break-words">
                {selectedWallpaper.title}
              </h1>
              {/* ID 和 Size */}
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-pink-500/20 text-pink-500 border-pink-500/20 hover:bg-pink-500/30">
                  {selectedWallpaper.id}
                </Badge>
                <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/30">
                  {selectedWallpaper.size || "0 MB"}
                </Badge>
              </div>
            </div>

            {/* ✨ 新增：Nickname 编辑 + 收藏切换 */}
            <div className="flex gap-2 pt-2 border-t">
              {/* Nickname 编辑按钮 */}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex-1 gap-2 h-10">
                    <Edit3 className="w-4 h-4" />
                    {nickname ? "Edit Nickname" : "Set Nickname"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Set Wallpaper Nickname</DialogTitle>
                    <DialogDescription>
                      Give this wallpaper a custom nickname for easier
                      identification.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="nickname">Nickname</Label>
                      <Input
                        id="nickname"
                        value={nicknameInput}
                        onChange={(e) => setNicknameInput(e.target.value)}
                        placeholder="Enter a nickname..."
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveNickname();
                        }}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSaveNickname}>Save</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* 收藏切换按钮 */}
              <Toggle
                pressed={isFavorite}
                onPressedChange={handleToggleFavorite}
                variant="outline"
                className="flex-1 gap-2 h-10 data-[state=on]:bg-yellow-500/20 data-[state=on]:text-yellow-600 data-[state=on]:border-yellow-500/50"
              >
                <Star
                  className={`w-4 h-4 transition-colors ${
                    isFavorite
                      ? "fill-yellow-500 text-yellow-500"
                      : "fill-transparent"
                  }`}
                />
                {isFavorite ? "Unfavorite" : "Favorite"}
              </Toggle>
            </div>

            {/* ✨ 3. 并排布局：Tags (左) + Type (右) */}
            <div className="grid grid-cols-2 gap-4 border-t pt-4">
              {/* 左侧：Tags */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Tags
                </div>
                <div className="flex flex-wrap gap-1.5 content-start">
                  {selectedWallpaper.tags?.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className={cn(
                        "font-normal border shadow-sm",
                        getColorForTag(tag),
                      )}
                    >
                      {tag}
                    </Badge>
                  ))}
                  {(!selectedWallpaper.tags ||
                    selectedWallpaper.tags.length === 0) && (
                    <span className="text-xs text-muted-foreground italic">
                      No tags
                    </span>
                  )}
                </div>
              </div>

              {/* 右侧：Type */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Type
                </div>
                <div className="flex flex-wrap content-start">
                  <Badge
                    variant="secondary"
                    className="font-mono bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                  >
                    {selectedWallpaper.type || "Unknown"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* 4. 描述 */}
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
