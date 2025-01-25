import { Size } from "../types/Size";

/** Get the maximum falling speed. This should only be applied to downwards (positive) Y-axis speeds, not upwards (negative). */
export const getTerminalVelocity = (viewportSize: Size): number => {
  return viewportSize.height / 10;
};
