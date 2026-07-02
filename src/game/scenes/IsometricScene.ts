import Phaser from "phaser";
import {
  TILE_HEIGHT,
  TILE_WIDTH,
  depthForGridCell,
  gridToScreen,
} from "../isometric";
import {
  ensureWorldTextures,
  getFloorTextureKey,
  WALL_RISE,
} from "../render/worldTextures";
import { getPartySummary } from "../creatures/party";
import { getInventorySummary } from "../inventory/playerInventory";
import { rollWildCreature } from "../encounters/tables";
import { canOccupy } from "../world/collision";
import {
  STARTING_ZONE_ID,
  getZone,
} from "../world/zones";
import { toggleOverworldUnlock, worldState } from "../world/worldState";
import { TileType, type ZoneDefinition, type ZoneId } from "../world/zoneTypes";
import {
  getZoneProps,
  propTextureKey,
} from "../world/zoneProps";

const FLOOR_LAYER = 0;
const PLAYER_LAYER = 0.5;
const MOVE_SPEED = 6;
const ENCOUNTER_TRAVEL_THRESHOLD = 0.75;
const ENCOUNTER_CHANCE = 0.10;

type Facing = "south" | "north" | "east" | "west";

export class IsometricScene extends Phaser.Scene {
  private currentZoneId: ZoneId = STARTING_ZONE_ID;
  private playerGridX = 3;
  private playerGridY = 7;
  private playerFacing: Facing = "south";
  private player!: Phaser.GameObjects.Image;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  private unlockKey!: Phaser.Input.Keyboard.Key;
  private interactKey!: Phaser.Input.Keyboard.Key;
  private travelSinceEncounter = 0;
  private inEncounter = false;
  private inShrine = false;
  private shrinePrompt?: Phaser.GameObjects.Text;
  private worldOrigin = { x: 0, y: 0 };

  constructor() {
    super({ key: "IsometricScene" });
  }

  create(): void {
    const startZone = getZone(STARTING_ZONE_ID);
    if (startZone.defaultSpawn) {
      this.playerGridX = startZone.defaultSpawn.x;
      this.playerGridY = startZone.defaultSpawn.y;
    }

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys("W,A,S,D") as typeof this.wasd;
    this.unlockKey = this.input.keyboard!.addKey("U");
    this.interactKey = this.input.keyboard!.addKey("E");

    this.loadZone(this.currentZoneId);

    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);

    this.events.on("resume", () => {
      this.inEncounter = false;
      this.inShrine = false;
      this.travelSinceEncounter = 0;
      const zoneId = this.currentZoneId;
      const x = this.playerGridX;
      const y = this.playerGridY;
      this.loadZone(zoneId);
      this.playerGridX = x;
      this.playerGridY = y;
      this.syncPlayerToGrid();
      this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    });

