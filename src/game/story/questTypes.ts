import type { ZoneId } from "../world/zoneTypes";

export type QuestId =
  | "first-befriend"
  | "first-spar"
  | "reach-village"
  | "shrine-craft";

export type QuestStatus = "locked" | "active" | "complete";

export type QuestObjective =
  | { type: "enter_zone"; zoneId: ZoneId }
  | { type: "befriend_creature" }
  | { type: "win_spar" }
  | { type: "craft_item" };

export type QuestDefinition = {
  id: QuestId;
  title: string;
  hint: string;
  objective: QuestObjective;
  unlocksOverworld?: boolean;
};

export type QuestEvent =
  | { type: "enter_zone"; zoneId: ZoneId }
  | { type: "befriend_creature" }
  | { type: "win_spar" }
  | { type: "craft_item" };
