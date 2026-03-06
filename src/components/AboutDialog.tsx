import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Github, Globe, Code2 } from "lucide-react";

interface AboutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AboutDialog({ open, onOpenChange }: AboutDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] flex flex-col items-center text-center">
        {/* 1. Logo 区域 (致敬 Adw.AboutDialog 的大图标) */}
        <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center mb-2 text-primary">
          <Code2 className="h-12 w-12" />
          {/* 这里可以换成你的真实 <img src="/logo.png" /> */}
        </div>

        <DialogHeader className="flex flex-col items-center">
          <DialogTitle className="text-2xl font-bold">
            LINUX WALLPAPER ENGINE GUI
          </DialogTitle>
          <DialogDescription className="text-sm">v1.2.0-pre</DialogDescription>
        </DialogHeader>

        {/* 2. 描述文本 */}
        <div className="py-4 text-sm text-muted-foreground">
          <p>
            A modern, high-performance wallpaper manager for{" "}
            <a
              href="https://github.com/Almamu/linux-wallpaperengine"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Almamu/linux-wallpaperengine
            </a>{" "}
            built with Tauri, React, and Rust.
            <br />
            Designed for simplicity and efficiency.
          </p>
        </div>

        {/* 3. 链接按钮组 */}
        <div className="flex gap-2 justify-center w-full">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() =>
              window.open(
                "https://github.com/Suhoiyis/gui-for-linux-wallpaperengine",
                "_blank",
              )
            }
          >
            <Github className="h-4 w-4" /> GitHub
          </Button>
          {/* <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => window.open("https://tauri.app", "_blank")}
          >
            <Globe className="h-4 w-4" /> Website
          </Button> */}
        </div>

        {/* 4. 底部版权信息 */}
        <div className="mt-4 text-[10px] text-muted-foreground">
          <p>© 2026 Suhoiyis.</p>
          <p>Licensed under GPL-3.0 License.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
