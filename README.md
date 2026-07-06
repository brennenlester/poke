# Poke

Browser-based sandbox creature-collecting RPG with folklore-inspired creatures and 2.5D isometric exploration.

## Development setup

**Requirements:** Node.js 20+ and npm.

```bash
# Install dependencies
npm install

# Start dev server (default http://localhost:5173)
npm run dev

# Production build (output in dist/)
npm run build

# Preview production build locally
npm run preview
```

Open the dev server in a browser. You should see an isometric tile grid with a placeholder player. Move with **arrow keys** or **WASD** (hold for continuous movement).

At **Moon Shrine**, stand on the moon altar and press **E** to open the shrine UI. The world uses a **rotated square board** (ALttP-style 2.5D) with a camera that follows your character.

### World zones (dev)

The confined starting region has three zones — **Whisper Grove** → **Moon Shrine** → **Hearth Crossing** — connected by map exits. The **Folklore Overworld** north of Hearth Crossing is locked until you complete **Story 3/5** (win a training spar).

### Story quests

Five guided beats appear in the HUD (`Story N/5: …`). Progress persists across refresh for host sessions:

1. Arrive in Whisper Grove (automatic on start)
2. Befriend a wild creature
3. Win a training spar — **opens the overworld gate**
4. Reach Hearth Crossing
5. Craft a relic at Moon Shrine

Gate status is shown as `Overworld gate: LOCKED (Story 3/5)` until quest 3 completes.

### Friend invites

As host, press **I** to copy an invite link. The URL encodes a snapshot of your world (party, inventory, quests, position). Open that link in another browser tab to join as a **visitor** — read-only exploration of the host's world (no encounters, crafting, or quest progress).

### Save and resume

Host progress (party, inventory, quests, position, gate) persists in `localStorage` across refresh. Append `?new=1` to start a fresh game and clear the saved host state. Visitor `?join=` links always take precedence over local save.

- **U** — dev-only cheat: toggle overworld gate (local development)

## Project structure

- `src/game/` — Phaser 3 game bootstrap and scenes
- `src/game/isometric.ts` — isometric grid ↔ screen coordinate helpers
- `src/game/story/` — quest definitions and progress tracking
- `src/game/world/` — zone maps, collision, `worldState.overworldUnlocked`, invite snapshots
- `src/game/creatures/` — folklore creature catalog and party collection
- `src/game/inventory/` — spar-win materials and crafted items
- `src/game/crafting/` — shrine craft recipes
- `src/game/shrine/` — fusion effect matrix and Moon Shrine logic
- `src/game/progression/` — creature XP and leveling from spar wins
- `src/game/encounters/` — zone encounter tables
- Walk in zones to trigger random encounters; choose **Befriend**, **Spar**, or **Flee**
- Win spars to earn creature-specific materials, Folklore Dust, and XP
- `AGENTS.md` — agent workflow conventions

## License

Private project.
