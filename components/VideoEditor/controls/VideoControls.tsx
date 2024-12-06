import { type RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";

export interface VideoControlsProps {
  videoRef: RefObject<HTMLVideoElement>;
  isPlaying: boolean;
  onPlayPause: () => void;
}

export function VideoControls({
  videoRef,
  isPlaying,
  onPlayPause,
}: VideoControlsProps) {
  return (
    <div className="flex justify-center gap-2">
      <Button variant="outline" size="icon" onClick={onPlayPause}>
        {isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
}
