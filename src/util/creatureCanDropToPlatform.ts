import { Creature } from "../models/creatures/Creature";
import { Platform } from "../models/platforms/Platform";

export const creatureCanDropToPlatform = (
  creature: Creature,
  targetPlatform: Platform | null
): boolean => {
  const creaturePlatform = creature.getPlatform();
  if (!creaturePlatform || !targetPlatform) {
    return false;
  }
  if (creaturePlatform.getId() === targetPlatform.getId()) {
    return false;
  }
  if (creaturePlatform.getY() >= targetPlatform.getY()) {
    return false;
  }

  const leftEdge = creaturePlatform.getX() - creature.getWidth();
  const rightEdge =
    creaturePlatform.getX() + creaturePlatform.getWidth() + creature.getWidth();

  // if left edge is within the bounds of target platform, return true
  if (
    leftEdge >= targetPlatform.getX() &&
    leftEdge <= targetPlatform.getX() + targetPlatform.getWidth()
  ) {
    return true;
  }

  // if right edge is within the bounds of target platform, return true
  if (
    rightEdge >= targetPlatform.getX() &&
    rightEdge <= targetPlatform.getX() + targetPlatform.getWidth()
  ) {
    return true;
  }

  return false;
};
