import { Coordinates } from "../types/Coordinates";
import { Size } from "../types/Size";
import { UIElement } from "../models/UIElement";

interface UIElementIsVisible {
  uiElement: UIElement;
  viewportSize: Size;
  viewportCoordinates: Coordinates;
}

export const uiElementIsVisible = ({
  uiElement,
  viewportSize,
  viewportCoordinates,
}: UIElementIsVisible) => {
  const { width: viewportWidth, height: viewportHeight } = viewportSize;
  const { x: viewportX, y: viewportY } = viewportCoordinates;

  const viewportTopLeftX = viewportX;
  const viewportTopLeftY = viewportY;
  const viewportBottomRightX = viewportX + viewportWidth;
  const viewportBottomRightY = viewportY + viewportHeight;

  const uiElementIsVisible =
    uiElement.hitbox.topLeft.x < viewportBottomRightX &&
    uiElement.hitbox.topRight.x > viewportTopLeftX &&
    uiElement.hitbox.topLeft.y < viewportBottomRightY &&
    uiElement.hitbox.bottomLeft.y > viewportTopLeftY;

  return uiElementIsVisible;
};
