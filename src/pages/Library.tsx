import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyState } from "@/components/ui/empty";
import { WallpaperCard } from "@/components/WallpaperCard";
import { useAppStore } from "@/store/appStore";
import { useMemo, useCallback } from "react";

export function Library() {
  const wallpapers = useAppStore((state) => state.wallpapers);
  const searchQuery = useAppStore((state) => state.searchQuery);
  const selectedId = useAppStore((state) => state.selectedId);
  const setSelectedId = useAppStore((state) => state.setSelectedId);
  
  const filteredWallpapers = useMemo(() => {
    if (!searchQuery) return wallpapers;
    const lowerQ = searchQuery.toLowerCase();
    return wallpapers.filter(w => 
      w.title.toLowerCase().includes(lowerQ) || w.id.includes(lowerQ)
    );
  }, [wallpapers, searchQuery]);
  
  const selectedWallpaper = useMemo(() => {
    return wallpapers.find(w => w.id === selectedId) || null;
  }, [wallpapers, selectedId]);
  
  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
  }, [setSelectedId]);

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      {/* 状态工具栏 */}
      <div className="flex items-center justify-between bg-muted/20 px-4 py-2 rounded-xl border border-border/50">
        <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground tracking-widest">
          <span className="text-pink-500 uppercase">Currently Using</span>
          <span className="text-foreground truncate max-w-[300px]">
            {selectedWallpaper?.title || "None"}
          </span>
        </div>
        <span className="text-xs font-mono text-muted-foreground/50">
          {filteredWallpapers.length} wallpapers
        </span>
      </div>

      <ScrollArea className="flex-1">
        {filteredWallpapers.length === 0 ? (
          <div className="flex h-full min-h-[50vh] items-center justify-center">
            <EmptyState />
          </div>
        ) : (
          <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10 justify-items-center [&>*]:w-full [&>*]:max-w-[280px]">
            {filteredWallpapers.map((wp) => (
              <WallpaperCard 
                key={wp.id} 
                wp={wp} 
                isSelected={selectedId === wp.id} 
                onSelect={() => handleSelect(wp.id)} 
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}