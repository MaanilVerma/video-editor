import { useRef, useState } from "react";
import { useEditorStore } from "@/lib/store/editor-store";
import { DraggableTimelineItem } from "./DraggableTimelineItem";
import { formatTime } from "@/lib/utils/time";
import { Button } from "@/components/ui/button";
import { Plus, Type, Image as ImageIcon } from "lucide-react";
import { TextOverlayControls } from "../overlays/TextOverlayControls";
import { ImageOverlayControls } from "../overlays/ImageOverlayControls";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface OverlayTimelineProps {
  duration: number;
  currentTime: number;
  zoom: number;
  onScrub?: (time: number) => void;
  onScrubStart?: () => void;
  onScrubEnd?: () => void;
}

export function OverlayTimeline({
  duration,
  zoom,
  onScrub,
  onScrubStart,
  onScrubEnd,
}: OverlayTimelineProps) {
  const { textOverlays, imageOverlays } = useEditorStore();
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(
    null
  );

  const handleSelect = (id: string) => {
    setSelectedOverlayId((currentId) => (currentId === id ? null : id));
  };

  // Group overlays by type for better organization
  const textItems = textOverlays
    .map((overlay) => ({
      id: overlay.id,
      type: "text" as const,
      timestamp: overlay.timestamp,
      duration: overlay.duration,
      label: overlay.text,
      data: overlay,
    }))
    .sort((a, b) => a.timestamp - b.timestamp);

  const imageItems = imageOverlays
    .map((overlay) => ({
      id: overlay.id,
      type: "image" as const,
      timestamp: overlay.timestamp,
      duration: overlay.duration,
      label: `Image ${overlay.id.slice(0, 4)}`,
      data: overlay,
    }))
    .sort((a, b) => a.timestamp - b.timestamp);

  return (
    <div className="relative h-full">
      {/* Track labels */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-background/50 backdrop-blur-sm border-r">
        <div className="p-2 text-xs font-medium">Text</div>
        <div className="p-2 text-xs font-medium mt-8">Images</div>
      </div>

      {/* Overlay tracks */}
      <div className="absolute left-24 right-0 top-0 bottom-0">
        {/* Text track */}
        <div className="relative h-8 border-b">
          {textItems.map((item) => (
            <DraggableTimelineItem
              key={item.id}
              item={item}
              duration={duration}
              zoom={zoom}
              onSelect={handleSelect}
              isSelected={selectedOverlayId === item.id}
            />
          ))}
        </div>

        {/* Image track */}
        <div className="relative h-8">
          {imageItems.map((item) => (
            <DraggableTimelineItem
              key={item.id}
              item={item}
              duration={duration}
              zoom={zoom}
              onSelect={handleSelect}
              isSelected={selectedOverlayId === item.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
