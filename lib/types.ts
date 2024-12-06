export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface TextOverlayType {
  id: string;
  text: string;
  position: Position;
  fontSize: number;
  fontFamily: string;
  color: string;
  timestamp: number;
}

export interface ImageOverlayType {
  id: string;
  url: string;
  position: Position;
  size: Size;
  timestamp: number;
}
