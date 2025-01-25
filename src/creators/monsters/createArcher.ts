import { MonsterTemplate } from "../../models/creatures/Monster";

export const createArcher = (
  overrides?: Partial<MonsterTemplate>
): MonsterTemplate => {
  return {
    name: "Archer",
    hitpoints: 10,
    armor: 0,
    attackPower: 15,
    attackCooldown: 2000,
    attackDuration: 200,
    width: 1,
    height: 1.5,
    y: 0,
    x: 0,
    monster: "archer",
    movementType: "walking",
    speedX: 0.25,
    speedY: 0,
    directionX: "left",
    intelligence: "dumb",
    ...overrides,
  };
};
