import { MonsterTemplate } from "../../models/creatures/Monster";

export const createSkeleton = (
  overrides?: Partial<MonsterTemplate>
): MonsterTemplate => {
  return {
    name: "Skeleton",
    hitpoints: 10,
    armor: 0,
    attackPower: 5,
    attackCooldown: 2000,
    attackDuration: 200,
    width: 1,
    height: 1.5,
    y: 0,
    x: 0,
    monster: "skeleton",
    movementType: "walking",
    speedX: 0.25,
    speedY: 0,
    directionX: "left",
    intelligence: "dumb",
    ...overrides,
  };
};
