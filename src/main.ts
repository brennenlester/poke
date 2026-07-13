import Phaser from "phaser";
import "./style.css";
import { initQuestProgress } from "./game/story/questProgress";
import { createGame } from "./game/Game";
import { initStatusPanelControls } from "./game/ui/statusPanel";
import {
  clearJoinParamAndReload,
  parseInviteParam,
} from "./game/world/invite";
import {
  applyWorldSnapshot,
  isValidWorldSnapshot,
} from "./game/world/worldSnapshot";
import {
  clearHostSave,
  loadHostSave,
  restoreHostSave,
  resumeHostPersist,
  suspendHostPersist,
} from "./game/world/worldSave";
import { setVisitorMode } from "./game/world/worldSession";

function showInvalidInviteScreen(): void {
  const overlay = document.getElementById("invite-error");
  const startFresh = document.getElementById("invite-error-start-fresh");
  const playfield = document.getElementById("playfield");
  if (!overlay || !startFresh) {
    return;
  }
  playfield?.setAttribute("hidden", "");
  overlay.hidden = false;
  startFresh.addEventListener("click", () => {
    clearJoinParamAndReload();
  });
}

const params = new URLSearchParams(window.location.search);
if (params.has("new")) {
  clearHostSave();
}

const inviteResult = parseInviteParam();
if (inviteResult.status === "invalid") {
  // Blocking error — do not boot host/visitor game or write quest progress.
  showInvalidInviteScreen();
} else {
  if (inviteResult.status === "ok" && isValidWorldSnapshot(inviteResult.snapshot)) {
    suspendHostPersist();
    applyWorldSnapshot(inviteResult.snapshot);
    setVisitorMode(true, inviteResult.snapshot.hostLabel);
    resumeHostPersist();
  } else {
    const saved = loadHostSave();
    if (saved) {
      restoreHostSave(saved);
    } else {
      initQuestProgress();
    }
  }

  const invite =
    inviteResult.status === "ok" ? inviteResult.snapshot : null;
  const game = createGame("game");
  initStatusPanelControls();

  // ponytail: dev-only encounter preview via ?encounter=ember-wisp or ?spar=ember-wisp
  if (import.meta.env.DEV && !invite) {
    const previewParams = new URLSearchParams(window.location.search);
    const creatureId =
      previewParams.get("encounter") ?? previewParams.get("spar");
    if (creatureId) {
      const launchPreview = (): void => {
        if (!game.scene.isActive("IsometricScene")) {
          window.setTimeout(launchPreview, 40);
          return;
        }
        const iso = game.scene.getScene("IsometricScene") as Phaser.Scene;
        if (previewParams.has("spar")) {
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
      };
      game.events.once("ready", launchPreview);
    }
  }
}
