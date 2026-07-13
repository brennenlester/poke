import { beforeEach, describe, expect, it } from "vitest";
import { setVisitorMode } from "../world/worldSession";
import { setOverworldUnlocked, worldState } from "../world/worldState";
import {
  getActiveQuestId,
  initQuestProgress,
  questProgress,
  recordQuestEvent,
  restoreQuestProgress,
} from "./questProgress";
import { QUEST_ORDER } from "./quests";
import type { QuestId, QuestStatus } from "./questTypes";

function lockedProgress(): Record<QuestId, QuestStatus> {
  return Object.fromEntries(
    QUEST_ORDER.map((id) => [id, "locked" as const]),
  ) as Record<QuestId, QuestStatus>;
}

describe("recordQuestEvent", () => {
  beforeEach(() => {
    setVisitorMode(false);
    setOverworldUnlocked(false);
    restoreQuestProgress(lockedProgress());
    initQuestProgress();
  });

  it("advances first-befriend then activates first-spar", () => {
    expect(getActiveQuestId()).toBe("first-befriend");
    expect(recordQuestEvent({ type: "befriend_creature" })).toBe(true);
    expect(questProgress["first-befriend"]).toBe("complete");
    expect(questProgress["first-spar"]).toBe("active");
    expect(getActiveQuestId()).toBe("first-spar");
  });

  it("unlocks overworld when first-spar completes", () => {
    restoreQuestProgress({
      ...lockedProgress(),
      "first-befriend": "complete",
      "first-spar": "active",
    });
    expect(recordQuestEvent({ type: "win_spar" })).toBe(true);
    expect(questProgress["first-spar"]).toBe("complete");
    expect(worldState.overworldUnlocked).toBe(true);
    expect(getActiveQuestId()).toBe("reach-village");
  });

  it("ignores mismatched objectives", () => {
    expect(recordQuestEvent({ type: "win_spar" })).toBe(false);
    expect(questProgress["first-befriend"]).toBe("active");
  });

  it("blocks progression while visiting", () => {
    setVisitorMode(true);
    expect(recordQuestEvent({ type: "befriend_creature" })).toBe(false);
    expect(questProgress["first-befriend"]).toBe("active");
  });
});
