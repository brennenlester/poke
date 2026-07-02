import Phaser from "phaser";
import {
  canCraft,
  craftItem,
  CRAFT_RECIPES,
  type CraftRecipe,
} from "../crafting/recipes";
import { getMaterialName, getItemName } from "../inventory/materials";
import {
  getItemCount,
  getMaterialCount,
} from "../inventory/playerInventory";
import { applyShrineFusion, getEligibleCreaturesForItem } from "../shrine/fusion";
import { getEffectsForItem } from "../shrine/shrineEffects";
import {
  applyConsumable,
  CONSUMABLE_ITEM_IDS,
  FUSION_ITEM_IDS,
  getConsumable,
  getEligibleCreaturesForConsumable,
  isConsumableItem,
} from "../shrine/consumables";

const MOON_PANEL = 0x2a2440;
const MOON_STROKE = 0xc8b8e8;
const MOON_ACCENT = 0x8a7aa8;
const MOON_TEXT = "#e8dff8";
const MOON_MUTED = "#b8a8d0";

type Tab = "craft" | "fusion" | "use";

export class ShrineScene extends Phaser.Scene {
  private activeTab: Tab = "craft";
  private selectedItemId: string | null = null;
  private statusText!: Phaser.GameObjects.Text;
  private contentContainer!: Phaser.GameObjects.Container;
  private tabButtons: Phaser.GameObjects.Text[] = [];

  constructor() {
    super({ key: "ShrineScene" });
  }

