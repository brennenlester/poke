export type MoveDefinition = {
  id: string;
  name: string;
  power: number;
};

export type CreatureDefinition = {
  id: string;
  name: string;
  folkloreType: string;
  maxHp: number;
  attack: number;
  defense: number;
  spriteKey: string;
  spriteColor: number;
  moves: MoveDefinition[];
  /** Early-region creature obtainable before overworld. */
  early: boolean;
};

export type CreatureInstance = {
  instanceId: string;
  definitionId: string;
  /** Original befriended species; unchanged by evolution. */
  speciesId: string;
  currentHp: number;
  nickname?: string;
  level: number;
  xp: number;
  /** Bonus max HP from shrine health buffs. */
  hpBonus?: number;
  /** Bonus attack from shrine attack buffs. */
  attackBonus?: number;
  /** Secondary elemental type from shrine attack buff. */
  secondaryElement?: string;
  /** Extra move granted by shrine attack buff. */
  secondaryMove?: MoveDefinition;
  /** Applied shrine effect keys (creatureId:itemId). */
  appliedEffects?: string[];
};

export type BattleCombatant = {
  name: string;
  maxHp: number;
  currentHp: number;
  attack: number;
  defense: number;
  moves: MoveDefinition[];
};
