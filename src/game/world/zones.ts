import { TileType, type ZoneDefinition, type ZoneId } from "./zoneTypes";

function borderedFloor(
  width: number,
  height: number,
  openings: { x: number; y: number }[],
): TileType[][] {
  const tiles: TileType[][] = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => TileType.Wall),
  );

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      tiles[y][x] = TileType.Floor;
    }
  }

  for (const { x, y } of openings) {
    tiles[y][x] = TileType.Floor;
  }

  return tiles;
}

const GROVE: ZoneDefinition = {
  id: "grove",
  name: "Whisper Grove",
  width: 10,
  height: 10,
  tiles: borderedFloor(10, 10, [{ x: 9, y: 5 }]),
  defaultSpawn: { x: 3, y: 7 },
  lightTint: 0xd8e8c0,
  darkTint: 0x7a9a5c,
  transitions: [{ x: 9, y: 5, targetZone: "shrine", targetX: 1, targetY: 5 }],
};

const SHRINE: ZoneDefinition = {
  id: "shrine",
  name: "Moon Shrine",
  width: 10,
  height: 10,
  tiles: borderedFloor(10, 10, [
    { x: 0, y: 5 },
    { x: 9, y: 5 },
  ]),
  lightTint: 0xe0d4f0,
  darkTint: 0x8a7aa8,
  shrineInteract: { x: 5, y: 5 },
  transitions: [
    { x: 0, y: 5, targetZone: "grove", targetX: 8, targetY: 5 },
    { x: 9, y: 5, targetZone: "village", targetX: 1, targetY: 5 },
  ],
};

const villageTiles = borderedFloor(10, 10, [
  { x: 0, y: 5 },
  { x: 5, y: 0 },
]);
villageTiles[0][5] = TileType.OverworldGate;

const VILLAGE: ZoneDefinition = {
  id: "village",
  name: "Hearth Crossing",
  width: 10,
  height: 10,
  tiles: villageTiles,
  lightTint: 0xf0d9b5,
  darkTint: 0xb58863,
  transitions: [
    { x: 0, y: 5, targetZone: "shrine", targetX: 8, targetY: 5 },
    { x: 5, y: 0, targetZone: "overworld", targetX: 7, targetY: 12 },
  ],
};

const OVERWORLD: ZoneDefinition = {
  id: "overworld",
  name: "Folklore Overworld",
  width: 15,
  height: 15,
  tiles: borderedFloor(15, 15, [{ x: 7, y: 14 }]),
  lightTint: 0xc8dce8,
  darkTint: 0x6a8aa0,
  transitions: [
    { x: 7, y: 14, targetZone: "village", targetX: 5, targetY: 1 },
  ],
};

export const ZONES: Record<ZoneId, ZoneDefinition> = {
  grove: GROVE,
  shrine: SHRINE,
  village: VILLAGE,
  overworld: OVERWORLD,
};

export const STARTING_ZONE_ID: ZoneId = "grove";

export function getZone(id: ZoneId): ZoneDefinition {
  return ZONES[id];
}
