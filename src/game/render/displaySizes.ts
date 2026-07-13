import type Phaser from "phaser";

/** Logical on-screen sizes (Imagine textures are 4× these). */
export const PLAYER_DISPLAY = { width: 48, height: 64 } as const;
export const CREATURE_DISPLAY = { width: 48, height: 52 } as const;

export const PROP_DISPLAY: Record<string, { width: number; height: number }> = {
  "prop-tree": { width: 48, height: 50 },
  "prop-fern": { width: 40, height: 32 },
  "prop-shrine-altar": { width: 48, height: 40 },
  "prop-standing-stone": { width: 42, height: 38 },
  "prop-pebble-pile": { width: 44, height: 32 },
  "prop-hearth": { width: 48, height: 40 },
  "prop-cottage": { width: 48, height: 44 },
  "prop-gate": { width: 48, height: 42 },
  "prop-gate-locked": { width: 48, height: 42 },
};

export const ENCOUNTER_CREATURE_DISPLAY = { width: 120, height: 130 } as const;
export const BATTLE_CREATURE_DISPLAY = { width: 112, height: 122 } as const;
export const BATTLE_PLAYER_DISPLAY = { width: 100, height: 134 } as const;

export function fitDisplay(
  image: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite,
  size: { width: number; height: number },
): typeof image {
  image.setDisplaySize(size.width, size.height);
  return image;
}
