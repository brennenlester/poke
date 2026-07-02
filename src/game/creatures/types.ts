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
  currentHp: number;
  nickname?: string;
};

export type BattleCombatant = {
  name: string;
  maxHp: number;
  currentHp: number;
  attack: number;
  defense: number;
  moves: MoveDefinition[];
};
