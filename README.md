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

### World zones (dev)

The confined starting region has three zones — **Whisper Grove** → **Moon Shrine** → **Hearth Crossing** — connected by map exits. The **Folklore Overworld** north of Hearth Crossing is locked until the story gate opens.

- **U** — dev cheat: toggle overworld gate unlock (until BRE-12 quests wire the real flag)

## Project structure

- `src/game/` — Phaser 3 game bootstrap and scenes
- `src/game/isometric.ts` — isometric grid ↔ screen coordinate helpers
- `src/game/world/` — zone maps, collision, `worldState.overworldUnlocked`
- `src/game/creatures/` — folklore creature catalog and party collection
- `src/game/encounters/` — zone encounter tables
- Walk in zones to trigger random encounters; choose **Befriend**, **Spar**, or **Flee**
- `AGENTS.md` — agent workflow conventions

## License

Private project.
