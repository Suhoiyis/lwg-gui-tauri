import { useState } from "react";
import {
  Menu,
  RefreshCw,
  Rocket,
  Info,
  RotateCcw,
  LogOut,
  History,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AboutDialog } from "./AboutDialog";
import { useAppStore } from "@/store/appStore";
import { toast } from "sonner";

export function AppMenu() {
  const loadWallpapers = useAppStore((state) => state.loadWallpapers);
  const [showAbout, setShowAbout] = useState(false);

  // Mock handlers
  const handleRefresh = () => {
    loadWallpapers();
    toast.info("Refreshing library...");
  };

  const handleHistory = () => toast.info("History Panel (Coming soon)");
  const handleGetStarted = () =>
    toast.info("Show Welcome Screen (Coming soon)");

  const handleCheckUpdate = async () => {
    const CURRENT_VERSION = "v0.1.0"; // 当前的版号

    toast.promise(
      (async () => {
        // 1. 发起请求
        const response = await fetch(
          `https://github.com/Suhoiyis/gui-for-linux-wallpaperengine/releaseslatest`,
        );

        if (!response.ok) throw new Error("Failed to connect to GitHub");

        const data = await response.json();
        const latestVersion = data.tag_name;
        const downloadUrl = data.html_url;

        // 2. 逻辑判断
        if (latestVersion === CURRENT_VERSION) {
          return { status: "latest", version: latestVersion };
        } else {
          return { status: "update", version: latestVersion, url: downloadUrl };
        }
      })(),
      {
        loading: "Checking for updates...",
        success: (result: any) => {
          if (result.status === "latest") {
            return `You are on the latest version (${CURRENT_VERSION})`;
          } else {
            // 如果有更新，返回一个带操作按钮的提示
            return (
              <div className="flex flex-col gap-2">
                <p>
                  New version{" "}
                  <span className="font-bold">{result.version}</span> is
                  available!
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs w-fit"
                  onClick={() => window.open(result.url, "_blank")}
                >
                  Go to Download
                </Button>
              </div>
            );
          }
        },
        error: (err) => `Update check failed: ${err.message}`,
      },
    );
  };

  const handleAbout = () =>
    toast.info("LWG GUI v0.1.0\nCreated with Tauri & React");
  const handleRestart = () => toast.warning("Restarting app... (Mock)");
  const handleQuit = () => toast.error("Quitting app... (Mock)");

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-muted-foreground/10"
          >
            <Menu className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Application</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh Library
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleHistory}>
            <History className="mr-2 h-4 w-4" /> Play History
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleGetStarted}>
            <Rocket className="mr-2 h-4 w-4" /> Get Started
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleCheckUpdate}>
            <Download className="mr-2 h-4 w-4" /> Check for Update
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setShowAbout(true)}>
            <Info className="mr-2 h-4 w-4" /> About
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleRestart}>
            <RotateCcw className="mr-2 h-4 w-4" /> Restart
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleQuit}
            className="text-red-600 focus:text-red-600 focus:bg-red-100 dark:focus:bg-red-900/30"
          >
            <LogOut className="mr-2 h-4 w-4" /> Quit
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* ✨ 挂载 Dialog */}
      <AboutDialog open={showAbout} onOpenChange={setShowAbout} />
    </>
  );
}
