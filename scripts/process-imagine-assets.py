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

    # Stride frame 2: Imagine walk2 sheets drift outfit/props, so lock to walk1.
    # Front/back: horizontal flip gives opposite contact with same outfit.
    # East: duplicate walk1 (side flip would reverse facing; art follow-up later).
    # West: Imagine walk2 is outfit-matched enough to use as the second pose.
    from PIL import Image as _Image

    player = DST / "player"
    for facing in ("south", "north"):
        im = _Image.open(player / f"player-{facing}-1.png").convert("RGBA")
        im.transpose(_Image.Transpose.FLIP_LEFT_RIGHT).save(
            player / f"player-{facing}-2.png",
            optimize=True,
        )
        print(f"ok player/player-{facing}-2.png (hflip walk1)")

    _Image.open(player / "player-east-1.png").convert("RGBA").save(
        player / "player-east-2.png",
        optimize=True,
    )
    print("ok player/player-east-2.png (copy walk1; side art follow-up)")

    process(
        "player-west-walk2.png",
        "player/player-west-2.png",
        48 * SCALE,
        64 * SCALE,
    )
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
