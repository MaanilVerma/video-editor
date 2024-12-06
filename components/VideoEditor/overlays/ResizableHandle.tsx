import { useRef, useState } from "react";

interface ResizableHandleProps {
  initialSize: { width: number; height: number };
  onResize: (size: { width: number; height: number }) => void;
  aspectRatio?: number;
  children: React.ReactNode;
}

export function ResizableHandle({
  initialSize,
  onResize,
  aspectRatio,
  children,
}: ResizableHandleProps) {
  const [size, setSize] = useState(initialSize);
  const isResizing = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const startSize = useRef(initialSize);

  const handleMouseDown = (e: React.MouseEvent) => {
    isResizing.current = true;
    startPos.current = { x: e.clientX, y: e.clientY };
    startSize.current = size;
    e.stopPropagation();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing.current) return;

    const deltaX = e.clientX - startPos.current.x;
    const deltaY = e.clientY - startPos.current.y;

    let newWidth = startSize.current.width + deltaX;
    let newHeight = startSize.current.height + deltaY;

    if (aspectRatio) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        newHeight = newWidth / aspectRatio;
      } else {
        newWidth = newHeight * aspectRatio;
      }
    }

    const newSize = {
      width: Math.max(20, newWidth),
      height: Math.max(20, newHeight),
    };

    setSize(newSize);
    onResize(newSize);
  };

  const handleMouseUp = () => {
    isResizing.current = false;
  };

  return (
    <div className="relative group/resize">
      {children}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-0 group-hover/resize:opacity-100"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove as any}
        onMouseUp={handleMouseUp}
      >
        <div className="w-2 h-2 bg-white border border-gray-300 rounded-sm" />
      </div>
    </div>
  );
}
