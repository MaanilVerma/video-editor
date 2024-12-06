import { useState } from "react";
import { useEditorStore } from "@/lib/store/editor-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ColorPicker } from "@/components/ui/color-picker";
import { FontSelect } from "@/components/ui/font-select";
import { DurationInput } from "@/components/VideoEditor/controls/DurationInput";
import { Plus } from "lucide-react";

export function TextOverlayControls() {
  const [text, setText] = useState("");
  const [fontSize, setFontSize] = useState(24);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [color, setColor] = useState("#ffffff");
  const [duration, setDuration] = useState(5);
  const { addTextOverlay } = useEditorStore();

  const handleAddText = () => {
    const id = crypto.randomUUID();

    // Get container dimensions
    const container = document.querySelector(".video-container");
    const containerWidth = container?.clientWidth || 0;
    const containerHeight = container?.clientHeight || 0;

    // Calculate center position
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;

    addTextOverlay({
      id,
      text: "New Text",
      position: {
        x: centerX,
        y: centerY,
      },
      fontSize: 24,
      fontFamily: "Arial",
      color: "#ffffff",
      timestamp: 0,
      duration: 5,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <Label className="text-white/80">Text Content</Label>
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text..."
          className="bg-black/20 border-white/10 text-white"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-white/80">Font Size: {fontSize}px</Label>
        <Slider
          value={[fontSize]}
          min={12}
          max={72}
          step={1}
          onValueChange={([value]) => setFontSize(value)}
          className="py-4"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-white/80">Font Family</Label>
        <FontSelect
          value={fontFamily}
          onChange={setFontFamily}
          className="bg-black/20 border-white/10 text-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2 mt-1.5">
          <Label className="text-white/80">Color</Label>
          <ColorPicker color={color} onChange={setColor} />
        </div>

        <div className="space-y-2">
          <Label className="text-white/80">Duration (seconds)</Label>
          <DurationInput
            duration={duration}
            onChange={setDuration}
            maxDuration={30}
          />
        </div>
      </div>

      <Button
        onClick={handleAddText}
        disabled={!text.trim()}
        className="w-full bg-white/10 hover:bg-white/20 text-white"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Text Overlay
      </Button>
    </div>
  );
}
