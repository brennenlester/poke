import Phaser from "phaser";
import { preloadGameAudio } from "../audio/gameAudio";
import { preloadImagineAssets } from "../render/imagineAssets";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: "PreloadScene" });
  }

  preload(): void {
    // ponytail: ignore missing optional Imagine files; procedural ensure* fills gaps
    this.load.on("loaderror", () => {
      /* intentional no-op */
    });
    preloadImagineAssets(this);
    preloadGameAudio(this);
  }

  create(): void {
    this.scene.start("IsometricScene");
  }
}
