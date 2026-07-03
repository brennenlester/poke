import type { QuestDefinition, QuestId } from "./questTypes";

export const QUEST_ORDER: QuestId[] = [
  "grove-arrival",
  "first-befriend",
  "first-spar",
  "reach-village",
  "shrine-craft",
];

export const QUESTS: Record<QuestId, QuestDefinition> = {
  "grove-arrival": {
    id: "grove-arrival",
    title: "Arrive in Whisper Grove",
    objective: { type: "enter_zone", zoneId: "grove" },
  },
  "first-befriend": {
    id: "first-befriend",
    title: "Befriend a wild creature",
    objective: { type: "befriend_creature" },
  },
  "first-spar": {
    id: "first-spar",
    title: "Win a training spar",
    objective: { type: "win_spar" },
    unlocksOverworld: true,
  },
  "reach-village": {
    id: "reach-village",
    title: "Reach Hearth Crossing",
    objective: { type: "enter_zone", zoneId: "village" },
  },
  "shrine-craft": {
    id: "shrine-craft",
    title: "Craft a relic at Moon Shrine",
    objective: { type: "craft_item" },
  },
};
