import Phaser from "phaser";
import { CREATURES } from "./catalog";

const SPRITE_WIDTH = 48;
const SPRITE_HEIGHT = 52;

type CreatureDrawer = (
  g: Phaser.GameObjects.Graphics,
  color: number,
) => void;

function shade(color: number, delta: number): number {
  const clamp = (value: number) => Math.min(255, Math.max(0, value));
  const r = clamp(((color >> 16) & 0xff) + delta);
  const g = clamp(((color >> 8) & 0xff) + delta);
  const b = clamp((color & 0xff) + delta);
  return (r << 16) | (g << 8) | b;
}

function drawShadow(g: Phaser.GameObjects.Graphics): void {
  g.fillStyle(0x000000, 0.22);
  g.fillEllipse(SPRITE_WIDTH / 2, SPRITE_HEIGHT - 4, 22, 6);
}

function drawMossling(g: Phaser.GameObjects.Graphics, color: number): void {
  g.fillStyle(shade(color, -25), 1);
  g.fillEllipse(24, 36, 18, 12);
  g.fillStyle(color, 1);
  g.fillEllipse(24, 28, 16, 14);
  g.fillStyle(shade(color, 35), 1);
  g.fillCircle(24, 20, 11);
  g.fillStyle(shade(color, -40), 1);
  g.fillRect(18, 38, 4, 6);
  g.fillRect(26, 38, 4, 6);
  g.fillStyle(0x7ab848, 1);
  g.fillTriangle(24, 8, 16, 18, 32, 18);
  g.fillStyle(0x98d060, 0.8);
  g.fillCircle(20, 14, 4);
  g.fillCircle(28, 15, 3);
  g.fillStyle(0x2a4020, 1);
  g.fillCircle(20, 22, 2);
  g.fillCircle(28, 22, 2);
}

function drawEmberWisp(g: Phaser.GameObjects.Graphics, color: number): void {
  g.fillStyle(shade(color, 40), 0.45);
  g.fillTriangle(24, 6, 10, 34, 38, 34);
  g.fillStyle(color, 1);
  g.fillCircle(24, 24, 14);
  g.fillStyle(shade(color, 50), 0.9);
  g.fillCircle(24, 20, 8);
  g.fillStyle(0xfff0a0, 0.85);
  g.fillCircle(24, 18, 4);
  g.fillStyle(shade(color, -30), 0.7);
  g.fillTriangle(24, 38, 18, 48, 30, 48);
  g.lineStyle(2, shade(color, 60), 0.5);
  g.strokeCircle(24, 24, 15);
}

function drawBrookNymph(g: Phaser.GameObjects.Graphics, color: number): void {
  g.fillStyle(shade(color, 30), 0.35);
  g.fillEllipse(24, 40, 20, 8);
  g.fillStyle(color, 1);
  g.fillEllipse(24, 30, 12, 16);
  g.fillStyle(shade(color, 45), 0.85);
  g.fillCircle(24, 18, 9);
  g.fillStyle(0xd8f0ff, 0.7);
  g.fillCircle(21, 16, 3);
  g.fillStyle(shade(color, -35), 1);
  g.fillTriangle(8, 28, 14, 36, 10, 44);
  g.fillTriangle(40, 28, 34, 36, 38, 44);
  g.lineStyle(1, 0xe8ffff, 0.5);
  g.strokeEllipse(24, 30, 12, 16);
}

function drawStoneHound(g: Phaser.GameObjects.Graphics, color: number): void {
  g.fillStyle(shade(color, -30), 1);
  g.fillRect(14, 36, 8, 10);
  g.fillRect(28, 36, 8, 10);
  g.fillStyle(color, 1);
  g.fillEllipse(24, 30, 20, 14);
  g.fillStyle(shade(color, 20), 1);
  g.fillCircle(24, 20, 12);
  g.fillStyle(shade(color, -20), 1);
  g.fillTriangle(14, 16, 18, 8, 22, 18);
  g.fillTriangle(34, 16, 30, 8, 26, 18);
  g.fillStyle(0x2a2a30, 1);
  g.fillCircle(20, 20, 2);
  g.fillCircle(28, 20, 2);
  g.lineStyle(1, shade(color, -45), 0.6);
  g.lineBetween(16, 26, 32, 28);
  g.lineBetween(18, 32, 30, 34);
}

function drawMistSerpent(g: Phaser.GameObjects.Graphics, color: number): void {
  g.fillStyle(shade(color, 25), 0.35);
  g.fillCircle(12, 38, 8);
  g.fillCircle(36, 38, 8);
  g.fillStyle(color, 1);
  g.fillEllipse(24, 32, 22, 10);
  g.fillEllipse(30, 24, 14, 10);
  g.fillCircle(36, 16, 8);
  g.fillStyle(shade(color, 40), 0.8);
  g.fillCircle(38, 14, 4);
  g.fillStyle(0x1a1830, 1);
  g.fillCircle(39, 13, 2);
  g.lineStyle(2, shade(color, 50), 0.45);
  g.strokeCircle(24, 32, 11);
}

