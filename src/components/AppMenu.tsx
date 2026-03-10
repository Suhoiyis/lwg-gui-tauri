import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
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
import { UpdateDialog } from "./UpdateDialog";
import { useAppStore } from "@/store/appStore";
import { toast } from "sonner";

interface UpdateInfo {
  latest_version: string;
  download_url: string;
}

export function AppMenu() {
  const loadWallpapers = useAppStore((state) => state.loadWallpapers);
  const appVersion = useAppStore((state) => state.appVersion);
  const [showAbout, setShowAbout] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [currentVersion, setCurrentVersion] = useState("");

  // Mock handlers
  const handleRefresh = () => {
    loadWallpapers();
    toast.info("Refreshing library...");
  };

  const handleHistory = () => toast.info("History Panel (Coming soon)");
  const handleGetStarted = () =>
    toast.info("Show Welcome Screen (Coming soon)");

  const handleCheckUpdate = async () => {
    // Guard: Only run in Tauri environment
    if (!window.__TAURI_INTERNALS__) {
      toast.error("Update check is only available in the desktop app");
      return;
    }

    const toastId = toast.loading("Checking for updates...");

    try {
      const result = await invoke<{
        has_update: boolean;
        current_version: string;
        latest_version: string | null;
        download_url: string | null;
      }>("check_for_updates");

      toast.dismiss(toastId);

      if (result.has_update) {
        // 情况 A：有新版本 → 打开 Dialog
        setCurrentVersion(result.current_version);
        setUpdateInfo({
          latest_version: result.latest_version!,
          download_url: result.download_url!,
        });
        setShowUpdate(true);
      } else {
        // 情况 B：已是最新 → 绿色 toast
        toast.success(`已是最新版本 (v${result.current_version})`);
      }
    } catch (err) {
      toast.dismiss(toastId);
      // 情况 C：错误 → 红色 toast
      toast.error(`检查更新失败: ${err}`);
    }
  };

  const handleAbout = () =>
    toast.info(`LWG GUI v${appVersion}\nCreated with Tauri & React`);
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

      {/* Dialogs */}
      <AboutDialog open={showAbout} onOpenChange={setShowAbout} />
      {updateInfo && (
        <UpdateDialog
          open={showUpdate}
          onOpenChange={setShowUpdate}
          currentVersion={currentVersion}
          latestVersion={updateInfo.latest_version}
          downloadUrl={updateInfo.download_url}
        />
      )}
    </>
  );
}
