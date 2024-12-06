import { useRef } from "react";
import { TimelineTrackProps } from "@/lib/models/timeline";
import { formatTime } from "@/lib/utils/time";
import { DraggableTimelineItem } from "./DraggableTimelineItem";

interface ScrubEvent {
  clientX: number;
  clientY: number;
}

function getTimeMarkers(duration: number): number[] {
  // For videos under 1 minute, show markers every 5 seconds
  if (duration <= 60) {
    return Array.from({ length: Math.ceil(duration / 5) }, (_, i) => i * 5);
  }
  // For videos under 5 minutes, show markers every 30 seconds
  if (duration <= 300) {
    return Array.from({ length: Math.ceil(duration / 30) }, (_, i) => i * 30);
  }
  // For longer videos, show markers every minute
  return Array.from({ length: Math.ceil(duration / 60) }, (_, i) => i * 60);
}

export function TimelineTrack({
  duration,
  currentTime,
  items,
  onItemClick,
  onTimeUpdate,
  zoom = 1,
}: TimelineTrackProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const timeMarkers = getTimeMarkers(duration);

  const handleScrubStart = (event: ScrubEvent) => {
    isDragging.current = true;
    handleScrubMove(event);
  };

  const handleScrubMove = (event: ScrubEvent) => {
    if (!isDragging.current || !trackRef.current) return;

    const rect = trackRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, event.clientX - rect.left));
    const percentage = x / rect.width;
    const newTime = duration * percentage;
    onTimeUpdate(Math.max(0, Math.min(newTime, duration)));
  };

  const handleScrubEnd = () => {
    isDragging.current = false;
  };

  return (
    <div className="relative h-12 bg-zinc-900/50 rounded-lg border border-zinc-800/50 overflow-hidden">
      {/* Container with horizontal scroll */}
      <div
        className="absolute inset-0 overflow-x-auto overflow-y-hidden touch-none"
        onMouseDown={(e) => handleScrubStart(e)}
        onMouseMove={(e) => handleScrubMove(e)}
        onMouseUp={handleScrubEnd}
        onMouseLeave={handleScrubEnd}
        onTouchStart={(e) => handleScrubStart(e.touches[0])}
        onTouchMove={(e) => handleScrubMove(e.touches[0])}
        onTouchEnd={handleScrubEnd}
      >
        {/* Content container with minimum width and padding */}
        <div
          ref={trackRef}
          className="relative h-full px-8"
          style={{
            width: `${Math.max(100 * zoom, 100)}%`,
            minWidth: "100%",
          }}
        >
          {/* Time markers container with proper bounds */}
          <div className="absolute inset-x-0 top-0 h-6">
            {/* First and last markers for bounds */}
            <div
              className="absolute left-0 flex flex-col items-center"
              style={{ transform: "translateX(-50%)" }}
            >
              <div className="h-2 w-px bg-zinc-700" />
              <span className="text-[10px] text-zinc-500 mt-1 whitespace-nowrap">
                {formatTime(0)}
              </span>
            </div>

            {/* Dynamic time markers */}
            {timeMarkers
              .filter((time) => time > 0 && time < duration)
              .map((time) => (
                <div
                  key={time}
                  className="absolute flex flex-col items-center"
                  style={{
                    left: `${(time / duration) * 100}%`,
                    transform: "translateX(-50%)",
                  }}
                >
                  <div className="h-2 w-px bg-zinc-700" />
                  <span className="text-[10px] text-zinc-500 mt-1 whitespace-nowrap">
                    {formatTime(time)}
                  </span>
                </div>
              ))}

            {/* End marker */}
            <div
              className="absolute right-0 flex flex-col items-center"
              style={{ transform: "translateX(50%)" }}
            >
              <div className="h-2 w-px bg-zinc-700" />
              <span className="text-[10px] text-zinc-500 mt-1 whitespace-nowrap">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Current time indicator */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500/50"
            style={{
              left: `${(currentTime / duration) * 100}%`,
              transform: "translateX(-50%)",
            }}
          />

          {/* Timeline items */}
          <div className="absolute bottom-0 left-0 right-0 h-6">
            {items.map((item) => (
              <DraggableTimelineItem
                key={item.id}
                item={item}
                duration={duration}
                zoom={zoom}
                onSelect={() => onItemClick(item.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
