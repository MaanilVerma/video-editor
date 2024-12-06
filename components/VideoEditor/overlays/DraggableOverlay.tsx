import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { Position } from "@/lib/models/overlays";

interface DraggableOverlayProps {
  initialPosition: Position;
  onPositionChange: (position: Position) => void;
  className?: string;
  children: React.ReactNode;
  containerSize: { width: number; height: number };
  otherElements?: Array<{
    position: Position;
    size?: { width: number; height: number };
  }>;
}

export function DraggableOverlay({
  initialPosition,
  onPositionChange,
  className,
  children,
  containerSize,
  otherElements = [],
}: DraggableOverlayProps) {
  // Store position in relative coordinates (0-1) instead of percentages
  const [position, setPosition] = useState({
    x: initialPosition.x / containerSize.width,
    y: initialPosition.y / containerSize.height,
  });

  const elementRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setPosition({
      x: initialPosition.x / containerSize.width,
      y: initialPosition.y / containerSize.height,
    });
  }, [initialPosition.x, initialPosition.y]); // Remove containerSize dependency

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!elementRef.current) return;

    isDragging.current = true;
    const rect = elementRef.current.getBoundingClientRect();
    offset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current || !elementRef.current) return;

    const containerRect =
      elementRef.current.parentElement?.getBoundingClientRect();
    if (!containerRect) return;

    // Calculate new position in relative coordinates (0-1)
    const newX =
      (e.clientX - containerRect.left - offset.current.x) / containerRect.width;
    const newY =
      (e.clientY - containerRect.top - offset.current.y) / containerRect.height;

    // Clamp values between 0 and 1
    const clampedX = Math.max(0, Math.min(1, newX));
    const clampedY = Math.max(0, Math.min(1, newY));

    setPosition({ x: clampedX, y: clampedY });

    // Convert to actual pixels for the callback
    onPositionChange({
      x: clampedX * containerSize.width,
      y: clampedY * containerSize.height,
    });
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      ref={elementRef}
      className={cn(
        "absolute cursor-move",
        "transform -translate-x-1/2 -translate-y-1/2",
        className
      )}
      style={{
        left: `${position.x * 100}%`,
        top: `${position.y * 100}%`,
        touchAction: "none",
        zIndex: isDragging.current ? 100 : 1,
      }}
      onMouseDown={handleMouseDown}
    >
      {children}
    </div>
  );
}
