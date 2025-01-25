import { DrawUIElementProps, UIElement, UIElementOptions } from "../UIElement";
import { Window } from "./Window";

export interface LabelOptions extends UIElementOptions {
  parentWindow: Window;
  label: string;
  textAlign: CanvasTextAlign;
}

export class Label extends UIElement {
  private parentWindow: Window;
  label: string;
  textAlign: CanvasTextAlign;

  constructor({ parentWindow, label, textAlign, ...rest }: LabelOptions) {
    super({ ...rest, uiElementType: "label" });
    this.parentWindow = parentWindow;
    this.setX(this.getX() + this.parentWindow.getX());
    this.setY(this.getY() + this.parentWindow.getY());
    this.label = label;
    this.textAlign = textAlign;


  }

  draw(props: DrawUIElementProps) {
    const { ctx } = props;
    // Draw text
    const fontSize = this.getHeight() / 1.5;
    ctx.fillStyle = "white";
    ctx.font = `${fontSize}px Arial`;
    ctx.textAlign = this.textAlign;
    ctx.fillText(
      this.label,
      this.getX() + this.getWidth() / 2,
      this.getY() + this.getHeight() / 2 + fontSize / 3,
      this.getWidth()

    );
    super.draw(props);
  }
}
