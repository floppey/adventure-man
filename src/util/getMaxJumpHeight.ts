import { Creature } from "../models/creatures/Creature";
import { Viewport } from "../types/Viewport";
import { getBaseJumpSpeed } from "./getBaseJumpSpeed";

export const getMaxJumpHeight = (
  creature: Creature,
  viewport: Viewport
): number => {
  let jumpHeight = 0;

  const gravity = creature.gravity;
  const intervalFactor = 1 / 100;

  while (creature.canJump()) {
    let ySpeed = getBaseJumpSpeed(viewport, creature.getJumpCount());
    while (ySpeed < 0) {
      jumpHeight += ySpeed * -1 * intervalFactor;
      ySpeed += gravity * intervalFactor;
    }

    creature.setJumpCount(creature.getJumpCount() + 1);
  }
  const centerHeight = jumpHeight - creature.getHeight() / 2;

  return centerHeight;
};
