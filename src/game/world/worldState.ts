/** Story progression flags — quest completion updates overworld access. */
export const worldState = {
  overworldUnlocked: false,
};

export function setOverworldUnlocked(unlocked: boolean): void {
  worldState.overworldUnlocked = unlocked;
}

/** Dev-only gate toggle. */
export function toggleOverworldUnlock(): boolean {
  worldState.overworldUnlocked = !worldState.overworldUnlocked;
  return worldState.overworldUnlocked;
}
