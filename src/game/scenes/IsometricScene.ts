import Phaser from "phaser";
import {
  TILE_HEIGHT,
  TILE_WIDTH,
  gridToScreen,
  isWithinGrid,
} from "../isometric";

const GRID_WIDTH = 12;
const GRID_HEIGHT = 12;
const MOVE_DURATION_MS = 120;

export class IsometricScene extends Phaser.Scene {
  private playerGridX = 6;
  private playerGridY = 6;
  private player!: Phaser.GameObjects.Image;
  private isMoving = false;
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

    const origin = this.getGridOrigin();
    const start = gridToScreen(
      this.playerGridX,
      this.playerGridY,
      origin.x,
      origin.y,
    );

    this.player = this.add
      .image(start.x, start.y - TILE_HEIGHT / 2, "player")
      .setOrigin(0.5, 1)
      .setDepth(1000);

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys("W,A,S,D") as typeof this.wasd;

    this.scale.on("resize", () => this.repositionGrid());
  }

  update(): void {
    if (this.isMoving) {
      return;
    }

    let dx = 0;
    let dy = 0;

    if (this.cursors.left.isDown || this.wasd.A.isDown) {
      dx = -1;
    } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
      dx = 1;
    } else if (this.cursors.up.isDown || this.wasd.W.isDown) {
      dy = -1;
    } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
      dy = 1;
    }

    if (dx === 0 && dy === 0) {
      return;
    }

    const nextX = this.playerGridX + dx;
    const nextY = this.playerGridY + dy;

    if (!isWithinGrid(nextX, nextY, GRID_WIDTH, GRID_HEIGHT)) {
      return;
    }

    this.movePlayerTo(nextX, nextY);
  }

  private createPlaceholderTextures(): void {
    const tileGraphics = this.make.graphics({ x: 0, y: 0 });
    tileGraphics.fillStyle(0x3d6b4f, 1);
    tileGraphics.beginPath();
    tileGraphics.moveTo(TILE_WIDTH / 2, 0);
    tileGraphics.lineTo(TILE_WIDTH, TILE_HEIGHT / 2);
    tileGraphics.lineTo(TILE_WIDTH / 2, TILE_HEIGHT);
    tileGraphics.lineTo(0, TILE_HEIGHT / 2);
    tileGraphics.closePath();
    tileGraphics.fillPath();
    tileGraphics.lineStyle(2, 0x2a4a38, 1);
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

        const checker = (x + y) % 2 === 0 ? 0xffffff : 0x000000;
        tile.setTint(checker);
        tile.setAlpha(checker === 0xffffff ? 1 : 0.85);
        tile.setDepth(x + y);
      }
    }
  }

  private movePlayerTo(gridX: number, gridY: number): void {
    this.isMoving = true;
    this.playerGridX = gridX;
    this.playerGridY = gridY;

    const origin = this.getGridOrigin();
    const target = gridToScreen(gridX, gridY, origin.x, origin.y);

    this.player.setDepth(gridX + gridY + 1000);

    this.tweens.add({
      targets: this.player,
      x: target.x,
      y: target.y - TILE_HEIGHT / 2,
      duration: MOVE_DURATION_MS,
      ease: "Linear",
      onComplete: () => {
        this.isMoving = false;
      },
    });
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

    const origin = this.getGridOrigin();
    const screen = gridToScreen(
      this.playerGridX,
      this.playerGridY,
      origin.x,
      origin.y,
    );

    this.player = this.add
      .image(screen.x, screen.y - TILE_HEIGHT / 2, "player")
      .setOrigin(0.5, 1)
      .setDepth(this.playerGridX + this.playerGridY + 1000);
  }
}
