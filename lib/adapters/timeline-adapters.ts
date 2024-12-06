import { TextOverlayType, ImageOverlayType } from "@/lib/models/overlays";
import { TimelineItem } from "@/lib/models/timeline";

export function adaptOverlaysToTimelineItems(
  textOverlays: TextOverlayType[],
  imageOverlays: ImageOverlayType[]
): TimelineItem[] {
  const textItems = textOverlays.map(
    (overlay): TimelineItem => ({
      id: overlay.id,
      timestamp: overlay.timestamp,
      duration: overlay.duration,
      label: overlay.text,
      type: "text",
      data: overlay,
    })
  );

  const imageItems = imageOverlays.map(
    (overlay): TimelineItem => ({
      id: overlay.id,
      timestamp: overlay.timestamp,
      duration: overlay.duration,
      label: "Image",
      type: "image",
      data: overlay,
    })
  );

  return [...textItems, ...imageItems];
}
