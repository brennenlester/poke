import Phaser from "phaser";
import { TILE_HEIGHT, TILE_WIDTH } from "../isometric";
import type { ZoneId } from "../world/zoneTypes";

const WALL_RISE = 28;

type ZonePalette = { light: number; dark: number; accent: number; edge: number };

const ZONE_PALETTES: Record<ZoneId, ZonePalette> = {
  grove: { light: 0xa8c878, dark: 0x6a9050, accent: 0x88b060, edge: 0x4a6838 },
  shrine: { light: 0xd8c8e8, dark: 0x9888b8, accent: 0xb8a8d0, edge: 0x6a5878 },
  village: { light: 0xe8d0a0, dark: 0xc0a070, accent: 0xd8b888, edge: 0x8a6840 },
  overworld: { light: 0xb8d0e0, dark: 0x7898b0, accent: 0x98b8c8, edge: 0x506878 },
};

function drawIsoDiamond(
  g: Phaser.GameObjects.Graphics,
  w: number,
  h: number,
  fill: number,
  stroke: number,
  strokeAlpha = 0.35,
): void {
  g.fillStyle(fill, 1);
  g.beginPath();
  g.moveTo(w / 2, 0);
  g.lineTo(w, h / 2);
  g.lineTo(w / 2, h);
  g.lineTo(0, h / 2);
  g.closePath();
  g.fillPath();
  g.lineStyle(1, stroke, strokeAlpha);
  g.strokePath();
}

function generateFloorTextures(scene: Phaser.Scene, zoneId: ZoneId): void {
  const palette = ZONE_PALETTES[zoneId];
  for (const variant of ["light", "dark"] as const) {
    const key = `floor-${zoneId}-${variant}`;
    if (scene.textures.exists(key)) {
      continue;
    }
    const base = variant === "light" ? palette.light : palette.dark;
    const g = scene.make.graphics({ x: 0, y: 0 });
    drawIsoDiamond(g, TILE_WIDTH, TILE_HEIGHT, base, palette.edge);
    g.fillStyle(palette.accent, 0.25);
    if (zoneId === "grove") {
      g.fillCircle(22, 18, 3);
      g.fillCircle(40, 22, 2);
    } else if (zoneId === "shrine") {
      g.fillCircle(32, 16, 2);
      g.lineStyle(1, 0xe8e0f8, 0.4);
      g.strokeCircle(32, 16, 5);
    } else if (zoneId === "village") {
      g.fillRect(18, 12, 8, 2);
      g.fillRect(36, 20, 6, 2);
    }
    g.generateTexture(key, TILE_WIDTH, TILE_HEIGHT);
    g.destroy();
  }
}

function generateWallTextures(scene: Phaser.Scene): void {
  if (!scene.textures.exists("wall-top")) {
    const g = scene.make.graphics({ x: 0, y: 0 });
    drawIsoDiamond(g, TILE_WIDTH, TILE_HEIGHT, 0x5a5a68, 0x3a3a48, 0.5);
    g.generateTexture("wall-top", TILE_WIDTH, TILE_HEIGHT);
    g.destroy();
  }

  if (!scene.textures.exists("wall-face")) {
    const g = scene.make.graphics({ x: 0, y: 0 });
    const w = TILE_WIDTH / 2;
    const h = WALL_RISE;
    g.fillStyle(0x4a4a58, 1);
    g.fillTriangle(0, 0, w, h / 2, 0, h);
    g.fillStyle(0x3a3a48, 1);
    g.fillTriangle(w, h / 2, w, h + h / 2, 0, h);
    g.lineStyle(1, 0x2a2a38, 0.6);
    g.strokeTriangle(0, 0, w, h / 2, 0, h);
    g.generateTexture("wall-face", w + 2, h + h / 2 + 2);
    g.destroy();
  }

  if (!scene.textures.exists("hedge-top")) {
    const g = scene.make.graphics({ x: 0, y: 0 });
    drawIsoDiamond(g, TILE_WIDTH, TILE_HEIGHT, 0x4a7a40, 0x2a5028, 0.5);
    g.fillStyle(0x5a9a48, 0.7);
    g.fillCircle(TILE_WIDTH / 2, TILE_HEIGHT / 2 - 4, 10);
    g.generateTexture("hedge-top", TILE_WIDTH, TILE_HEIGHT);
    g.destroy();
  }
}

