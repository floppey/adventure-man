import { Creature } from "../models/creatures/Creature";
import { Coordinates } from "../types/Coordinates";
import { getDistanceBetweenCoordinates } from "./getDistanceBetweenCoordinates";

export const getClosesCreatureToCoordinates = (
  coordinates: Coordinates,
  creatures: Creature[]
): Creature | null => {
  let closestCreature = null;
  let closestDistance = Infinity;

  creatures.forEach((creature) => {
    const distance = getDistanceBetweenCoordinates(
      creature.centerCoordinates,
      coordinates
    );

    if (distance < closestDistance) {
      closestCreature = creature;
      closestDistance = distance;
    }
  });

  return closestCreature;
};
