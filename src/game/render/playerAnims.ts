import Phaser from "phaser";
import { PLAYER_DISPLAY, fitDisplay } from "./displaySizes";

const FRAME_WIDTH = 48;
const FRAME_HEIGHT = 64;
const FACINGS = ["south", "north", "east", "west"] as const;

type Facing = (typeof FACINGS)[number];

function textureKey(facing: Facing, frame: number): string {
  return `player-${facing}-${frame}`;
}

function drawTrainer(
  g: Phaser.GameObjects.Graphics,
  facing: Facing,
  frame: number,
): void {
  const stride = frame === 1 ? -3 : frame === 2 ? 3 : 0;
  const side = facing === "east" ? 1 : facing === "west" ? -1 : 0;
  const back = facing === "north";
  const center = 24 + side * 2;

  g.fillStyle(0x17243c, 0.24);
  g.fillEllipse(24, 61, 26, 6);

  // Longer legs and boots keep the hero youthful rather than chibi.
  g.fillStyle(0x243454, 1);
  g.fillRect(center - 10, 43, 7, 14 + Math.max(0, stride));
  g.fillRect(center + 3, 43, 7, 14 + Math.max(0, -stride));
  g.fillStyle(0x203044, 1);
  g.fillRoundedRect(center - 12, 56 + Math.max(0, stride), 11, 5, 2);
  g.fillRoundedRect(center + 2, 56 + Math.max(0, -stride), 11, 5, 2);

  // Backpack and cape/vest silhouette.
  g.fillStyle(0x1d293b, 1);
  g.fillRoundedRect(center - 14 - side * 2, 29, 9, 19, 3);
  g.fillStyle(0x6b4a32, 1);
  g.fillRoundedRect(center - 13 - side * 2, 34, 7, 10, 2);
  g.fillStyle(back ? 0x315d7c : 0x3e8bb2, 1);
  g.fillRoundedRect(center - 11, 27, 22, 20, 5);
  g.fillStyle(0x8bd2de, 0.9);
  g.fillRect(center - 8, 30, 16, 4);
  g.fillStyle(0xf0b65f, 1);
  g.fillRoundedRect(center - 3, 30, 6, 5, 2);

  // Swinging arms make the three walk frames read at a glance.
  g.fillStyle(0x315d7c, 1);
  g.fillRoundedRect(center - 16, 31 + stride / 3, 6, 15, 3);
  g.fillRoundedRect(center + 10, 31 - stride / 3, 6, 15, 3);
  g.fillStyle(0xe4aa82, 1);
  g.fillCircle(center - 13, 46 + stride / 3, 3);
  g.fillCircle(center + 13, 46 - stride / 3, 3);

  // Hair, face, and a wide anime-style eye pair.
  g.fillStyle(0x31233e, 1);
  g.fillCircle(center, 19, 12);
  g.fillStyle(0x5a3b6c, 1);
  g.fillCircle(center - side, 17, 10);
  g.fillStyle(0xe7b28b, 1);
  g.fillCircle(center + side, 20, 9);

  if (!back) {
    const eyeOffset = side === 0 ? 4 : 2;
    g.fillStyle(0xf8fbff, 1);
    g.fillCircle(center - eyeOffset + side * 2, 20, 3);
    g.fillCircle(center + eyeOffset + side * 2, 20, 3);
    g.fillStyle(0x243252, 1);
    g.fillCircle(center - eyeOffset + side * 2, 20, 1.5);
    g.fillCircle(center + eyeOffset + side * 2, 20, 1.5);
    g.fillStyle(0xc96f66, 0.7);
    g.fillCircle(center - 6 + side * 2, 25, 2);
    g.fillCircle(center + 6 + side * 2, 25, 2);
  } else {
    g.fillStyle(0x251a31, 1);
    g.fillRoundedRect(center - 9, 13, 18, 10, 5);
  }

  g.lineStyle(2, 0x182032, 0.65);
  g.strokeRoundedRect(center - 11, 27, 22, 20, 5);
}

