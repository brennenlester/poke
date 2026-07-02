import Phaser from "phaser";
import { IsometricScene } from "./scenes/IsometricScene";
import { EncounterScene } from "./scenes/EncounterScene";
import { BattleScene } from "./scenes/BattleScene";

export function createGame(parent: string): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: "#1a1a2e",
    scene: [IsometricScene, EncounterScene, BattleScene],
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
  });
}
