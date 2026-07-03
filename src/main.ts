import Phaser from "phaser";
import "./style.css";
import { initQuestProgress } from "./game/story/questProgress";
import { createGame } from "./game/Game";
import { parseInviteFromUrl } from "./game/world/invite";
import { applyWorldSnapshot } from "./game/world/worldSnapshot";
import { setVisitorMode } from "./game/world/worldSession";

const invite = parseInviteFromUrl();
if (invite) {
  applyWorldSnapshot(invite);
  setVisitorMode(true, invite.hostLabel);
} else {
  initQuestProgress();
}

const game = createGame("game");

// ponytail: dev-only encounter preview via ?encounter=ember-wisp or ?spar=ember-wisp
if (import.meta.env.DEV && !invite) {
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
