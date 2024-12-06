import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEditorStore } from "@/lib/store/editor-store";
import { Type } from "lucide-react";

export default function TextOverlayControls() {
  const [text, setText] = useState("");
  const { currentTime, addTextOverlay, duration } = useEditorStore();

  const handleAddText = () => {
    if (!text.trim()) return;

    addTextOverlay({
      id: crypto.randomUUID(),
      text,
      position: { x: 50, y: 50 }, // Default position in the middle
      fontSize: 24,
      fontFamily: "Arial",
      color: "#ffffff",
      timestamp: currentTime,
      duration,
    });

    setText("");
  };

  return (
    <div className="flex gap-2 items-center">
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text overlay..."
        className="flex-1"
      />
      <Button
        variant="outline"
        size="icon"
        onClick={handleAddText}
        title="Add Text Overlay"
      >
        <Type className="w-4 h-4" />
      </Button>
    </div>
  );
}
