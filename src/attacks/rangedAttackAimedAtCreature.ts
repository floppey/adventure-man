import { Coordinates } from "../types/Coordinates";
import {
  Projectile,
  ProjectileOptions,
} from "../models/projectiles/Projectile";
import { RangedAttack, targetIsCreature } from "./types";
import { HomingProjectile } from "../models/projectiles/HomingProjectile";
import { BombProjectile } from "../models/projectiles/BombProjectile";

export const rangedAttackAimedAtCreature: RangedAttack = ({
  self,
  target,
  chargePercent,
  projectileType = "arrow",
  colorTheme = "red",
}) => {
  if (!targetIsCreature(target)) {
    console.error("Target is not a creature");
    return null;
  }
  const scale = self.getGame.baseUnitSize / 64;
  const targetCenter: Coordinates = {
    x: target.getX() + target.getWidth() / 2,
    y: target.getY() + target.getHeight() / 2,
  };
  const selfCenter: Coordinates = {
    x: self.getX() + self.getWidth() / 2,
    y: self.getY() + self.getHeight() / 2,
  };

  const projectileWidth = 64 * scale;
  const projectileHeight = 18 * scale;

  const baseSpeed = self.getGame.baseProjectileSpeed;
  const maxSpeed = baseSpeed + baseSpeed * chargePercent;
  const maxSpeedY = maxSpeed * 1.25;

  const projectileGravity = self.getGame.baseGravity / 2;

  // Calculate distances
  const dx = targetCenter.x - selfCenter.x;
  const dy = targetCenter.y - selfCenter.y;

  // Calculate angle to target
  const angle = Math.atan2(dy, dx);

  // Calculate speed components based on angle
  // cos(angle) gives us the proportion of speed that should go to x-axis
  // sin(angle) gives us the proportion of speed that should go to y-axis
  const speedX = Math.cos(angle) * maxSpeed;

  // Calculate time to reach target horizontally
  const timeToTarget = Math.abs(dx) / Math.abs(speedX);

  // Calculate required initial vertical velocity
  // Using the projectile motion equation: y = y0 + v0y*t + (1/2)*g*t^2
  // Solve for v0y: v0y = (y - y0 - (1/2)*g*t^2) / t
  const speedY =
    (dy - 0.5 * projectileGravity * timeToTarget * timeToTarget) / timeToTarget;

  // Add some bounds checking to prevent extreme angles
  if (speedY > maxSpeedY) {
    return null;
  }

  const projectileOptions: ProjectileOptions = {
    game: self.getGame,
    x: selfCenter.x,
    y: self.getY(),
    width: projectileWidth,
    height: projectileHeight,
    speedX,
    speedY,
    gravity: projectileGravity,
    name: "Ranged Attack",
    attackPower: self.attackPower,
    createdBy: self.getId(),
    type: projectileType,
    colorTheme,
  };

  if (projectileType === "homing") {
    return new HomingProjectile({
      ...projectileOptions,
      target: target,
      maxSpeed: maxSpeed,
    });
  }

  if (projectileType === "bomb") {
    return new BombProjectile(projectileOptions);
  }

  return new Projectile(projectileOptions);
};
