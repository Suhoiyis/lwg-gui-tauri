// src/components/library/LibraryHeader.tsx
import { memo, useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface LibraryHeaderProps {
  currentTitle: string;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  currentIndex: number;
  onPageChange: (page: number) => void;
}

export const LibraryHeader = memo(
  ({
    currentTitle,
    totalCount,
    currentPage,
    totalPages,
    currentIndex,
    onPageChange,
  }: LibraryHeaderProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState(currentPage.toString());
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      setInputValue(currentPage.toString());
    }, [currentPage]);

    useEffect(() => {
      if (isEditing && inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, [isEditing]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        const page = parseInt(inputValue);
        if (!isNaN(page) && page >= 1 && page <= totalPages) {
          onPageChange(page);
          setIsEditing(false);
        } else {
          toast.error("Invalid Page");
          setInputValue(currentPage.toString());
        }
      } else if (e.key === "Escape") {
        setIsEditing(false);
        setInputValue(currentPage.toString());
      }
    };

    const handleBlur = () => {
      setIsEditing(false);
      setInputValue(currentPage.toString());
    };

    return (
      // ✨ 改动 1: 固定高度 h-12 (48px)，并垂直居中。
      // 这样内部元素无论怎么变，只要不超过 48px，Header 就不会抖动。
      <div className="h-12 flex items-center justify-between bg-muted/20 px-4 rounded-xl border border-border/50 shrink-0">
        <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground tracking-widest">
          <span className="text-pink-500 uppercase">Currently Using</span>
          <span className="text-foreground truncate max-w-[300px]">
            {currentTitle || "None"}
          </span>
        </div>

        <span className="flex items-center gap-1 text-xs font-mono text-muted-foreground/50 select-none">
          <span>
            {currentIndex > 0 ? currentIndex : "-"}/{totalCount} wallpapers
          </span>

          {totalPages > 0 && (
            <span className="flex items-center ml-2 text-muted-foreground/40">
              (
              {isEditing ? (
                // ✨ 改动 2: 给 Input 一个明确的固定高度 h-5 (20px)
                // 配合外层的 h-12，空间非常富裕，绝对不会撑大容器
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleBlur}
                  className="inline-block h-5 w-8 min-h-0 py-0 px-0 text-center text-xs font-mono border-0 border-b border-primary rounded-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 leading-none mx-0.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              ) : (
                // 样式代码
                // 样式代码
                // 修改 LibraryHeader.tsx 中的数字 3 样式
                <span
                  onClick={() => setIsEditing(true)}
                  className="
                    inline-block w-8 text-center mx-0.5
                    text-primary/90
                    hover:text-primary
                    cursor-pointer
                    transition-colors
                    border-b border-dashed border-primary/30
                    hover:border-solid
                  "
                >
                  {currentPage}
                </span>
              )}
              /{totalPages} Pages)
            </span>
          )}
        </span>
      </div>
    );
  },
);
