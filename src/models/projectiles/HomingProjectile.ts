import { renderCrosshairs } from "../../renderFunctions/renderCrosshairs";
import { Coordinates } from "../../types/Coordinates";
import { Creature } from "../creatures/Creature";
import { DrawUIElementProps } from "../UIElement";
import { Projectile, ProjectileOptions } from "./Projectile";

interface HomingProjectileOptions extends ProjectileOptions {
  target: Creature;
  maxSpeed: number;
}

export class HomingProjectile extends Projectile {
  private target: Creature;
  private maxSpeed: number;
  private agility: number = 0.1;
  private createdTime: number;
  private accelerationTime: number = 2500;
  private impactTime: number | null = null;
  private homingDisabledUntil: number | null = null;

  constructor({ target, maxSpeed, ...rest }: HomingProjectileOptions) {
    super(rest);
    this.target = target;
    this.maxSpeed = maxSpeed;
    this.createdTime = Date.now();
  }

  draw(drawProps: DrawUIElementProps): void {
    if (!this.impactTime) {
      super.draw(drawProps);
    }
    if (this.isOutOfBounds()) {
      return;
    }

    if (this.target.isAlive()) {
      // Draw target crosshair
      renderCrosshairs({
        ctx: drawProps.ctx,
        game: this.getGame,
        position: {
          x: this.target.getXWithViewport,
          y: this.target.getYWithViewport,
        },
      });
    }

    if (this.impactTime) {
      const timeSinceImpact = Date.now() - this.impactTime;
      if (timeSinceImpact <= 250) {
        const progress = timeSinceImpact / 250;
        // Draw impact circle, starting at 0.5 radius and expanding to 1.5 radius
        const impactRadius = 0.5 + progress;
        drawProps.ctx.beginPath();
        drawProps.ctx.arc(
          this.getXWithViewport + this.getWidth() / 2,
          this.getYWithViewport + this.getHeight() / 2,
          impactRadius * this.getGame.baseUnitSize,
          0,
          2 * Math.PI
        );
        drawProps.ctx.fillStyle = `rgba(255, 0, 0, ${1 - progress * 0.75})`;
        drawProps.ctx.fill();
      } else {
        this.setIsOutOfBounds(true);
      }
    }
  }

  get isHomingDisabled(): boolean {
    return (
      Date.now() < (this.homingDisabledUntil ?? 0) ||
      (this.target.isDead() && !this.impactTime)
    );
  }

  checkCollisionsWithProjectiles(): Projectile | null {
    const projectileCollision = super.checkCollisionsWithProjectiles();
    if (projectileCollision) {
      this.homingDisabledUntil = Date.now() + 1500;
    }
    return projectileCollision;
  }

  getPotentialTargets(): Creature[] {
    if (this.target.isAlive()) {
      return [this.target];
    }
    return super.getPotentialTargets();
  }

  applyDamageToCreature(creature: Creature): Creature | null {
    const hitTarget = super.applyDamageToCreature(creature);
    if (hitTarget) {
      this.impactTime = Date.now();
      this.setX(
        hitTarget.getX() + hitTarget.getWidth() / 2 - this.getWidth() / 2
      );
      this.setY(
        hitTarget.getY() + hitTarget.getHeight() / 2 - this.getHeight() / 2
      );
    }
    return hitTarget;
  }

  applyGravity(): void {
    if (this.isHomingDisabled) {
      super.applyGravity();
    }
    return;
  }

  applyMovement() {
    if (this.isHomingDisabled) {
      super.applyMovement();
      return;
    }
    const targetCenter: Coordinates = {
      x: this.target.getX() + this.target.getWidth() / 2,
      y: this.target.getY() + this.target.getHeight() / 2,
    };

    const accelerationProgress = Math.min(
      (Date.now() - this.createdTime) / this.accelerationTime,
      1
    );

    const currentMaxSpeed =
      this.maxSpeed * 0.15 + this.maxSpeed * 0.85 * accelerationProgress;

    // Calculate distances
    const dx = targetCenter.x - this.getX();
    const dy = targetCenter.y - this.getY();

    // Get optimal speed to reach target
    const angle = Math.atan2(dy, dx);
    const optimalSpeedX = Math.cos(angle) * Math.abs(currentMaxSpeed);
    const optimalSpeedY = Math.sin(angle) * Math.abs(currentMaxSpeed);

    // Get difference between optimal speed and current speed
    const speedDifferenceX = (optimalSpeedX - this.speedX) * this.agility;
    const speedDifferenceY = (optimalSpeedY - this.speedY) * this.agility;

    this.speedX += speedDifferenceX * this.getGame.updateFactor;

    this.speedY += speedDifferenceY * this.getGame.updateFactor;

    // ensure speed is within max speed
    if (Math.abs(this.speedX) > currentMaxSpeed) {
      this.speedX = currentMaxSpeed * Math.sign(this.speedX);
    }
    if (Math.abs(this.speedY) > currentMaxSpeed) {
      this.speedY = currentMaxSpeed * Math.sign(this.speedY);
    }

    // Move Projectile
    const xMovement = this.speedX * this.getGame.updateFactor;
    const yMovement = this.speedY * this.getGame.updateFactor;
    this.setX(this.getX() + xMovement);
    this.setY(this.getY() + yMovement);
  }
}
