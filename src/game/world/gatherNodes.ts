import type { PropKind } from "./zoneProps";
import { getZoneProps } from "./zoneProps";
import type { ZoneId } from "./zoneTypes";

export type GatherAction = {
  materialId: string;
  prompt: string;
  cooldownMs: number;
};

export const GATHERABLE_PROPS: Partial<Record<PropKind, GatherAction>> = {
  tree: { materialId: "wood", prompt: "Chop tree", cooldownMs: 30_000 },
  "standing-stone": {
    materialId: "stone",
    prompt: "Mine stone",
    cooldownMs: 30_000,
  },
  fern: { materialId: "wild-fiber", prompt: "Gather fiber", cooldownMs: 30_000 },
  "pebble-pile": {
    materialId: "pebble",
    prompt: "Collect pebbles",
    cooldownMs: 30_000,
  },
};

export function gatherNodeKey(zoneId: ZoneId, x: number, y: number): string {
  return `${zoneId}:${x}:${y}`;
}

export function findGatherPropNearPlayer(
  zoneId: ZoneId,
  tileX: number,
  tileY: number,
): { x: number; y: number; kind: PropKind; action: GatherAction } | undefined {
  let best:
    | { x: number; y: number; kind: PropKind; action: GatherAction; dist: number }
    | undefined;

  for (const prop of getZoneProps(zoneId)) {
    const action = GATHERABLE_PROPS[prop.kind];
    if (!action) {
      continue;
    }
    const dist = Math.max(Math.abs(prop.x - tileX), Math.abs(prop.y - tileY));
    if (dist > 1) {
      continue;
    }
    if (!best || dist < best.dist) {
      best = { ...prop, action, dist };
    }
  }

  if (!best) {
    return undefined;
  }
  return { x: best.x, y: best.y, kind: best.kind, action: best.action };
}
