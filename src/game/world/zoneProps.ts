import type { ZoneId } from "./zoneTypes";

export type PropKind =
  | "tree"
  | "fern"
  | "shrine-altar"
  | "standing-stone"
  | "hearth"
  | "cottage"
  | "gate";

export type ZoneProp = {
  x: number;
  y: number;
  kind: PropKind;
};

export const ZONE_PROPS: Partial<Record<ZoneId, ZoneProp[]>> = {
  grove: [
    { x: 2, y: 3, kind: "tree" },
    { x: 7, y: 2, kind: "tree" },
    { x: 4, y: 6, kind: "fern" },
    { x: 7, y: 7, kind: "tree" },
    { x: 3, y: 5, kind: "fern" },
    { x: 6, y: 4, kind: "standing-stone" },
  ],
  shrine: [
    { x: 5, y: 5, kind: "shrine-altar" },
    { x: 3, y: 3, kind: "standing-stone" },
    { x: 7, y: 3, kind: "standing-stone" },
    { x: 4, y: 7, kind: "standing-stone" },
  ],
  village: [
    { x: 2, y: 3, kind: "cottage" },
    { x: 4, y: 4, kind: "hearth" },
    { x: 7, y: 6, kind: "hearth" },
    { x: 5, y: 0, kind: "gate" },
  ],
  overworld: [
    { x: 4, y: 5, kind: "tree" },
    { x: 10, y: 8, kind: "tree" },
    { x: 7, y: 11, kind: "fern" },
  ],
};

export function getZoneProps(zoneId: ZoneId): ZoneProp[] {
  return ZONE_PROPS[zoneId] ?? [];
}

export function propTextureKey(kind: PropKind, gateOpen = true): string {
  if (kind === "gate") {
    return gateOpen ? "prop-gate" : "prop-gate-locked";
  }
  return `prop-${kind}`;
}
