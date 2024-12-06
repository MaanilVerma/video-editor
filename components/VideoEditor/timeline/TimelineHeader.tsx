import { Button } from "@/components/ui/button";
import { Clock, Scissors, Layers } from "lucide-react";
import { TimelineMode } from "@/lib/models/timeline";
import { cn } from "@/lib/utils";

interface TimelineHeaderProps {
  mode: TimelineMode;
  onModeChange: (mode: TimelineMode) => void;
}

export function TimelineHeader({ mode, onModeChange }: TimelineHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-red-500/10 backdrop-blur-sm">
          <Clock className="w-4 h-4 text-red-500" />
        </div>
        <div>
          <h3 className="font-medium text-zinc-200">Timeline</h3>
          <p className="text-xs text-zinc-400 hidden sm:block">
            Edit and arrange your content
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 p-1 bg-zinc-900/50 rounded-lg border border-zinc-800/50">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 px-3",
            mode === TimelineMode.SCRUB && "bg-zinc-800"
          )}
          onClick={() => onModeChange(TimelineMode.SCRUB)}
        >
          <Clock className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Scrub</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 px-3",
            mode === TimelineMode.TRIM && "bg-zinc-800"
          )}
          onClick={() => onModeChange(TimelineMode.TRIM)}
        >
          <Scissors className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Trim</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 px-3",
            mode === TimelineMode.OVERLAY && "bg-zinc-800"
          )}
          onClick={() => onModeChange(TimelineMode.OVERLAY)}
        >
          <Layers className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Overlays</span>
        </Button>
      </div>
    </div>
  );
}
