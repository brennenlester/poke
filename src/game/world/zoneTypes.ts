export type ZoneId = "grove" | "shrine" | "village" | "overworld";

export const TileType = {
  Wall: 0,
  Floor: 1,
  OverworldGate: 2,
} as const;

export type TileType = (typeof TileType)[keyof typeof TileType];

export type ZoneTransition = {
  x: number;
  y: number;
  targetZone: ZoneId;
  targetX: number;
  targetY: number;
};

export type ZoneDefinition = {
  id: ZoneId;
  name: string;
  width: number;
  height: number;
  tiles: TileType[][];
  transitions: ZoneTransition[];
  /** Starting spawn when entering the confined region for the first time. */
  defaultSpawn?: { x: number; y: number };
  lightTint: number;
  darkTint: number;
  /** Optional interact point (e.g. Moon Shrine crafting altar). */
  shrineInteract?: { x: number; y: number };
};
