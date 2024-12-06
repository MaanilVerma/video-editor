import { TextOverlayType, ImageOverlayType } from "./overlays";

export type TimelineItemType = "text" | "image";

export interface TimelineItem {
  id: string;
  timestamp: number;
  duration: number;
  label: string;
  type: TimelineItemType;
  data: TextOverlayType | ImageOverlayType;
}

export interface TimelineTrackProps {
  duration: number;
  currentTime: number;
  items: TimelineItem[];
  onItemClick: (id: string) => void;
  onTimeUpdate: (time: number) => void;
  onScrubStart?: () => void;
  zoom?: number;
}

export interface TimelineState {
  selectedItemId: string | null;
  zoom: number;
  isPlaying: boolean;
  currentTime: number;
  setSelectedItem: (id: string | null) => void;
  setZoom: (zoom: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentTime: (time: number) => void;
}

export interface TimelineMarker {
  time: number;
  label: string;
  type: "in" | "out" | "custom";
}

export enum TimelineMode {
  SCRUB = "scrub",
  TRIM = "trim",
  OVERLAY = "overlay",
}
