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
    hint: "Walk around Whisper Grove to get your bearings.",
    objective: { type: "enter_zone", zoneId: "grove" },
  },
  "first-befriend": {
    id: "first-befriend",
    title: "Befriend a wild creature",
    hint: "Walk in a zone until a wild creature appears, then choose Befriend.",
    objective: { type: "befriend_creature" },
  },
  "first-spar": {
    id: "first-spar",
    title: "Win a training spar",
    hint: "Trigger an encounter, choose Spar, and win — this opens the overworld gate.",
    objective: { type: "win_spar" },
    unlocksOverworld: true,
  },
  "reach-village": {
    id: "reach-village",
    title: "Reach Hearth Crossing",
    hint: "Follow the paths through Moon Shrine to Hearth Crossing.",
    objective: { type: "enter_zone", zoneId: "village" },
  },
  "shrine-craft": {
    id: "shrine-craft",
    title: "Craft a relic at Moon Shrine",
    hint: "Stand on the moon altar and press E, then craft any relic in the shrine.",
    objective: { type: "craft_item" },
  },
};
