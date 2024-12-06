import { useRef } from "react";
import { Size } from "@/lib/models/overlays";

interface ResizeHandleProps {
  size: Size;
  onResize: (size: Size) => void;
  children: React.ReactNode;
  minWidth?: number;
  minHeight?: number;
}

export function ResizeHandle({
  size,
  onResize,
  children,
  minWidth = 50,
  minHeight = 50,
}: ResizeHandleProps) {
  const startResizeRef = useRef({ x: 0, y: 0, width: 0, height: 0 });

  const startResize = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    startResizeRef.current = {
      x: e.pageX,
      y: e.pageY,
      width: size.width,
      height: size.height,
    };

    document.addEventListener("mousemove", handleResize);
    document.addEventListener("mouseup", stopResize);
  };

  const handleResize = (e: MouseEvent) => {
    const deltaX = e.pageX - startResizeRef.current.x;
    const deltaY = e.pageY - startResizeRef.current.y;

    const newWidth = Math.max(minWidth, startResizeRef.current.width + deltaX);
    const aspectRatio =
      startResizeRef.current.width / startResizeRef.current.height;
    const newHeight = Math.max(minHeight, newWidth / aspectRatio);

    onResize({
      width: Math.round(newWidth),
      height: Math.round(newHeight),
    });
  };

  const stopResize = () => {
    document.removeEventListener("mousemove", handleResize);
    document.removeEventListener("mouseup", stopResize);
  };

  return (
    <div className="relative group">
      {children}
      <div
        className="absolute -right-1 -bottom-1 w-4 h-4 bg-white border border-gray-300 rounded-sm cursor-se-resize opacity-0 group-hover:opacity-100 hover:scale-125 transition-all"
        onMouseDown={startResize}
      />
    </div>
  );
}
