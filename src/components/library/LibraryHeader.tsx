// src/components/library/LibraryHeader.tsx
import { memo, useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown } from "lucide-react";
import { useAppStore } from "@/store/appStore";

interface LibraryHeaderProps {
  currentTitle: string;
  activeWallpaperId: string | null;
  onTitleClick: (id: string) => void;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  currentIndex: number;
  onPageChange: (page: number) => void;
}

export const LibraryHeader = memo(
  ({
    currentTitle,
    activeWallpaperId,
    onTitleClick,
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

    // ✨ 2. 获取排序状态
    const sortBy = useAppStore((state) => state.sortBy);
    const setSortBy = useAppStore((state) => state.setSortBy);

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
      <div className="bg-muted/20 px-4 py-2 rounded-xl border border-border/50 shrink-0">
        {/* 宽窗口（桌面模式）：单行布局 */}
        <div className="hidden md:flex items-center justify-between gap-4">
          {/* 左侧：Current Using */}
          <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground tracking-widest flex-shrink min-w-0">
            <span className="text-pink-500 uppercase whitespace-nowrap">Currently Using</span>
            {activeWallpaperId ? (
              <span
                className="text-foreground truncate flex-1 min-w-0 cursor-pointer hover:text-pink-500 transition-colors underline underline-offset-2 decoration-pink-500/30 hover:decoration-pink-500"
                onClick={() => onTitleClick(activeWallpaperId)}
              >
                {currentTitle || "None"}
              </span>
            ) : (
              <span className="text-foreground truncate flex-1 min-w-0">
                {currentTitle || "None"}
              </span>
            )}
          </div>

          {/* 右侧：排序 + 分页 */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <Select
              value={sortBy}
              onValueChange={(value: "name" | "id" | "size") => setSortBy(value)}
            >
              <SelectTrigger className="h-7 w-[130px] text-xs bg-transparent border-dashed shadow-none">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ArrowUpDown className="h-3 w-3" />
                  <SelectValue placeholder="Sort by" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="id">ID (Ascending)</SelectItem>
                <SelectItem value="size">Size (Largest)</SelectItem>
              </SelectContent>
            </Select>

            <div className="h-4 w-px bg-border/50"></div>

            <span className="flex items-center gap-1 text-xs font-mono text-muted-foreground/50 select-none">
              <span>
                {currentIndex > 0 ? currentIndex : "-"}/{totalCount} wallpapers
              </span>
              {totalPages > 0 && (
                <span className="flex items-center ml-2 text-muted-foreground/40">
                  (
                  {isEditing ? (
                    <Input
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onBlur={handleBlur}
                      className="inline-block h-5 w-8 min-h-0 py-0 px-0 text-center text-xs font-mono border-0 border-b border-primary rounded-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 leading-none mx-0.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  ) : (
                    <span
                      onClick={() => setIsEditing(true)}
                      className="inline-block w-8 text-center mx-0.5 text-primary/90 hover:text-primary cursor-pointer transition-colors border-b border-dashed border-primary/30 hover:border-solid"
                    >
                      {currentPage}
                    </span>
                  )}
                  /{totalPages} Pages)
                </span>
              )}
            </span>
          </div>
        </div>

        {/* 窄窗口（移动端/紧凑模式）：两行布局 */}
        <div className="md:hidden">
          {/* 第一行：Currently Using（全宽） */}
          <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground tracking-widest">
            <span className="text-pink-500 uppercase whitespace-nowrap">Currently Using</span>
            {activeWallpaperId ? (
              <span
                className="text-foreground truncate flex-1 min-w-0 cursor-pointer hover:text-pink-500 transition-colors underline underline-offset-2 decoration-pink-500/30 hover:decoration-pink-500"
                onClick={() => onTitleClick(activeWallpaperId)}
              >
                {currentTitle || "None"}
              </span>
            ) : (
              <span className="text-foreground truncate flex-1 min-w-0">
                {currentTitle || "None"}
              </span>
            )}
          </div>

          {/* 第二行：分页（左） + 排序（右） */}
          <div className="flex items-center justify-between mt-1">
            {/* 左侧：分页信息 */}
            <span className="flex items-center gap-1 text-xs font-mono text-muted-foreground/50 select-none">
              <span>
                {currentIndex > 0 ? currentIndex : "-"}/{totalCount} wallpapers
              </span>
              {totalPages > 0 && (
                <span className="flex items-center ml-2 text-muted-foreground/40">
                  (
                  {isEditing ? (
                    <Input
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onBlur={handleBlur}
                      className="inline-block h-5 w-8 min-h-0 py-0 px-0 text-center text-xs font-mono border-0 border-b border-primary rounded-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 leading-none mx-0.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  ) : (
                    <span
                      onClick={() => setIsEditing(true)}
                      className="inline-block w-8 text-center mx-0.5 text-primary/90 hover:text-primary cursor-pointer transition-colors border-b border-dashed border-primary/30 hover:border-solid"
                    >
                      {currentPage}
                    </span>
                  )}
                  /{totalPages} Pages)
                </span>
              )}
            </span>

            {/* 右侧：排序选择器 */}
            <Select
              value={sortBy}
              onValueChange={(value: "name" | "id" | "size") => setSortBy(value)}
            >
              <SelectTrigger className="h-7 w-[130px] text-xs bg-transparent border-dashed shadow-none">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ArrowUpDown className="h-3 w-3" />
                  <SelectValue placeholder="Sort by" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="id">ID (Ascending)</SelectItem>
                <SelectItem value="size">Size (Largest)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    );
  },
);
