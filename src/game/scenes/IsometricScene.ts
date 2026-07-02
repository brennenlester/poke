import Phaser from "phaser";
import {
  TILE_HEIGHT,
  TILE_WIDTH,
  depthForGridCell,
  gridToScreen,
} from "../isometric";

const FLOOR_LAYER = 0;
const PLAYER_LAYER = 0.5;

const GRID_WIDTH = 12;
const GRID_HEIGHT = 12;
const MOVE_SPEED = 6;

const CHESS_LIGHT = 0xf0d9b5;
const CHESS_DARK = 0xb58863;

export class IsometricScene extends Phaser.Scene {
  private playerGridX = 6;
  private playerGridY = 6;
  private player!: Phaser.GameObjects.Image;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };

  constructor() {
    super({ key: "IsometricScene" });
  }

  create(): void {
    this.createPlaceholderTextures();
    this.drawTileGrid();

    this.player = this.add.image(0, 0, "player").setOrigin(0.5, 1);
    this.syncPlayerToGrid();

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys("W,A,S,D") as typeof this.wasd;

    this.scale.on("resize", () => this.repositionGrid());
  }

  update(_time: number, delta: number): void {
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

    const step = MOVE_SPEED * (delta / 1000);
    this.playerGridX = Phaser.Math.Clamp(
      this.playerGridX + dx * step,
      0,
      GRID_WIDTH - 1,
    );
    this.playerGridY = Phaser.Math.Clamp(
      this.playerGridY + dy * step,
      0,
      GRID_HEIGHT - 1,
    );

    this.syncPlayerToGrid();
  }

  private createPlaceholderTextures(): void {
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

  private drawTileGrid(): void {
    const origin = this.getGridOrigin();

    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        const screen = gridToScreen(x, y, origin.x, origin.y);
        const tile = this.add
          .image(screen.x, screen.y, "iso-tile")
          .setOrigin(0.5, 0.5);

        const isLight = (x + y) % 2 === 0;
        tile.setTint(isLight ? CHESS_LIGHT : CHESS_DARK);
        tile.setDepth(depthForGridCell(x, y, FLOOR_LAYER));
      }
    }
  }

  private syncPlayerToGrid(): void {
    const origin = this.getGridOrigin();
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

  private getGridOrigin(): { x: number; y: number } {
    const center = gridToScreen(
      (GRID_WIDTH - 1) / 2,
      (GRID_HEIGHT - 1) / 2,
      0,
      0,
    );

    return {
      x: this.scale.width / 2 - center.x,
      y: this.scale.height / 2 - center.y,
    };
  }

  private repositionGrid(): void {
    this.children.removeAll(true);
    this.createPlaceholderTextures();
    this.drawTileGrid();

    this.player = this.add
      .image(0, 0, "player")
      .setOrigin(0.5, 1);

    this.syncPlayerToGrid();
  }
}
