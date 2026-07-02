import Phaser from "phaser";
import { getCreatureDefinition } from "../creatures/catalog";
import { addToParty, hasCreature } from "../creatures/party";
import { ensureCreatureTextures } from "../creatures/sprites";

const WANDERER_PARTNER = {
  name: "Wanderer's Spark",
  maxHp: 24,
  attack: 6,
  defense: 4,
  moves: [{ id: "nudge", name: "Nudge", power: 5 }],
};

export class EncounterScene extends Phaser.Scene {
  private creatureId!: string;
  private resolved = false;

  constructor() {
    super({ key: "EncounterScene" });
  }

  init(data: { creatureId: string }): void {
    this.creatureId = data.creatureId;
  }

  create(): void {
    ensureCreatureTextures(this);
    const def = getCreatureDefinition(this.creatureId);

    this.add
      .rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.65)
      .setOrigin(0)
      .setInteractive();

    const panelX = this.scale.width / 2;
    const panelY = this.scale.height / 2;

    this.add
      .rectangle(panelX, panelY, 420, 280, 0x2a2a3e, 0.95)
      .setStrokeStyle(2, 0xf0e6d2);

    this.add
      .image(panelX - 80, panelY - 20, def.spriteKey)
      .setScale(1.5);

    this.add
      .text(panelX + 20, panelY - 70, `A wild ${def.name} appeared!`, {
        color: "#f0e6d2",
        fontFamily: "system-ui, sans-serif",
        fontSize: "20px",
      })
      .setOrigin(0, 0.5);

    this.add
      .text(panelX + 20, panelY - 40, `Type: ${def.folkloreType}`, {
        color: "#c8b8a0",
        fontFamily: "system-ui, sans-serif",
        fontSize: "14px",
      })
      .setOrigin(0, 0.5);

    this.addButton(panelX - 90, panelY + 60, "Befriend", () =>
      this.tryBefriend(),
    );
    this.addButton(panelX, panelY + 60, "Spar", () => this.startSpar());
    this.addButton(panelX + 90, panelY + 60, "Flee", () => this.endEncounter());
  }

  private addButton(
    x: number,
    y: number,
    label: string,
    onClick: () => void,
  ): void {
    const btn = this.add
      .text(x, y, label, {
        color: "#1a1a2e",
        backgroundColor: "#f0e6d2",
        fontFamily: "system-ui, sans-serif",
        fontSize: "16px",
        padding: { x: 12, y: 8 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    btn.on("pointerdown", onClick);
  }

  private tryBefriend(): void {
    if (this.resolved) {
      return;
    }
    this.resolved = true;

    if (hasCreature(this.creatureId)) {
      this.showResult(
        `${getCreatureDefinition(this.creatureId).name} is already in your party.`,
      );
      return;
    }

    const catchChance = 0.55;
    if (Math.random() < catchChance) {
      addToParty(this.creatureId);
      this.showResult(`${getCreatureDefinition(this.creatureId).name} joined you!`);
    } else {
      this.showResult("It slipped away...");
    }
  }

  private showResult(message: string): void {
    const text = this.add
      .text(this.scale.width / 2, this.scale.height / 2 + 120, message, {
        color: "#f0e6d2",
        fontFamily: "system-ui, sans-serif",
        fontSize: "18px",
      })
      .setOrigin(0.5);
    this.time.delayedCall(900, () => {
      text.destroy();
      this.endEncounter();
    });
  }

  private startSpar(): void {
    if (this.resolved) {
      return;
    }
    this.resolved = true;

    this.scene.launch("BattleScene", {
      wildCreatureId: this.creatureId,
      wandererPartner: WANDERER_PARTNER,
    });
    this.scene.pause();
  }

  private endEncounter(): void {
    if (this.resolved) {
      return;
    }
    this.resolved = true;

    this.scene.stop("EncounterScene");
    this.scene.resume("IsometricScene");
  }
}
