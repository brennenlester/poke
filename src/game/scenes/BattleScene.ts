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

  constructor() {
    super({ key: "BattleScene" });
  }

  init(data: {
    wildCreatureId: string;
    wandererPartner: WandererPartner;
  }): void {
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
      const def = getCreatureDefinition(partyCreature.definitionId);
      this.player = {
        name: def.name,
        maxHp: def.maxHp,
        currentHp: partyCreature.currentHp,
        attack: def.attack,
        defense: def.defense,
        moves: def.moves,
      };
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

    this.logText = this.add.text(cx, 260, "", {
      color: "#c8b8a0",
      fontFamily: "system-ui, sans-serif",
      fontSize: "14px",
      align: "center",
      wordWrap: { width: 380 },
    }).setOrigin(0.5, 0);

    this.refreshHp();
    this.log(`A training spar with ${this.wild.name} begins.`);

    let buttonY = 320;
    for (const move of this.player.moves) {
      this.addMoveButton(cx, buttonY, move);
      buttonY += 44;
    }
  }

  private addMoveButton(
    x: number,
    y: number,
    move: MoveDefinition,
  ): void {
    const btn = this.add
      .text(x, y, move.name, {
        color: "#1a1a2e",
        backgroundColor: "#c8dce8",
        fontFamily: "system-ui, sans-serif",
        fontSize: "16px",
        padding: { x: 16, y: 8 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    btn.on("pointerdown", () => {
      if (!this.waitingForPlayer) {
        return;
      }
      this.playerTurn(move);
    });
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
    this.log(
      playerWon
        ? "You won the training spar!"
        : "You lost the training spar...",
    );

    const partyCreature =
      this.partyInstanceIndex >= 0
        ? playerParty.creatures[this.partyInstanceIndex]
        : undefined;
    if (partyCreature) {
      partyCreature.currentHp = this.player.currentHp;
    }

    this.time.delayedCall(1200, () => {
      this.scene.stop("BattleScene");
      this.scene.stop("EncounterScene");
      this.scene.resume("IsometricScene");
    });
  }
}
