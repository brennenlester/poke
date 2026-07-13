import Phaser from "phaser";
import { CREATURES } from "./catalog";

const SPRITE_WIDTH = 48;
const SPRITE_HEIGHT = 52;
const OUTLINE = 0x1a2838;

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
  g.fillStyle(0x000000, 0.2);
  g.fillEllipse(SPRITE_WIDTH / 2, SPRITE_HEIGHT - 4, 24, 6);
}

function drawEyes(
  g: Phaser.GameObjects.Graphics,
  leftX: number,
  rightX: number,
  y: number,
  radius = 3.5,
): void {
  g.fillStyle(0xffffff, 1);
  g.fillCircle(leftX, y, radius);
  g.fillCircle(rightX, y, radius);
  g.fillStyle(0x1a2838, 1);
  g.fillCircle(leftX + 0.5, y + 0.5, radius * 0.45);
  g.fillCircle(rightX + 0.5, y + 0.5, radius * 0.45);
  g.fillStyle(0xffffff, 0.9);
  g.fillCircle(leftX - 1, y - 1, 1);
  g.fillCircle(rightX - 1, y - 1, 1);
}

function blob(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: number,
): void {
  g.fillStyle(OUTLINE, 1);
  g.fillEllipse(x, y, w + 3, h + 3);
  g.fillStyle(fill, 1);
  g.fillEllipse(x, y, w, h);
}

function drawMossling(g: Phaser.GameObjects.Graphics, color: number): void {
  blob(g, 24, 36, 20, 14, shade(color, -20));
  blob(g, 24, 28, 18, 16, color);
  blob(g, 24, 18, 20, 18, shade(color, 30));
  g.fillStyle(OUTLINE, 1);
  g.fillTriangle(24, 4, 14, 18, 34, 18);
  g.fillStyle(0x7ad848, 1);
  g.fillTriangle(24, 6, 16, 17, 32, 17);
  g.fillStyle(0xc8f070, 0.85);
  g.fillCircle(20, 12, 4);
  g.fillCircle(28, 13, 3);
  g.fillStyle(OUTLINE, 1);
  g.fillRoundedRect(17, 38, 5, 8, 2);
  g.fillRoundedRect(26, 38, 5, 8, 2);
  g.fillStyle(shade(color, -40), 1);
  g.fillRoundedRect(18, 39, 3, 6, 1);
  g.fillRoundedRect(27, 39, 3, 6, 1);
  drawEyes(g, 20, 28, 20);
}

function drawEmberWisp(g: Phaser.GameObjects.Graphics, color: number): void {
  g.fillStyle(shade(color, 50), 0.35);
  g.fillTriangle(24, 4, 8, 36, 40, 36);
  blob(g, 24, 24, 26, 26, color);
  g.fillStyle(shade(color, 45), 0.95);
  g.fillCircle(24, 20, 10);
  g.fillStyle(0xfff4b0, 0.95);
  g.fillCircle(24, 17, 5);
  g.fillStyle(OUTLINE, 1);
  g.fillTriangle(24, 40, 16, 50, 32, 50);
  g.fillStyle(shade(color, -10), 0.85);
  g.fillTriangle(24, 40, 18, 48, 30, 48);
  drawEyes(g, 19, 29, 22, 3);
}

function drawBrookNymph(g: Phaser.GameObjects.Graphics, color: number): void {
  g.fillStyle(shade(color, 40), 0.3);
  g.fillEllipse(24, 42, 24, 8);
  blob(g, 24, 30, 16, 22, color);
  blob(g, 24, 16, 18, 16, shade(color, 35));
  g.fillStyle(0xe8f8ff, 0.8);
  g.fillCircle(20, 14, 4);
  g.fillStyle(OUTLINE, 1);
  g.fillTriangle(6, 28, 14, 36, 8, 46);
  g.fillTriangle(42, 28, 34, 36, 40, 46);
  g.fillStyle(shade(color, 50), 1);
  g.fillTriangle(8, 30, 13, 35, 9, 43);
  g.fillTriangle(40, 30, 35, 35, 39, 43);
  drawEyes(g, 20, 28, 17);
}

function drawStoneHound(g: Phaser.GameObjects.Graphics, color: number): void {
  g.fillStyle(OUTLINE, 1);
  g.fillRoundedRect(13, 36, 8, 12, 2);
  g.fillRoundedRect(27, 36, 8, 12, 2);
  g.fillStyle(shade(color, -25), 1);
  g.fillRoundedRect(14, 37, 6, 10, 2);
  g.fillRoundedRect(28, 37, 6, 10, 2);
  blob(g, 24, 30, 26, 16, color);
  blob(g, 24, 18, 22, 20, shade(color, 20));
  g.fillStyle(OUTLINE, 1);
  g.fillTriangle(12, 14, 16, 4, 22, 16);
  g.fillTriangle(36, 14, 32, 4, 26, 16);
  g.fillStyle(shade(color, -10), 1);
  g.fillTriangle(14, 14, 17, 7, 21, 15);
  g.fillTriangle(34, 14, 31, 7, 27, 15);
  g.lineStyle(2, shade(color, -40), 0.55);
  g.lineBetween(16, 28, 32, 30);
  drawEyes(g, 19, 29, 18);
}

function drawMistSerpent(g: Phaser.GameObjects.Graphics, color: number): void {
  g.fillStyle(shade(color, 40), 0.3);
  g.fillCircle(10, 40, 8);
  g.fillCircle(38, 40, 8);
  blob(g, 22, 34, 26, 12, color);
  blob(g, 30, 24, 18, 14, shade(color, 15));
  blob(g, 36, 14, 16, 14, shade(color, 30));
  g.fillStyle(0xf0e8ff, 0.85);
  g.fillCircle(38, 12, 4);
  drawEyes(g, 34, 40, 13, 3);
}

