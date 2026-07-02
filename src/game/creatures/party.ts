import { getCreatureDefinition } from "./catalog";
import type { CreatureInstance } from "./types";

export const playerParty = {
  creatures: [] as CreatureInstance[],
};

let nextInstanceId = 1;

export function addToParty(definitionId: string): CreatureInstance {
  const def = getCreatureDefinition(definitionId);
  const instance: CreatureInstance = {
    instanceId: `c-${nextInstanceId++}`,
    definitionId,
    currentHp: def.maxHp,
  };
  playerParty.creatures.push(instance);
  return instance;
}

export function hasCreature(definitionId: string): boolean {
  return playerParty.creatures.some((c) => c.definitionId === definitionId);
}

export function getPartySummary(): string {
  if (playerParty.creatures.length === 0) {
    return "Party: (empty)";
  }
  const names = playerParty.creatures.map((c) => {
    const def = getCreatureDefinition(c.definitionId);
    return def.name;
  });
  return `Party: ${names.join(", ")}`;
}
