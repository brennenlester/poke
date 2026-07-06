import Phaser from "phaser";
import { getCreatureDefinition } from "../creatures/catalog";
import {
  getEffectiveAttack,
  getEffectiveMaxHp,
  playerParty,
} from "../creatures/party";
import { ensureCreatureTextures } from "../creatures/sprites";
import type { BattleCombatant, MoveDefinition } from "../creatures/types";
import {
  applyDamage,
  calcDamage,
  isFainted,
  pickRandomMove,
} from "../battle/battleLogic";
import {
  formatRewardMessage,
  grantSparRewards,
} from "../battle/sparRewards";
import {
  buildArmedWanderer,
  getBestWeaponId,
  hasCraftedWeapon,
  resolveWandererForBattle,
  type WandererPartner,
} from "../battle/wandererWeapons";
import { notifyWorldChanged } from "../world/worldSaveSchedule";

type WandererPartnerData = WandererPartner;

export class BattleScene extends Phaser.Scene {
  private wildCreatureId!: string;
  private wild!: BattleCombatant;
  private player!: BattleCombatant;
  private partyInstanceIndex = -1;
  private logText!: Phaser.GameObjects.Text;
  private playerHpText!: Phaser.GameObjects.Text;
  private wildHpText!: Phaser.GameObjects.Text;
  private waitingForPlayer = true;
  private forcedSwitch = false;
  private switchMenuOpen = false;
  private wandererFallbackOpen = false;
  private usingArmedWanderer = false;
  private actionButtons: Phaser.GameObjects.Text[] = [];
  private switchMenuObjects: Phaser.GameObjects.GameObject[] = [];
  private wandererFallbackObjects: Phaser.GameObjects.GameObject[] = [];

  constructor() {
    super({ key: "BattleScene" });
  }

