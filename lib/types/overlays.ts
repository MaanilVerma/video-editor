export interface Size {
  width: number;
  height: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface TextOverlayType {
  id: string;
  text: string;
  position: Position;
  fontSize: number;
  fontFamily: string;
  color: string;
  timestamp: number;
  duration: number;
}

export interface ImageOverlayType {
  id: string;
  url: string;
  file?: File;
  position: Position;
  size: Size;
  timestamp: number;
  duration: number;
}
