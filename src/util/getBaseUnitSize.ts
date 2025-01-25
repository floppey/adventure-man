import { Size } from "../types/Size";

export const getBaseUnitSize = (viewportSize: Size): number => {
  return viewportSize.width / 30;
};