  init(data: {
    wildCreatureId: string;
    wandererPartner: WandererPartnerData;
  }): void {
    this.wildCreatureId = data.wildCreatureId;
    this.waitingForPlayer = true;
    this.partyInstanceIndex = -1;
    this.forcedSwitch = false;
    this.switchMenuOpen = false;
    this.wandererFallbackOpen = false;
    this.usingArmedWanderer = false;
    this.actionButtons = [];
    this.switchMenuObjects = [];
    this.wandererFallbackObjects = [];

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
      const wanderer = resolveWandererForBattle(data.wandererPartner);
      this.usingArmedWanderer = hasCraftedWeapon();
      this.player = this.combatantFromWanderer(wanderer);
    }
  }

  private combatantFromWanderer(wanderer: WandererPartnerData): BattleCombatant {
    return {
      name: wanderer.name,
      maxHp: wanderer.maxHp,
      currentHp: wanderer.maxHp,
      attack: wanderer.attack,
      defense: wanderer.defense,
      moves: wanderer.moves,
    };
  }

  create(): void {
    this.scene.bringToTop();
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
    const moves = [...def.moves];
    if (partyCreature.secondaryMove) {
      moves.push(partyCreature.secondaryMove);
    }
    return {
      name: def.name,
      maxHp: getEffectiveMaxHp(partyCreature),
      currentHp: partyCreature.currentHp,
      attack: getEffectiveAttack(partyCreature),
      defense: def.defense,
      moves,
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
    this.hideWandererFallbackMenu();

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
    const damage = calcDamage(this.player, move, this.wild);
    return this.addActionButton(x, y, `${move.name}  −${damage}`, () => {
      if (!this.waitingForPlayer || this.switchMenuOpen || this.wandererFallbackOpen) {
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
      const maxHp = getEffectiveMaxHp(creature);
      const label = fainted
        ? `${def.name} Lv.${creature.level} (fainted)`
        : isActive
          ? `${def.name} Lv.${creature.level} (active)`
          : `${def.name} Lv.${creature.level} (${creature.currentHp}/${maxHp} HP)`;

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

  private showWandererFallbackMenu(): void {
    if (this.wandererFallbackOpen) {
      return;
    }

    this.wandererFallbackOpen = true;
    const cx = this.scale.width / 2;
    const panelY = this.scale.height / 2;
    const weaponId = getBestWeaponId();
    const armed = weaponId ? buildArmedWanderer(weaponId) : undefined;

    const panel = this.add
      .rectangle(cx, panelY, 340, 180, 0x2a2a3e, 0.98)
      .setStrokeStyle(2, 0xf0e6d2);
    this.wandererFallbackObjects.push(panel);

    const title = this.add
      .text(cx, panelY - 50, "Your party has fainted!", {
        color: "#f0e6d2",
        fontFamily: "system-ui, sans-serif",
        fontSize: "16px",
      })
      .setOrigin(0.5);
    this.wandererFallbackObjects.push(title);

    const subtitle = this.add
      .text(
        cx,
        panelY - 20,
        armed ? `Fight as ${armed.name}?` : "No weapon available.",
        {
          color: "#c8b8a0",
          fontFamily: "system-ui, sans-serif",
          fontSize: "14px",
          align: "center",
          wordWrap: { width: 300 },
        },
      )
      .setOrigin(0.5);
    this.wandererFallbackObjects.push(subtitle);

    if (armed) {
      const fight = this.add
        .text(cx, panelY + 30, "Fight as Wanderer", {
          color: "#1a1a2e",
          backgroundColor: "#c8dce8",
          fontFamily: "system-ui, sans-serif",
          fontSize: "16px",
          padding: { x: 16, y: 8 },
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
      fight.on("pointerdown", () => this.switchToArmedWanderer());
      this.wandererFallbackObjects.push(fight);
    }

    const retreat = this.add
      .text(cx, panelY + 70, "Retreat", {
        color: "#1a1a2e",
        backgroundColor: "#c8b8a0",
        fontFamily: "system-ui, sans-serif",
        fontSize: "14px",
        padding: { x: 12, y: 6 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    retreat.on("pointerdown", () => this.endBattle(false));
    this.wandererFallbackObjects.push(retreat);
  }

  private hideWandererFallbackMenu(): void {
    for (const object of this.wandererFallbackObjects) {
      object.destroy();
    }
    this.wandererFallbackObjects = [];
    this.wandererFallbackOpen = false;
  }

  private switchToArmedWanderer(): void {
    const weaponId = getBestWeaponId();
    if (!weaponId) {
      this.endBattle(false);
      return;
    }

    this.syncActivePartyHp();
    this.partyInstanceIndex = -1;
    this.usingArmedWanderer = true;
    this.forcedSwitch = false;
    this.player = this.combatantFromWanderer(buildArmedWanderer(weaponId));
    this.hideWandererFallbackMenu();
    this.refreshHp();
    this.log(`${this.player.name} steps up to fight!`);
    this.buildActionButtons();
    this.waitingForPlayer = true;
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
    this.showDamageCounter("wild", damage);
    this.log(`${this.player.name} used ${move.name}.`);
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
    this.showDamageCounter("player", damage);
    this.log(`${this.wild.name} used ${move.name}.`);
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
      if (!this.usingArmedWanderer && hasCraftedWeapon()) {
        this.forcedSwitch = true;
        this.waitingForPlayer = true;
        this.log(`${this.player.name} fainted!`);
        this.buildActionButtons();
        this.showWandererFallbackMenu();
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

  private showDamageCounter(
    target: "wild" | "player",
    damage: number,
  ): void {
    const anchor = target === "wild" ? this.wildHpText : this.playerHpText;
    const color = target === "wild" ? "#ff8866" : "#ffaa44";
    const counter = this.add
      .text(anchor.x + anchor.width + 8, anchor.y - 4, `−${damage}`, {
        color,
        fontFamily: "system-ui, sans-serif",
        fontSize: "22px",
        fontStyle: "bold",
        stroke: "#1a1a2e",
        strokeThickness: 3,
      })
      .setOrigin(0, 0.5)
      .setDepth(10_000);

    this.tweens.add({
      targets: counter,
      y: counter.y - 36,
      alpha: 0,
      duration: 900,
      ease: "Cubic.easeOut",
      onComplete: () => counter.destroy(),
    });
  }

  private log(message: string): void {
    this.logText.setText(message);
  }

  private endBattle(playerWon: boolean): void {
    this.waitingForPlayer = false;
    this.hideSwitchMenu();
    this.hideWandererFallbackMenu();
    this.syncActivePartyHp();

    if (playerWon) {
      const reward = grantSparRewards(
        this.wildCreatureId,
        this.partyInstanceIndex,
      );
      this.log(formatRewardMessage(reward));
    } else {
      this.log("You lost the training spar...");
    }
    notifyWorldChanged();

    this.time.delayedCall(1800, () => {
      this.scene.stop("BattleScene");
      this.scene.stop("EncounterScene");
      this.scene.resume("IsometricScene");
    });
  }
}
