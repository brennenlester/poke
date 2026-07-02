export const TILE_WIDTH = 64;
export const TILE_HEIGHT = 32;

export type GridPoint = { x: number; y: number };
export type ScreenPoint = { x: number; y: number };

export function gridToScreen(
  gridX: number,
  gridY: number,
  originX: number,
  originY: number,
): ScreenPoint {
  return {
    x: originX + (gridX - gridY) * (TILE_WIDTH / 2),
    y: originY + (gridX + gridY) * (TILE_HEIGHT / 2),
  };
}

export function screenToGrid(
  screenX: number,
  screenY: number,
  originX: number,
  originY: number,
): GridPoint {
  const halfW = TILE_WIDTH / 2;
  const halfH = TILE_HEIGHT / 2;
  const dx = screenX - originX;
  const dy = screenY - originY;

  return {
    x: (dx / halfW + dy / halfH) / 2,
    y: (dy / halfH - dx / halfW) / 2,
  };
}

export function isWithinGrid(
  gridX: number,
  gridY: number,
  width: number,
  height: number,
): boolean {
  return gridX >= 0 && gridY >= 0 && gridX < width && gridY < height;
}

/** Render depth for a grid cell; higher values draw in front (closer to camera). */
export function depthForGridCell(
  gridX: number,
  gridY: number,
  layer = 0,
): number {
  return gridX + gridY + layer;
}
