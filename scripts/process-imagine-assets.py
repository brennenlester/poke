#!/usr/bin/env python3
"""Chroma-key Imagine PNGs into public/assets for Phaser."""
from pathlib import Path
from PIL import Image

SRC = Path.home() / ".cursor/projects/Users-brennen-dev-poke/assets"
DST = Path(__file__).resolve().parents[1] / "public" / "assets"
KEYS = [(200, 200, 200), (255, 255, 255), (240, 240, 240), (232, 232, 232), (210, 210, 210)]


def near_key(px, tol=38):
    r, g, b, a = px
    if a < 8:
        return True
    for kr, kg, kb in KEYS:
        if abs(r - kr) <= tol and abs(g - kg) <= tol and abs(b - kb) <= tol:
            if max(r, g, b) - min(r, g, b) <= 18:
                return True
    return False


SCALE = 4


def process(src_name, dest_rel, max_w, max_h, pad=4):
    im = Image.open(SRC / src_name).convert("RGBA")
    pixels = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            if near_key(pixels[x, y]):
                pixels[x, y] = (0, 0, 0, 0)
    bbox = im.getbbox()
    if not bbox:
        print("EMPTY", src_name)
        return
    im = im.crop(bbox)
    padded = Image.new("RGBA", (im.width + pad * 2, im.height + pad * 2), (0, 0, 0, 0))
    padded.paste(im, (pad, pad))
    padded.thumbnail((max_w, max_h), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (max_w, max_h), (0, 0, 0, 0))
    ox = (max_w - padded.width) // 2
    oy = max_h - padded.height
    canvas.paste(padded, (ox, oy), padded)
    out = DST / dest_rel
    out.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(out, optimize=True)
    print(f"ok {dest_rel}")


def strip_extra_vs_reference(ref: Image.Image, posed: Image.Image) -> Image.Image:
    """Clear posed pixels that are empty on ref (e.g. staff that appears only on walk2)."""
    ref_px = ref.convert("RGBA").load()
    out = posed.convert("RGBA").copy()
    out_px = out.load()
    w, h = out.size
    for y in range(h):
        for x in range(w):
            if ref_px[x, y][3] < 8 and out_px[x, y][3] > 8:
                out_px[x, y] = (0, 0, 0, 0)
    return out


def main():
    for facing in ["south", "north", "east", "west"]:
        # Style D walk1 is canonical idle + stride frame 1 (outfit-matched).
        process(
            f"player-{facing}-walk1.png",
            f"player/player-{facing}-0.png",
            48 * SCALE,
            64 * SCALE,
        )
        process(
            f"player-{facing}-walk1.png",
            f"player/player-{facing}-1.png",
            48 * SCALE,
            64 * SCALE,
        )

    # Stride frame 2 — prefer readable limb change without different-trainer flash.
    player = DST / "player"

    # South: hflip walk1 (opposite contact, same outfit).
    Image.open(player / "player-south-1.png").convert("RGBA").transpose(
        Image.Transpose.FLIP_LEFT_RIGHT
    ).save(player / "player-south-2.png", optimize=True)
    print("ok player/player-south-2.png (hflip walk1)")

    # North: Imagine walk2 with staff/extras stripped against walk1.
    process(
        "player-north-walk2.png",
        "player/player-north-2.png",
        48 * SCALE,
        64 * SCALE,
    )
    north1 = Image.open(player / "player-north-1.png").convert("RGBA")
    north2 = Image.open(player / "player-north-2.png").convert("RGBA")
    strip_extra_vs_reference(north1, north2).save(
        player / "player-north-2.png",
        optimize=True,
    )
    print("ok player/player-north-2.png (walk2 staff-stripped)")

    # West: Imagine walk2 (outfit-matched side stride).
    process(
        "player-west-walk2.png",
        "player/player-west-2.png",
        48 * SCALE,
        64 * SCALE,
    )

    # East: mirror west walk cycle so right-facing has real limb motion.
    for frame in (0, 1, 2):
        src = Image.open(player / f"player-west-{frame}.png").convert("RGBA")
        src.transpose(Image.Transpose.FLIP_LEFT_RIGHT).save(
            player / f"player-east-{frame}.png",
            optimize=True,
        )
        print(f"ok player/player-east-{frame}.png (hflip west-{frame})")

    for c in [
        "mossling", "ember-wisp", "brook-nymph", "stone-hound", "mist-serpent",
        "rootwalker", "lantern-fox", "thunder-finch", "bramblewarden", "hearthflame",
    ]:
        process(
            f"creature-{c}.png",
            f"creatures/creature-{c}.png",
            48 * SCALE,
            52 * SCALE,
        )
    for name, size in {
        "prop-tree.png": (48, 50),
        "prop-fern.png": (40, 32),
        "prop-shrine-altar.png": (48, 40),
        "prop-standing-stone.png": (42, 38),
        "prop-pebble-pile.png": (44, 32),
        "prop-hearth.png": (48, 40),
        "prop-cottage.png": (48, 44),
        "prop-gate.png": (48, 42),
        "prop-gate-locked.png": (48, 42),
    }.items():
        process(name, f"world/{name}", size[0] * SCALE, size[1] * SCALE)
    print("DONE")


if __name__ == "__main__":
    main()
