import {
  Menu,
  RefreshCw,
  Rocket,
  Info,
  RotateCcw,
  LogOut,
  History,
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
import { useAppStore } from "@/store/appStore";
import { toast } from "sonner";

export function AppMenu() {
  const loadWallpapers = useAppStore((state) => state.loadWallpapers);

  // Mock handlers
  const handleRefresh = () => {
    loadWallpapers();
    toast.info("Refreshing library...");
  };

  const handleHistory = () => toast.info("History Panel (Coming soon)"); // ✨ 新增
  const handleGetStarted = () =>
    toast.info("Show Welcome Screen (Coming soon)");
  const handleAbout = () =>
    toast.info("LWG GUI v0.1.0\nCreated with Tauri & React");
  const handleRestart = () => toast.warning("Restarting app... (Mock)");
  const handleQuit = () => toast.error("Quitting app... (Mock)");

  return (
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

        <DropdownMenuItem onClick={handleAbout}>
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
  );
}
