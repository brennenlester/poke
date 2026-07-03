import Phaser from "phaser";
import "./style.css";
import { createGame } from "./game/Game";

const game = createGame("game");

// ponytail: dev-only encounter preview via ?encounter=ember-wisp
if (import.meta.env.DEV) {
  const creatureId = new URLSearchParams(window.location.search).get("encounter");
  if (creatureId) {
    game.events.once("ready", () => {
      const iso = game.scene.getScene("IsometricScene") as Phaser.Scene;
      iso.scene.launch("EncounterScene", { creatureId });
      iso.scene.pause();
    });
  }
}
