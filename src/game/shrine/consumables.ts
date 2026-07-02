import { getCreatureDefinition } from "../creatures/catalog";
import {
  getCreatureInstance,
  getEffectiveMaxHp,
  playerParty,
} from "../creatures/party";
import { consumeItem } from "../inventory/playerInventory";

export type ConsumableEffectType = "heal" | "revive";

export type ConsumableDefinition = {
  itemId: string;
  effectType: ConsumableEffectType;
  /** Fraction of effective max HP restored or revived to. */
  hpFraction: number;
};

export const CONSUMABLE_ITEMS: ConsumableDefinition[] = [
  { itemId: "brook-tonic", effectType: "heal", hpFraction: 0.5 },
  { itemId: "moonwake-draught", effectType: "revive", hpFraction: 0.5 },
];

export const FUSION_ITEM_IDS = ["ember-charm", "moss-salve"] as const;

export const CONSUMABLE_ITEM_IDS = CONSUMABLE_ITEMS.map((c) => c.itemId);

const byItemId = new Map(CONSUMABLE_ITEMS.map((c) => [c.itemId, c]));

export function getConsumable(itemId: string): ConsumableDefinition | undefined {
  return byItemId.get(itemId);
}

export function isConsumableItem(itemId: string): boolean {
  return byItemId.has(itemId);
}

export type ConsumableResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export function canUseConsumableOn(
  creature: { currentHp: number },
  consumable: ConsumableDefinition,
  maxHp: number,
): boolean {
  if (consumable.effectType === "heal") {
    return creature.currentHp > 0 && creature.currentHp < maxHp;
  }
  return creature.currentHp <= 0;
}

export function applyConsumable(
  instanceId: string,
  itemId: string,
): ConsumableResult {
  const consumable = getConsumable(itemId);
  if (!consumable) {
    return { ok: false, message: "That item cannot be used here." };
  }

  const creature = getCreatureInstance(instanceId);
  if (!creature) {
    return { ok: false, message: "Creature not found." };
  }

  const maxHp = getEffectiveMaxHp(creature);
  if (!canUseConsumableOn(creature, consumable, maxHp)) {
    if (consumable.effectType === "heal") {
      if (creature.currentHp <= 0) {
        return { ok: false, message: "Cannot heal a fainted creature." };
      }
      return { ok: false, message: "Creature is already at full health." };
    }
    return { ok: false, message: "Creature is not fainted." };
  }

  if (!consumeItem(itemId)) {
    return { ok: false, message: "You don't have that item." };
  }

  const def = getCreatureDefinition(creature.definitionId);
  const amount = Math.max(1, Math.floor(maxHp * consumable.hpFraction));

  if (consumable.effectType === "heal") {
    const before = creature.currentHp;
    creature.currentHp = Math.min(maxHp, creature.currentHp + amount);
    const gained = creature.currentHp - before;
    return {
      ok: true,
      message: `${def.name} recovered ${gained} HP (${creature.currentHp}/${maxHp}).`,
    };
  }

  creature.currentHp = amount;
  return {
    ok: true,
    message: `${def.name} was revived (${creature.currentHp}/${maxHp} HP).`,
  };
}

export function getEligibleCreaturesForConsumable(itemId: string): {
  instanceId: string;
  name: string;
  level: number;
  currentHp: number;
  maxHp: number;
  eligible: boolean;
  reason?: string;
}[] {
  const consumable = getConsumable(itemId);
  if (!consumable) {
    return [];
  }

  return playerParty.creatures.map((creature) => {
    const def = getCreatureDefinition(creature.definitionId);
    const maxHp = getEffectiveMaxHp(creature);
    const eligible = canUseConsumableOn(creature, consumable, maxHp);
    let reason: string | undefined;
    if (!eligible) {
      if (consumable.effectType === "heal") {
        reason =
          creature.currentHp <= 0
            ? "Fainted"
            : creature.currentHp >= maxHp
              ? "Full HP"
              : undefined;
      } else {
        reason = "Not fainted";
      }
    }
    return {
      instanceId: creature.instanceId,
      name: def.name,
      level: creature.level,
      currentHp: creature.currentHp,
      maxHp,
      eligible,
      reason,
    };
  });
}
