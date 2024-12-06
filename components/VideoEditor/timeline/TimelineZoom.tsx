import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface TimelineZoomProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onReset: () => void;
}

export function TimelineZoom({
  zoom,
  onZoomChange,
  onReset,
}: TimelineZoomProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onZoomChange(Math.max(0.25, zoom - 0.25))}
        disabled={zoom <= 0.25}
      >
        <ZoomOut className="h-4 w-4" />
      </Button>

      <Slider
        value={[zoom]}
        min={0.25}
        max={4}
        step={0.25}
        onValueChange={([value]) => onZoomChange(value)}
        className="w-32"
      />

      <Button
        variant="outline"
        size="icon"
        onClick={() => onZoomChange(Math.min(4, zoom + 0.25))}
        disabled={zoom >= 4}
      >
        <ZoomIn className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={onReset}
        disabled={zoom === 1}
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
    </div>
  );
}
