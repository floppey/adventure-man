import { Game } from "../Game";
import { Creature, CreatureOptions } from "../models/creatures/Creature";
import { Viewport } from "../types/Viewport";
import { getBaseSpeedX } from "../util/getBaseSpeedX";
import { getGravity } from "../util/getGravity";

export const createCreature = (
  overrides: Partial<CreatureOptions> = {},
  gameSize: Viewport,
  viewportSize: Viewport
) => {
  const baseUnitSize = viewportSize.width / 30;
  const defaultCreature = new Creature({
    game: {} as unknown as Game,
    x: 0,
    y: gameSize.height - baseUnitSize,
    width: baseUnitSize,
    height: baseUnitSize,
    maxSpeedX: getBaseSpeedX(viewportSize),
    speedY: 0,
    gravity: getGravity(viewportSize),
    directionX: "none",
    directionY: "none",
    movementType: "walking",
    hitpoints: 100,
    armor: 0,
    name: "TestCreature",
    attackPower: 10,
    attackCooldown: 1000,
    attackDuration: 500,
    ...overrides,
  });
  return defaultCreature;
};
