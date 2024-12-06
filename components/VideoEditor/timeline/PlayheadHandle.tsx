import { useRef, useEffect } from "react";
import { TimelineMode } from "@/lib/models";

interface PlayheadHandleProps {
  position: number;
  duration: number;
  onDrag: (time: number) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  isPlaying?: boolean;
  mode?: TimelineMode;
  trimStart?: number;
  trimEnd?: number;
}

export function PlayheadHandle({
  position,
  duration,
  onDrag,
  onDragStart,
  onDragEnd,
  isPlaying,
  mode,
  trimStart = 0,
  trimEnd = duration,
}: PlayheadHandleProps) {
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use CSS animation for smoother playback within trim bounds
  useEffect(() => {
    if (!containerRef.current) return;
    const element = containerRef.current;

    if (isPlaying) {
      const endPosition = mode === TimelineMode.TRIM ? trimEnd : duration;
      const remainingDuration = endPosition - position;
      element.style.transition = `left ${remainingDuration}s linear`;
      element.style.left = `${(endPosition / duration) * 100}%`;
    } else {
      element.style.transition = "none";
      // Ensure playhead stays within trim bounds in trim mode
      const boundedPosition =
        mode === TimelineMode.TRIM
          ? Math.max(trimStart, Math.min(trimEnd, position))
          : position;
      element.style.left = `${(boundedPosition / duration) * 100}%`;
    }

    return () => {
      element.style.transition = "none";
    };
  }, [isPlaying, position, duration, mode, trimStart, trimEnd]);

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;

    const container = containerRef.current.parentElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    let time = (x / rect.width) * duration;

    // Constrain to trim bounds in trim mode
    if (mode === TimelineMode.TRIM) {
      time = Math.max(trimStart, Math.min(trimEnd, time));
    }

    onDrag(time);
  };

  useEffect(() => {
    const handleMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      onDragEnd?.();
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    if (isDragging.current) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [duration, onDrag, onDragEnd]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    isDragging.current = true;
    onDragStart?.();
  };

  return (
    <div
      ref={containerRef}
      className="absolute top-0 -translate-x-1/2 select-none"
      style={{
        left: isPlaying ? `${(position / duration) * 100}%` : undefined,
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="flex flex-col items-center">
        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-red-500 to-red-600 shadow-lg hover:scale-110 transition-transform cursor-grab active:cursor-grabbing ring-2 ring-red-500/20">
          <div className="w-1.5 h-1.5 bg-white rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="w-0.5 h-24 bg-gradient-to-b from-red-500 to-red-500/20" />
      </div>
    </div>
  );
}
