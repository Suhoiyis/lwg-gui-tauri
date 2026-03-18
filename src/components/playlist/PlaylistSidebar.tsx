import React from "react";
import { ChevronLeft, ChevronRight, Plus, ListMusic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/appStore";
import { PlaylistList } from "./PlaylistList";
import { CreatePlaylistDialog } from "./CreatePlaylistDialog";

export function PlaylistSidebar() {
  const isHydrated = useAppStore((state) => state.isHydrated);
  const isOpen = useAppStore((state) => state.isPlaylistSidebarOpen);
  const toggleSidebar = useAppStore((state) => state.togglePlaylistSidebar);
  const activePlaylistId = useAppStore((state) => state.activePlaylistId);
  const setActivePlaylist = useAppStore((state) => state.setActivePlaylist);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);

  // FOUC prevention - show skeleton while hydrating
  if (!isHydrated) {
    return (
      <div className="w-[220px] h-full bg-sidebar border-r flex flex-col">
        <div className="p-4 border-b">
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="flex-1 p-2 space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 w-full rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={cn(
          "h-full flex flex-col bg-sidebar border-r transition-all duration-200",
          isOpen ? "w-[220px]" : "w-0 overflow-hidden"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b shrink-0">
          <div className="flex items-center gap-2">
            <ListMusic className="w-4 h-4 text-muted-foreground" />
            <span className="font-semibold text-sm">Playlists</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={toggleSidebar}
          >
            {isOpen ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {/* ALL item */}
            <button
              onClick={() => setActivePlaylist(null)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                !activePlaylistId
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/50 text-muted-foreground"
              )}
            >
              <ListMusic className="w-4 h-4" />
              <span>All Wallpapers</span>
            </button>

            <Separator className="my-2" />

            {/* Playlist list with drag-drop */}
            <PlaylistList />
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-2 border-t shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="w-4 h-4" />
            <span>New Playlist</span>
          </Button>
        </div>
      </div>

      {/* Collapsed toggle button (visible when sidebar is closed) */}
      {!isOpen && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-6 rounded-r-md border border-l-0 bg-background hover:bg-accent"
          onClick={toggleSidebar}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}

      {/* Create Playlist Dialog */}
      <CreatePlaylistDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </>
  );
}