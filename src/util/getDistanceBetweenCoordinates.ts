import { Coordinates } from "../types/Coordinates";

export const getDistanceBetweenCoordinates = (
  coordinatesA: Coordinates,
  coordinatesB: Coordinates
): number => {
  const dx = coordinatesA.x - coordinatesB.x;
  const dy = coordinatesA.y - coordinatesB.y;
  return Math.hypot(dx, dy);
};