  create(): void {
    this.activeTab = "craft";
    this.selectedItemId = null;

    this.add
      .rectangle(0, 0, this.scale.width, this.scale.height, 0x0a0818, 0.82)
      .setOrigin(0)
      .setInteractive();

    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;

    const panel = this.add
      .rectangle(cx, cy, 480, 380, MOON_PANEL, 0.97)
      .setStrokeStyle(3, MOON_STROKE);
    void panel;

    this.drawRuneBorder(cx, cy, 500, 400);

    this.add
      .text(cx, cy - 165, "Moon Shrine", {
        color: MOON_TEXT,
        fontFamily: "system-ui, serif",
        fontSize: "26px",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .text(cx, cy - 138, "Craft relics, use tonics, or fuse with companions", {
        color: MOON_MUTED,
        fontFamily: "system-ui, sans-serif",
        fontSize: "13px",
      })
      .setOrigin(0.5);

    this.buildTabs(cx, cy - 105);
    this.contentContainer = this.add.container(0, 0);
    this.statusText = this.add
      .text(cx, cy + 155, "", {
        color: MOON_TEXT,
        fontFamily: "system-ui, sans-serif",
        fontSize: "14px",
        align: "center",
        wordWrap: { width: 420 },
      })
      .setOrigin(0.5);

    this.add
      .text(cx, cy + 175, "Press Esc or click Close to leave", {
        color: MOON_MUTED,
        fontFamily: "system-ui, sans-serif",
        fontSize: "12px",
      })
      .setOrigin(0.5);

    this.add
      .text(cx, cy + 195, "Close", {
        color: "#1a1a2e",
        backgroundColor: "#c8b8e8",
        fontFamily: "system-ui, sans-serif",
        fontSize: "14px",
        padding: { x: 14, y: 6 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.closeShrine());

    this.input.keyboard?.once("keydown-ESC", () => this.closeShrine());

    this.renderTabContent();
  }

  private drawRuneBorder(cx: number, cy: number, w: number, h: number): void {
    const g = this.add.graphics();
    g.lineStyle(1, MOON_ACCENT, 0.6);
    const corners = [
      { x: cx - w / 2 + 12, y: cy - h / 2 + 12 },
      { x: cx + w / 2 - 12, y: cy - h / 2 + 12 },
      { x: cx - w / 2 + 12, y: cy + h / 2 - 12 },
      { x: cx + w / 2 - 12, y: cy + h / 2 - 12 },
    ];
    for (const c of corners) {
      g.strokeCircle(c.x, c.y, 6);
    }
  }

  private buildTabs(cx: number, y: number): void {
    this.tabButtons = [];
    const tabs: { id: Tab; label: string }[] = [
      { id: "craft", label: "Craft" },
      { id: "use", label: "Use" },
      { id: "fusion", label: "Fusion" },
    ];

    let x = cx - 120;
    for (const tab of tabs) {
      const btn = this.add
        .text(x, y, tab.label, {
          color: this.activeTab === tab.id ? "#1a1a2e" : MOON_TEXT,
          backgroundColor:
            this.activeTab === tab.id ? "#e0d4f0" : "#4a3a68",
          fontFamily: "system-ui, sans-serif",
          fontSize: "15px",
          padding: { x: 16, y: 8 },
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      btn.on("pointerdown", () => {
        this.activeTab = tab.id;
        this.selectedItemId = null;
        this.refreshTabs();
        this.renderTabContent();
      });
      this.tabButtons.push(btn);
      x += 90;
    }
  }

  private refreshTabs(): void {
    const labels = ["Craft", "Use", "Fusion"];
    const ids: Tab[] = ["craft", "use", "fusion"];
    this.tabButtons.forEach((btn, i) => {
      const active = this.activeTab === ids[i];
      btn.setColor(active ? "#1a1a2e" : MOON_TEXT);
      btn.setBackgroundColor(active ? "#e0d4f0" : "#4a3a68");
      btn.setText(labels[i]);
    });
  }

  private renderTabContent(): void {
    this.contentContainer.removeAll(true);
    if (this.activeTab === "craft") {
      this.renderCraftTab();
    } else if (this.activeTab === "use") {
      this.renderUseTab();
    } else {
      this.renderFusionTab();
    }
  }

  private renderCraftTab(): void {
    const cx = this.scale.width / 2;
    let y = this.scale.height / 2 - 75;

    for (const recipe of CRAFT_RECIPES) {
      const row = this.buildRecipeRow(cx, y, recipe);
      this.contentContainer.add(row);
      y += 55;
    }
  }

  private buildRecipeRow(
    cx: number,
    y: number,
    recipe: CraftRecipe,
  ): Phaser.GameObjects.GameObject[] {
    const objects: Phaser.GameObjects.GameObject[] = [];

    const costParts = recipe.materials.map(
      (m) => `${getMaterialName(m.materialId)}×${m.count} (${getMaterialCount(m.materialId)})`,
    );
    const label = this.add
      .text(cx - 100, y, `${recipe.name}\n${costParts.join(" + ")}`, {
        color: MOON_TEXT,
        fontFamily: "system-ui, sans-serif",
        fontSize: "14px",
      })
      .setOrigin(0, 0.5);
    objects.push(label);

    const craftable = canCraft(recipe);
    const btn = this.add
      .text(cx + 140, y, craftable ? "Craft" : "Need mats", {
        color: craftable ? "#1a1a2e" : "#888888",
        backgroundColor: craftable ? "#e0d4f0" : "#3a2a50",
        fontFamily: "system-ui, sans-serif",
        fontSize: "14px",
        padding: { x: 12, y: 6 },
      })
      .setOrigin(0.5);

    if (craftable) {
      btn.setInteractive({ useHandCursor: true });
      btn.on("pointerdown", () => {
        if (craftItem(recipe)) {
          this.setStatus(`Crafted ${recipe.name}!`);
          this.renderTabContent();
        }
      });
    }
    objects.push(btn);
    return objects;
  }

  private renderFusionTab(): void {
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;

    const ownedItems = FUSION_ITEM_IDS.filter((id) => getItemCount(id) > 0);

    if (ownedItems.length === 0) {
      const empty = this.add
        .text(cx, cy - 20, "Craft items first, then return to fuse.", {
          color: MOON_MUTED,
          fontFamily: "system-ui, sans-serif",
          fontSize: "15px",
        })
        .setOrigin(0.5);
      this.contentContainer.add(empty);
      return;
    }

    if (!this.selectedItemId) {
      const prompt = this.add
        .text(cx, cy - 70, "Choose an item to fuse:", {
          color: MOON_TEXT,
          fontFamily: "system-ui, sans-serif",
          fontSize: "15px",
        })
        .setOrigin(0.5);
      this.contentContainer.add(prompt);

      let y = cy - 30;
      for (const itemId of ownedItems) {
        const btn = this.add
          .text(cx, y, `${getItemName(itemId)} (×${getItemCount(itemId)})`, {
            color: "#1a1a2e",
            backgroundColor: "#c8b8e8",
            fontFamily: "system-ui, sans-serif",
            fontSize: "14px",
            padding: { x: 14, y: 8 },
          })
          .setOrigin(0.5)
          .setInteractive({ useHandCursor: true });

        btn.on("pointerdown", () => {
          this.selectedItemId = itemId;
          this.renderTabContent();
        });
        this.contentContainer.add(btn);
        y += 44;
      }
      return;
    }

    const itemId = this.selectedItemId;
    const effects = getEffectsForItem(itemId);
    const effectDesc = effects
      .map((e) => `${e.creatureId} @ Lv.${e.minLevel}: ${e.effectType}`)
      .join("; ");

    const header = this.add
      .text(cx, cy - 80, `${getItemName(itemId)} — ${effectDesc}`, {
        color: MOON_MUTED,
        fontFamily: "system-ui, sans-serif",
        fontSize: "12px",
        align: "center",
        wordWrap: { width: 400 },
      })
      .setOrigin(0.5);
    this.contentContainer.add(header);

    const back = this.add
      .text(cx - 180, cy - 80, "← Back", {
        color: MOON_TEXT,
        fontFamily: "system-ui, sans-serif",
        fontSize: "13px",
      })
      .setOrigin(0, 0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        this.selectedItemId = null;
        this.renderTabContent();
      });
    this.contentContainer.add(back);

    const eligible = getEligibleCreaturesForItem(itemId).filter(
      (entry) => entry.eligible,
    );
    const allCandidates = getEligibleCreaturesForItem(itemId);
    if (eligible.length === 0) {
      const alreadyApplied = allCandidates.some(
        (e) => e.reason === "Already applied",
      );
      const message = alreadyApplied
        ? "Fusion already applied to all eligible creatures."
        : "No creatures at the required level.";
      const none = this.add
        .text(cx, cy, message, {
          color: MOON_MUTED,
          fontFamily: "system-ui, sans-serif",
          fontSize: "14px",
        })
        .setOrigin(0.5);
      this.contentContainer.add(none);
      return;
    }

    let y = cy - 40;
    for (const entry of eligible) {
      const label = `${entry.name} Lv.${entry.level}`;

      const btn = this.add
        .text(cx, y, label, {
          color: "#1a1a2e",
          backgroundColor: "#e0d4f0",
          fontFamily: "system-ui, sans-serif",
          fontSize: "14px",
          padding: { x: 12, y: 6 },
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      btn.on("pointerdown", () => {
        const result = applyShrineFusion(entry.instanceId, itemId);
        this.setStatus(result.message);
        if (result.ok) {
          this.selectedItemId = null;
        }
        this.renderTabContent();
      });
      this.contentContainer.add(btn);
      y += 38;
    }
  }

  private renderUseTab(): void {
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;

    const consumableIds = CONSUMABLE_ITEM_IDS.filter(
      (id) => getItemCount(id) > 0,
    );

    if (consumableIds.length === 0) {
      const empty = this.add
        .text(cx, cy - 20, "Craft Brook Tonic or Moonwake Draught first.", {
          color: MOON_MUTED,
          fontFamily: "system-ui, sans-serif",
          fontSize: "15px",
        })
        .setOrigin(0.5);
      this.contentContainer.add(empty);
      return;
    }

    if (!this.selectedItemId || !isConsumableItem(this.selectedItemId)) {
      const prompt = this.add
        .text(cx, cy - 70, "Choose a consumable:", {
          color: MOON_TEXT,
          fontFamily: "system-ui, sans-serif",
          fontSize: "15px",
        })
        .setOrigin(0.5);
      this.contentContainer.add(prompt);

      let y = cy - 30;
      for (const itemId of consumableIds) {
        const consumable = getConsumable(itemId)!;
        const effectLabel =
          consumable.effectType === "heal" ? "heals 50% HP" : "revives fainted";
        const btn = this.add
          .text(
            cx,
            y,
            `${getItemName(itemId)} (×${getItemCount(itemId)}) — ${effectLabel}`,
            {
              color: "#1a1a2e",
              backgroundColor: "#c8b8e8",
              fontFamily: "system-ui, sans-serif",
              fontSize: "13px",
              padding: { x: 12, y: 8 },
            },
          )
          .setOrigin(0.5)
          .setInteractive({ useHandCursor: true });

        btn.on("pointerdown", () => {
          this.selectedItemId = itemId;
          this.renderTabContent();
        });
        this.contentContainer.add(btn);
        y += 44;
      }
      return;
    }

    const itemId = this.selectedItemId;
    const consumable = getConsumable(itemId)!;
    const effectLabel =
      consumable.effectType === "heal"
        ? "Heals injured creatures by 50% max HP"
        : "Revives fainted creatures to 50% max HP";

    const header = this.add
      .text(cx, cy - 80, `${getItemName(itemId)} — ${effectLabel}`, {
        color: MOON_MUTED,
        fontFamily: "system-ui, sans-serif",
        fontSize: "12px",
        align: "center",
        wordWrap: { width: 400 },
      })
      .setOrigin(0.5);
    this.contentContainer.add(header);

    const back = this.add
      .text(cx - 180, cy - 80, "← Back", {
        color: MOON_TEXT,
        fontFamily: "system-ui, sans-serif",
        fontSize: "13px",
      })
      .setOrigin(0, 0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        this.selectedItemId = null;
        this.renderTabContent();
      });
    this.contentContainer.add(back);

    const eligible = getEligibleCreaturesForConsumable(itemId).filter(
      (entry) => entry.eligible,
    );
    if (eligible.length === 0) {
      const message =
        consumable.effectType === "heal"
          ? "No injured creatures to heal."
          : "No fainted creatures to revive.";
      const none = this.add
        .text(cx, cy, message, {
          color: MOON_MUTED,
          fontFamily: "system-ui, sans-serif",
          fontSize: "14px",
        })
        .setOrigin(0.5);
      this.contentContainer.add(none);
      return;
    }

    let y = cy - 40;
    for (const entry of eligible) {
      const hpLabel =
        entry.currentHp <= 0
          ? "fainted"
          : `${entry.currentHp}/${entry.maxHp} HP`;
      const label = `${entry.name} Lv.${entry.level} (${hpLabel})`;

      const btn = this.add
        .text(cx, y, label, {
          color: "#1a1a2e",
          backgroundColor: "#e0d4f0",
          fontFamily: "system-ui, sans-serif",
          fontSize: "14px",
          padding: { x: 12, y: 6 },
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      btn.on("pointerdown", () => {
        const result = applyConsumable(entry.instanceId, itemId);
        this.setStatus(result.message);
        if (result.ok) {
          this.selectedItemId = null;
        }
        this.renderTabContent();
      });
      this.contentContainer.add(btn);
      y += 38;
    }
  }

  private setStatus(message: string): void {
    this.statusText.setText(message);
  }

  private closeShrine(): void {
    this.scene.stop("ShrineScene");
    this.scene.resume("IsometricScene");
  }
}
