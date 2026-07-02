import type { CreatureDefinition } from "./types";

export const CREATURES: CreatureDefinition[] = [
  {
    id: "mossling",
    name: "Mossling",
    folkloreType: "woodland",
    maxHp: 28,
    attack: 6,
    defense: 4,
    spriteKey: "creature-mossling",
    spriteColor: 0x5a9a4a,
    early: true,
    moves: [
      { id: "tangle", name: "Tangle", power: 5 },
      { id: "spore", name: "Spore", power: 8 },
    ],
  },
  {
    id: "ember-wisp",
    name: "Ember Wisp",
    folkloreType: "hearth",
    maxHp: 22,
    attack: 8,
    defense: 3,
    spriteKey: "creature-ember-wisp",
    spriteColor: 0xe87830,
    early: true,
    moves: [
      { id: "flare", name: "Flare", power: 7 },
      { id: "kindle", name: "Kindle", power: 10 },
      { id: "glow", name: "Glow", power: 4 },
    ],
  },
  {
    id: "brook-nymph",
    name: "Brook Nymph",
    folkloreType: "water",
    maxHp: 26,
    attack: 5,
    defense: 6,
    spriteKey: "creature-brook-nymph",
    spriteColor: 0x4a8ac8,
    early: true,
    moves: [
      { id: "ripple", name: "Ripple", power: 6 },
      { id: "current", name: "Current", power: 9 },
    ],
  },
  {
    id: "stone-hound",
    name: "Stone Hound",
    folkloreType: "earth",
    maxHp: 34,
    attack: 7,
    defense: 8,
    spriteKey: "creature-stone-hound",
    spriteColor: 0x7a7a82,
    early: false,
    moves: [
      { id: "bark", name: "Bark", power: 5 },
      { id: "ram", name: "Ram", power: 11 },
    ],
  },
  {
    id: "mist-serpent",
    name: "Mist Serpent",
    folkloreType: "mist",
    maxHp: 30,
    attack: 9,
    defense: 4,
    spriteKey: "creature-mist-serpent",
    spriteColor: 0x9a8ac0,
    early: false,
    moves: [
      { id: "haze", name: "Haze", power: 6 },
      { id: "coil", name: "Coil", power: 10 },
      { id: "drift", name: "Drift", power: 7 },
    ],
  },
  {
    id: "rootwalker",
    name: "Rootwalker",
    folkloreType: "forest",
    maxHp: 32,
    attack: 6,
    defense: 7,
    spriteKey: "creature-rootwalker",
    spriteColor: 0x6a5030,
    early: false,
    moves: [
      { id: "stomp", name: "Stomp", power: 8 },
      { id: "bloom", name: "Bloom", power: 6 },
    ],
  },
  {
    id: "lantern-fox",
    name: "Lantern Fox",
    folkloreType: "twilight",
    maxHp: 24,
    attack: 8,
    defense: 5,
    spriteKey: "creature-lantern-fox",
    spriteColor: 0xe8c040,
    early: false,
    moves: [
      { id: "gleam", name: "Gleam", power: 7 },
      { id: "dash", name: "Dash", power: 9 },
      { id: "flicker", name: "Flicker", power: 5 },
    ],
  },
  {
    id: "thunder-finch",
    name: "Thunder Finch",
    folkloreType: "storm",
    maxHp: 20,
    attack: 10,
    defense: 3,
    spriteKey: "creature-thunder-finch",
    spriteColor: 0xd0d8f0,
    early: false,
    moves: [
      { id: "peck", name: "Peck", power: 6 },
      { id: "bolt", name: "Bolt", power: 12 },
    ],
  },
];

const byId = new Map(CREATURES.map((c) => [c.id, c]));

export function getCreatureDefinition(id: string): CreatureDefinition {
  const creature = byId.get(id);
  if (!creature) {
    throw new Error(`Unknown creature: ${id}`);
  }
  return creature;
}
