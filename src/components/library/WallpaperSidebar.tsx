import React from "react";
import { Star, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { WallpaperCard } from "@/components/library/WallpaperCard";
import { WallpaperMetadata } from "@/components/library/WallpaperMetadata";
import { ApplyButton } from "@/components/shared/ApplyButton";
import { EditNicknameDialog } from "@/components/dialogs/EditNicknameDialog";
import { useAppStore } from "@/store/appStore";
import { toast } from "sonner";
import { cn, getDisplayName } from "@/lib/utils";
import { renderInlineMarkdown } from "@/lib/markdown";

/**
 * 移除 BBCode 标签并清理文本
 */
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
  const nicknames = useAppStore((state) => state.nicknames);
  const selectedWallpaper = useAppStore((state) =>
    state.getSelectedWallpaper(),
  );
  
  // Get display name with nickname support
  const { displayName, originalTitle } = selectedWallpaper
    ? getDisplayName(nicknames, selectedWallpaper.id, selectedWallpaper.title)
    : { displayName: '', originalTitle: null };
  const isNickname = originalTitle !== null;
  
  const isFavorite = useAppStore((state) =>
    selectedWallpaper ? state.isFavorite(selectedWallpaper.id) : false,
  );
  const toggleFavorite = useAppStore((state) => state.toggleFavorite);

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const handleToggleFavorite = () => {
    if (selectedWallpaper) {
      toggleFavorite(selectedWallpaper.id);
      toast.success(
        isFavorite ? "Removed from favorites" : "Added to favorites",
        { description: displayName },
      );
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
              <h1 className={cn(
                "text-xl font-bold leading-tight break-words",
                isNickname && "nickname-text"
              )}>
                {renderInlineMarkdown(displayName)}
              </h1>
              {isNickname && (
                <p className="original-name-text">
                  {renderInlineMarkdown(originalTitle || "")}
                </p>
              )}
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
                <Button
                  variant="outline"
                  className="flex-1 gap-2 h-10"
                  onClick={() => setIsDialogOpen(true)}
                >
                  <Edit3 className="w-4 h-4" />
                  Nickname
                </Button>

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
        <ApplyButton className="w-full h-12 bg-brand hover:bg-brand/90 text-brand-foreground font-bold rounded-xl shadow-lg shadow-brand/20 gap-2 disabled:opacity-50 disabled:cursor-not-allowed" />
      </div>

      {/* Edit Nickname Dialog */}
      {selectedWallpaper && (
        <EditNicknameDialog
          wallpaperId={selectedWallpaper.id}
          wallpaperTitle={selectedWallpaper.title}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      )}
    </div>
  );
}
