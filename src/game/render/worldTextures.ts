import Phaser from "phaser";
import { TILE_HEIGHT, TILE_WIDTH } from "../isometric";
import type { ZoneId } from "../world/zoneTypes";

type ZonePalette = { light: number; dark: number; accent: number; edge: number };

const ZONE_PALETTES: Record<ZoneId, ZonePalette> = {
  grove: { light: 0xa8c878, dark: 0x6a9050, accent: 0x88b060, edge: 0x4a6838 },
  shrine: { light: 0xd8c8e8, dark: 0x9888b8, accent: 0xb8a8d0, edge: 0x6a5878 },
  village: { light: 0xe8d0a0, dark: 0xc0a070, accent: 0xd8b888, edge: 0x8a6840 },
  overworld: { light: 0xb8d0e0, dark: 0x7898b0, accent: 0x98b8c8, edge: 0x506878 },
};

const WORLD_TEXTURE_KEYS = [
  "wall-block",
  "hedge-block",
  "floor-path",
  "boundary-grove",
  "boundary-shrine",
  "boundary-village",
  "boundary-overworld",
  "prop-tree",
  "prop-fern",
  "prop-shrine-altar",
  "prop-standing-stone",
  "prop-hearth",
  "prop-cottage",
  "prop-gate",
  "prop-gate-locked",
  "player-south",
  "player-north",
  "player-east",
  "player-west",
] as const;

const BOUNDARY_HEIGHT = 56;

function removeStaleTextures(scene: Phaser.Scene, zoneId: ZoneId): void {
  for (const key of WORLD_TEXTURE_KEYS) {
    if (scene.textures.exists(key)) {
      scene.textures.remove(key);
    }
  }
  for (const variant of ["light", "dark"] as const) {
    const key = `floor-${zoneId}-${variant}`;
    if (scene.textures.exists(key)) {
      scene.textures.remove(key);
    }
  }
}

function drawSquareTile(
  g: Phaser.GameObjects.Graphics,
  w: number,
  h: number,
  fill: number,
  stroke: number,
  strokeAlpha = 0.45,
): void {
  g.fillStyle(fill, 1);
  g.fillRect(0, 0, w, h);
  g.lineStyle(1, stroke, strokeAlpha);
  g.strokeRect(0.5, 0.5, w - 1, h - 1);
}

function generateFloorTextures(scene: Phaser.Scene, zoneId: ZoneId): void {
  const palette = ZONE_PALETTES[zoneId];
  for (const variant of ["light", "dark"] as const) {
    const key = `floor-${zoneId}-${variant}`;
    const base = variant === "light" ? palette.light : palette.dark;
    const g = scene.make.graphics({ x: 0, y: 0 });
    drawSquareTile(g, TILE_WIDTH, TILE_HEIGHT, base, palette.edge);
    g.fillStyle(palette.accent, 0.25);
    if (zoneId === "grove") {
      g.fillCircle(14, 14, 3);
      g.fillCircle(34, 30, 2);
    } else if (zoneId === "shrine") {
      g.fillCircle(TILE_WIDTH / 2, TILE_HEIGHT / 2, 2);
      g.lineStyle(1, 0xe8e0f8, 0.4);
      g.strokeCircle(TILE_WIDTH / 2, TILE_HEIGHT / 2, 6);
    } else if (zoneId === "village") {
      g.fillRect(10, 10, 8, 2);
      g.fillRect(28, 28, 6, 2);
    }
    g.generateTexture(key, TILE_WIDTH, TILE_HEIGHT);
    g.destroy();
  }
}

function generateBoundaryTexture(
  scene: Phaser.Scene,
  key: string,
  draw: (g: Phaser.GameObjects.Graphics) => void,
): void {
  if (scene.textures.exists(key)) {
    return;
  }
  const g = scene.make.graphics({ x: 0, y: 0 });
  draw(g);
  g.generateTexture(key, TILE_WIDTH, BOUNDARY_HEIGHT);
  g.destroy();
}

