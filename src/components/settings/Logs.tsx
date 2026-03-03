import { useState, useEffect, useMemo, useCallback } from "react";
import { Filter, Copy, Check } from "lucide-react";
import { LogEntry } from "@/types";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Header,
  LOG_FILTER_OPTIONS,
  getLevelColor,
  formatLogEntry,
} from "./Shared";

export function LogViewer() {
  const [filter, setFilter] = useState<string>("All");
  const [isCopied, setIsCopied] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    setLogs([
      {
        id: 1,
        timestamp: "10:00:01",
        level: "info",
        source: "GUI",
        message: "Application initialized",
      },
      {
        id: 2,
        timestamp: "10:00:02",
        level: "info",
        source: "Core",
        message: "Connected to Wallpaper Engine Core",
      },
      {
        id: 3,
        timestamp: "10:00:02",
        level: "warn",
        source: "Controller",
        message: "Steam API not detected",
      },
    ]);
  }, []);

  const filteredLogs = useMemo(
    () => logs.filter((log) => filter === "All" || log.source === filter),
    [logs, filter],
  );

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(filteredLogs.map(formatLogEntry).join("\n"));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }, [filteredLogs]);

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <Header title="Log Monitor" desc="Real-time debug information." />
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LOG_FILTER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 rounded-lg border bg-[#0f0f12] font-mono text-xs overflow-hidden flex flex-col">
        <ScrollArea className="flex-1 p-4">
          {filteredLogs.map((log) => (
            <div key={log.id} className="flex gap-4 py-0.5">
              <span className="text-gray-500 w-16">{log.timestamp}</span>
              <span className={`w-10 font-bold ${getLevelColor(log.level)}`}>
                {log.level.toUpperCase()}
              </span>
              <span className="text-purple-500 w-20">[{log.source}]</span>
              <span className="text-gray-200 flex-1">{log.message}</span>
            </div>
          ))}
        </ScrollArea>
      </div>

      <div className="flex justify-between items-center pt-2">
        <span className="text-[10px] text-muted-foreground">
          {filteredLogs.length} entries
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="h-8 gap-2 text-xs"
        >
          {isCopied ? (
            <Check className="w-3 h-3 text-green-500" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
          {isCopied ? "Copied!" : "Copy"}
        </Button>
      </div>
    </div>
  );
}
