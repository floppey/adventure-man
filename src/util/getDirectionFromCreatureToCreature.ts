import { Creature, Direction, DirectionY } from "../models/creatures/Creature";

export const getDirectionFromCreatureToCreature = (
  from: Creature,
  to: Creature
): {
  x: Direction;
  y: DirectionY;
} => {
  const fromX = from.getX() + from.getWidth() / 2;
  const fromY = from.getY() + from.getHeight() / 2;
  const toX = to.getX() + to.getWidth() / 2;
  const toY = to.getY() + to.getHeight() / 2;

  let x: Direction = "none";
  let y: DirectionY = "none";

  if (fromX < toX) {
    x = "right";
  } else if (fromX > toX) {
    x = "left";
  }

  if (fromY < toY) {
    y = "down";
  } else if (fromY > toY) {
    y = "up";
  }

  return { x, y };
};
