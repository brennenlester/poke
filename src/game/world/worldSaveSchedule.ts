const SAVE_DEBOUNCE_MS = 400;

let persistSuspended = false;
let saveTimer: ReturnType<typeof setTimeout> | null = null;
let persistHandler: (() => void) | null = null;

export function registerWorldPersistHandler(handler: () => void): void {
  persistHandler = handler;
}

export function suspendHostPersist(): void {
  persistSuspended = true;
}

export function resumeHostPersist(): void {
  persistSuspended = false;
}

export function scheduleHostSave(): void {
  if (persistSuspended || !persistHandler) {
    return;
  }
  if (saveTimer) {
    clearTimeout(saveTimer);
  }
  saveTimer = setTimeout(() => {
    saveTimer = null;
    persistHandler?.();
  }, SAVE_DEBOUNCE_MS);
}

export function notifyWorldChanged(): void {
  scheduleHostSave();
}

export function isHostPersistSuspended(): boolean {
  return persistSuspended;
}
