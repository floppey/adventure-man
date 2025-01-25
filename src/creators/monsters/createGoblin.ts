import { MonsterTemplate } from "../../models/creatures/Monster";

export const createGoblin = (
  overrides?: Partial<MonsterTemplate>
): MonsterTemplate => {
  return {
    name: "Goblin",
    hitpoints: 15,
    armor: 0,
    attackPower: 5,
    attackCooldown: 2000,
    attackDuration: 200,
    width: 1,
    height: 1.5,
    y: 0,
    x: 0,
    monster: "goblin",
    movementType: "walking",
    speedX: 0.45,
    speedY: 0,
    directionX: "left",
    intelligence: "dumb",
    ...overrides,
  };
};
