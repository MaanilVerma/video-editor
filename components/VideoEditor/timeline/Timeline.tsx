import { useState, useRef } from "react";
import { TimelineMode } from "@/lib/models/timeline";
import { TimelineTrimmer } from "./TimelineTrimmer";
import { useEditorStore } from "@/lib/store/editor-store";
import { formatTime } from "@/lib/utils/time";
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

// Helper functions for timeline markers
function getTimeMarkers(duration: number) {
  const markers = {
    major: [] as number[],
    minor: [] as number[],
    micro: [] as number[],
  };

  // Helper to generate evenly spaced markers within 2-98% range
  const generateMarkers = (count: number) => {
    return Array.from({ length: count }, (_, i) => {
      // Calculate percentage between 2% and 98%
      const percentage = 0.02 + (0.96 * (i + 1)) / (count + 1);
      return percentage * duration;
    });
  };

  if (duration <= 10) {
    // For very short videos (under 10s)
    markers.major = generateMarkers(4); // 4 major markers
    markers.minor = generateMarkers(8); // 8 minor markers (between majors)
    markers.micro = generateMarkers(16); // 16 micro markers (between minors)
  } else if (duration <= 60) {
    // Under 1 minute
    markers.major = generateMarkers(6); // 6 major markers
    markers.minor = generateMarkers(12); // 12 minor markers
    markers.micro = generateMarkers(24); // 24 micro markers
  } else if (duration <= 300) {
    // Under 5 minutes
    markers.major = generateMarkers(5); // 5 major markers
    markers.minor = generateMarkers(10); // 10 minor markers
    markers.micro = generateMarkers(20); // 20 micro markers
  } else {
    // Over 5 minutes
    markers.major = generateMarkers(6); // 6 major markers
    markers.minor = generateMarkers(12); // 12 minor markers
    markers.micro = generateMarkers(24); // 24 micro markers
  }

  // Filter out minor markers that are too close to major markers
  const majorTimes = new Set(markers.major);
  markers.minor = markers.minor.filter((time) => {
    return !markers.major.some(
      (majorTime) => Math.abs(majorTime - time) < duration * 0.02
    );
  });

  // Filter out micro markers that are too close to minor or major markers
  const allLargerMarkers = new Set([...markers.major, ...markers.minor]);
  markers.micro = markers.micro.filter((time) => {
    return !Array.from(allLargerMarkers).some(
      (largerTime) => Math.abs(largerTime - time) < duration * 0.01
    );
  });

  return markers;
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
    textOverlays,
    imageOverlays,
    setCurrentTime,
    trimStart,
    trimEnd,
    setTrimPoints,
  } = useEditorStore();

  const [isDragging, setIsDragging] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (mode !== TimelineMode.SCRUB) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    setCurrentTime(Math.max(0, Math.min(duration, newTime)));
  };

  const generatePreview = async (time: number) => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    video.currentTime = time;

    await new Promise((resolve) => {
      video.onseeked = resolve;
    });

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

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
