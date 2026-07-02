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

const PANEL_WIDTH = 420;
const PANEL_HEIGHT = 280;
const PANEL_PADDING = 32;
const SPRITE_COLUMN_WIDTH = 76;
const TEXT_INSET = 8;

const TEXT_STYLE = {
  fontFamily: "system-ui, sans-serif",
} as const;

export class EncounterScene extends Phaser.Scene {
  private creatureId!: string;
  private actionTaken = false;

  constructor() {
    super({ key: "EncounterScene" });
  }

  init(data: { creatureId: string }): void {
    this.creatureId = data.creatureId;
    this.actionTaken = false;
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
    const panelLeft = panelX - PANEL_WIDTH / 2;
    const innerLeft = panelLeft + PANEL_PADDING;
    const innerRight = panelLeft + PANEL_WIDTH - PANEL_PADDING;
    const innerWidth = innerRight - innerLeft;
    const textLeft = innerLeft + SPRITE_COLUMN_WIDTH + TEXT_INSET;
    const textColumnWidth = innerRight - textLeft - TEXT_INSET;

    this.add
      .rectangle(panelX, panelY, PANEL_WIDTH, PANEL_HEIGHT, 0x2a2a3e, 0.95)
      .setStrokeStyle(2, 0xf0e6d2);

    this.add
      .image(
        innerLeft + SPRITE_COLUMN_WIDTH / 2,
        panelY - 30,
        def.spriteKey,
      )
      .setScale(1.5)
      .setOrigin(0.5);

    this.add
      .text(textLeft, panelY - 62, `A wild ${def.name} appeared!`, {
        ...TEXT_STYLE,
        color: "#f0e6d2",
        fontSize: "18px",
        align: "left",
        wordWrap: { width: textColumnWidth, useAdvancedWrap: true },
      })
      .setOrigin(0, 0.5);

    this.add
      .text(textLeft, panelY - 28, `Type: ${def.folkloreType}`, {
        ...TEXT_STYLE,
        color: "#c8b8a0",
        fontSize: "14px",
        align: "left",
        wordWrap: { width: textColumnWidth, useAdvancedWrap: true },
      })
      .setOrigin(0, 0.5);

    const buttonY = panelY + 68;
    const buttonLabels = ["Befriend", "Spar", "Flee"] as const;
    const buttonActions = [
      () => this.tryBefriend(),
      () => this.startSpar(),
      () => this.flee(),
    ] as const;
    const buttonSlotWidth = innerWidth / buttonLabels.length;

    buttonLabels.forEach((label, index) => {
      const buttonX = innerLeft + buttonSlotWidth * (index + 0.5);
      this.addButton(buttonX, buttonY, label, buttonActions[index]);
    });
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
        ...TEXT_STYLE,
        fontSize: "16px",
        padding: { x: 10, y: 8 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    btn.on("pointerdown", onClick);
  }

  private tryBefriend(): void {
    if (this.actionTaken) {
      return;
    }
    this.actionTaken = true;

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
        ...TEXT_STYLE,
        color: "#f0e6d2",
        fontSize: "18px",
        align: "center",
        wordWrap: {
          width: PANEL_WIDTH - PANEL_PADDING * 2,
          useAdvancedWrap: true,
        },
      })
      .setOrigin(0.5);
    this.time.delayedCall(900, () => {
      text.destroy();
      this.endEncounter();
    });
  }

  private startSpar(): void {
    if (this.actionTaken) {
      return;
    }
    this.actionTaken = true;

    this.scene.launch("BattleScene", {
      wildCreatureId: this.creatureId,
      wandererPartner: WANDERER_PARTNER,
    });
    this.scene.pause();
  }

  private flee(): void {
    if (this.actionTaken) {
      return;
    }
    this.actionTaken = true;
    this.endEncounter();
  }

  private endEncounter(): void {
    this.scene.stop("EncounterScene");
    this.scene.resume("IsometricScene");
  }
}
