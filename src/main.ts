import Phaser from "phaser";
import "./style.css";
import { createGame } from "./game/Game";

const game = createGame("game");

// ponytail: dev-only encounter preview via ?encounter=ember-wisp or ?spar=ember-wisp
if (import.meta.env.DEV) {
  const params = new URLSearchParams(window.location.search);
  const creatureId = params.get("encounter") ?? params.get("spar");
  if (creatureId) {
    game.events.once("ready", () => {
      const iso = game.scene.getScene("IsometricScene") as Phaser.Scene;
      if (params.has("spar")) {
        iso.scene.launch("BattleScene", {
          wildCreatureId: creatureId,
          wandererPartner: {
            name: "Wanderer's Spark",
            maxHp: 24,
            attack: 6,
            defense: 4,
            moves: [{ id: "nudge", name: "Nudge", power: 5 }],
          },
        });
      } else {
        iso.scene.launch("EncounterScene", { creatureId });
      }
      iso.scene.pause();
    });
  }
}
