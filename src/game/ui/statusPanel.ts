import { getPartySummary } from "../creatures/party";
import { getInventorySummary } from "../inventory/playerInventory";
import { worldState } from "../world/worldState";
import type { ZoneDefinition } from "../world/zoneTypes";

function gateStatusText(): string {
  return worldState.overworldUnlocked
    ? "Overworld gate: OPEN (dev U toggles)"
    : "Overworld gate: LOCKED (press U to unlock)";
}

export function updateStatusPanel(zone: ZoneDefinition): void {
  const zoneEl = document.getElementById("status-zone");
  const gateEl = document.getElementById("status-gate");
  const partyEl = document.getElementById("status-party");
  const materialsEl = document.getElementById("status-materials");

  if (zoneEl) {
    zoneEl.textContent = zone.name;
  }
  if (gateEl) {
    gateEl.textContent = gateStatusText();
  }
  if (partyEl) {
    partyEl.textContent = getPartySummary();
  }
  if (materialsEl) {
    materialsEl.textContent = getInventorySummary();
  }
}

export function measureStatusPanelHeight(): number {
  const panel = document.getElementById("status-panel");
  return panel?.offsetHeight ?? 96;
}
