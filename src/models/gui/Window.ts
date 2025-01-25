import { createMetallicGradient } from "../../canvasTools/createMetallicGradient";

import { DrawUIElementProps, UIElement, UIElementOptions } from "../UIElement";
import { Button } from "./Button";

interface WindowOptions extends UIElementOptions {
  uiElements: UIElement[];
  addCloseButton?: boolean;
}

export class Window extends UIElement {
  private uiElements: UIElement[] = [];
  closed: boolean = false;

  constructor({ uiElements, addCloseButton, ...rest }: WindowOptions) {
    super({ ...rest, uiElementType: "window" });
    this.uiElements = uiElements;
    if (addCloseButton) {
      const closeButton = new Button({
        game: this.getGame,
        x: this.getWidth() - 50, // relative to parent window
        y: 0, // relative to parent window
        width: 50,
        height: 50,
        name: "close",
        parentWindow: this,
        onClick: () => {
          this.close();
        },
        label: "X",
      });
      this.uiElements = [closeButton, ...this.uiElements];
    }
  }

  close() {
    this.closed = true;
  }

  getUIElements() {
    return this.uiElements;
  }

  addUIElement(element: UIElement) {
    this.uiElements.push(element);
  }

  private drawCutCorner(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    direction: "topLeft" | "topRight" | "bottomLeft" | "bottomRight"
  ) {
    ctx.beginPath();
    switch (direction) {
      case "topLeft":
        ctx.moveTo(x + size, y);
        ctx.lineTo(x + size, y + size);
        ctx.lineTo(x, y + size);
        break;
      case "topRight":
        ctx.moveTo(x - size, y);
        ctx.lineTo(x - size, y + size);
        ctx.lineTo(x, y + size);
        break;
      case "bottomLeft":
        ctx.moveTo(x + size, y);
        ctx.lineTo(x + size, y - size);
        ctx.lineTo(x, y - size);
        break;
      case "bottomRight":
        ctx.moveTo(x - size, y);
        ctx.lineTo(x - size, y - size);
        ctx.lineTo(x, y - size);
        break;
    }
    ctx.closePath();
    ctx.fill();
  }

  private getPixelColor(x: number, y: number, baseColor: number): string {
    // Use various prime numbers to create a pseudo-random but deterministic pattern
    const variation =
      ((x * 17 + y * 23) * 13 +
        (Math.floor(x / 7) * 11 + Math.floor(y / 5) * 19)) %
      7;

    // Create subtle variations of the base color
    const color = baseColor + variation - 3; // This will give us -3 to +3 variation
    return `rgb(${color}, ${color}, ${color})`;
  }

  draw(props: DrawUIElementProps) {
    if (!this.closed) {
      const { ctx } = props;
      const cornerSize = Math.max(this.getWidth() / 75, 10);
      const borderWidth = Math.max(this.getWidth() / 75, 10);
      const pixelSize = (this.getWidth() - cornerSize * 2) / 125;
      const baseColor = 42; // Darker base color

      // Draw main background first (extended slightly under the borders)
      ctx.fillStyle = `rgb(${baseColor}, ${baseColor}, ${baseColor})`;
      ctx.fillRect(
        this.getX() + cornerSize - borderWidth / 2,
        this.getY() + cornerSize - borderWidth / 2,
        this.getWidth() - cornerSize * 2 + borderWidth,
        this.getHeight() - cornerSize * 2 + borderWidth
      );

      // Draw pixelated background pattern with subtle variations
      for (
        let x = this.getX() + cornerSize;
        x < this.getX() + this.getWidth() - cornerSize;
        x += pixelSize
      ) {
        for (
          let y = this.getY() + cornerSize;
          y < this.getY() + this.getHeight() - cornerSize;
          y += pixelSize
        ) {
          ctx.fillStyle = this.getPixelColor(x, y, baseColor);
          ctx.fillRect(x, y, pixelSize, pixelSize);
        }
      }

      // Draw metallic border
      ctx.fillStyle = createMetallicGradient({
        ctx,
        x: this.getX(),
        y: this.getY(),
        width: this.getWidth(),
        height: this.getHeight(),
      });

      // Top border
      ctx.fillRect(
        this.getX() + cornerSize,
        this.getY(),
        this.getWidth() - cornerSize * 2,
        borderWidth
      );
      // Bottom border
      ctx.fillRect(
        this.getX() + cornerSize,
        this.getY() + this.getHeight() - borderWidth,
        this.getWidth() - cornerSize * 2,
        borderWidth
      );
      // Left border
      ctx.fillRect(
        this.getX(),
        this.getY() + cornerSize,
        borderWidth,
        this.getHeight() - cornerSize * 2
      );
      // Right border
      ctx.fillRect(
        this.getX() + this.getWidth() - borderWidth,
        this.getY() + cornerSize,
        borderWidth,
        this.getHeight() - cornerSize * 2
      );

      // Draw cut corners
      ctx.fillStyle = "#1a1a1a";
      this.drawCutCorner(ctx, this.getX(), this.getY(), cornerSize, "topLeft");
      this.drawCutCorner(
        ctx,
        this.getX() + this.getWidth(),
        this.getY(),
        cornerSize,
        "topRight"
      );
      this.drawCutCorner(
        ctx,
        this.getX(),
        this.getY() + this.getHeight(),
        cornerSize,
        "bottomLeft"
      );
      this.drawCutCorner(
        ctx,
        this.getX() + this.getWidth(),
        this.getY() + this.getHeight(),
        cornerSize,
        "bottomRight"
      );

      // Draw UI elements
      this.uiElements.forEach((element) => {
        element.draw(props);
      });
    }
    super.draw(props);
  }
}
