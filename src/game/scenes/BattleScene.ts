import Phaser from "phaser";
import { getCreatureDefinition } from "../creatures/catalog";
import { playerParty } from "../creatures/party";
import { ensureCreatureTextures } from "../creatures/sprites";
import type { BattleCombatant, MoveDefinition } from "../creatures/types";
import {
  applyDamage,
  calcDamage,
  isFainted,
  pickRandomMove,
} from "../battle/battleLogic";

type WandererPartner = {
  name: string;
  maxHp: number;
  attack: number;
  defense: number;
  moves: MoveDefinition[];
};

export class BattleScene extends Phaser.Scene {
  private wild!: BattleCombatant;
  private player!: BattleCombatant;
  private partyInstanceIndex = -1;
  private logText!: Phaser.GameObjects.Text;
  private playerHpText!: Phaser.GameObjects.Text;
  private wildHpText!: Phaser.GameObjects.Text;
  private waitingForPlayer = true;
  private forcedSwitch = false;
  private switchMenuOpen = false;
  private actionButtons: Phaser.GameObjects.Text[] = [];
  private switchMenuObjects: Phaser.GameObjects.GameObject[] = [];

  constructor() {
    super({ key: "BattleScene" });
  }

  init(data: {
    wildCreatureId: string;
    wandererPartner: WandererPartner;
  }): void {
    this.waitingForPlayer = true;
    this.partyInstanceIndex = -1;
    this.forcedSwitch = false;
    this.switchMenuOpen = false;
    this.actionButtons = [];
    this.switchMenuObjects = [];

    const wildDef = getCreatureDefinition(data.wildCreatureId);
    this.wild = {
      name: wildDef.name,
      maxHp: wildDef.maxHp,
      currentHp: wildDef.maxHp,
      attack: wildDef.attack,
      defense: wildDef.defense,
      moves: wildDef.moves,
    };

    const activeIndex = playerParty.creatures.findIndex((c) => c.currentHp > 0);
    const partyCreature =
      activeIndex >= 0 ? playerParty.creatures[activeIndex] : undefined;

    if (partyCreature) {
      this.partyInstanceIndex = activeIndex;
      this.player = this.combatantFromPartyIndex(activeIndex);
    } else {
      this.player = {
        name: data.wandererPartner.name,
        maxHp: data.wandererPartner.maxHp,
        currentHp: data.wandererPartner.maxHp,
        attack: data.wandererPartner.attack,
        defense: data.wandererPartner.defense,
        moves: data.wandererPartner.moves,
      };
    }
  }

  create(): void {
    ensureCreatureTextures(this);

    this.add
      .rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.75)
      .setOrigin(0);

    const cx = this.scale.width / 2;

    this.add
      .text(cx, 40, "Training Spar", {
        color: "#f0e6d2",
        fontFamily: "system-ui, sans-serif",
        fontSize: "22px",
      })
      .setOrigin(0.5);

    this.wildHpText = this.add.text(cx - 120, 90, "", {
      color: "#f0e6d2",
      fontFamily: "system-ui, sans-serif",
      fontSize: "14px",
    });

    this.playerHpText = this.add.text(cx + 40, 200, "", {
      color: "#f0e6d2",
      fontFamily: "system-ui, sans-serif",
      fontSize: "14px",
    });

    this.logText = this.add
      .text(cx, 260, "", {
        color: "#c8b8a0",
        fontFamily: "system-ui, sans-serif",
        fontSize: "14px",
        align: "center",
        wordWrap: { width: 380 },
      })
      .setOrigin(0.5, 0);

