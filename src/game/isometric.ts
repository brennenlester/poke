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

export function isWithinGrid(
  gridX: number,
  gridY: number,
  width: number,
  height: number,
): boolean {
  return gridX >= 0 && gridY >= 0 && gridX < width && gridY < height;
}