function drawRootwalker(g: Phaser.GameObjects.Graphics, color: number): void {
  g.fillStyle(shade(color, -35), 1);
  g.fillRect(16, 38, 6, 10);
  g.fillRect(26, 38, 6, 10);
  g.fillStyle(color, 1);
  g.fillRect(18, 22, 12, 18);
  g.fillStyle(shade(color, 15), 1);
  g.fillCircle(24, 16, 10);
  g.fillStyle(0x5a9a40, 1);
  g.fillCircle(18, 10, 6);
  g.fillCircle(30, 12, 5);
  g.fillStyle(shade(color, -25), 1);
  g.lineStyle(2, shade(color, -40), 0.7);
  g.lineBetween(20, 24, 28, 30);
  g.lineBetween(28, 24, 20, 32);
  g.fillStyle(0x1a1008, 1);
  g.fillCircle(21, 16, 2);
  g.fillCircle(27, 16, 2);
}

function drawLanternFox(g: Phaser.GameObjects.Graphics, color: number): void {
  g.fillStyle(shade(color, -35), 1);
  g.fillRect(18, 38, 5, 8);
  g.fillRect(28, 38, 5, 8);
  g.fillStyle(color, 1);
  g.fillEllipse(24, 30, 16, 12);
  g.fillCircle(32, 22, 9);
  g.fillStyle(shade(color, 20), 1);
  g.fillTriangle(38, 22, 44, 24, 38, 28);
  g.fillStyle(0xfff8c0, 0.9);
  g.fillCircle(36, 24, 4);
  g.fillStyle(0x2a2010, 1);
  g.fillCircle(30, 20, 2);
  g.fillStyle(shade(color, -20), 1);
  g.fillCircle(24, 32, 8);
}

function drawThunderFinch(g: Phaser.GameObjects.Graphics, color: number): void {
  g.fillStyle(shade(color, -25), 1);
  g.fillTriangle(10, 26, 18, 34, 12, 38);
  g.fillStyle(color, 1);
  g.fillEllipse(24, 28, 14, 10);
  g.fillCircle(30, 20, 8);
  g.fillStyle(0xf0e040, 1);
  g.fillRect(34, 16, 3, 8);
  g.fillTriangle(37, 20, 42, 24, 37, 28);
  g.fillStyle(0x2a2838, 1);
  g.fillCircle(32, 19, 2);
  g.lineStyle(2, 0xf0e040, 0.8);
  g.lineBetween(36, 14, 40, 20);
  g.lineBetween(40, 20, 36, 24);
}

function drawBramblewarden(g: Phaser.GameObjects.Graphics, color: number): void {
  g.fillStyle(shade(color, -30), 1);
  g.fillRect(16, 38, 6, 8);
  g.fillRect(26, 38, 6, 8);
  g.fillStyle(color, 1);
  g.fillEllipse(24, 30, 18, 14);
  g.fillStyle(shade(color, 25), 1);
  g.fillCircle(24, 18, 12);
  g.fillStyle(0x4a6828, 1);
  for (const [x, y] of [
    [16, 12],
    [32, 14],
    [24, 8],
    [20, 22],
    [28, 20],
  ]) {
    g.fillCircle(x, y, 3);
  }
  g.lineStyle(1, 0x2a4018, 0.8);
  g.lineBetween(16, 12, 24, 8);
  g.lineBetween(32, 14, 24, 8);
  g.fillStyle(0x1a2810, 1);
  g.fillCircle(21, 18, 2);
  g.fillCircle(27, 18, 2);
}

function drawHearthflame(g: Phaser.GameObjects.Graphics, color: number): void {
  g.fillStyle(shade(color, -40), 1);
  g.fillRect(16, 38, 7, 8);
  g.fillRect(26, 38, 7, 8);
  g.fillStyle(color, 1);
  g.fillEllipse(24, 30, 18, 14);
  g.fillStyle(shade(color, 35), 0.9);
  g.fillCircle(24, 18, 12);
  g.fillStyle(0xffe880, 0.95);
  g.fillCircle(24, 14, 6);
  g.fillStyle(shade(color, -20), 0.6);
  g.fillTriangle(24, 42, 14, 48, 34, 48);
  g.lineStyle(2, shade(color, 50), 0.45);
  g.strokeCircle(24, 18, 13);
}

const CREATURE_DRAWERS: Record<string, CreatureDrawer> = {
  mossling: drawMossling,
  "ember-wisp": drawEmberWisp,
  "brook-nymph": drawBrookNymph,
  "stone-hound": drawStoneHound,
  "mist-serpent": drawMistSerpent,
  rootwalker: drawRootwalker,
  "lantern-fox": drawLanternFox,
  "thunder-finch": drawThunderFinch,
  bramblewarden: drawBramblewarden,
  hearthflame: drawHearthflame,
};

export function ensureCreatureTextures(scene: Phaser.Scene): void {
  for (const creature of CREATURES) {
    if (scene.textures.exists(creature.spriteKey)) {
      scene.textures.remove(creature.spriteKey);
    }

    const g = scene.make.graphics({ x: 0, y: 0 });
    drawShadow(g);
    const draw = CREATURE_DRAWERS[creature.id];
    if (draw) {
      draw(g, creature.spriteColor);
    } else {
      g.fillStyle(creature.spriteColor, 1);
      g.fillCircle(SPRITE_WIDTH / 2, SPRITE_HEIGHT / 2 - 4, 14);
    }
    g.generateTexture(creature.spriteKey, SPRITE_WIDTH, SPRITE_HEIGHT);
    g.destroy();
  }
}
