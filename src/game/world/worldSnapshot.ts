import {
  getNextInstanceId,
  playerParty,
  setPartyFromSnapshot,
} from "../creatures/party";
import type { CreatureInstance } from "../creatures/types";
import {
  playerInventory,
  setInventoryFromSnapshot,
} from "../inventory/playerInventory";
import { restoreQuestProgress, questProgress } from "../story/questProgress";
import type { QuestId, QuestStatus } from "../story/questTypes";
import { setOverworldUnlocked, worldState } from "./worldState";
import type { ZoneId } from "./zoneTypes";
import { ZONES } from "./zones";
import { CREATURES } from "../creatures/catalog";

export type WorldSnapshot = {
  version: 1;
  hostLabel: string;
  overworldUnlocked: boolean;
  questProgress: Record<QuestId, QuestStatus>;
  party: CreatureInstance[];
  nextInstanceId: number;
  materials: Record<string, number>;
  items: Record<string, number>;
  position: {
    zoneId: ZoneId;
    x: number;
    y: number;
  };
};

export type PendingWorldPosition = WorldSnapshot["position"];

const VALID_ZONE_IDS = new Set<ZoneId>(Object.keys(ZONES) as ZoneId[]);
const VALID_CREATURE_IDS = new Set(CREATURES.map((c) => c.id));

export function isValidWorldSnapshot(value: unknown): value is WorldSnapshot {
  if (typeof value !== "object" || value === null) return false;
  const s = value as Record<string, unknown>;
  if (s.version !== 1) return false;
  if (typeof s.hostLabel !== "string") return false;
  const pos = s.position as Record<string, unknown> | undefined;
  if (!pos || typeof pos.zoneId !== "string" || !VALID_ZONE_IDS.has(pos.zoneId as ZoneId)) return false;
  if (typeof pos.x !== "number" || !Number.isFinite(pos.x)) return false;
  if (typeof pos.y !== "number" || !Number.isFinite(pos.y)) return false;
  if (!Array.isArray(s.party)) return false;
  for (const p of s.party) {
    if (typeof p !== "object" || p === null) return false;
    const defId = (p as Record<string, unknown>).definitionId;
    if (typeof defId !== "string" || !VALID_CREATURE_IDS.has(defId)) return false;
  }
  if (typeof s.nextInstanceId !== "number" || !Number.isFinite(s.nextInstanceId)) return false;
  if (typeof s.overworldUnlocked !== "boolean") return false;
  if (typeof s.questProgress !== "object" || s.questProgress === null) return false;
  if (typeof s.materials !== "object" || s.materials === null) return false;
  if (typeof s.items !== "object" || s.items === null) return false;
  return true;
}

let pendingPosition: PendingWorldPosition | null = null;

export function takePendingWorldPosition(): PendingWorldPosition | null {
  const position = pendingPosition;
  pendingPosition = null;
  return position;
}

export function exportWorldSnapshot(
  position: PendingWorldPosition,
  hostLabel = "Your world",
): WorldSnapshot {
  return {
    version: 1,
    hostLabel,
    overworldUnlocked: worldState.overworldUnlocked,
    questProgress: { ...questProgress },
    party: structuredClone(playerParty.creatures),
    nextInstanceId: getNextInstanceId(),
    materials: { ...playerInventory.materials },
    items: { ...playerInventory.items },
    position,
  };
}

export function applyWorldSnapshot(snapshot: WorldSnapshot): void {
  if (!isValidWorldSnapshot(snapshot)) {
    throw new Error("Invalid world snapshot schema");
  }

  setOverworldUnlocked(snapshot.overworldUnlocked);
  restoreQuestProgress(snapshot.questProgress);
  setPartyFromSnapshot(snapshot.party, snapshot.nextInstanceId);
  setInventoryFromSnapshot(snapshot.materials, snapshot.items);
  pendingPosition = snapshot.position;
}