    this.refreshHp();
    this.log(`A training spar with ${this.wild.name} begins.`);
    this.buildActionButtons();
  }

  private combatantFromPartyIndex(index: number): BattleCombatant {
    const partyCreature = playerParty.creatures[index];
    const def = getCreatureDefinition(partyCreature.definitionId);
    return {
      name: def.name,
      maxHp: def.maxHp,
      currentHp: partyCreature.currentHp,
      attack: def.attack,
      defense: def.defense,
      moves: def.moves,
    };
  }

  private syncActivePartyHp(): void {
    if (this.partyInstanceIndex < 0) {
      return;
    }
    const partyCreature = playerParty.creatures[this.partyInstanceIndex];
    if (partyCreature) {
      partyCreature.currentHp = this.player.currentHp;
    }
  }

  private hasSwitchablePartyMembers(): boolean {
    return playerParty.creatures.some(
      (creature, index) =>
        index !== this.partyInstanceIndex && creature.currentHp > 0,
    );
  }

  private clearActionButtons(): void {
    for (const button of this.actionButtons) {
      button.destroy();
    }
    this.actionButtons = [];
  }

  private buildActionButtons(): void {
    this.clearActionButtons();
    this.hideSwitchMenu();

    const cx = this.scale.width / 2;
    let buttonY = 320;

    if (!this.forcedSwitch) {
      for (const move of this.player.moves) {
        this.actionButtons.push(this.addMoveButton(cx, buttonY, move));
        buttonY += 44;
      }
    }

    if (this.hasSwitchablePartyMembers()) {
      this.actionButtons.push(
        this.addActionButton(cx, buttonY, "Switch", () => this.showSwitchMenu()),
      );
    }
  }

  private addActionButton(
    x: number,
    y: number,
    label: string,
    onClick: () => void,
  ): Phaser.GameObjects.Text {
    const btn = this.add
      .text(x, y, label, {
        color: "#1a1a2e",
        backgroundColor: "#c8dce8",
        fontFamily: "system-ui, sans-serif",
        fontSize: "16px",
        padding: { x: 16, y: 8 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    btn.on("pointerdown", onClick);
    return btn;
  }

  private addMoveButton(
    x: number,
    y: number,
    move: MoveDefinition,
  ): Phaser.GameObjects.Text {
    return this.addActionButton(x, y, move.name, () => {
      if (!this.waitingForPlayer || this.switchMenuOpen) {
        return;
      }
      this.playerTurn(move);
    });
  }

  private showSwitchMenu(): void {
    if (!this.waitingForPlayer || this.switchMenuOpen) {
      return;
    }

    this.switchMenuOpen = true;
    const cx = this.scale.width / 2;
    const panelY = this.scale.height / 2;

    const panel = this.add
      .rectangle(cx, panelY, 320, 220, 0x2a2a3e, 0.98)
      .setStrokeStyle(2, 0xf0e6d2);
    this.switchMenuObjects.push(panel);

    const title = this.add
      .text(cx, panelY - 90, "Choose a creature", {
        color: "#f0e6d2",
        fontFamily: "system-ui, sans-serif",
        fontSize: "16px",
      })
      .setOrigin(0.5);
    this.switchMenuObjects.push(title);

    let rowY = panelY - 50;
    for (let index = 0; index < playerParty.creatures.length; index++) {
      const creature = playerParty.creatures[index];
      const def = getCreatureDefinition(creature.definitionId);
      const isActive = index === this.partyInstanceIndex;
      const fainted = creature.currentHp <= 0;
      const label = fainted
        ? `${def.name} (fainted)`
        : isActive
          ? `${def.name} (active)`
          : `${def.name} (${creature.currentHp}/${def.maxHp} HP)`;

      const btn = this.add
        .text(cx, rowY, label, {
          color: fainted || isActive ? "#888888" : "#1a1a2e",
          backgroundColor: fainted || isActive ? "#4a4a5a" : "#f0e6d2",
          fontFamily: "system-ui, sans-serif",
          fontSize: "14px",
          padding: { x: 10, y: 6 },
        })
        .setOrigin(0.5);

      if (!fainted && !isActive) {
        btn.setInteractive({ useHandCursor: true });
        btn.on("pointerdown", () => this.switchToPartyIndex(index));
      }

      this.switchMenuObjects.push(btn);
      rowY += 36;
    }

    const cancel = this.add
      .text(cx, panelY + 80, "Cancel", {
        color: "#1a1a2e",
        backgroundColor: "#c8b8a0",
        fontFamily: "system-ui, sans-serif",
        fontSize: "14px",
        padding: { x: 10, y: 6 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    cancel.on("pointerdown", () => {
      if (this.forcedSwitch) {
        return;
      }
      this.hideSwitchMenu();
    });
    this.switchMenuObjects.push(cancel);
  }

  private hideSwitchMenu(): void {
    for (const object of this.switchMenuObjects) {
      object.destroy();
    }
    this.switchMenuObjects = [];
    this.switchMenuOpen = false;
  }

  private switchToPartyIndex(index: number): void {
    const creature = playerParty.creatures[index];
    if (
      !creature ||
      index === this.partyInstanceIndex ||
      creature.currentHp <= 0
    ) {
      return;
    }

    const voluntarySwitch = !this.forcedSwitch;
    this.syncActivePartyHp();
    this.partyInstanceIndex = index;
    this.player = this.combatantFromPartyIndex(index);
    this.forcedSwitch = false;
    this.hideSwitchMenu();
    this.refreshHp();
    this.log(`Go, ${this.player.name}!`);
    this.buildActionButtons();

    if (voluntarySwitch) {
      this.waitingForPlayer = false;
      this.time.delayedCall(500, () => this.wildTurn());
    } else {
      this.waitingForPlayer = true;
    }
  }

  private playerTurn(move: MoveDefinition): void {
    this.waitingForPlayer = false;
    const damage = calcDamage(this.player, move, this.wild);
    applyDamage(this.wild, damage);
    this.log(`${this.player.name} used ${move.name} (${damage} dmg).`);
    this.refreshHp();

    if (isFainted(this.wild)) {
      this.endBattle(true);
      return;
    }

    this.time.delayedCall(500, () => this.wildTurn());
  }

  private wildTurn(): void {
    const move = pickRandomMove(this.wild);
    const damage = calcDamage(this.wild, move, this.player);
    applyDamage(this.player, damage);
    this.log(`${this.wild.name} used ${move.name} (${damage} dmg).`);
    this.refreshHp();

    if (isFainted(this.player)) {
      this.syncActivePartyHp();
      if (this.hasSwitchablePartyMembers()) {
        this.forcedSwitch = true;
        this.waitingForPlayer = true;
        this.log(`${this.player.name} fainted! Choose a replacement.`);
        this.buildActionButtons();
        this.showSwitchMenu();
        return;
      }
      this.endBattle(false);
      return;
    }

    this.waitingForPlayer = true;
  }

  private refreshHp(): void {
    this.wildHpText.setText(
      `${this.wild.name}: ${this.wild.currentHp}/${this.wild.maxHp} HP`,
    );
    this.playerHpText.setText(
      `${this.player.name}: ${this.player.currentHp}/${this.player.maxHp} HP`,
    );
  }

  private log(message: string): void {
    this.logText.setText(message);
  }

  private endBattle(playerWon: boolean): void {
    this.waitingForPlayer = false;
    this.hideSwitchMenu();
    this.log(
      playerWon
        ? "You won the training spar!"
        : "You lost the training spar...",
    );

    this.syncActivePartyHp();

    this.time.delayedCall(1200, () => {
      this.scene.stop("BattleScene");
      this.scene.stop("EncounterScene");
      this.scene.resume("IsometricScene");
    });
  }
}
