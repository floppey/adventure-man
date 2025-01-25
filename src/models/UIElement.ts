import { Game } from "../Game";
import { Coordinates } from "../types/Coordinates";

export interface UIElementOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  game: Game;
  uiElementType?: UIElementType;
}

export interface DrawUIElementProps {
  ctx: CanvasRenderingContext2D;
}

type UIElementType =
  | "adventurer"
  | "monster"
  | "platform"
  | "powerup"
  | "projectile"
  | "ui"
  | "button"
  | "window"
  | "label"
  | "item"
  | "unknown";

export class UIElement {
  private id: number;
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  private angle: number = 0;
  private game: Game;
  private uiElementType: UIElementType;

  name: string;

  hitbox: {
    topLeft: Coordinates;
    topRight: Coordinates;
    bottomLeft: Coordinates;
    bottomRight: Coordinates;
  };

  constructor({
    x,
    y,
    width,
    height,
    name,
    game,
    uiElementType: type,
  }: UIElementOptions) {
    this.id = Math.floor(Math.random() * 1000000);
    this.game = game;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.name = name;
    this.uiElementType = type ?? "unknown";

    this.hitbox = {
      topLeft: { x: x, y: y },
      topRight: { x: x + width, y: y },
      bottomLeft: { x: x, y: y + height },
      bottomRight: { x: x + width, y: y + height },
    };

    this.recalculateHitbox();
  }

  get getGame() {
    return this.game;
  }

  set setGame(game: Game) {
    this.game = game;
  }

  get getAngle() {
    return this.angle;
  }

  set setAngle(angle: number) {
    this.angle = angle;
    this.recalculateHitbox();
  }

  get getXWithViewport() {
    return this.x - this.game.getViewportCoordinates.x;
  }

  get getYWithViewport() {
    return this.y - this.game.getViewportCoordinates.y;
  }

  getId() {
    return this.id;
  }

  getWidth() {
    return this.width;
  }

  setWidth(width: number) {
    this.width = width;
    this.recalculateHitbox();
  }

  getHeight() {
    return this.height;
  }

  recalculateHitbox() {
    // If angle is 0, hitbox is a rectangle
    if (this.angle === 0) {
      this.hitbox.topLeft.x = this.x;
      this.hitbox.topLeft.y = this.y;
      this.hitbox.topRight.x = this.x + this.width;
      this.hitbox.topRight.y = this.y;
      this.hitbox.bottomLeft.x = this.x;
      this.hitbox.bottomLeft.y = this.y + this.height;
      this.hitbox.bottomRight.x = this.x + this.width;
      this.hitbox.bottomRight.y = this.y + this.height;
    } else {
      // Recalculate hitbox based on position and angle
      const x = this.getX();
      const y = this.getY();
      const width = this.getWidth();
      const height = this.getHeight();
      const angle = this.angle;
      const xCenter = x + width / 2;
      const yCenter = y + height / 2;
      const xTopLeft = x;
      const yTopLeft = y;
      const xTopRight = x + width;
      const yTopRight = y;
      const xBottomLeft = x;
      const yBottomLeft = y + height;
      const xBottomRight = x + width;
      const yBottomRight = y + height;
      const xTopLeftRotated =
        Math.cos(angle) * (xTopLeft - xCenter) -
        Math.sin(angle) * (yTopLeft - yCenter) +
        xCenter;
      const yTopLeftRotated =
        Math.sin(angle) * (xTopLeft - xCenter) +
        Math.cos(angle) * (yTopLeft - yCenter) +
        yCenter;
      const xTopRightRotated =
        Math.cos(angle) * (xTopRight - xCenter) -
        Math.sin(angle) * (yTopRight - yCenter) +
        xCenter;
      const yTopRightRotated =
        Math.sin(angle) * (xTopRight - xCenter) +
        Math.cos(angle) * (yTopRight - yCenter) +
        yCenter;
      const xBottomLeftRotated =
        Math.cos(angle) * (xBottomLeft - xCenter) -
        Math.sin(angle) * (yBottomLeft - yCenter) +
        xCenter;
      const yBottomLeftRotated =
        Math.sin(angle) * (xBottomLeft - xCenter) +
        Math.cos(angle) * (yBottomLeft - yCenter) +
        yCenter;
      const xBottomRightRotated =
        Math.cos(angle) * (xBottomRight - xCenter) -
        Math.sin(angle) * (yBottomRight - yCenter) +
        xCenter;
      const yBottomRightRotated =
        Math.sin(angle) * (xBottomRight - xCenter) +
        Math.cos(angle) * (yBottomRight - yCenter) +
        yCenter;
      this.hitbox = {
        topLeft: { x: xTopLeftRotated, y: yTopLeftRotated },
        topRight: { x: xTopRightRotated, y: yTopRightRotated },
        bottomLeft: { x: xBottomLeftRotated, y: yBottomLeftRotated },
        bottomRight: { x: xBottomRightRotated, y: yBottomRightRotated },
      };
    }
  }

  setHeight(height: number) {
    this.height = height;
    this.recalculateHitbox();
  }

  getX() {
    return this.x;
  }

  setX(x: number) {
    this.x = x;
    this.recalculateHitbox();
  }

  getY() {
    return this.y;
  }

  setY(y: number) {
    this.y = y;
    this.recalculateHitbox();
  }

  isClicked(x: number, y: number) {
    return (
      x > this.getX() &&
      x < this.getX() + this.getWidth() &&
      y > this.getY() &&
      y < this.getY() + this.getHeight()
    );
  }

  onClick() {
    // To be overridden
  }

  update() {
    this.recalculateHitbox();
  }

  draw({ ctx }: DrawUIElementProps) {
    if (this.game.isDebug) {
      this.drawHitbox(ctx);
    }
  }

  drawHitbox(ctx: CanvasRenderingContext2D) {
    const validTypes: UIElementType[] = [
      "adventurer",
      "monster",
      "powerup",
      "projectile",
    ];
    if (validTypes.includes(this.uiElementType)) {
      ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
      ctx.beginPath();
      ctx.moveTo(this.hitbox.topLeft.x, this.hitbox.topLeft.y);
      ctx.lineTo(this.hitbox.topRight.x, this.hitbox.topRight.y);
      ctx.lineTo(this.hitbox.bottomRight.x, this.hitbox.bottomRight.y);
      ctx.lineTo(this.hitbox.bottomLeft.x, this.hitbox.bottomLeft.y);
      ctx.closePath();
      ctx.fill();
    }
  }

  isVisibleOnScreen(): boolean {
    return (
      this.x + this.width > this.getGame.getViewportCoordinates.x &&
      this.x <
      this.getGame.getViewportCoordinates.x +
      this.getGame.getViewportSize.width &&
      this.y + this.height > this.getGame.getViewportCoordinates.y &&
      this.y <
      this.getGame.getViewportCoordinates.y +
      this.getGame.getViewportSize.height
    );
  }

  get centerCoordinates(): Coordinates {
    return {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2,
    };
  }
}
