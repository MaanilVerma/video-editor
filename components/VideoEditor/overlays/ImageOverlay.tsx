import { DraggableOverlay } from "./DraggableOverlay";
import { useEditorStore } from "@/lib/store/editor-store";
import { Button } from "@/components/ui/button";
import { X, Move } from "lucide-react";
import { ResizableHandle } from "./ResizableHandle";
import type { Position, Size } from "@/lib/models/overlays";
import { ResizeHandle } from "./ResizeHandle";

export interface ImageOverlayProps {
  id: string;
  url: string;
  position: Position;
  size: Size;
  timestamp: number;
  onPositionChange?: (position: Position) => void;
  containerSize: { width: number; height: number };
  otherElements?: Array<{
    position: Position;
    size?: Size;
  }>;
}

export function ImageOverlay({
  id,
  url,
  position,
  size,
  onPositionChange,
  containerSize,
  otherElements,
}: ImageOverlayProps) {
  const { updateImageOverlay, removeImageOverlay } = useEditorStore();

  const handlePositionChange = (newPosition: Position) => {
    updateImageOverlay(id, { position: newPosition });
    onPositionChange?.(newPosition);
  };

  const handleResize = (newSize: Size) => {
    updateImageOverlay(id, { size: newSize });
  };

  return (
    <DraggableOverlay
      initialPosition={position}
      onPositionChange={handlePositionChange}
      className="group"
      containerSize={containerSize}
      otherElements={otherElements}
    >
      <ResizeHandle
        size={size}
        onResize={handleResize}
        minWidth={50}
        minHeight={50}
      >
        <img
          src={url}
          alt="Overlay"
          style={{
            width: size.width,
            height: size.height,
            objectFit: "contain",
          }}
          draggable={false}
        />
        <Button
          variant="destructive"
          size="icon"
          className="absolute -top-8 right-0 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => removeImageOverlay(id)}
        >
          <X className="h-4 w-4" />
        </Button>
      </ResizeHandle>
    </DraggableOverlay>
  );
}
