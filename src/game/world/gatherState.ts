import { addMaterial } from "../inventory/playerInventory";
import { getMaterialName } from "../inventory/materials";
import {
  gatherNodeKey,
  type GatherAction,
} from "./gatherNodes";
import type { ZoneId } from "./zoneTypes";

const lastHarvestAt = new Map<string, number>();

export function getGatherCooldownRemainingMs(
  zoneId: ZoneId,
  x: number,
  y: number,
  action: GatherAction,
  now = Date.now(),
): number {
  const key = gatherNodeKey(zoneId, x, y);
  const last = lastHarvestAt.get(key);
  if (last === undefined) {
    return 0;
  }
  return Math.max(0, action.cooldownMs - (now - last));
}

export function tryHarvestNode(
  zoneId: ZoneId,
  x: number,
  y: number,
  action: GatherAction,
): { ok: true; message: string } | { ok: false; message: string } {
  const remaining = getGatherCooldownRemainingMs(zoneId, x, y, action);
  if (remaining > 0) {
    const seconds = Math.ceil(remaining / 1000);
    return { ok: false, message: `Nothing to gather yet (${seconds}s).` };
  }

  addMaterial(action.materialId);
  lastHarvestAt.set(gatherNodeKey(zoneId, x, y), Date.now());
  const name = getMaterialName(action.materialId);
  return { ok: true, message: `+1 ${name}` };
}
