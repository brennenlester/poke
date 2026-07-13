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

/** Queue Imagine-backed PNGs. Missing files fall through to procedural ensure* helpers. */
export function preloadImagineAssets(scene: Phaser.Scene): void {
  // Only idle facings — walk PNGs were inconsistent outfits and caused anim flashes.
  for (const facing of FACINGS) {
    scene.load.image(`player-${facing}-0`, `assets/player/player-${facing}-0.png`);
  }

  for (const creature of CREATURES) {
    scene.load.image(
      creature.spriteKey,
      `assets/creatures/${creature.spriteKey}.png`,
    );
  }

  for (const key of PROP_KEYS) {
    scene.load.image(key, `assets/world/${key}.png`);
  }
}
