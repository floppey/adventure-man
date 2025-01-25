import { Size } from "../types/Size";

export const getGravity = (viewportSize: Size): number => {
  return viewportSize.height / 100;
};
