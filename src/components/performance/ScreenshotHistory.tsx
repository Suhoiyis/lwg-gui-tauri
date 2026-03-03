// src/components/performance/ScreenshotHistory.tsx
import React, { memo } from "react";
import {
  Camera,
  FolderOpen,
  Image as ImageIcon,
  Clock,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScreenshotRecord } from "@/types/performance";
import { toast } from "sonner";

interface ScreenshotRowProps {
  record: ScreenshotRecord;
}

const ScreenshotRow: React.FC<ScreenshotRowProps> = memo(({ record }) => {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors group">
      <div className="flex items-center gap-4">
        <div className="w-16 h-10 bg-muted rounded overflow-hidden border group-hover:border-primary/50 transition-colors flex items-center justify-center relative">
          <Camera className="w-4 h-4 text-muted-foreground absolute" />
        </div>
        <div>
          <div className="text-sm font-medium">{record.name}</div>
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <Clock className="w-3 h-3" /> {record.timestamp}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div className="text-right w-20">
          <div className="text-xs font-bold">{record.duration}s</div>
          <div className="text-[10px] text-muted-foreground uppercase">
            Duration
          </div>
        </div>
        <div className="text-right w-20">
          <div className="text-xs font-bold text-orange-500">
            {record.maxCpu}%
          </div>
          <div className="text-[10px] text-muted-foreground uppercase">
            Max CPU
          </div>
        </div>
        <div className="text-right w-20">
          <div className="text-xs font-bold text-blue-500">
            {record.maxMem} MB
          </div>
          <div className="text-[10px] text-muted-foreground uppercase">
            Max Mem
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => toast.success(`Opening ${record.path}...`)}
        >
          <FolderOpen className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => toast.success(`Viewing image...`)}
        >
          <ImageIcon className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
});

ScreenshotRow.displayName = "ScreenshotRow";

interface ScreenshotHistoryProps {
  items: ScreenshotRecord[];
  onClear: () => void;
}

export default function ScreenshotHistory({
  items,
  onClear,
}: ScreenshotHistoryProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Camera className="w-5 h-5" /> Screenshot History
          </h2>
          <p className="text-xs text-muted-foreground">
            Recent performance snapshots.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onClear}
          disabled={items.length === 0}
        >
          <Trash2 className="w-4 h-4 mr-2" /> Clear
        </Button>
      </div>

      <div className="rounded-xl border bg-card/50 overflow-hidden">
        {items.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No screenshots taken yet.
          </div>
        ) : (
          <div className="divide-y">
            {items.map((record) => (
              <ScreenshotRow key={record.id} record={record} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
