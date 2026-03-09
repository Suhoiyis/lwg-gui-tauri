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
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { WallpaperCard } from "@/components/WallpaperCard";
import { WallpaperMetadata } from "@/components/WallpaperMetadata";
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

/**
 * 移除 BBCode 标签并清理文本
 */
function cleanDescription(text: string): string {
  return (
    text
      // 1. 移除 BBCode 标签 [tag]...[/tag] 和 [tag=...]
      .replace(/\[\/?[a-zA-Z0-9_]+\s*[^\]]*\]/g, "")
      // 2. 移除裸露的 URL（BBCode 移除后剩下的）
      .replace(/https?:\/\/\S+/g, "")
      // 3. Trim 每行的开头和结尾空格（杀死用于居中对齐的大量空格）
      .split("\n")
      .map((line) => line.trim())
      .join("\n")
      // 4. 压缩多余空行
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}
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
    <div className="h-full flex flex-col bg-card/30">
      <ScrollArea className="flex-1 p-6">
        {selectedWallpaper ? (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
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
            <div className="space-y-2">
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

            {/* Nickname  + favorite */}
            {/* ✨ 修复间距：将 Separator 和按键打包在一个 div 里，内部使用紧凑间距 */}
            <div className="space-y-2">
              <Separator />
              <div className="flex gap-2">
                {/* Nickname 编辑按钮 */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex-1 gap-2 h-10">
                      <Edit3 className="w-4 h-4" />
                      Nickname
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

                {/* favorite */}
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
                  {/* always Favorite */}
                  Favorite
                </Toggle>
              </div>
            </div>

            {/* Tags (left) + Type (right) */}
            {/* ✨ 修复间距：打包 Separator 和 Metadata */}
            <div className="space-y-3">
              <Separator />
              <WallpaperMetadata wallpaper={selectedWallpaper} />
            </div>

            {/* 4. 描述 - 使用 Accordion，可折叠展开 */}
            {selectedWallpaper.description &&
              cleanDescription(selectedWallpaper.description) && (
                /* ✨ 修复间距：打包 Separator 和 Accordion */
                <div className="space-y-2">
                  <Separator />
                  <Accordion type="single" collapsible>
                    <AccordionItem value="description" className="border-0">
                      <AccordionTrigger className="text-xs font-bold text-muted-foreground uppercase tracking-widest py-2 hover:no-underline">
                        Description
                      </AccordionTrigger>
                      <AccordionContent
                        className="text-sm text-muted-foreground/80 leading-relaxed italic break-words pt-0"
                        style={{
                          whiteSpace: "pre-wrap",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {cleanDescription(selectedWallpaper.description)}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground/50 space-y-4">
            <div className="w-16 h-16 rounded-xl bg-muted/50 border-2 border-dashed border-muted-foreground/20" />
            <p className="text-sm">Select a wallpaper to view details</p>
          </div>
        )}
      </ScrollArea>

      {/* 这个底部的区域本来就不受 space-y-6 的影响，所以不需要包，结构保持干净即可 */}
      <Separator />
      <div className="p-6 bg-background/50">
        <Button
          onClick={handleApply}
          disabled={!selectedWallpaper}
          className="w-full h-12 bg-brand hover:bg-brand/90 text-brand-foreground font-bold rounded-xl shadow-lg shadow-brand/20 gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="w-5 h-5 fill-current" /> Apply Wallpaper
        </Button>
      </div>
    </div>
  );
}
