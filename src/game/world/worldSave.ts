import {
  applyWorldSnapshot,
  exportWorldSnapshot,
  isValidWorldSnapshot,
  type WorldSnapshot,
} from "./worldSnapshot";
import { isVisitorMode } from "./worldSession";
import {
  registerWorldPersistHandler,
  resumeHostPersist,
  scheduleHostSave,
  suspendHostPersist,
  isHostPersistSuspended,
} from "./worldSaveSchedule";
import { STARTING_ZONE_ID } from "./zones";
import type { ZoneId } from "./zoneTypes";

const STORAGE_KEY = "poke-save-v1";

let hostPosition: WorldSnapshot["position"] = {
  zoneId: STARTING_ZONE_ID,
  x: 3,
  y: 7,
};

export function updateHostPosition(zoneId: ZoneId, x: number, y: number): void {
  hostPosition = { zoneId, x, y };
  scheduleHostSave();
}

export function persistHostSave(): void {
  if (isVisitorMode() || isHostPersistSuspended()) {
    return;
  }
  try {
    const snapshot = exportWorldSnapshot(hostPosition);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // ponytail: ignore quota/private-mode failures
  }
}

registerWorldPersistHandler(persistHostSave);

export function clearHostSave(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** Clear host save and reload a fresh game (same as ?new=1). */
export function resetHostGame(): void {
  clearHostSave();
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  window.location.assign(url.toString());
}

export function loadHostSave(): WorldSnapshot | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!isValidWorldSnapshot(parsed)) {
      clearHostSave();
      return null;
    }
    return parsed;
  } catch {
    clearHostSave();
    return null;
  }
}

export function restoreHostSave(snapshot: WorldSnapshot): void {
  suspendHostPersist();
  applyWorldSnapshot(snapshot);
  hostPosition = { ...snapshot.position };
  resumeHostPersist();
}

export {
  notifyWorldChanged,
  resumeHostPersist,
  suspendHostPersist,
} from "./worldSaveSchedule";
