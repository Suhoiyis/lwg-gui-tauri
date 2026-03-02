import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyState } from "@/components/ui/empty";
import { WallpaperCard } from "@/components/WallpaperCard"; // 修正引用路径
import { useAppStore } from "@/store/appStore";

export function Library() {
  const getFilteredWallpapers = useAppStore((state) => state.getFilteredWallpapers);
  const filteredWallpapers = getFilteredWallpapers();
  
  const selectedId = useAppStore((state) => state.selectedId);
  const setSelectedId = useAppStore((state) => state.setSelectedId);
  const selectedWallpaper = useAppStore((state) => state.getSelectedWallpaper());

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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-6 pb-10">
            {filteredWallpapers.map((wp) => (
              <WallpaperCard 
                key={wp.id} 
                wp={wp} 
                isSelected={selectedId === wp.id} 
                onSelect={() => setSelectedId(wp.id)} 
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}