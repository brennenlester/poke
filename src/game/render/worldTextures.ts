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
  "floor-path",
  "boundary-grove",
  "boundary-shrine",
  "boundary-village",
  "boundary-overworld",
  "prop-tree",
  "prop-fern",
  "prop-shrine-altar",
  "prop-standing-stone",
  "prop-pebble-pile",
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
    g.fillStyle(palette.accent, 0.18);
    for (let i = 0; i < 10; i += 1) {
      const x = 5 + ((i * 17 + (variant === "light" ? 3 : 9)) % 38);
      const y = 5 + ((i * 11 + (variant === "light" ? 7 : 2)) % 38);
      g.fillRect(x, y, i % 3 === 0 ? 2 : 1, 1);
    }
    if (zoneId === "grove") {
      g.fillStyle(0x547c38, 0.45);
      g.fillTriangle(8, 15, 11, 8, 13, 15);
      g.fillTriangle(31, 34, 34, 25, 36, 34);
      g.fillStyle(0xc0d878, 0.35);
      g.fillCircle(16, 29, 1);
      g.fillCircle(39, 12, 1);
    } else if (zoneId === "shrine") {
      g.fillStyle(0xf0e6ff, 0.35);
      g.fillCircle(TILE_WIDTH / 2, TILE_HEIGHT / 2, 2);
      g.lineStyle(1, 0xe8e0f8, 0.4);
      g.strokeCircle(TILE_WIDTH / 2, TILE_HEIGHT / 2, 6);
      g.lineBetween(19, 24, 29, 24);
      g.lineBetween(24, 19, 24, 29);
    } else if (zoneId === "village") {
      g.fillStyle(0x8a5c3c, 0.3);
      g.fillRect(7, 11, 13, 1);
      g.fillRect(25, 30, 12, 1);
      g.fillRect(12, 36, 9, 1);
    } else {
      g.fillStyle(0xd0e6f0, 0.28);
      g.fillCircle(11, 12, 1);
      g.fillCircle(35, 31, 1);
      g.lineStyle(1, 0x587c90, 0.28);
      g.lineBetween(7, 35, 18, 30);
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
    g.fillStyle(0x000000, 0.18);
    g.fillEllipse(25, 47, 28, 6);
    g.fillStyle(0x38261a, 1);
    g.fillRect(19, 29, 10, 19);
    g.fillStyle(0x6a4428, 1);
    g.fillRect(22, 28, 4, 19);
    g.lineStyle(1, 0x2a1a12, 0.7);
    g.lineBetween(24, 31, 16, 39);
    g.lineBetween(24, 35, 32, 27);
    g.fillStyle(0x245c28, 1);
    g.fillCircle(24, 19, 17);
    g.fillCircle(15, 25, 11);
    g.fillCircle(34, 25, 10);
    g.fillStyle(0x4e923c, 0.85);
    g.fillCircle(18, 14, 9);
    g.fillCircle(30, 16, 9);
    g.fillStyle(0x8cba54, 0.55);
    g.fillCircle(17, 12, 3);
    g.fillCircle(30, 16, 2);
    g.generateTexture("prop-tree", 48, 50);
    g.destroy();
  }

  if (!scene.textures.exists("prop-fern")) {
    const g = scene.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x294c2c, 1);
    g.fillTriangle(20, 30, 5, 12, 20, 18);
    g.fillTriangle(20, 30, 35, 8, 25, 22);
    g.fillStyle(0x6cb85a, 1);
    g.fillTriangle(20, 28, 8, 7, 21, 18);
    g.fillTriangle(20, 28, 32, 5, 24, 19);
    g.fillTriangle(20, 28, 15, 4, 22, 18);
    g.fillStyle(0xa4d878, 0.7);
    g.fillCircle(15, 13, 2);
    g.generateTexture("prop-fern", 40, 32);
    g.destroy();
  }

  if (!scene.textures.exists("prop-shrine-altar")) {
    const g = scene.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x40354e, 1);
    g.fillRect(8, 24, 32, 12);
    g.fillStyle(0x76628e, 1);
    g.fillRect(12, 16, 24, 10);
    g.fillStyle(0x9f8abc, 1);
    g.fillRect(15, 18, 18, 5);
    g.fillStyle(0xc8b8e8, 0.9);
    g.fillCircle(24, 10, 8);
    g.lineStyle(1, 0xf0e6ff, 0.55);
    g.strokeCircle(24, 10, 10);
    g.generateTexture("prop-shrine-altar", 48, 40);
    g.destroy();
  }

  if (!scene.textures.exists("prop-standing-stone")) {
    const g = scene.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x000000, 0.18);
    g.fillEllipse(21, 35, 22, 5);
    g.fillStyle(0x514a64, 1);
    g.fillTriangle(15, 34, 16, 11, 22, 5);
    g.fillTriangle(22, 5, 29, 12, 28, 34);
    g.fillStyle(0x817798, 1);
    g.fillTriangle(18, 31, 18, 13, 22, 8);
    g.fillStyle(0xc0b0d0, 0.6);
    g.fillCircle(22, 18, 2);
    g.fillCircle(22, 25, 1);
    g.generateTexture("prop-standing-stone", 42, 38);
    g.destroy();
  }

  if (!scene.textures.exists("prop-pebble-pile")) {
    const g = scene.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x5c5a64, 1);
    g.fillCircle(14, 24, 5);
    g.fillCircle(22, 26, 4);
    g.fillCircle(30, 23, 5);
    g.fillCircle(18, 20, 3);
    g.fillCircle(26, 18, 4);
    g.fillStyle(0xb4b0bd, 0.65);
    g.fillCircle(17, 20, 2);
    g.fillCircle(28, 17, 2);
    g.generateTexture("prop-pebble-pile", 44, 32);
    g.destroy();
  }

  if (!scene.textures.exists("prop-hearth")) {
    const g = scene.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x493326, 1);
    g.fillRect(6, 18, 36, 18);
    g.fillStyle(0x76513a, 1);
    g.fillRect(14, 6, 20, 14);
    g.fillStyle(0x211812, 1);
    g.fillRect(18, 20, 12, 10);
    g.fillStyle(0xff6c28, 0.9);
    g.fillCircle(24, 18, 5);
    g.fillStyle(0xffd26a, 0.9);
    g.fillCircle(24, 17, 2);
    g.generateTexture("prop-hearth", 48, 40);
    g.destroy();
  }

  if (!scene.textures.exists("prop-cottage")) {
    const g = scene.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x4c3428, 1);
    g.fillRect(10, 22, 28, 18);
    g.fillStyle(0x80604a, 1);
    g.fillRect(13, 24, 22, 14);
    g.fillStyle(0x6e3028, 1);
    g.fillTriangle(8, 22, 24, 6, 40, 22);
    g.fillStyle(0x4a3828, 1);
    g.fillRect(20, 28, 8, 12);
    g.fillStyle(0xffcc88, 0.7);
    g.fillRect(12, 26, 6, 5);
    g.fillRect(30, 26, 4, 5);
    g.lineStyle(1, 0xb07050, 0.55);
    g.lineBetween(10, 22, 38, 22);
    g.generateTexture("prop-cottage", 48, 44);
    g.destroy();
  }

  if (!scene.textures.exists("prop-gate")) {
    const g = scene.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x402c22, 1);
    g.fillRect(8, 8, 6, 32);
    g.fillRect(34, 8, 6, 32);
    g.fillRect(8, 6, 32, 6);
    g.fillStyle(0x855e3d, 1);
    g.fillRect(10, 10, 2, 28);
    g.fillRect(36, 10, 2, 28);
    g.fillStyle(0x4a9a5a, 0.65);
    g.fillRect(14, 12, 20, 24);
    g.lineStyle(1, 0xc28a58, 0.55);
    g.lineBetween(14, 16, 34, 28);
    g.generateTexture("prop-gate", 48, 42);
    g.destroy();
  }

  if (!scene.textures.exists("prop-gate-locked")) {
    const g = scene.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x402c22, 1);
    g.fillRect(8, 8, 6, 32);
    g.fillRect(34, 8, 6, 32);
    g.fillRect(8, 6, 32, 6);
    g.fillStyle(0x855e3d, 1);
    g.fillRect(10, 10, 2, 28);
    g.fillRect(36, 10, 2, 28);
    g.fillStyle(0x8b3a3a, 0.75);
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
    g.fillStyle(0x000000, 0.28);
    g.fillEllipse(16, 35, 20, 5);
    g.fillStyle(0x2b1f36, 1);
    g.fillRect(10, 20, 12, 13);
    g.fillStyle(0x5b3c72, 1);
    g.fillTriangle(8, 31, 11, 14, 22, 14);
    g.fillTriangle(22, 14, 25, 31, 10, 31);
    g.fillStyle(0x82609b, 0.8);
    g.fillTriangle(11, 27, 16, 17, 19, 29);
    g.fillStyle(0xc69b78, 1);
    g.fillCircle(16, 12, 6);
    g.fillStyle(0x302238, 1);
    g.fillCircle(16, 10, 8);
    g.fillStyle(0x6c4c83, 1);
    g.fillCircle(16, 9, 6);
    g.fillStyle(0x24192e, 1);
    g.fillRect(13, 11, 6, 4);
    g.fillStyle(0xb89262, 0.9);
    g.fillCircle(15, 13, 1);
    g.fillStyle(0x6b482e, 1);
    g.fillRect(25, 14, 2, 19);
    g.fillCircle(26, 13, 2);
    g.fillStyle(0x9b6a3f, 1);
    g.fillRect(20, 22, 5, 7);
    if (dir === "north") {
      g.fillStyle(0x3d294e, 1);
      g.fillTriangle(9, 30, 16, 13, 23, 30);
      g.fillStyle(0x21172c, 1);
      g.fillCircle(16, 10, 8);
    } else if (dir === "east") {
      g.fillStyle(0x765094, 1);
      g.fillTriangle(15, 30, 17, 15, 25, 29);
      g.fillStyle(0xc69b78, 1);
      g.fillCircle(19, 12, 5);
    } else if (dir === "west") {
      g.fillStyle(0x765094, 1);
      g.fillTriangle(7, 29, 15, 15, 17, 30);
      g.fillStyle(0xc69b78, 1);
      g.fillCircle(13, 12, 5);
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
