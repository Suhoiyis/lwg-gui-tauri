// src/components/library/LibraryHeader.tsx
import { memo } from "react";

interface LibraryHeaderProps {
  currentTitle: string;
  totalCount: number;
}

export const LibraryHeader = memo(({ currentTitle, totalCount }: LibraryHeaderProps) => {
  return (
    <div className="flex items-center justify-between bg-muted/20 px-4 py-2 rounded-xl border border-border/50">
      <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground tracking-widest">
        <span className="text-pink-500 uppercase">Currently Using</span>
        <span className="text-foreground truncate max-w-[300px]">
          {currentTitle || "None"}
        </span>
      </div>
      <span className="text-xs font-mono text-muted-foreground/50">
        {totalCount} wallpapers
      </span>
    </div>
  );
});
