import { Creature } from "../models/creatures/Creature";
import { Coordinates } from "../types/Coordinates";
import { getDistanceBetweenCoordinates } from "./getDistanceBetweenCoordinates";

export const getCreaturesWithinRadius = (
  coordinates: Coordinates,
  radius: number,
  creatures: Creature[]
): Creature[] => {
  const creaturesWithinRadius = creatures.filter((creature) => {
    const distance = getDistanceBetweenCoordinates(
      creature.centerCoordinates,
      coordinates
    );

    return distance < radius;
  });

  return creaturesWithinRadius;
};
