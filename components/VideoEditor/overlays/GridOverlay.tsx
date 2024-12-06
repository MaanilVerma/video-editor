import { useEffect, useState } from "react";
import { gridSystem, type GuideLines } from "@/lib/services/grid-system";

interface GridOverlayProps {
  width: number;
  height: number;
  guides: GuideLines;
}

export function GridOverlay({
  width,
  height,
  guides,
}: {
  width: number;
  height: number;
  guides: GuideLines;
}) {
  if (!width || !height) return null;

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={width}
      height={height}
      style={{ overflow: "visible" }}
    >
      {/* Grid lines */}
      <g className="stroke-muted-foreground/20">
        {/* Vertical lines */}
        {Array.from({ length: 10 }, (_, i) => (
          <line
            key={`v-${i}`}
            x1={(width * (i + 1)) / 10}
            y1={0}
            x2={(width * (i + 1)) / 10}
            y2={height}
            strokeWidth={1}
          />
        ))}
        {/* Horizontal lines */}
        {Array.from({ length: 10 }, (_, i) => (
          <line
            key={`h-${i}`}
            x1={0}
            y1={(height * (i + 1)) / 10}
            x2={width}
            y2={(height * (i + 1)) / 10}
            strokeWidth={1}
          />
        ))}
      </g>

      {/* Guide lines */}
      <g className="stroke-blue-500">
        {guides.vertical.map((x, i) => (
          <line
            key={`guide-v-${i}`}
            x1={x}
            y1={-5000}
            x2={x}
            y2={5000}
            strokeWidth={1}
            strokeDasharray="4 4"
          />
        ))}
        {guides.horizontal.map((y, i) => (
          <line
            key={`guide-h-${i}`}
            x1={-5000}
            y1={y}
            x2={5000}
            y2={y}
            strokeWidth={1}
            strokeDasharray="4 4"
          />
        ))}
      </g>
    </svg>
  );
}
