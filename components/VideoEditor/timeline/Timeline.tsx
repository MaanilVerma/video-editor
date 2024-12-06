import { useState, useRef } from "react";
import { TimelineMode } from "@/lib/models/timeline";
import { TimelineTrimmer } from "./TimelineTrimmer";
import { useEditorStore } from "@/lib/store/editor-store";
import { formatTime, getTimeMarkers } from "@/lib/utils/time";
import { PlayheadHandle } from "./PlayheadHandle";
import { TrimControls } from "../controls/TrimControls";
import { toast } from "sonner";
import { OverlayTimeline } from "./OverlayTimeline";
import { TimelineHeader } from "./TimelineHeader";
import { OverlayControls } from "../controls/OverlayControls";

interface TimelineProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isPlaying?: boolean;
  mode: TimelineMode;
  onModeChange: (mode: TimelineMode) => void;
  onTrimApply: () => void;
}

export function Timeline({
  videoRef,
  isPlaying,
  mode,
  onModeChange,
  onTrimApply,
}: TimelineProps) {
  const {
    duration,
    currentTime,
    setCurrentTime,
    trimStart,
    trimEnd,
    setTrimPoints,
  } = useEditorStore();

  const [isDragging, setIsDragging] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const generatePreview = async (time: number) => {
    // If no video element exists, exit early
    if (!videoRef.current) return;

    // Get reference to video element and set the playback position
    const video = videoRef.current;
    video.currentTime = time;

    // Wait for the video to finish seeking to the new time
    await new Promise((resolve) => {
      video.onseeked = resolve;
    });

    // Create a canvas element to capture the video frame
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Get canvas context and draw the current video frame
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert the canvas to a base64 data URL and return it
    return canvas.toDataURL();
  };

  const handlePlayheadDrag = async (newTime: number) => {
    // Ensure time is within bounds
    const boundedTime = Math.max(0, Math.min(duration, newTime));

    // In trim mode, constrain to trim bounds
    const finalTime =
      mode === TimelineMode.TRIM
        ? Math.max(trimStart, Math.min(trimEnd, boundedTime))
        : boundedTime;

    setCurrentTime(finalTime);

    if (videoRef.current) {
      videoRef.current.currentTime = finalTime;
      // Always generate preview regardless of mode
      const preview = await generatePreview(finalTime);
      if (preview) setPreviewImage(preview);
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleTrimApply = () => {
    onTrimApply();
    toast.success("Trim applied successfully");
  };

  return (
    <div className="space-y-4 p-4">
      <TimelineHeader mode={mode} onModeChange={onModeChange} />

      <div className="space-y-4">
        {mode === TimelineMode.TRIM && (
          <div className="px-4 py-3 bg-zinc-900/50 rounded-lg border border-zinc-800/50">
            <TrimControls
              duration={duration}
              trimStart={trimStart}
              trimEnd={trimEnd}
              onTrimChange={setTrimPoints}
              onApplyTrim={handleTrimApply}
            />
          </div>
        )}

        {mode === TimelineMode.OVERLAY && (
          <div className="px-4 py-3 bg-zinc-900/50 rounded-lg border border-zinc-800/50">
            <OverlayControls />
          </div>
        )}

        <div className="relative bg-zinc-900/30 rounded-lg border border-zinc-800/50 p-4">
          {/* Time markers with density */}
          <div className="relative h-8 mb-2 px-8">
            <div className="absolute inset-0 flex items-center">
              {/* Start marker (0) */}
              <div
                className="absolute flex flex-col items-center"
                style={{ left: 0, transform: "translateX(-50%)" }}
              >
                <div className="h-4 w-0.5 bg-zinc-500" />
                <span className="text-[10px] font-medium text-zinc-400 mt-1 whitespace-nowrap">
                  {formatTime(0)}
                </span>
              </div>

              {/* Micro markers */}
              {getTimeMarkers(duration).micro.map((time, index) => (
                <div
                  key={`micro-${time}-${index}`}
                  className="absolute flex flex-col items-center"
                  style={{
                    left: `${(time / duration) * 100}%`,
                    transform: "translateX(-50%)",
                  }}
                >
                  <div className="h-1 w-px bg-zinc-800" />
                </div>
              ))}

              {/* Minor markers */}
              {getTimeMarkers(duration).minor.map((time, index) => (
                <div
                  key={`minor-${time}-${index}`}
                  className="absolute flex flex-col items-center"
                  style={{
                    left: `${(time / duration) * 100}%`,
                    transform: "translateX(-50%)",
                  }}
                >
                  <div className="h-2 w-px bg-zinc-700" />
                </div>
              ))}

              {/* Major markers */}
              {getTimeMarkers(duration).major.map((time, index) => (
                <div
                  key={`major-${time}-${index}`}
                  className="absolute flex flex-col items-center"
                  style={{
                    left: `${(time / duration) * 100}%`,
                    transform: "translateX(-50%)",
                  }}
                >
                  <div className="h-4 w-0.5 bg-zinc-500" />
                  <span className="text-[10px] font-medium text-zinc-400 mt-1 whitespace-nowrap">
                    {formatTime(time)}
                  </span>
                </div>
              ))}

              {/* End marker (duration) */}
              <div
                className="absolute flex flex-col items-center"
                style={{ left: "100%", transform: "translateX(-50%)" }}
              >
                <div className="h-4 w-0.5 bg-zinc-500" />
                <span className="text-[10px] font-medium text-zinc-400 mt-1 whitespace-nowrap">
                  {formatTime(duration)}
                </span>
              </div>

              {/* Current time indicator */}
              <div
                className="absolute top-0 bottom-8 w-0.5 bg-red-500"
                style={{
                  left: `${(currentTime / duration) * 100}%`,
                  transform: "translateX(-50%)",
                }}
              />
            </div>
          </div>

          {/* Timeline content */}
          <div className="relative h-24 mt-2">
            {/* Preview thumbnail */}
            {previewImage && isDragging && (
              <div
                className="absolute bottom-full mb-2 -translate-x-1/2 bg-black rounded-lg overflow-hidden shadow-xl z-50"
                style={{
                  left: `${(currentTime / duration) * 100}%`,
                  width: "160px",
                  aspectRatio: "16/9",
                }}
              >
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <PlayheadHandle
              position={currentTime}
              duration={duration}
              onDrag={handlePlayheadDrag}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              isPlaying={isPlaying}
              mode={mode}
              trimStart={trimStart}
              trimEnd={trimEnd}
            />

            {mode === TimelineMode.OVERLAY && (
              <OverlayTimeline
                duration={duration}
                currentTime={currentTime}
                zoom={1}
                onScrub={handlePlayheadDrag}
                onScrubStart={handleDragStart}
                onScrubEnd={handleDragEnd}
              />
            )}

            {mode === TimelineMode.TRIM && (
              <TimelineTrimmer
                duration={duration}
                trimStart={trimStart}
                trimEnd={trimEnd}
                onTrimChange={setTrimPoints}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
