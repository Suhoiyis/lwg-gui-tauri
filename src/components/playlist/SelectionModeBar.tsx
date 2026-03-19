import { X, Check, CheckCheck, Plus, Trash2, ListPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/store/appStore";
import { useState } from "react";
import { CreatePlaylistDialog } from "./CreatePlaylistDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export function SelectionModeBar() {
  const selectedForPlaylist = useAppStore((state) => state.selectedForPlaylist);
  const exitSelectionMode = useAppStore((state) => state.exitSelectionMode);
  const selectAllForPlaylist = useAppStore((state) => state.selectAllForPlaylist);
  const deselectAllForPlaylist = useAppStore((state) => state.deselectAllForPlaylist);
  
  // 播放列表相关状态
  const playlists = useAppStore((state) => state.playlists);
  const activePlaylistId = useAppStore((state) => state.activePlaylistId);
  const addToPlaylist = useAppStore((state) => state.addToPlaylist);
  const removeFromPlaylist = useAppStore((state) => state.removeFromPlaylist);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const selectedCount = selectedForPlaylist.size;
  const selectedIds = Array.from(selectedForPlaylist);

  // 添加到指定播放列表
  const handleAddToPlaylist = async (playlistId: string) => {
    if (selectedCount === 0) return;
    
    try {
      await addToPlaylist(playlistId, selectedIds);
      exitSelectionMode();
    } catch (error) {
      // 错误已在 store 中处理
    }
  };

  // 从当前播放列表移除
  const handleRemoveFromPlaylist = async () => {
    if (!activePlaylistId || selectedCount === 0) return;
    
    try {
      // 逐个移除
      for (const wallpaperId of selectedIds) {
        await removeFromPlaylist(activePlaylistId, wallpaperId);
      }
      toast.success(`Removed ${selectedCount} wallpaper(s) from playlist`);
      exitSelectionMode();
    } catch (error) {
      // 错误已在 store 中处理
    }
  };

  // 获取当前播放列表名称
  const activePlaylist = playlists.find(p => p.id === activePlaylistId);

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-accent/50 border-b animate-in fade-in slide-in-from-top-2 duration-300">
      <Badge variant="secondary" className="font-normal">
        {selectedCount} selected
      </Badge>

      <div className="flex-1" />

      <Button
        variant="outline"
        size="sm"
        onClick={selectAllForPlaylist}
        className="gap-1"
      >
        <CheckCheck className="w-4 h-4" />
        Select All
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={deselectAllForPlaylist}
        className="gap-1"
      >
        <Check className="w-4 h-4" />
        Deselect
      </Button>

      {/* Add to Playlist 下拉菜单 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={selectedCount === 0 || playlists.length === 0}
            className="gap-1"
          >
            <ListPlus className="w-4 h-4" />
            Add to Playlist
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {playlists.map((playlist) => (
            <DropdownMenuItem
              key={playlist.id}
              onClick={() => handleAddToPlaylist(playlist.id)}
            >
              <span className="truncate">{playlist.name}</span>
              <Badge variant="secondary" className="ml-auto text-[10px] px-1">
                {playlist.wallpaperIds.length}
              </Badge>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Remove from Playlist - 仅当 activePlaylistId 存在时显示 */}
      {activePlaylistId && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleRemoveFromPlaylist}
          disabled={selectedCount === 0}
          className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
        >
          <Trash2 className="w-4 h-4" />
          Remove from "{activePlaylist?.name}"
        </Button>
      )}

      <Button
        variant="default"
        size="sm"
        onClick={() => setIsCreateDialogOpen(true)}
        disabled={selectedCount === 0}
        className="gap-1"
      >
        <Plus className="w-4 h-4" />
        Create Playlist
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={exitSelectionMode}
        className="gap-1"
      >
        <X className="w-4 h-4" />
        Cancel
      </Button>

      <CreatePlaylistDialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) {
            exitSelectionMode();
          }
        }}
        initialWallpaperIds={selectedIds}
      />
    </div>
  );
}