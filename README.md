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

Open the dev server in a browser. You should see an isometric tile grid with a placeholder player. Move with **arrow keys** or **WASD**.

## Project structure

- `src/game/` — Phaser 3 game bootstrap and scenes
- `src/game/isometric.ts` — isometric grid ↔ screen coordinate helpers
- `AGENTS.md` — agent workflow conventions

## License

Private project.
