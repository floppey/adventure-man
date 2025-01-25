import { MonsterTemplate } from "../models/creatures/Monster";
import { PlatformTemplate } from "../models/platforms/Platform";
import { Size } from "../types/Size";
import { getBaseUnitSize } from "./getBaseUnitSize";

export const placeMonstersOnPlatforms = (
  monsters: MonsterTemplate[],
  platforms: PlatformTemplate[],
  gameSize: Size,
  viewportSize: Size
): MonsterTemplate[] => {
  return monsters.map((monster) => {
    const platform = platforms[Math.floor(Math.random() * platforms.length)];
    const monsterHeight =
      (getBaseUnitSize(viewportSize) * monster.height) / gameSize.height;
    // get random position on platform
    const randomX = Math.random() * platform.width;

    monster.x = platform.x + randomX;
    monster.directionX = randomX > 0.5 ? "left" : "right";
    monster.y = platform.y - monsterHeight;
    return monster;
  });
};
