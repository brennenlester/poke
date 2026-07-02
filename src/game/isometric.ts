export const TILE_WIDTH = 64;
export const TILE_HEIGHT = 32;

export type GridPoint = { x: number; y: number };
export type ScreenPoint = { x: number; y: number };

export type ZoneCenter = { x: number; y: number };

/**
 * Project square grid to screen with dimetric layout, then rotate 45° CCW
 * around the zone center so a flat edge of the board faces the camera.
 */
export function gridToScreen(
  gridX: number,
  gridY: number,
  originX: number,
  originY: number,
  zoneCenter?: ZoneCenter,
): ScreenPoint {
  const halfW = TILE_WIDTH / 2;
  const halfH = TILE_HEIGHT / 2;
  const isoX = (gridX - gridY) * halfW;
  const isoY = (gridX + gridY) * halfH;

  if (!zoneCenter) {
    return { x: originX + isoX, y: originY + isoY };
  }

  const centerIsoX = (zoneCenter.x - zoneCenter.y) * halfW;
  const centerIsoY = (zoneCenter.x + zoneCenter.y) * halfH;
  const dx = isoX - centerIsoX;
  const dy = isoY - centerIsoY;
  const c = Math.SQRT1_2;
  const rotX = (dx - dy) * c;
  const rotY = (dx + dy) * c;

  return {
    x: originX + centerIsoX + rotX,
    y: originY + centerIsoY + rotY,
  };
}

export function screenToGrid(
  screenX: number,
  screenY: number,
  originX: number,
  originY: number,
  zoneCenter?: ZoneCenter,
): GridPoint {
  const halfW = TILE_WIDTH / 2;
  const halfH = TILE_HEIGHT / 2;

  let dx = screenX - originX;
  let dy = screenY - originY;

  if (zoneCenter) {
    const centerIsoX = (zoneCenter.x - zoneCenter.y) * halfW;
    const centerIsoY = (zoneCenter.x + zoneCenter.y) * halfH;
    dx -= centerIsoX;
    dy -= centerIsoY;
    const c = Math.SQRT1_2;
    const unrotX = (dx + dy) * c;
    const unrotY = (-dx + dy) * c;
    dx = centerIsoX + unrotX;
    dy = centerIsoY + unrotY;
  }

  return {
    x: (dx / halfW + dy / halfH) / 2,
    y: (dy / halfH - dx / halfW) / 2,
  };
}

export function zoneGridCenter(width: number, height: number): ZoneCenter {
  return { x: (width - 1) / 2, y: (height - 1) / 2 };
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
