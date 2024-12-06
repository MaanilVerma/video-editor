import { TextOverlay } from "./TextOverlay";
import { ImageOverlay } from "./ImageOverlay";
import { GridOverlay } from "./GridOverlay";
import {
  type TextOverlayType,
  type ImageOverlayType,
} from "@/lib/models/overlays";
import { gridSystem, GuideLines } from "@/lib/services/grid-system";
import { useRef, useState, useCallback, useEffect } from "react";

interface VideoOverlaysProps {
  textOverlays: TextOverlayType[];
  imageOverlays: ImageOverlayType[];
  currentTime: number;
}

export function VideoOverlays({
  textOverlays,
  imageOverlays,
  currentTime,
}: VideoOverlaysProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [guides, setGuides] = useState<GuideLines>({
    vertical: [],
    horizontal: [],
  });

  const isOverlayVisible = useCallback(
    (timestamp: number, duration: number) => {
      return currentTime >= timestamp && currentTime <= timestamp + duration;
    },
    [currentTime]
  );

  const visibleTextOverlays = textOverlays.filter((overlay) =>
    isOverlayVisible(overlay.timestamp, overlay.duration)
  );

  const visibleImageOverlays = imageOverlays.filter((overlay) =>
    isOverlayVisible(overlay.timestamp, overlay.duration)
  );

  // Update guides when overlays change
  const updateGuides = (position: { x: number; y: number }) => {
    if (!containerRef.current) return;

    const containerSize = {
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
    };

    const allElements = [
      ...visibleTextOverlays.map((o) => ({ position: o.position })),
      ...visibleImageOverlays.map((o) => ({
        position: o.position,
        size: o.size,
      })),
    ];

    const newGuides = gridSystem.findAlignmentGuides(
      position,
      allElements,
      containerSize
    );
    setGuides(newGuides);
  };

  // Update container size on mount and resize
  useEffect(() => {
    if (!containerRef.current) return;

    const updateSize = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        setContainerSize({
          width: rect.width,
          height: rect.height,
        });
      }
    };

    updateSize();
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-visible border border-white/30 rounded-xl"
      style={{ contain: "paint" }}
    >
      <GridOverlay
        width={containerSize.width}
        height={containerSize.height}
        guides={guides}
      />

      {visibleTextOverlays.map((overlay) => (
        <TextOverlay
          key={overlay.id}
          {...overlay}
          onPositionChange={updateGuides}
          containerSize={containerSize}
          otherElements={[
            ...visibleTextOverlays
              .filter((o) => o.id !== overlay.id)
              .map((o) => ({ position: o.position })),
            ...visibleImageOverlays.map((o) => ({
              position: o.position,
              size: o.size,
            })),
          ]}
        />
      ))}

      {visibleImageOverlays.map((overlay) => (
        <ImageOverlay
          key={overlay.id}
          {...overlay}
          url={overlay.url}
          onPositionChange={updateGuides}
          containerSize={containerSize}
          otherElements={[
            ...visibleTextOverlays.map((o) => ({ position: o.position })),
            ...visibleImageOverlays
              .filter((o) => o.id !== overlay.id)
              .map((o) => ({ position: o.position, size: o.size })),
          ]}
        />
      ))}
    </div>
  );
}
