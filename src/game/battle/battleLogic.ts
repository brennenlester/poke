import type { BattleCombatant, MoveDefinition } from "../creatures/types";

export function calcDamage(
  attacker: BattleCombatant,
  move: MoveDefinition,
  defender: BattleCombatant,
): number {
  return Math.max(1, move.power + attacker.attack - defender.defense);
}

export function applyDamage(target: BattleCombatant, amount: number): void {
  target.currentHp = Math.max(0, target.currentHp - amount);
}

export function pickRandomMove(combatant: BattleCombatant): MoveDefinition {
  const index = Math.floor(Math.random() * combatant.moves.length);
  return combatant.moves[index];
}

export function isFainted(combatant: BattleCombatant): boolean {
  return combatant.currentHp <= 0;
}
