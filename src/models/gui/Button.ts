import { DrawUIElementProps, UIElement, UIElementOptions } from "../UIElement";
import { Window } from "./Window";

export interface ButtonOptions extends UIElementOptions {
  parentWindow: Window;
  label: string;
  onClick: () => void;
}

export class Button extends UIElement {
  private parentWindow: Window;
  label: string;
  onClick: () => void;
  private isHovered: boolean = false;
  private isPressed: boolean = false;

  constructor({ parentWindow, label, onClick, ...rest }: ButtonOptions) {
    super({ ...rest, uiElementType: "button" });
    this.parentWindow = parentWindow;
    this.setX(this.getX() + this.parentWindow.getX());
    this.setY(this.getY() + this.parentWindow.getY());
    this.label = label;
    this.onClick = onClick;
  }

  private createButtonGradient(
    ctx: CanvasRenderingContext2D,
    y: number,
    height: number,
    isPressed: boolean
  ): CanvasGradient {
    const gradient = ctx.createLinearGradient(0, y, 0, y + height);

    if (isPressed) {
      // Darker gradient when pressed
      gradient.addColorStop(0, "#4a332b");
      gradient.addColorStop(0.5, "#5c4034");
      gradient.addColorStop(1, "#4a332b");
    } else if (this.isHovered) {
      // Lighter gradient when hovered
      gradient.addColorStop(0, "#8b5e3c");
      gradient.addColorStop(0.5, "#a0704a");
      gradient.addColorStop(1, "#8b5e3c");
    } else {
      // Normal state
      gradient.addColorStop(0, "#6b4732");
      gradient.addColorStop(0.5, "#7c533a");
      gradient.addColorStop(1, "#6b4732");
    }

    return gradient;
  }

  private createBorderGradient(
    ctx: CanvasRenderingContext2D,
    y: number,
    height: number
  ): CanvasGradient {
    const gradient = ctx.createLinearGradient(0, y, 0, y + height);
    gradient.addColorStop(0, "#c4956a");
    gradient.addColorStop(0.5, "#a67c54");
    gradient.addColorStop(1, "#8b6344");
    return gradient;
  }
  private drawCornerPiece(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    position: "topLeft" | "topRight" | "bottomLeft" | "bottomRight"
  ) {
    ctx.fillStyle = this.createBorderGradient(ctx, y, size);
    ctx.beginPath();

    switch (position) {
      case "topLeft":
        ctx.moveTo(x, y + size);
        ctx.lineTo(x + size, y + size);
        ctx.lineTo(x + size, y);
        break;
      case "topRight":
        ctx.moveTo(x - size, y);
        ctx.lineTo(x - size, y + size);
        ctx.lineTo(x, y + size);
        break;
      case "bottomLeft":
        ctx.moveTo(x, y - size);
        ctx.lineTo(x + size, y - size);
        ctx.lineTo(x + size, y);
        break;
      case "bottomRight":
        ctx.moveTo(x, y - size);
        ctx.lineTo(x - size, y - size);
        ctx.lineTo(x - size, y);
        break;
    }

    ctx.closePath();
    ctx.fill();
  }

  update() {
    const mousePosition = this.getGame.getMousePosition;
    const x = this.getX();
    const y = this.getY();
    const width = this.getWidth();
    const height = this.getHeight();

    if (
      mousePosition.x >= x &&
      mousePosition.x <= x + width &&
      mousePosition.y >= y &&
      mousePosition.y <= y + height
    ) {
      if (this.isHovered === false) {
        this.onMouseEnter();
      }
    } else {
      if (this.isHovered === true) {
        this.onMouseLeave();
      }
    }
    super.update();
  }

  draw(props: DrawUIElementProps) {
    const { ctx } = props;
    const borderWidth = 4;
    const cornerSize = 8;

    const x = this.getX();
    const y = this.getY();
    const width = this.getWidth();
    const height = this.getHeight();

    // Draw main button body with gradient
    ctx.fillStyle = this.createButtonGradient(ctx, y, height, this.isPressed);

    // Draw main body accounting for corners
    ctx.beginPath();
    ctx.moveTo(x + cornerSize, y); // Top left after corner
    ctx.lineTo(x + width - cornerSize, y); // Top right before corner
    ctx.lineTo(x + width, y + cornerSize); // Right top after corner
    ctx.lineTo(x + width, y + height - cornerSize); // Right bottom before corner
    ctx.lineTo(x + width - cornerSize, y + height); // Bottom right after corner
    ctx.lineTo(x + cornerSize, y + height); // Bottom left before corner
    ctx.lineTo(x, y + height - cornerSize); // Left bottom after corner
    ctx.lineTo(x, y + cornerSize); // Left top before corner
    ctx.closePath();
    ctx.fill();

    // Draw border with metallic gradient
    ctx.strokeStyle = this.createBorderGradient(ctx, y, height);
    ctx.lineWidth = borderWidth;

    // Top border
    ctx.beginPath();
    ctx.moveTo(x + cornerSize, y + borderWidth / 2);
    ctx.lineTo(x + width - cornerSize, y + borderWidth / 2);
    ctx.stroke();

    // Bottom border
    ctx.beginPath();
    ctx.moveTo(x + cornerSize, y + height - borderWidth / 2);
    ctx.lineTo(x + width - cornerSize, y + height - borderWidth / 2);
    ctx.stroke();

    // Left border
    ctx.beginPath();
    ctx.moveTo(x + borderWidth / 2, y + cornerSize);
    ctx.lineTo(x + borderWidth / 2, y + height - cornerSize);
    ctx.stroke();

    // Right border
    ctx.beginPath();
    ctx.moveTo(x + width - borderWidth / 2, y + cornerSize);
    ctx.lineTo(x + width - borderWidth / 2, y + height - cornerSize);
    ctx.stroke();

    // Draw corner pieces
    this.drawCornerPiece(ctx, x, y, cornerSize, "topLeft");
    this.drawCornerPiece(ctx, x + width, y, cornerSize, "topRight");
    this.drawCornerPiece(ctx, x, y + height, cornerSize, "bottomLeft");
    this.drawCornerPiece(ctx, x + width, y + height, cornerSize, "bottomRight");

    // Draw text
    ctx.fillStyle = "#e8d5b7";
    ctx.font = '20px "Cinzel", serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 2;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;

    ctx.fillText(this.label, x + width / 2, y + height / 2);

    ctx.shadowColor = "transparent";
    super.draw(props);
  }

  // Add these methods to handle mouse interactions
  onMouseEnter() {
    this.isHovered = true;
  }

  onMouseLeave() {
    this.isHovered = false;
    this.isPressed = false;
  }

  onMouseDown() {
    this.isPressed = true;
  }

  onMouseUp() {
    this.isPressed = false;
  }

  getIsHovered() {
    return this.isHovered;
  }
}
