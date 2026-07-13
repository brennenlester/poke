import type Phaser from "phaser";

export type CreaturePose = "idle" | "encounter" | "battle";

/** Texture key for a pose; idle uses the canonical `spriteKey`. */
export function creaturePoseKey(
  spriteKey: string,
  pose: CreaturePose,
): string {
  if (pose === "idle") {
    return spriteKey;
  }
  return `${spriteKey}-${pose}`;
}

/**
 * Prefer pose-specific Imagine art; fall back to the base sprite key.
 * Missing pose textures are acceptable — scenes keep working.
 */
export function resolveCreaturePoseTexture(
  scene: Phaser.Scene,
  spriteKey: string,
  pose: CreaturePose,
): string {
  const key = creaturePoseKey(spriteKey, pose);
  if (scene.textures.exists(key)) {
    return key;
  }
  if (pose !== "idle" && scene.textures.exists(`${spriteKey}-idle`)) {
    return `${spriteKey}-idle`;
  }
  return spriteKey;
}