function drawRootwalker(g: Phaser.GameObjects.Graphics, color: number): void {
  g.fillStyle(OUTLINE, 1);
  g.fillRoundedRect(15, 38, 7, 10, 2);
  g.fillRoundedRect(26, 38, 7, 10, 2);
  g.fillStyle(shade(color, -30), 1);
  g.fillRoundedRect(16, 39, 5, 8, 1);
  g.fillRoundedRect(27, 39, 5, 8, 1);
  g.fillStyle(OUTLINE, 1);
  g.fillRoundedRect(16, 20, 16, 20, 4);
  g.fillStyle(color, 1);
  g.fillRoundedRect(17, 21, 14, 18, 3);
  blob(g, 24, 14, 18, 16, shade(color, 20));
  g.fillStyle(OUTLINE, 1);
  g.fillCircle(17, 8, 7);
  g.fillCircle(31, 10, 6);
  g.fillStyle(0x68c848, 1);
  g.fillCircle(17, 8, 5);
  g.fillCircle(31, 10, 4);
  g.fillStyle(0xc8f070, 0.7);
  g.fillCircle(16, 6, 2);
  drawEyes(g, 20, 28, 15);
}

function drawLanternFox(g: Phaser.GameObjects.Graphics, color: number): void {
  g.fillStyle(OUTLINE, 1);
  g.fillRoundedRect(17, 38, 6, 10, 2);
  g.fillRoundedRect(27, 38, 6, 10, 2);
  g.fillStyle(shade(color, -30), 1);
  g.fillRoundedRect(18, 39, 4, 8, 1);
  g.fillRoundedRect(28, 39, 4, 8, 1);
  blob(g, 24, 30, 20, 14, color);
  blob(g, 32, 20, 16, 14, shade(color, 15));
  g.fillStyle(OUTLINE, 1);
  g.fillTriangle(30, 10, 34, 2, 38, 12);
  g.fillTriangle(38, 18, 46, 16, 40, 26);
  g.fillStyle(shade(color, -5), 1);
  g.fillTriangle(31, 10, 34, 4, 36, 12);
  g.fillStyle(0xfff8c0, 1);
  g.fillCircle(40, 22, 5);
  g.fillStyle(0xfff880, 0.55);
  g.fillCircle(40, 22, 8);
  drawEyes(g, 28, 35, 18, 3);
}

function drawThunderFinch(g: Phaser.GameObjects.Graphics, color: number): void {
  g.fillStyle(OUTLINE, 1);
  g.fillTriangle(8, 26, 18, 34, 10, 40);
  g.fillStyle(shade(color, -20), 1);
  g.fillTriangle(10, 28, 16, 33, 11, 38);
  blob(g, 24, 28, 18, 14, color);
  blob(g, 30, 18, 16, 14, shade(color, 20));
  g.fillStyle(OUTLINE, 1);
  g.fillRoundedRect(34, 14, 4, 10, 1);
  g.fillTriangle(38, 18, 44, 24, 38, 28);
  g.fillStyle(0xffe84a, 1);
  g.fillRoundedRect(35, 15, 2, 8, 1);
  g.fillTriangle(38, 19, 42, 24, 38, 27);
  g.lineStyle(2, 0xffe84a, 0.9);
  g.lineBetween(36, 12, 42, 18);
  g.lineBetween(42, 18, 36, 24);
  drawEyes(g, 28, 34, 17, 3);
}

function drawBramblewarden(g: Phaser.GameObjects.Graphics, color: number): void {
  g.fillStyle(OUTLINE, 1);
  g.fillRoundedRect(15, 38, 7, 10, 2);
  g.fillRoundedRect(26, 38, 7, 10, 2);
  g.fillStyle(shade(color, -25), 1);
  g.fillRoundedRect(16, 39, 5, 8, 1);
  g.fillRoundedRect(27, 39, 5, 8, 1);
  blob(g, 24, 30, 24, 16, color);
  blob(g, 24, 16, 22, 20, shade(color, 25));
  for (const [x, y] of [
    [15, 10],
    [33, 12],
    [24, 5],
    [18, 22],
    [30, 20],
  ]) {
    g.fillStyle(OUTLINE, 1);
    g.fillCircle(x, y, 4);
    g.fillStyle(0x5a9a40, 1);
    g.fillCircle(x, y, 3);
  }
  drawEyes(g, 20, 28, 17);
}

function drawHearthflame(g: Phaser.GameObjects.Graphics, color: number): void {
  g.fillStyle(OUTLINE, 1);
  g.fillRoundedRect(15, 38, 8, 10, 2);
  g.fillRoundedRect(25, 38, 8, 10, 2);
  g.fillStyle(shade(color, -30), 1);
  g.fillRoundedRect(16, 39, 6, 8, 1);
  g.fillRoundedRect(26, 39, 6, 8, 1);
  blob(g, 24, 30, 24, 16, color);
  blob(g, 24, 16, 22, 20, shade(color, 30));
  g.fillStyle(0xfff0a0, 0.95);
  g.fillCircle(24, 12, 7);
  g.fillStyle(0xffffff, 0.7);
  g.fillCircle(22, 10, 3);
  g.fillStyle(OUTLINE, 1);
  g.fillTriangle(24, 42, 14, 50, 34, 50);
  g.fillStyle(shade(color, -10), 0.8);
  g.fillTriangle(24, 42, 17, 48, 31, 48);
  drawEyes(g, 19, 29, 18);
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
    // Prefer Imagine PNGs loaded in PreloadScene; procedural only as fallback.
    if (scene.textures.exists(creature.spriteKey)) {
      continue;
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
