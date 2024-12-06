import { DraggableOverlay } from "./DraggableOverlay";
import { useEditorStore } from "@/lib/store/editor-store";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { Position } from "@/lib/models/overlays";

export interface TextOverlayProps {
  id: string;
  text: string;
  position: Position;
  fontSize: number;
  fontFamily: string;
  color: string;
  timestamp: number;
  onPositionChange?: (position: Position) => void;
  containerSize: { width: number; height: number };
  otherElements?: Array<{
    position: Position;
    size?: { width: number; height: number };
  }>;
}

export function TextOverlay({
  id,
  text,
  position,
  fontSize,
  fontFamily,
  color,
  onPositionChange,
  containerSize,
  otherElements,
}: TextOverlayProps) {
  const { updateTextOverlay, removeTextOverlay } = useEditorStore();

  const handlePositionChange = (newPosition: Position) => {
    updateTextOverlay(id, { position: newPosition });
    onPositionChange?.(newPosition);
  };

  return (
    <DraggableOverlay
      initialPosition={position}
      onPositionChange={handlePositionChange}
      className="group"
      containerSize={containerSize}
      otherElements={otherElements}
    >
      <div className="relative">
        <p
          style={{
            fontSize: `${fontSize}px`,
            fontFamily,
            color,
          }}
        >
          {text}
        </p>
        <div className="absolute -top-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="destructive"
            size="icon"
            className="h-6 w-6"
            onClick={() => removeTextOverlay(id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </DraggableOverlay>
  );
}
