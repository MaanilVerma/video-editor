import { Button } from "@/components/ui/button";
import { Save, RotateCcw } from "lucide-react";

interface TrimControlsProps {
  duration: number;
  trimStart: number;
  trimEnd: number;
  onTrimChange: (start: number, end: number) => void;
  onApplyTrim: () => void;
}

export function TrimControls({
  duration,
  trimStart,
  trimEnd,
  onTrimChange,
  onApplyTrim,
}: TrimControlsProps) {
  const handleReset = () => {
    onTrimChange(0, duration);
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-secondary/5 rounded-lg border border-red-500/10">
      <div className="flex-1">
        <p className="text-xs text-red-500/60">
          Trim: {trimStart.toFixed(2)}s - {trimEnd.toFixed(2)}s
        </p>
        <p className="text-xs text-red-500/60">
          Duration: {(trimEnd - trimStart).toFixed(2)}s
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="text-red-500/80"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={onApplyTrim}
          className="bg-red-500 hover:bg-red-600 text-white gap-2"
        >
          <Save className="w-4 h-4" />
          Apply Trim
        </Button>
      </div>
    </div>
  );
}
