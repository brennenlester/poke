import Phaser from "phaser";
import { IsometricScene } from "./scenes/IsometricScene";
import { EncounterScene } from "./scenes/EncounterScene";
import { BattleScene } from "./scenes/BattleScene";
import { ShrineScene } from "./scenes/ShrineScene";

export function createGame(parent: string): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: 640,
    height: 640,
    backgroundColor: "#1a1a2e",
    scene: [IsometricScene, EncounterScene, BattleScene, ShrineScene],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
  });
}
