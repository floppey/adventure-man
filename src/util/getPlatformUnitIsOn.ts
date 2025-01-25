import { Creature } from "../models/creatures/Creature";
import { Platform } from "../models/platforms/Platform";
import { Projectile } from "../models/projectiles/Projectile";

export const getPlatformUnitIsOn = (
  unit: Creature | Projectile,
  platforms: Platform[]
): Platform | null => {
  // If unit is moving up, it is not on a platform
  if (unit.speedY < 0) {
    return null;
  }
  // tolerance for landing on platforms
  const tolerance = Math.max(10, unit.speedY);
  const lowestCorner = getLowestCorner(unit);

  // Check for landing on platforms
  const platform = platforms?.find((platform) => {
    const platformTop = platform.getY();

    const isOnOrInsidePlatform =
      lowestCorner.y <= platformTop + tolerance &&
      lowestCorner.y >= platformTop;
    const isWithinXBounds =
      unit.hitbox.bottomRight.x >= platform.getX() &&
      unit.hitbox.bottomLeft.x <= platform.getX() + platform.getWidth();
    if (isOnOrInsidePlatform && isWithinXBounds) {
      return true;
    }
  });
  return platform ?? null;
};

const getLowestCorner = (projectile: Projectile | Creature) => {
  let lowestCorner = projectile.hitbox.bottomLeft;
  if (projectile.hitbox.bottomRight.y > lowestCorner.y) {
    lowestCorner = projectile.hitbox.bottomRight;
  }
  if (projectile.hitbox.topLeft.y > lowestCorner.y) {
    lowestCorner = projectile.hitbox.topLeft;
  }
  if (projectile.hitbox.topRight.y > lowestCorner.y) {
    lowestCorner = projectile.hitbox.topRight;
  }
  return lowestCorner;
};
