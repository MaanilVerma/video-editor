import { useRef } from "react";
import { GripVertical } from "lucide-react";

interface TimelineTrimmerProps {
  duration: number;
  trimStart: number;
  trimEnd: number;
  onTrimChange: (start: number, end: number) => void;
}

export function TimelineTrimmer({
  duration,
  trimStart,
  trimEnd,
  onTrimChange,
}: TimelineTrimmerProps) {
  const isDragging = useRef<"start" | "end" | null>(null);
  const startX = useRef(0);
  const initialValues = useRef({ start: 0, end: 0 });

  const handleMouseDown = (e: React.MouseEvent, handle: "start" | "end") => {
    isDragging.current = handle;
    startX.current = e.clientX;
    initialValues.current = { start: trimStart, end: trimEnd };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return;

    const deltaX = e.clientX - startX.current;
    const deltaTime = (deltaX / window.innerWidth) * duration;

    if (isDragging.current === "start") {
      const newStart = Math.max(
        0,
        Math.min(trimEnd - 1, initialValues.current.start + deltaTime)
      );
      onTrimChange(newStart, trimEnd);
    } else {
      const newEnd = Math.max(
        trimStart + 1,
        Math.min(duration, initialValues.current.end + deltaTime)
      );
      onTrimChange(trimStart, newEnd);
    }
  };

  const handleMouseUp = () => {
    isDragging.current = null;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className="absolute inset-0">
      {/* Trimmed out regions with semi-transparent overlay */}
      <div
        className="absolute top-0 bottom-0 bg-black/50"
        style={{
          left: 0,
          width: `${(trimStart / duration) * 100}%`,
        }}
      />
      <div
        className="absolute top-0 bottom-0 bg-black/50"
        style={{
          right: 0,
          width: `${((duration - trimEnd) / duration) * 100}%`,
        }}
      />

      {/* Active region indicator */}
      <div
        className="absolute top-0 bottom-0 border-l-2 border-r-2 border-red-500/30"
        style={{
          left: `${(trimStart / duration) * 100}%`,
          width: `${((trimEnd - trimStart) / duration) * 100}%`,
        }}
      />

      {/* Trim handles */}
      <div
        className="absolute top-0 bottom-0 -ml-3 flex items-center cursor-ew-resize group"
        style={{ left: `${(trimStart / duration) * 100}%` }}
        onMouseDown={(e) => handleMouseDown(e, "start")}
      >
        <div className="w-6 h-12 bg-primary rounded-l flex items-center justify-center group-hover:w-8 transition-all">
          <GripVertical className="w-4 h-4 text-primary-foreground" />
        </div>
      </div>
      <div
        className="absolute top-0 bottom-0 -mr-3 flex items-center cursor-ew-resize group"
        style={{ left: `${(trimEnd / duration) * 100}%` }}
        onMouseDown={(e) => handleMouseDown(e, "end")}
      >
        <div className="w-6 h-12 bg-primary rounded-r flex items-center justify-center group-hover:w-8 transition-all">
          <GripVertical className="w-4 h-4 text-primary-foreground" />
        </div>
      </div>
    </div>
  );
}
