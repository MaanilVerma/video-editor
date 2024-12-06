export interface GridConfig {
  cellSize: number;
  snapThreshold: number;
  showGrid: boolean;
  showGuides: boolean;
}

export interface Position {
  x: number;
  y: number;
}

export interface GuideLines {
  vertical: number[];
  horizontal: number[];
}

export class GridSystem {
  private config: GridConfig = {
    cellSize: 20,
    snapThreshold: 5,
    showGrid: true,
    showGuides: true,
  };

  setConfig(config: Partial<GridConfig>) {
    this.config = { ...this.config, ...config };
  }

  snapToGrid(position: Position): Position {
    const { cellSize, snapThreshold } = this.config;

    const snapX = Math.round(position.x / cellSize) * cellSize;
    const snapY = Math.round(position.y / cellSize) * cellSize;

    // Only snap if within threshold
    return {
      x: Math.abs(position.x - snapX) < snapThreshold ? snapX : position.x,
      y: Math.abs(position.y - snapY) < snapThreshold ? snapY : position.y,
    };
  }

  findAlignmentGuides(
    currentPosition: Position,
    otherElements: Array<{
      position: Position;
      size?: { width: number; height: number };
    }>,
    containerSize: { width: number; height: number }
  ): GuideLines {
    const guides: GuideLines = {
      vertical: [],
      horizontal: [],
    };

    // Center guides
    guides.vertical.push(containerSize.width / 2);
    guides.horizontal.push(containerSize.height / 2);

    // Edge guides
    guides.vertical.push(0, containerSize.width);
    guides.horizontal.push(0, containerSize.height);

    // Element alignment guides
    otherElements.forEach((element) => {
      // Left/Right alignment
      guides.vertical.push(element.position.x);
      if (element.size) {
        guides.vertical.push(element.position.x + element.size.width);
      }

      // Top/Bottom alignment
      guides.horizontal.push(element.position.y);
      if (element.size) {
        guides.horizontal.push(element.position.y + element.size.height);
      }
    });

    return guides;
  }

  snapToGuides(position: Position, guides: GuideLines): Position {
    const { snapThreshold } = this.config;
    let snappedPosition = { ...position };

    // Snap to vertical guides
    guides.vertical.forEach((guideX) => {
      if (Math.abs(position.x - guideX) < snapThreshold) {
        snappedPosition.x = guideX;
      }
    });

    // Snap to horizontal guides
    guides.horizontal.forEach((guideY) => {
      if (Math.abs(position.y - guideY) < snapThreshold) {
        snappedPosition.y = guideY;
      }
    });

    return snappedPosition;
  }
}

export const gridSystem = new GridSystem();
