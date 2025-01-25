import { getCreaturesWithinRadius } from "../../util/getCreaturesWithinRadius";
import { Creature } from "../creatures/Creature";
import { DrawUIElementProps } from "../UIElement";
import { Projectile, ProjectileOptions } from "./Projectile";

interface BombProjectileOptions extends ProjectileOptions {
  explosionSize?: number;
}

export class BombProjectile extends Projectile {
  private explosionSize: number;
  private detonated: number | null = null;
  private detonationDuration: number = 250;

  constructor({ explosionSize, ...rest }: BombProjectileOptions) {
    super(rest);
    this.type = "bomb";
    this.explosionSize = explosionSize ?? 2;
    this.projectileMass = 5;
    this.setHeight(this.getGame.baseUnitSize / 2);
    this.setWidth(this.getGame.baseUnitSize / 2);
  }

  draw(drawProps: DrawUIElementProps): void {
    if (!this.detonated) {
      super.draw(drawProps);
    }

    // Draw explosion as a half circle
    if (this.detonated) {
      const timeSinceDetonation = Date.now() - this.detonated;
      if (timeSinceDetonation <= this.detonationDuration) {
        const progress = timeSinceDetonation / this.detonationDuration;
        const explosionRadius =
          this.explosionSize * this.getGame.baseUnitSize * progress;
        drawProps.ctx.beginPath();
        drawProps.ctx.arc(
          this.getXWithViewport + this.getWidth() / 2,
          this.getYWithViewport + this.getHeight(),
          explosionRadius,
          Math.PI,
          Math.PI * 2
        );
        drawProps.ctx.fillStyle = `rgba(255, 0, 0, ${1 - progress * 0.75})`;
        drawProps.ctx.fill();
      }
    }
  }

  update(): void {
    super.update();
    if (this.attachedPlatform && !this.detonated) {
      this.detonate();
      const affectedCreatures = getCreaturesWithinRadius(
        this.centerCoordinates,
        this.explosionSize * this.getGame.baseUnitSize,
        this.getGame.getCreatures
      );
      affectedCreatures.forEach((creature) => {
        creature.takeDamage(this.attackPower);
      });
    }
  }

  detonate(): void {
    this.detonated = Date.now();
  }

  getPotentialTargets(): Creature[] {
    return [];
  }
}
