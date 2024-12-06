import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { TimelineItem } from "@/lib/models/timeline";
import { useEditorStore } from "@/lib/store/editor-store";

interface DraggableTimelineItemProps {
  item: TimelineItem;
  duration: number;
  zoom: number;
  onSelect: (id: string) => void;
  isSelected?: boolean;
}

export function DraggableTimelineItem({
  item,
  duration,
  zoom,
  onSelect,
  isSelected = false,
}: DraggableTimelineItemProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragRef = useRef<{ startX: number; startTime: number } | null>(null);
  const { updateTextOverlay, updateImageOverlay } = useEditorStore();

  const handleDragStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startTime: item.timestamp,
    };
    onSelect(item.id);
  };

  const handleDrag = (e: React.MouseEvent) => {
    if (!isDragging || !dragRef.current) return;

    const rect = e.currentTarget.parentElement?.getBoundingClientRect();
    if (!rect) return;

    const deltaX = e.clientX - dragRef.current.startX;
    const deltaTime = (deltaX / rect.width) * duration;
    const newTime = Math.max(
      0,
      Math.min(duration - item.duration, dragRef.current.startTime + deltaTime)
    );

    const update = {
      timestamp: newTime,
    };

    if (item.type === "text") {
      updateTextOverlay(item.id, update);
    } else {
      updateImageOverlay(item.id, update);
    }
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    dragRef.current = {
      startX: e.clientX,
      startTime: item.duration,
    };
  };

  const handleResize = (e: React.MouseEvent) => {
    if (!isResizing || !dragRef.current) return;

    const rect = e.currentTarget.parentElement?.getBoundingClientRect();
    if (!rect) return;

    const deltaX = e.clientX - dragRef.current.startX;
    const deltaTime = (deltaX / rect.width) * duration;
    const newDuration = Math.max(
      0.1,
      Math.min(duration - item.timestamp, dragRef.current.startTime + deltaTime)
    );

    const update = {
      duration: newDuration,
    };

    if (item.type === "text") {
      updateTextOverlay(item.id, update);
    } else {
      updateImageOverlay(item.id, update);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    dragRef.current = null;
  };

  return (
    <div
      className={cn(
        "absolute h-8 bottom-0 rounded group flex items-center justify-center",
        item.type === "text" ? "bg-primary/20" : "bg-secondary/20",
        "hover:bg-primary/30 transition-colors",
        isDragging && "opacity-50",
        isSelected && "ring-2 ring-primary ring-offset-1"
      )}
      style={{
        left: `${(item.timestamp / duration) * 100}%`,
        width: `${(item.duration / duration) * 100 * zoom}%`,
        cursor: isDragging ? "grabbing" : "grab",
      }}
      onMouseDown={handleDragStart}
      onMouseMove={
        isDragging ? handleDrag : isResizing ? handleResize : undefined
      }
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <span className="text-xs truncate px-2 select-none">{item.label}</span>

      <div
        className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize 
                   opacity-0 group-hover:opacity-100 bg-primary/50 rounded-r"
        onMouseDown={handleResizeStart}
      />

      <div
        className="absolute bottom-full mb-2 left-0 opacity-0 group-hover:opacity-100 
                    transition-opacity bg-background rounded-lg p-2 shadow-lg"
      >
        <div className="text-xs">
          <div>Start: {item.timestamp.toFixed(2)}s</div>
          <div>Duration: {item.duration.toFixed(2)}s</div>
        </div>
      </div>
    </div>
  );
}
