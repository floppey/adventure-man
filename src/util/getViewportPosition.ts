import { Adventurer } from "../models/classes/Adventurer";
import { Level } from "../levels";
import { Coordinates } from "../types/Coordinates";
import { Size } from "../types/Size";

interface Params {
  adventurer: Adventurer;
  viewportSize: Size;
  level: Level | null;
  currentViewportPosition: Coordinates;
}

/**
 * Get the viewport position based on the adventurer's position and the game window size
 * We want to keep the adventurer within 50%
 */
export const getViewportPosition = ({
  /** The adventurer */
  adventurer,
  /** Width of the viewport */
  viewportSize,
  /** The current level */
  level,
  /** Current viewport position */
  currentViewportPosition: currentViewport,
}: Params): Coordinates => {
  const gameWidth = viewportSize.width * (level?.levelSize?.width ?? 1);
  const gameHeight = viewportSize.height * (level?.levelSize?.height ?? 1);

  // Calculate the center 50% boundaries relative to the current viewport
  const centerMarginX = viewportSize.width * 0.5;
  const centerMarginY = viewportSize.height * 0.5;

  // Get adventurer's position relative to the current viewport
  const relativeX = adventurer.getX() - currentViewport.x;
  const relativeY = adventurer.getY() - currentViewport.y;

  // Initialize new viewport position to current position
  let newX = currentViewport.x;
  let newY = currentViewport.y;

  // Only move viewport horizontally if adventurer is outside center bounds
  if (relativeX < centerMarginX) {
    // Adventurer is too close to left edge
    newX = adventurer.getX() - centerMarginX;
  } else if (relativeX > viewportSize.width - centerMarginX) {
    // Adventurer is too close to right edge
    newX = adventurer.getX() - (viewportSize.width - centerMarginX);
  }

  // Only move viewport vertically if adventurer is outside center bounds
  if (relativeY < centerMarginY) {
    // Adventurer is too close to top edge
    newY = adventurer.getY() - centerMarginY;
  } else if (relativeY > viewportSize.height - centerMarginY) {
    // Adventurer is too close to bottom edge
    newY = adventurer.getY() - (viewportSize.height - centerMarginY);
  }

  // Clamp viewport position to level boundaries
  return {
    x: Math.min(Math.max(0, newX), gameWidth - viewportSize.width),
    y: Math.min(Math.max(0, newY), gameHeight - viewportSize.height),
  };
};
