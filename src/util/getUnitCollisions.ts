import { Unit } from "../types/Unit";

export const getUnitCollisions = <T extends Unit, U extends Unit>(
  unit: T,
  units: U[]
): U[] => {
  return units.filter((otherUnit) => {
    // check if any of the corners of the unit are inside the other unit
    const corners = [
      unit.hitbox.bottomLeft,
      unit.hitbox.bottomRight,
      unit.hitbox.topLeft,
      unit.hitbox.topRight,
    ];

    return corners.some((corner) => {
      return (
        corner.x >= otherUnit.getX() &&
        corner.x <= otherUnit.getX() + otherUnit.getWidth() &&
        corner.y >= otherUnit.getY() &&
        corner.y <= otherUnit.getY() + otherUnit.getHeight()
      );
    });
  });
};
