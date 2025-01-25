import { Creature } from "../models/creatures/Creature";
import {
  ProjectileColorTheme,
  Projectile,
  ProjectileType,
} from "../models/projectiles/Projectile";
import { Coordinates } from "../types/Coordinates";

export type Target = Creature | Coordinates;

export interface RangedAttackProps {
  self: Creature;
  chargePercent: number;
  colorTheme?: ProjectileColorTheme;
  projectileType?: ProjectileType;
  target: Target;
  attackPowerOverride?: number;
}

export type RangedAttack<T extends RangedAttackProps = RangedAttackProps> = (
  props: T
) => Projectile | null;

export const targetIsCreature = (target: Target): target is Creature => {
  return (target as Creature).name !== undefined;
};

export const targetIsCoordinates = (target: Target): target is Coordinates => {
  return (target as Coordinates).x !== undefined;
};
