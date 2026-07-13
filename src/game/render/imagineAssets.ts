import Phaser from "phaser";
import { CREATURES } from "../creatures/catalog";

const FACINGS = ["south", "north", "east", "west"] as const;

const PROP_KEYS = [
  "prop-tree",
  "prop-fern",
  "prop-shrine-altar",
  "prop-standing-stone",
  "prop-pebble-pile",
  "prop-hearth",
  "prop-cottage",
  "prop-gate",
  "prop-gate-locked",
] as const;

const ZONE_IDS = ["grove", "shrine", "village", "overworld", "mistwood"] as const;

const FLOOR_KEYS = [
  ...ZONE_IDS.flatMap((zoneId) => [
    `floor-${zoneId}-light`,
    `floor-${zoneId}-dark`,
  ]),
  "floor-path",
] as const;

const BOUNDARY_KEYS = ZONE_IDS.map(
  (zoneId) => `boundary-${zoneId}` as const,
);

/**
 * Queue Imagine-backed PNGs. Missing files fall through to procedural ensure* helpers.
 *
 * ponytail: only Style D walk1 is loaded as the canonical trainer pose per facing.
 * Source walk2 art flips held props mid-cycle; stride frames are derived from walk1
 * until matching dual-pose Imagine sheets exist.
 */
export function preloadImagineAssets(scene: Phaser.Scene): void {
  for (const facing of FACINGS) {
    scene.load.image(
      `player-${facing}-0`,
      `assets/player/player-${facing}-0.png`,
    );
  }

  for (const creature of CREATURES) {
    scene.load.image(
      creature.spriteKey,
      `assets/creatures/${creature.spriteKey}.png`,
    );
    scene.load.image(
      `${creature.spriteKey}-idle`,
      `assets/creatures/${creature.spriteKey}-idle.png`,
    );
    scene.load.image(
      `${creature.spriteKey}-encounter`,
      `assets/creatures/${creature.spriteKey}-encounter.png`,
    );
    scene.load.image(
      `${creature.spriteKey}-battle`,
      `assets/creatures/${creature.spriteKey}-battle.png`,
    );
  }

  for (const key of PROP_KEYS) {
    scene.load.image(key, `assets/world/${key}.png`);
  }

  for (const key of FLOOR_KEYS) {
    scene.load.image(key, `assets/world/${key}.png`);
  }

  for (const key of BOUNDARY_KEYS) {
    scene.load.image(key, `assets/world/${key}.png`);
  }

  for (const key of [
    "arena-sky",
    "arena-hills",
    "arena-platform",
  ] as const) {
    scene.load.image(key, `assets/world/${key}.png`);
  }
}
