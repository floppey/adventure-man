import { createGoldenGradient } from "../../canvasTools/createMetallicGradient";
import { Unit } from "../../types/Unit";
import { DrawUIElementProps, UIElementOptions } from "../UIElement";

export interface DoorOptions extends UIElementOptions {
  open: boolean;
}

export class Door extends Unit {
  private open: boolean;
  private frameThickness: number = 10;

  constructor({ open, ...rest }: DoorOptions) {
    super({
      ...rest,
    });
    this.open = open;
  }

  get isOpen() {
    return this.open;
  }

  set isOpen(value: boolean) {
    this.open = value;
  }

  draw(props: DrawUIElementProps) {
    const { ctx } = props;
    const xWithViewport = this.getXWithViewport;
    const yWithViewport = this.getYWithViewport;
    const doorWidth = this.getWidth();
    const rectangularHeight = this.getHeight() * 0.75;
    const archHeight = this.getHeight() * 0.25;
    const totalHeight = rectangularHeight + archHeight;

    const frameColor = "#444444";
    const doorColor = this.isOpen
      ? createGoldenGradient({
          ctx,
          x: xWithViewport,
          y: yWithViewport,
          width: doorWidth,
          height: totalHeight,
        })
      : "#8B4513";

    // Frame
    ctx.fillStyle = frameColor;
    ctx.fillRect(
      xWithViewport,
      yWithViewport + archHeight,
      doorWidth,
      rectangularHeight
    );
    ctx.beginPath();
    ctx.arc(
      xWithViewport + doorWidth / 2,
      yWithViewport + archHeight,
      doorWidth / 2,
      0,
      2 * Math.PI
    );
    ctx.fill();

    // Door
    ctx.fillStyle = doorColor;
    ctx.fillRect(
      xWithViewport + this.frameThickness,
      yWithViewport + archHeight + this.frameThickness,
      doorWidth - 2 * this.frameThickness,
      rectangularHeight - 2 * this.frameThickness
    );
    ctx.beginPath();
    ctx.arc(
      xWithViewport + doorWidth / 2,
      yWithViewport + archHeight,
      doorWidth / 2 - this.frameThickness,
      0,
      2 * Math.PI
    );
    ctx.fill();
  }
}
