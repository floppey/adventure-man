import {
  DrawUIElementProps,
  UIElement,
  UIElementOptions,
} from "../models/UIElement";

export class Unit extends UIElement {
  private floatingText: {
    text: string;
    options: {
      expiration: number;
      color: string;
      outlineColor: string;
    };
  }[] = [];

  constructor(props: UIElementOptions) {
    super(props);
  }

  setFloatingText(
    text: string,
    duration: number,
    color: string = "white",
    outlineColor: string = "black"
  ) {
    this.floatingText.push({
      text,
      options: {
        expiration: Date.now() + duration,
        color,
        outlineColor,
      },
    });
  }

  update() {
    // Update floating text
    this.floatingText = this.floatingText.filter((text) => {
      if (text.options.expiration > Date.now()) {
        return true;
      }
      return false;
    });
    super.update();
  }

  draw(props: DrawUIElementProps) {
    const { ctx } = props;
    const xWithViewport = this.getXWithViewport;
    const yWithViewport = this.getYWithViewport;

    this.floatingText.forEach((text) => {
      // Draw floating text using white text with a black outline
      ctx.fillStyle = text.options.color;
      ctx.strokeStyle = text.options.outlineColor;
      ctx.lineWidth = 2;
      ctx.font = "24px Arial";
      ctx.textAlign = "center";
      ctx.strokeText(
        text.text,
        xWithViewport + this.getWidth() / 2,
        yWithViewport - 10
      );
      ctx.fillText(
        text.text,
        xWithViewport + this.getWidth() / 2,
        yWithViewport - 10
      );
    });
    super.draw(props);
  }
}
