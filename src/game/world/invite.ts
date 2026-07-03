import { getHostLabel, isVisitorMode } from "./worldSession";
import type { WorldSnapshot } from "./worldSnapshot";
import { exportWorldSnapshot, isValidWorldSnapshot } from "./worldSnapshot";
import type { ZoneId } from "./zoneTypes";

function toBase64Url(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): string {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (padded.length % 4)) % 4;
  const base64 = padded + "=".repeat(padLength);
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function buildInviteUrl(
  zoneId: ZoneId,
  x: number,
  y: number,
): string {
  const snapshot = exportWorldSnapshot(
    { zoneId, x, y },
    getHostLabel(),
  );
  const encoded = toBase64Url(JSON.stringify(snapshot));
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  url.searchParams.set("join", encoded);
  return url.toString();
}

export function parseInviteFromUrl(): WorldSnapshot | null {
  const encoded = new URLSearchParams(window.location.search).get("join");
  if (!encoded) {
    return null;
  }

  try {
    const parsed = JSON.parse(fromBase64Url(encoded));
    if (!isValidWorldSnapshot(parsed)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function copyInviteLink(
  zoneId: ZoneId,
  x: number,
  y: number,
): Promise<string> {
  if (isVisitorMode()) {
    throw new Error("Visitors cannot create invite links");
  }

  const url = buildInviteUrl(zoneId, x, y);
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url);
  }
  return url;
}