function generateFrame(scene: Phaser.Scene, facing: Facing, frame: number): void {
  const key = textureKey(facing, frame);
  if (scene.textures.exists(key)) {
    return;
  }
  const g = scene.make.graphics({ x: 0, y: 0 });
  drawTrainer(g, facing, frame);
  g.generateTexture(key, FRAME_WIDTH, FRAME_HEIGHT);
  g.destroy();
}

/**
 * Fallback when Imagine walk frames are missing: derive stride poses from idle.
 */
function deriveWalkFramesFromIdle(scene: Phaser.Scene, facing: Facing): void {
  const idleKey = textureKey(facing, 0);
  if (!scene.textures.exists(idleKey)) {
    return;
  }

  const source = scene.textures.get(idleKey).getSourceImage() as
    | HTMLImageElement
    | HTMLCanvasElement;
  const width = source.width || FRAME_WIDTH;
  const height = source.height || FRAME_HEIGHT;

  const stepX = Math.max(10, Math.round(width * 0.06));
  const stepY = Math.max(14, Math.round(height * 0.07));
  const poses: Record<number, { x: number; y: number; rot: number; squash: number }> = {
    1: { x: -stepX, y: -stepY, rot: -0.08, squash: 0.92 },
    2: { x: stepX, y: -stepY, rot: 0.08, squash: 0.92 },
  };

  for (const frame of [1, 2] as const) {
    const key = textureKey(facing, frame);
    if (scene.textures.exists(key)) {
      scene.textures.remove(key);
    }
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      continue;
    }
    const pose = poses[frame];
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(width / 2 + pose.x, height * 0.92 + pose.y);
    ctx.rotate(pose.rot);
    ctx.scale(1, pose.squash);
    ctx.drawImage(source, -width / 2, -height * 0.92);
    ctx.restore();
    scene.textures.addCanvas(key, canvas);
  }
}

export function getPlayerIdleTextureKey(facing: Facing = "south"): string {
  return textureKey(facing, 0);
}

export function ensurePlayerAnims(scene: Phaser.Scene): void {
  for (const facing of FACINGS) {
    // Style D Imagine pose as idle; derive matching stride frames from it.
    // (Source walk2 sheets flip held props — do not use as consecutive frames.)
    generateFrame(scene, facing, 0);
    if (scene.textures.exists(textureKey(facing, 0))) {
      const src = scene.textures.get(textureKey(facing, 0)).getSourceImage() as {
        width?: number;
      };
      if (src.width && src.width > FRAME_WIDTH) {
        deriveWalkFramesFromIdle(scene, facing);
      } else {
        generateFrame(scene, facing, 1);
        generateFrame(scene, facing, 2);
      }
    } else {
      generateFrame(scene, facing, 1);
      generateFrame(scene, facing, 2);
    }

    const idleKey = `player-idle-${facing}`;
    if (!scene.anims.exists(idleKey)) {
      scene.anims.create({
        key: idleKey,
        frames: [{ key: textureKey(facing, 0) }],
        frameRate: 1,
        repeat: -1,
      });
    }

    const walkKey = `player-walk-${facing}`;
    if (scene.anims.exists(walkKey)) {
      scene.anims.remove(walkKey);
    }
    scene.anims.create({
      key: walkKey,
      frames: [0, 1, 2, 1].map((frame) => ({
        key: textureKey(facing, frame),
      })),
      frameRate: 8,
      repeat: -1,
    });
  }
}

/** Keep display size stable when anim swaps texture keys. */
export function bindPlayerDisplaySize(
  sprite: Phaser.GameObjects.Sprite,
): void {
  fitDisplay(sprite, PLAYER_DISPLAY);
  sprite.on("animationupdate", () => {
    fitDisplay(sprite, PLAYER_DISPLAY);
  });
}
