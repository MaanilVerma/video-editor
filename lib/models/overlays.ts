export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface OverlayBase {
  id: string;
  timestamp: number;
  duration: number;
  position: Position;
}

export interface TextOverlayType extends OverlayBase {
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
}

export interface ImageOverlayType extends OverlayBase {
  url: string;
  size: Size;
}
