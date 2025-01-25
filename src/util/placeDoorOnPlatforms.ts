import { Platform } from "../models/platforms/Platform";
import { Door } from "../models/portals/Door";

export const placeDoorOnPlatforms = (
  door: Door,
  platforms: Platform[]
): Door => {
  const platform = platforms[Math.floor(Math.random() * platforms.length)];

  // get random position on platform
  const randomX = Math.random() * (platform.getWidth() - door.getWidth());

  door.setX(platform.getX() + randomX);
  door.setY(platform.getY() - door.getHeight());
  return door;
};
