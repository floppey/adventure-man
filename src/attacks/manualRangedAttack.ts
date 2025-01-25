import { Coordinates } from "../types/Coordinates";
import {
  Projectile,
  ProjectileOptions,
} from "../models/projectiles/Projectile";
import { RangedAttack, targetIsCoordinates } from "./types";
import { BombProjectile } from "../models/projectiles/BombProjectile";

export const manualRangedAttack: RangedAttack = ({
  self,
  target,
  chargePercent,
  colorTheme = "red",
  projectileType,
  attackPowerOverride,
}) => {
  if (!targetIsCoordinates(target)) {
    console.error("Target is not coordinates");
    return null;
  }
  const scale = self.getGame.baseUnitSize / 64;
  const unitCenterCoordinates: Coordinates = {
    x: self.getX() + self.getWidth() / 2,
    y: self.getY() + self.getHeight() / 2,
  };
  const angle = Math.atan2(
    target.y - unitCenterCoordinates.y,
    target.x - unitCenterCoordinates.x
  );
  const projectileWidth = 64 * scale;
  const projectileHeight = 18 * scale;

  const baseSpeed = self.getGame.baseProjectileSpeed;
  const speed = baseSpeed + baseSpeed * chargePercent;

  const projectileSpeedX = speed * Math.cos(angle);
  const projectileSpeedY = speed * Math.sin(angle);
  const baseAttackPower = attackPowerOverride ?? self.attackPower;
  const projectileAttackPower =
    baseAttackPower + baseAttackPower * chargePercent;

  const baseX = unitCenterCoordinates.x - projectileWidth / 2;
  const baseY = unitCenterCoordinates.y - projectileHeight / 2;

  const projectileOptions: ProjectileOptions = {
    game: self.getGame,
    x: baseX,
    y: baseY,
    width: projectileWidth,
    height: projectileHeight,
    speedX: projectileSpeedX,
    speedY: projectileSpeedY,
    gravity: self.getGame.baseGravity / 2,
    name: "Ranged Attack",
    attackPower: projectileAttackPower,
    createdBy: self.getId(),
    type: projectileType ?? "arrow",
    colorTheme,
  };

  if (projectileType === "bomb") {
    return new BombProjectile(projectileOptions);
  }

  return new Projectile(projectileOptions);
};
