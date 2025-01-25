import { Projectile } from "../models/projectiles/Projectile";

export const transferKineticEnergy = (
  projectileA: Projectile,
  projectileB: Projectile,
  energyLossPercent: number = 30 // Default 30% energy loss
) => {
  if (Math.sign(projectileA.speedX) !== Math.sign(projectileB.speedX)) {
    const { newSpeedA, newSpeedB } = recalculateSpeeds(
      projectileA.speedX,
      projectileB.speedX,
      projectileA.projectileMass,
      projectileB.projectileMass,
      energyLossPercent
    );

    projectileA.speedX = newSpeedA;
    projectileB.speedX = newSpeedB;
  }

  if (Math.sign(projectileA.speedY) !== Math.sign(projectileB.speedY)) {
    const { newSpeedA, newSpeedB } = recalculateSpeeds(
      projectileA.speedY,
      projectileB.speedY,
      projectileA.projectileMass,
      projectileB.projectileMass,
      energyLossPercent
    );

    projectileA.speedY = newSpeedA;
    projectileB.speedY = newSpeedB;
  }
};

const recalculateSpeeds = (
  speedA: number,
  speedB: number,
  massA: number,
  massB: number,
  energyLossPercent: number
) => {
  const clampedEnergyLoss = Math.max(0, Math.min(100, energyLossPercent));
  const energyRetentionFactor = (100 - clampedEnergyLoss) / 100;

  const newSpeedA = speedB * energyRetentionFactor * (massB / massA);
  const newSpeedB = speedA * energyRetentionFactor * (massA / massB);

  return { newSpeedA, newSpeedB };
};
