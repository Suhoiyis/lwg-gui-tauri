import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useAppStore } from "@/store/appStore";
import { PlaylistItem } from "./PlaylistItem";
import { Accordion } from "@/components/ui/accordion";

export function PlaylistList() {
  const playlists = useAppStore((state) => state.playlists);
  const reorderPlaylists = useAppStore((state) => state.reorderPlaylists);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before starting drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = playlists.findIndex((p) => p.id === active.id);
      const newIndex = playlists.findIndex((p) => p.id === over.id);

      // Optimistic update - reorder locally first
      const newOrder = arrayMove(playlists, oldIndex, newIndex);

      // Persist to backend
      reorderPlaylists(newOrder.map((p) => p.id));
    }
  };

  if (playlists.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-xs text-muted-foreground">No playlists yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Click "+ New Playlist" to create one
        </p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
        <SortableContext
          items={playlists.map((p) => p.id)}
          strategy={verticalListSortingStrategy}
        >
        <Accordion type="multiple" className="space-y-1">
          {playlists.map((playlist) => (
            <PlaylistItem key={playlist.id} playlist={playlist} />
          ))}
        </Accordion>
      </SortableContext>
    </DndContext>
  );
}
