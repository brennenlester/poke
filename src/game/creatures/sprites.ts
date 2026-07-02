import Phaser from "phaser";
import { CREATURES } from "./catalog";

export function ensureCreatureTextures(scene: Phaser.Scene): void {
  for (const creature of CREATURES) {
    if (scene.textures.exists(creature.spriteKey)) {
      continue;
    }

    const g = scene.make.graphics({ x: 0, y: 0 });
    g.fillStyle(creature.spriteColor, 1);
    g.fillCircle(20, 22, 16);
    g.fillStyle(0xffffff, 0.35);
    g.fillCircle(14, 16, 5);
    g.generateTexture(creature.spriteKey, 40, 44);
    g.destroy();
  }
}