    this.scale.on("resize", () => this.onResize());
  }

  update(_time: number, delta: number): void {
    if (this.inEncounter || this.inShrine) {
      return;
    }
    if (Phaser.Input.Keyboard.JustDown(this.unlockKey)) {
      toggleOverworldUnlock();
      this.loadZone(this.currentZoneId);
    }

    if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      this.tryShrineInteract();
    }

    this.updateShrinePrompt();

    let dx = 0;
    let dy = 0;

    if (this.cursors.left.isDown || this.wasd.A.isDown) {
      dx -= 1;
    }
    if (this.cursors.right.isDown || this.wasd.D.isDown) {
      dx += 1;
    }
    if (this.cursors.up.isDown || this.wasd.W.isDown) {
      dy -= 1;
    }
    if (this.cursors.down.isDown || this.wasd.S.isDown) {
      dy += 1;
    }

    if (dx === 0 && dy === 0) {
      return;
    }

    this.updateFacing(dx, dy);

    const length = Math.hypot(dx, dy);
    dx /= length;
    dy /= length;

    const zone = getZone(this.currentZoneId);
    const step = MOVE_SPEED * (Math.min(delta, 50) / 1000);
    const nextX = this.playerGridX + dx * step;
    const nextY = this.playerGridY + dy * step;

    if (canOccupy(zone, nextX, nextY)) {
      this.playerGridX = nextX;
      this.playerGridY = nextY;
      this.syncPlayerToGrid();
      this.tryZoneTransition(zone);
      this.tryRandomEncounter(step);
    }
  }

  private updateFacing(dx: number, dy: number): void {
    let facing = this.playerFacing;
    if (Math.abs(dx) > Math.abs(dy)) {
      facing = dx > 0 ? "east" : "west";
    } else if (dy !== 0) {
      facing = dy > 0 ? "south" : "north";
    }
    if (facing !== this.playerFacing) {
      this.playerFacing = facing;
      this.player.setTexture(`player-${facing}`);
    }
  }

  private tryRandomEncounter(step: number): void {
    this.travelSinceEncounter += step;
    if (this.travelSinceEncounter < ENCOUNTER_TRAVEL_THRESHOLD) {
      return;
    }

    this.travelSinceEncounter = 0;
    if (Math.random() >= ENCOUNTER_CHANCE) {
      return;
    }

    const creatureId = rollWildCreature(this.currentZoneId);
    if (!creatureId) {
      return;
    }

    this.inEncounter = true;
    this.scene.pause();
    this.scene.launch("EncounterScene", { creatureId });
  }

  private tryZoneTransition(zone: ZoneDefinition): void {
    const tileX = Math.round(this.playerGridX);
    const tileY = Math.round(this.playerGridY);

    for (const transition of zone.transitions) {
      if (transition.x === tileX && transition.y === tileY) {
        if (
          transition.targetZone === "overworld" &&
          !worldState.overworldUnlocked
        ) {
          return;
        }
        this.loadZone(transition.targetZone);
        this.playerGridX = transition.targetX;
        this.playerGridY = transition.targetY;
        this.syncPlayerToGrid();
        return;
      }
    }
  }

  private loadZone(zoneId: ZoneId): void {
    this.currentZoneId = zoneId;
    const zone = getZone(zoneId);

    this.children.removeAll(true);
    this.shrinePrompt = undefined;

    ensureWorldTextures(this, zoneId);
    this.worldOrigin = this.getZoneWorldOrigin(zone);

    this.drawZoneTiles(zone);
    this.drawProps(zone);
    this.renderHud(zone);

    this.player = this.add
      .image(0, 0, `player-${this.playerFacing}`)
      .setOrigin(0.5, 1);
    this.syncPlayerToGrid();
    this.configureCamera(zone);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.updateShrinePrompt();
  }

  private getZoneWorldOrigin(zone: ZoneDefinition): { x: number; y: number } {
    return {
      x: zone.height * (TILE_WIDTH / 2),
      y: WALL_RISE + TILE_HEIGHT * 2,
    };
  }

  private configureCamera(zone: ZoneDefinition): void {
    const origin = this.worldOrigin;
    const corners = [
      gridToScreen(0, 0, origin.x, origin.y),
      gridToScreen(zone.width - 1, 0, origin.x, origin.y),
      gridToScreen(0, zone.height - 1, origin.x, origin.y),
      gridToScreen(
        zone.width - 1,
        zone.height - 1,
        origin.x,
        origin.y,
      ),
    ];

    const xs = corners.map((c) => c.x);
    const ys = corners.map((c) => c.y);
    const padding = 140;
    const minX = Math.min(...xs) - padding;
    const minY = Math.min(...ys) - WALL_RISE - padding;
    const maxX = Math.max(...xs) + TILE_WIDTH + padding;
    const maxY = Math.max(...ys) + TILE_HEIGHT + WALL_RISE + padding;
    const worldW = maxX - minX;
    const worldH = maxY - minY;

    this.cameras.main.setBounds(minX, minY, worldW, worldH);

    const zoomX = (this.scale.width * 0.94) / worldW;
    const zoomY = (this.scale.height * 0.9) / worldH;
    const zoom = Phaser.Math.Clamp(Math.min(zoomX, zoomY), 0.85, 2.8);
    this.cameras.main.setZoom(zoom);
  }

  private onResize(): void {
    const zone = getZone(this.currentZoneId);
    this.configureCamera(zone);
  }

  private drawZoneTiles(zone: ZoneDefinition): void {
    const origin = this.worldOrigin;
    const transitionSet = new Set(
      zone.transitions.map((t) => `${t.x},${t.y}`),
    );

    for (let y = 0; y < zone.height; y++) {
      for (let x = 0; x < zone.width; x++) {
        const tileType = zone.tiles[y][x];
        if (tileType === TileType.Wall) {
          continue;
        }

        const screen = gridToScreen(x, y, origin.x, origin.y);
        const isPath = transitionSet.has(`${x},${y}`);
        const textureKey = isPath
          ? "floor-path"
          : getFloorTextureKey(zone.id, (x + y) % 2 === 0);

        const tile = this.add
          .image(screen.x, screen.y, textureKey)
          .setOrigin(0.5, 0.5);

        if (tileType === TileType.OverworldGate && !isPath) {
          tile.setTint(
            worldState.overworldUnlocked ? 0xaaffaa : 0xffaaaa,
          );
          tile.setAlpha(0.85);
        }

        tile.setDepth(depthForGridCell(x, y, FLOOR_LAYER));
      }
    }

    this.drawWalls(zone, origin);
  }

  private drawWalls(
    zone: ZoneDefinition,
    origin: { x: number; y: number },
  ): void {
    for (let y = 0; y < zone.height; y++) {
      for (let x = 0; x < zone.width; x++) {
        if (zone.tiles[y][x] !== TileType.Wall) {
          continue;
        }

        const hasFloorNeighbor =
          (x > 0 && zone.tiles[y][x - 1] !== TileType.Wall) ||
          (x < zone.width - 1 && zone.tiles[y][x + 1] !== TileType.Wall) ||
          (y > 0 && zone.tiles[y - 1][x] !== TileType.Wall) ||
          (y < zone.height - 1 && zone.tiles[y + 1][x] !== TileType.Wall);

        if (!hasFloorNeighbor) {
          continue;
        }

        const screen = gridToScreen(x, y, origin.x, origin.y);
        const depth = depthForGridCell(x, y, FLOOR_LAYER);

        const top = this.add
          .image(screen.x, screen.y - WALL_RISE / 2, "hedge-top")
          .setOrigin(0.5, 0.5);
        top.setDepth(depth);

        const face = this.add
          .image(screen.x - TILE_WIDTH / 4, screen.y, "wall-face")
          .setOrigin(0.5, 1);
        face.setDepth(depth - 0.05);
      }
    }
  }

  private drawProps(zone: ZoneDefinition): void {
    const origin = this.worldOrigin;
    const gateOpen = worldState.overworldUnlocked;

    for (const prop of getZoneProps(zone.id)) {
      const screen = gridToScreen(prop.x, prop.y, origin.x, origin.y);
      const key = propTextureKey(
        prop.kind,
        prop.kind === "gate" ? gateOpen : true,
      );
      const propSprite = this.add
        .image(screen.x, screen.y - TILE_HEIGHT / 2 + 4, key)
        .setOrigin(0.5, 1);
      propSprite.setDepth(depthForGridCell(prop.x, prop.y, 0.45));
    }
  }

  private isOnShrineTile(): boolean {
    const zone = getZone(this.currentZoneId);
    if (!zone.shrineInteract) {
      return false;
    }
    const tileX = Math.round(this.playerGridX);
    const tileY = Math.round(this.playerGridY);
    return (
      tileX === zone.shrineInteract.x && tileY === zone.shrineInteract.y
    );
  }

  private updateShrinePrompt(): void {
    const show = this.isOnShrineTile();
    if (show && !this.shrinePrompt) {
      this.shrinePrompt = this.add
        .text(this.scale.width / 2, this.scale.height - 48, "Press E — Moon Shrine", {
          color: "#e8dff8",
          backgroundColor: "#2a2440cc",
          fontFamily: "system-ui, sans-serif",
          fontSize: "15px",
          padding: { x: 12, y: 6 },
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(10_001);
    } else if (!show && this.shrinePrompt) {
      this.shrinePrompt.destroy();
      this.shrinePrompt = undefined;
    }
  }

  private tryShrineInteract(): void {
    if (!this.isOnShrineTile()) {
      return;
    }
    this.inShrine = true;
    if (this.shrinePrompt) {
      this.shrinePrompt.destroy();
      this.shrinePrompt = undefined;
    }
    this.scene.pause();
    this.scene.launch("ShrineScene");
  }

  private syncPlayerToGrid(): void {
    const screen = gridToScreen(
      this.playerGridX,
      this.playerGridY,
      this.worldOrigin.x,
      this.worldOrigin.y,
    );

    this.player.setPosition(screen.x, screen.y - TILE_HEIGHT / 2 + 2);
    this.player.setDepth(
      depthForGridCell(this.playerGridX, this.playerGridY, PLAYER_LAYER),
    );
  }

  private renderHud(zone: ZoneDefinition): void {
    this.add
      .text(16, 16, zone.name, {
        color: "#f0e6d2",
        fontFamily: "system-ui, sans-serif",
        fontSize: "18px",
      })
      .setScrollFactor(0)
      .setDepth(10_000);

    this.add
      .text(
        16,
        42,
        worldState.overworldUnlocked
          ? "Overworld gate: OPEN (dev U toggles)"
          : "Overworld gate: LOCKED (press U to unlock)",
        {
          color: "#c8b8a0",
          fontFamily: "system-ui, sans-serif",
          fontSize: "14px",
        },
      )
      .setScrollFactor(0)
      .setDepth(10_000);

    this.add
      .text(16, 64, getPartySummary(), {
        color: "#d8e8c0",
        fontFamily: "system-ui, sans-serif",
        fontSize: "14px",
      })
      .setScrollFactor(0)
      .setDepth(10_000);

    this.add
      .text(16, 86, getInventorySummary(), {
        color: "#c8b8e8",
        fontFamily: "system-ui, sans-serif",
        fontSize: "13px",
      })
      .setScrollFactor(0)
      .setDepth(10_000);
  }
}
