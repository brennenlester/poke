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
  if (snapshot.version !== 1) {
    throw new Error("Unsupported world snapshot version");
  }

  setOverworldUnlocked(snapshot.overworldUnlocked);
  restoreQuestProgress(snapshot.questProgress);
  setPartyFromSnapshot(snapshot.party, snapshot.nextInstanceId);
  setInventoryFromSnapshot(snapshot.materials, snapshot.items);
  pendingPosition = snapshot.position;
}
