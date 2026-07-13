import type Phaser from "phaser";

/** Cap DPR so fill-rate stays reasonable on 3× phones. */
export const RENDER_DPR = Math.min(
  typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
  2,
);

/** Logical layout size for overlay scenes (battle / encounter / shrine). */
export const DESIGN_SIZE = 640;

/** Match the Phaser buffer to the CSS board size × DPR for crisp sprites. */
export function resizeGameForDisplay(
  scene: Phaser.Scene,
  boardDisplaySize: number,
): void {
  const size = Math.max(1, Math.round(boardDisplaySize * RENDER_DPR));
  if (
    scene.scale.gameSize.width !== size ||
    scene.scale.gameSize.height !== size
  ) {
    scene.scale.resize(size, size);
  }
}

/**
 * Frame the 640×640 design space in the HiDPI buffer so overlay layouts
 * (which use 0..640 coords) stay on camera.
 */
export function applyOverlayPixelRatio(scene: Phaser.Scene): void {
  const cam = scene.cameras.main;
  const zoom = Math.min(
    scene.scale.width / DESIGN_SIZE,
    scene.scale.height / DESIGN_SIZE,
  );
  cam.setZoom(zoom);
  cam.centerOn(DESIGN_SIZE / 2, DESIGN_SIZE / 2);
}

export function overlayCenter(): { x: number; y: number } {
  return { x: DESIGN_SIZE / 2, y: DESIGN_SIZE / 2 };
}
