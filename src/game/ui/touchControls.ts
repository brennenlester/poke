/** DOM virtual stick + interact for touch devices. */

export type TouchAxes = { x: number; y: number };

const DEADZONE = 0.22;

let axes: TouchAxes = { x: 0, y: 0 };
let interactQueued = false;
let bound = false;
let inputEnabled = true;

export function getTouchAxes(): TouchAxes {
  return axes;
}

/** One-shot interact press (same role as keyboard JustDown(E)). */
export function consumeTouchInteract(): boolean {
  if (!interactQueued) {
    return false;
  }
  interactQueued = false;
  return true;
}

export function setTouchControlsEnabled(enabled: boolean): void {
  inputEnabled = enabled;
  if (!enabled) {
    axes = { x: 0, y: 0 };
    interactQueued = false;
  }
  const root = document.getElementById("touch-controls");
  if (root) {
    root.classList.toggle("touch-controls-disabled", !enabled);
  }
}

function setAxesFromPointer(
  clientX: number,
  clientY: number,
  pad: DOMRect,
): void {
  const cx = pad.left + pad.width / 2;
  const cy = pad.top + pad.height / 2;
  const max = Math.min(pad.width, pad.height) / 2;
  let dx = (clientX - cx) / max;
  let dy = (clientY - cy) / max;
  const len = Math.hypot(dx, dy);
  if (len > 1) {
    dx /= len;
    dy /= len;
  }
  if (len < DEADZONE) {
    axes = { x: 0, y: 0 };
  } else {
    axes = { x: dx, y: dy };
  }
}

function clearAxes(): void {
  axes = { x: 0, y: 0 };
}

function placeKnob(knob: HTMLElement, pad: HTMLElement): void {
  const max = pad.clientWidth / 2 - knob.clientWidth / 2;
  knob.style.transform = `translate(${axes.x * max}px, ${axes.y * max}px)`;
}

/**
 * Bind once to #touch-controls. Safe to call when controls are absent (desktop).
 */
export function initTouchControls(): void {
  if (bound) {
    return;
  }
  const root = document.getElementById("touch-controls");
  const pad = document.getElementById("touch-stick-pad");
  const knob = document.getElementById("touch-stick-knob");
  const interact = document.getElementById("touch-interact");
  if (!root || !pad || !knob || !interact) {
    return;
  }
  bound = true;

  let activePointerId: number | null = null;

  const onPadDown = (event: PointerEvent): void => {
    if (!inputEnabled) {
      return;
    }
    event.preventDefault();
    activePointerId = event.pointerId;
    pad.setPointerCapture(event.pointerId);
    setAxesFromPointer(event.clientX, event.clientY, pad.getBoundingClientRect());
    placeKnob(knob, pad);
  };

  const onPadMove = (event: PointerEvent): void => {
    if (activePointerId !== event.pointerId) {
      return;
    }
    event.preventDefault();
    setAxesFromPointer(event.clientX, event.clientY, pad.getBoundingClientRect());
    placeKnob(knob, pad);
  };

  const onPadUp = (event: PointerEvent): void => {
    if (activePointerId !== event.pointerId) {
      return;
    }
    activePointerId = null;
    clearAxes();
    placeKnob(knob, pad);
  };

  pad.addEventListener("pointerdown", onPadDown);
  pad.addEventListener("pointermove", onPadMove);
  pad.addEventListener("pointerup", onPadUp);
  pad.addEventListener("pointercancel", onPadUp);

  interact.addEventListener("pointerdown", (event) => {
    if (!inputEnabled) {
      return;
    }
    event.preventDefault();
    interactQueued = true;
  });
}
