/** Creature-specific spar-win materials keyed by creature definition id. */
export const CREATURE_MATERIALS: Record<string, string> = {
  "mossling": "moss-fiber",
  "ember-wisp": "ember-ash",
  "brook-nymph": "brook-pearl",
  "stone-hound": "stone-chip",
  "mist-serpent": "mist-shard",
  "rootwalker": "root-bark",
  "lantern-fox": "lantern-wick",
  "thunder-finch": "storm-feather",
};

export const MATERIAL_NAMES: Record<string, string> = {
  "moss-fiber": "Moss Fiber",
  "ember-ash": "Ember Ash",
  "brook-pearl": "Brook Pearl",
  "stone-chip": "Stone Chip",
  "mist-shard": "Mist Shard",
  "root-bark": "Root Bark",
  "lantern-wick": "Lantern Wick",
  "storm-feather": "Storm Feather",
  "folklore-dust": "Folklore Dust",
};

export const ITEM_NAMES: Record<string, string> = {
  "ember-charm": "Ember Charm",
  "moss-salve": "Moss Salve",
};

export function getMaterialForCreature(creatureId: string): string | undefined {
  return CREATURE_MATERIALS[creatureId];
}

export function getMaterialName(materialId: string): string {
  return MATERIAL_NAMES[materialId] ?? materialId;
}

export function getItemName(itemId: string): string {
  return ITEM_NAMES[itemId] ?? itemId;
}
