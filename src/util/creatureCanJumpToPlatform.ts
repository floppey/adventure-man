import { Creature } from "../models/creatures/Creature";
import { Platform } from "../models/platforms/Platform";
import { getBaseJumpSpeed } from "./getBaseJumpSpeed";

export function canCreatureJumpToPlatform(
  creature: Creature,
  platform: Platform
): boolean {
  // If creature can't jump at all, return false
  if (!creature.canJump()) {
    return false;
  }

  // Can only initiate a jump when standing still or falling
  if (creature.speedY < 0) {
    return false;
  }

  const viewportSize = creature.getGame.getViewportSize;

  // Get the remaining jumps available
  const remainingJumps = 2 - creature.getJumpCount();

  // If we have two jumps available, calculate optimal double jump height
  if (remainingJumps === 2) {
    // First jump velocity
    const firstJumpVelocity = getBaseJumpSpeed(viewportSize, 0);

    // Time to reach peak of first jump (v = v0 + at)
    const timeToFirstPeak = Math.abs(firstJumpVelocity / creature.gravity);

    // Height reached at first peak (h = v0t + (1/2)at²)
    const firstJumpHeight =
      firstJumpVelocity * timeToFirstPeak +
      0.5 * creature.gravity * timeToFirstPeak * timeToFirstPeak;

    // Second jump velocity (from first jump peak)
    const secondJumpVelocity = getBaseJumpSpeed(viewportSize, 1);

    // Time to reach peak of second jump
    const timeToSecondPeak = Math.abs(secondJumpVelocity / creature.gravity);

    // Additional height from second jump
    const secondJumpHeight =
      secondJumpVelocity * timeToSecondPeak +
      0.5 * creature.gravity * timeToSecondPeak * timeToSecondPeak;

    // Total maximum height possible with optimal double jump
    const maxHeight = Math.abs(firstJumpHeight) + Math.abs(secondJumpHeight);

    // Calculate if platform is reachable within this height
    const heightDifference = creature.getY() - platform.getY();
    if (heightDifference > maxHeight) {
      return false;
    }
  } else {
    // Single jump calculation
    const jumpVelocity = getBaseJumpSpeed(viewportSize, 0);
    const timeToApex = Math.abs(jumpVelocity / creature.gravity);
    const maxJumpHeight = Math.abs(
      jumpVelocity * timeToApex +
        0.5 * creature.gravity * timeToApex * timeToApex
    );

    const heightDifference = creature.getY() - platform.getY();
    if (heightDifference > maxJumpHeight) {
      return false;
    }
  }

  // Calculate horizontal distance to the platform
  const creatureCenterX = creature.getX() + creature.getWidth() / 2;
  const horizontalDistanceToLeftSideOfPlatform = Math.abs(
    platform.getX() - creatureCenterX
  );
  const horizontalDistanceToRightSideOfPlatform = Math.abs(
    platform.getX() + platform.getWidth() - creatureCenterX
  );
  const horizontalDistance = Math.min(
    horizontalDistanceToLeftSideOfPlatform,
    horizontalDistanceToRightSideOfPlatform
  );
  const timeToReachHorizontally = Math.abs(
    horizontalDistance / creature.maxSpeedX
  );

  // Calculate if the platform is horizontally reachable
  // Using the time it takes to reach max height as a reference
  const maxJumpTime =
    Math.abs(-viewportSize.height / 15 / creature.gravity) * 2;

  // If it takes too long to reach horizontally compared to jump time, it's not reachable
  if (timeToReachHorizontally > maxJumpTime * 1.2) {
    // 20% margin for air control
    return false;
  }

  return true;
}