function generatePropTextures(scene: Phaser.Scene): void {
  if (!scene.textures.exists("prop-tree")) {
    const g = scene.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x4a3020, 1);
    g.fillRect(22, 36, 10, 20);
    g.fillStyle(0x3a8828, 1);
    g.fillCircle(27, 24, 18);
    g.fillStyle(0x5aaa40, 0.7);
    g.fillCircle(20, 20, 10);
    g.fillCircle(34, 22, 8);
    g.generateTexture("prop-tree", 54, 58);
    g.destroy();
  }

  if (!scene.textures.exists("prop-fern")) {
    const g = scene.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x5a9a48, 1);
    g.fillTriangle(16, 30, 8, 10, 24, 10);
    g.fillTriangle(24, 30, 16, 6, 32, 10);
    g.generateTexture("prop-fern", 40, 34);
    g.destroy();
  }

  if (!scene.textures.exists("prop-shrine-altar")) {
    const g = scene.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x6a5a88, 1);
    g.fillRect(10, 28, 44, 14);
    g.fillStyle(0x9a88b8, 1);
    g.fillRect(14, 18, 36, 12);
    g.fillStyle(0xc8b8e8, 0.9);
    g.fillCircle(32, 12, 10);
    g.fillStyle(0xe8e0ff, 0.5);
    g.fillCircle(32, 12, 5);
    g.generateTexture("prop-shrine-altar", 64, 46);
    g.destroy();
  }

  if (!scene.textures.exists("prop-standing-stone")) {
    const g = scene.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x7a7090, 1);
    g.fillRect(18, 14, 12, 28);
    g.fillStyle(0x9a90a8, 0.6);
    g.fillRect(20, 16, 4, 20);
    g.generateTexture("prop-standing-stone", 48, 46);
    g.destroy();
  }

  if (!scene.textures.exists("prop-hearth")) {
    const g = scene.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x8a6840, 1);
    g.fillRect(8, 20, 48, 24);
    g.fillStyle(0x5a4030, 1);
    g.fillRect(20, 8, 24, 18);
    g.fillStyle(0xff8830, 0.8);
    g.fillCircle(32, 22, 6);
    g.generateTexture("prop-hearth", 64, 48);
    g.destroy();
  }

  if (!scene.textures.exists("prop-gate")) {
    const g = scene.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x6a5040, 1);
    g.fillRect(10, 10, 8, 40);
    g.fillRect(46, 10, 8, 40);
    g.fillRect(10, 8, 44, 8);
    g.fillStyle(0x4a9a5a, 0.5);
    g.fillRect(18, 14, 28, 32);
    g.generateTexture("prop-gate", 64, 52);
    g.destroy();
  }

  if (!scene.textures.exists("prop-gate-locked")) {
    const g = scene.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x6a5040, 1);
    g.fillRect(10, 10, 8, 40);
    g.fillRect(46, 10, 8, 40);
    g.fillRect(10, 8, 44, 8);
    g.fillStyle(0x8b3a3a, 0.7);
    g.fillRect(18, 14, 28, 32);
    g.lineStyle(2, 0x5a2020, 0.9);
    g.strokeRect(18, 14, 28, 32);
    g.generateTexture("prop-gate-locked", 64, 52);
    g.destroy();
  }

  if (!scene.textures.exists("floor-path")) {
    const g = scene.make.graphics({ x: 0, y: 0 });
    drawIsoDiamond(g, TILE_WIDTH, TILE_HEIGHT, 0xc8b898, 0x9a8868);
    g.fillStyle(0xd8c8a8, 0.4);
    g.fillRect(20, 10, 24, 4);
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

export function ensureWorldTextures(scene: Phaser.Scene, zoneId: ZoneId): void {
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

export { WALL_RISE };
