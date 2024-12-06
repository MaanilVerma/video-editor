import { VideoControls } from "./VideoControls";

interface ControlsProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isPlaying: boolean;
  onPlayPause: () => void;
}

export function Controls({ videoRef, isPlaying, onPlayPause }: ControlsProps) {
  return (
    <div className="space-y-6">
      <VideoControls
        videoRef={videoRef}
        isPlaying={isPlaying}
        onPlayPause={onPlayPause}
      />
    </div>
  );
}
