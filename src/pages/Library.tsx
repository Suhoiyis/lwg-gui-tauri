// src/pages/Library.tsx
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyState } from "@/components/ui/empty";
import { WallpaperCard } from "@/components/library/WallpaperCard";
import { LibraryHeader } from "@/components/library/LibraryHeader"; // 引入新组件
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
      {/* 顶部状态栏 */}
      <LibraryHeader 
        currentTitle={selectedWallpaper?.title || ""} 
        totalCount={filteredWallpapers.length} 
      />

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
