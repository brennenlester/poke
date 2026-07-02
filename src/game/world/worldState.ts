/** Story progression flags — BRE-12 will wire quest completion here. */
export const worldState = {
  overworldUnlocked: false,
};

export function setOverworldUnlocked(unlocked: boolean): void {
  worldState.overworldUnlocked = unlocked;
}

/** Dev cheat until BRE-12 quest hook exists. */
export function toggleOverworldUnlock(): boolean {
  worldState.overworldUnlocked = !worldState.overworldUnlocked;
  return worldState.overworldUnlocked;
}