function generateWallTextures(scene: Phaser.Scene): void {
  generateBoundaryTexture(scene, "boundary-grove", (g) => {
    g.fillStyle(0x5a4830, 1);
    g.fillRect(10, BOUNDARY_HEIGHT - 14, 28, 14);
    g.fillStyle(0x3a7828, 1);
    g.fillCircle(24, BOUNDARY_HEIGHT - 22, 18);
    g.fillStyle(0x5a9a40, 0.75);
    g.fillCircle(14, BOUNDARY_HEIGHT - 28, 10);
    g.fillCircle(34, BOUNDARY_HEIGHT - 26, 8);
  });

  generateBoundaryTexture(scene, "boundary-shrine", (g) => {
    g.fillStyle(0x5a5068, 1);
    g.fillRect(8, BOUNDARY_HEIGHT - 18, 32, 18);
    g.fillStyle(0x8a78a8, 1);
    g.fillRect(12, BOUNDARY_HEIGHT - 32, 24, 16);
    g.fillStyle(0xc8b8e8, 0.5);
    g.fillCircle(24, BOUNDARY_HEIGHT - 38, 4);
  });

  generateBoundaryTexture(scene, "boundary-village", (g) => {
    g.fillStyle(0x8a6848, 1);
    g.fillRect(6, BOUNDARY_HEIGHT - 16, 36, 16);
    g.fillStyle(0xa88868, 1);
    for (let i = 0; i < 4; i++) {
      g.fillRect(10 + i * 9, BOUNDARY_HEIGHT - 28, 7, 12);
    }
    g.lineStyle(1, 0x6a5038, 0.6);
    g.strokeRect(6.5, BOUNDARY_HEIGHT - 16.5, 35, 15);
  });

  generateBoundaryTexture(scene, "boundary-overworld", (g) => {
    g.fillStyle(0x506878, 1);
    g.fillRect(4, BOUNDARY_HEIGHT - 20, 40, 20);
    g.fillStyle(0x7898a8, 1);
    g.fillTriangle(4, BOUNDARY_HEIGHT - 20, 24, BOUNDARY_HEIGHT - 44, 44, BOUNDARY_HEIGHT - 20);
    g.fillStyle(0x98b8c8, 0.45);
    g.fillRect(8, BOUNDARY_HEIGHT - 36, 6, 16);
    g.fillRect(34, BOUNDARY_HEIGHT - 32, 5, 12);
  });
}

