import Phaser from "phaser";
import {
  TILE_HEIGHT,
  TILE_WIDTH,
  depthForGridCell,
  gridToScreen,
} from "../isometric";
import { getPartySummary } from "../creatures/party";
import { rollWildCreature } from "../encounters/tables";
import { canOccupy } from "../world/collision";
import {
  STARTING_ZONE_ID,
  getZone,
} from "../world/zones";
import { toggleOverworldUnlock, worldState } from "../world/worldState";
import { TileType, type ZoneDefinition, type ZoneId } from "../world/zoneTypes";

const FLOOR_LAYER = 0;
const PLAYER_LAYER = 0.5;
const MOVE_SPEED = 6;
const ENCOUNTER_TRAVEL_THRESHOLD = 0.45;
const ENCOUNTER_CHANCE = 0.38;
const GATE_LOCKED = 0x8b3a3a;
const GATE_OPEN = 0x4a9a5a;
const WALL_TINT = 0x3a3a4a;

export class IsometricScene extends Phaser.Scene {
  private currentZoneId: ZoneId = STARTING_ZONE_ID;
  private playerGridX = 3;
  private playerGridY = 7;
  private player!: Phaser.GameObjects.Image;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  private unlockKey!: Phaser.Input.Keyboard.Key;
  private travelSinceEncounter = 0;
  private inEncounter = false;

  constructor() {
    super({ key: "IsometricScene" });
  }

  create(): void {
    this.createPlaceholderTextures();

    const startZone = getZone(STARTING_ZONE_ID);
    if (startZone.defaultSpawn) {
      this.playerGridX = startZone.defaultSpawn.x;
      this.playerGridY = startZone.defaultSpawn.y;
    }

    this.loadZone(this.currentZoneId);

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys("W,A,S,D") as typeof this.wasd;
    this.unlockKey = this.input.keyboard!.addKey("U");

    this.events.on("resume", () => {
      this.inEncounter = false;
      this.travelSinceEncounter = 0;
      const zoneId = this.currentZoneId;
      const x = this.playerGridX;
      const y = this.playerGridY;
      this.loadZone(zoneId);
      this.playerGridX = x;
      this.playerGridY = y;
      this.syncPlayerToGrid();
    });

    this.scale.on("resize", () => this.repositionZone());
  }

  update(_time: number, delta: number): void {
    if (this.inEncounter) {
      return;
    }
    if (Phaser.Input.Keyboard.JustDown(this.unlockKey)) {
      toggleOverworldUnlock();
      this.loadZone(this.currentZoneId);
    }

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
    this.createPlaceholderTextures();
    this.drawZoneTiles(zone);
    this.renderHud(zone);

    this.player = this.add.image(0, 0, "player").setOrigin(0.5, 1);
    this.syncPlayerToGrid();
  }

  private createPlaceholderTextures(): void {
    if (this.textures.exists("iso-tile")) {
      return;
    }

    const tileGraphics = this.make.graphics({ x: 0, y: 0 });
    tileGraphics.fillStyle(0xffffff, 1);
    tileGraphics.beginPath();
    tileGraphics.moveTo(TILE_WIDTH / 2, 0);
    tileGraphics.lineTo(TILE_WIDTH, TILE_HEIGHT / 2);
    tileGraphics.lineTo(TILE_WIDTH / 2, TILE_HEIGHT);
    tileGraphics.lineTo(0, TILE_HEIGHT / 2);
    tileGraphics.closePath();
    tileGraphics.fillPath();
    tileGraphics.lineStyle(1, 0x8b6914, 0.35);
    tileGraphics.strokePath();
    tileGraphics.generateTexture("iso-tile", TILE_WIDTH, TILE_HEIGHT);
    tileGraphics.destroy();

    const playerGraphics = this.make.graphics({ x: 0, y: 0 });
    playerGraphics.fillStyle(0xe8a838, 1);
    playerGraphics.fillCircle(16, 20, 14);
    playerGraphics.fillStyle(0xf5d78e, 1);
    playerGraphics.fillCircle(16, 16, 10);
    playerGraphics.generateTexture("player", 32, 36);
    playerGraphics.destroy();
  }

  private drawZoneTiles(zone: ZoneDefinition): void {
    const origin = this.getGridOrigin(zone);

    for (let y = 0; y < zone.height; y++) {
      for (let x = 0; x < zone.width; x++) {
        const tileType = zone.tiles[y][x];
        if (tileType === TileType.Wall) {
          continue;
        }

        const screen = gridToScreen(x, y, origin.x, origin.y);
        const tile = this.add
          .image(screen.x, screen.y, "iso-tile")
          .setOrigin(0.5, 0.5);

        if (tileType === TileType.OverworldGate) {
          tile.setTint(
            worldState.overworldUnlocked ? GATE_OPEN : GATE_LOCKED,
          );
        } else {
          const isLight = (x + y) % 2 === 0;
          tile.setTint(isLight ? zone.lightTint : zone.darkTint);
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
        const wall = this.add
          .image(screen.x, screen.y, "iso-tile")
          .setOrigin(0.5, 0.5)
          .setTint(WALL_TINT)
          .setAlpha(0.9);
        wall.setDepth(depthForGridCell(x, y, FLOOR_LAYER));
      }
    }
  }

  private syncPlayerToGrid(): void {
    const zone = getZone(this.currentZoneId);
    const origin = this.getGridOrigin(zone);
    const screen = gridToScreen(
      this.playerGridX,
      this.playerGridY,
      origin.x,
      origin.y,
    );

    this.player.setPosition(screen.x, screen.y - TILE_HEIGHT / 2);
    this.player.setDepth(
      depthForGridCell(this.playerGridX, this.playerGridY, PLAYER_LAYER),
    );
  }

  private getGridOrigin(zone: ZoneDefinition): { x: number; y: number } {
    const center = gridToScreen(
      (zone.width - 1) / 2,
      (zone.height - 1) / 2,
      0,
      0,
    );

    return {
      x: this.scale.width / 2 - center.x,
      y: this.scale.height / 2 - center.y,
    };
  }

  private repositionZone(): void {
    const zone = getZone(this.currentZoneId);
    const savedX = this.playerGridX;
    const savedY = this.playerGridY;

    this.children.removeAll(true);
    this.drawZoneTiles(zone);
    this.renderHud(zone);

    this.playerGridX = savedX;
    this.playerGridY = savedY;
    this.player = this.add.image(0, 0, "player").setOrigin(0.5, 1);
    this.syncPlayerToGrid();
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
  }
}
