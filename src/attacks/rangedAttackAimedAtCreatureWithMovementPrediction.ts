import { Projectile } from "../models/projectiles/Projectile";
import { Coordinates } from "../types/Coordinates";
import { RangedAttack, targetIsCreature } from "./types";

export const rangedAttackAimedAtCreatureWithMovementPrediction: RangedAttack =
  ({ self, target, chargePercent, colorTheme = "red" }) => {
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

    // Get target's current motion
    const targetSpeedX = target.speedX;
    const targetSpeedY = target.speedY;
    const targetGravity = target.getGravity();

    // We need to solve for time iteratively since this becomes a complex quadratic system
    // Start with a simple time estimate based on direct distance
    let dx = targetCenter.x - selfCenter.x;
    let dy = targetCenter.y - selfCenter.y;

    const baseTime = Math.sqrt(dx * dx + dy * dy) / maxSpeed;

    // Iterate a few times to refine our prediction
    const iterations = 3;
    let predictionTime = baseTime;

    for (let i = 0; i < iterations; i++) {
      // Predict target position after predictionTime
      const predictedTargetX = targetCenter.x + targetSpeedX * predictionTime;
      const predictedTargetY =
        targetCenter.y +
        targetSpeedY * predictionTime +
        0.5 * targetGravity * predictionTime * predictionTime;

      // Recalculate distances to predicted position
      dx = predictedTargetX - selfCenter.x;
      dy = predictedTargetY - selfCenter.y;

      // Calculate angle needed to hit predicted position
      const angle = Math.atan2(dy, dx);

      // Calculate speed components
      const speedX = Math.cos(angle) * maxSpeed * Math.sign(dx);

      // Update time prediction based on horizontal component
      predictionTime = Math.abs(dx) / Math.abs(speedX);
    }

    // Final angle calculation using predicted position
    const finalAngle = Math.atan2(dy, dx);

    // Calculate final velocities
    const speedX = Math.cos(finalAngle) * maxSpeed * Math.sign(dx);

    // Time to reach target horizontally
    const timeToTarget = Math.abs(dx) / Math.abs(speedX);

    // Calculate required initial vertical velocity accounting for gravity
    // y = y0 + v0y*t + (1/2)*g*t^2
    // Solving for v0y, but now including target's predicted vertical position
    const predictedTargetY =
      targetCenter.y +
      targetSpeedY * timeToTarget +
      0.5 * targetGravity * timeToTarget * timeToTarget;

    const speedY =
      (predictedTargetY -
        selfCenter.y -
        0.5 * projectileGravity * timeToTarget * timeToTarget) /
      timeToTarget;

    // Add some bounds checking to prevent extreme angles
    if (speedY > maxSpeedY) {
      return null;
    }

    return new Projectile({
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
      type: "arrow",
      colorTheme,
    });
  };