function generatePropTextures(scene: Phaser.Scene): void {
  if (!scene.textures.exists("prop-tree")) {
    const g = scene.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x4a3020, 1);
    g.fillRect(19, 30, 10, 18);
    g.fillStyle(0x3a8828, 1);
    g.fillCircle(24, 20, 16);
    g.fillStyle(0x5aaa40, 0.7);
    g.fillCircle(18, 16, 9);
    g.fillCircle(30, 18, 7);
    g.generateTexture("prop-tree", 48, 50);
    g.destroy();
  }

  if (!scene.textures.exists("prop-fern")) {
    const g = scene.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x5a9a48, 1);
    g.fillTriangle(16, 28, 8, 8, 24, 8);
    g.fillTriangle(24, 28, 16, 4, 32, 8);
    g.generateTexture("prop-fern", 40, 32);
    g.destroy();
  }

  if (!scene.textures.exists("prop-shrine-altar")) {
    const g = scene.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x6a5a88, 1);
    g.fillRect(8, 24, 32, 12);
    g.fillStyle(0x9a88b8, 1);
    g.fillRect(12, 16, 24, 10);
    g.fillStyle(0xc8b8e8, 0.9);
    g.fillCircle(24, 10, 8);
    g.generateTexture("prop-shrine-altar", 48, 40);
    g.destroy();
  }

  if (!scene.textures.exists("prop-standing-stone")) {
    const g = scene.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x7a7090, 1);
    g.fillRect(16, 10, 10, 24);
    g.generateTexture("prop-standing-stone", 42, 38);
    g.destroy();
  }

  if (!scene.textures.exists("prop-hearth")) {
    const g = scene.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x8a6840, 1);
    g.fillRect(6, 18, 36, 18);
    g.fillStyle(0x5a4030, 1);
    g.fillRect(14, 6, 20, 14);
    g.fillStyle(0xff8830, 0.8);
    g.fillCircle(24, 18, 5);
    g.generateTexture("prop-hearth", 48, 40);
    g.destroy();
  }

  if (!scene.textures.exists("prop-cottage")) {
    const g = scene.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x7a5840, 1);
    g.fillRect(10, 22, 28, 18);
    g.fillStyle(0x9a4030, 1);
    g.fillTriangle(8, 22, 24, 6, 40, 22);
    g.fillStyle(0x4a3828, 1);
    g.fillRect(20, 28, 8, 12);
    g.fillStyle(0xffcc88, 0.7);
    g.fillRect(12, 26, 6, 5);
    g.generateTexture("prop-cottage", 48, 44);
    g.destroy();
  }

  if (!scene.textures.exists("prop-gate")) {
    const g = scene.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x6a5040, 1);
    g.fillRect(8, 8, 6, 32);
    g.fillRect(34, 8, 6, 32);
    g.fillRect(8, 6, 32, 6);
    g.fillStyle(0x4a9a5a, 0.5);
    g.fillRect(14, 12, 20, 24);
    g.generateTexture("prop-gate", 48, 42);
    g.destroy();
  }

  if (!scene.textures.exists("prop-gate-locked")) {
    const g = scene.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x6a5040, 1);
    g.fillRect(8, 8, 6, 32);
    g.fillRect(34, 8, 6, 32);
    g.fillRect(8, 6, 32, 6);
    g.fillStyle(0x8b3a3a, 0.7);
    g.fillRect(14, 12, 20, 24);
    g.lineStyle(2, 0x5a2020, 0.9);
    g.strokeRect(14, 12, 20, 24);
    g.generateTexture("prop-gate-locked", 48, 42);
    g.destroy();
  }

  if (!scene.textures.exists("floor-path")) {
    const g = scene.make.graphics({ x: 0, y: 0 });
    drawSquareTile(g, TILE_WIDTH, TILE_HEIGHT, 0xc8b898, 0x9a8868);
    g.fillStyle(0xd8c8a8, 0.5);
    g.fillRect(8, TILE_HEIGHT / 2 - 2, TILE_WIDTH - 16, 4);
    g.generateTexture("floor-path", TILE_WIDTH, TILE_HEIGHT);
    g.destroy();
  }
}

function generatePlayerTextures(scene: Phaser.Scene): void {
  const dirs = ["south", "north", "east", "west"] as const;
  for (const dir of dirs) {
    const key = `player-${dir}`;
    if (scene.textures.exists(key)) {
      continue;
    }
    const g = scene.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x000000, 0.25);
    g.fillEllipse(16, 34, 18, 6);
    g.fillStyle(0x3a5a88, 1);
    g.fillRect(10, 16, 12, 16);
    g.fillStyle(0xc8a878, 1);
    g.fillCircle(16, 12, 7);
    g.fillStyle(0x4a3828, 1);
    g.fillRect(8, 10, 16, 4);
    if (dir === "north") {
      g.fillStyle(0x2a4070, 1);
      g.fillRect(10, 18, 12, 12);
    } else if (dir === "east") {
      g.fillRect(14, 14, 6, 18);
    } else if (dir === "west") {
      g.fillRect(8, 14, 6, 18);
    }
    g.generateTexture(key, 32, 38);
    g.destroy();
  }
}

export function getBoundaryTextureKey(zoneId: ZoneId): string {
  return `boundary-${zoneId}`;
}

export function ensureWorldTextures(scene: Phaser.Scene, zoneId: ZoneId): void {
  removeStaleTextures(scene, zoneId);
  generateWallTextures(scene);
  generatePropTextures(scene);
  generatePlayerTextures(scene);
  generateFloorTextures(scene, zoneId);
}

export function getFloorTextureKey(
  zoneId: ZoneId,
  light: boolean,
): string {
  return `floor-${zoneId}-${light ? "light" : "dark"}`;
}
