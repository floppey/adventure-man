import { renderArrow } from "../../canvasTools/renderArrow";
import { renderKnife } from "../../canvasTools/renderKnife";
import { DrawUIElementProps, UIElementOptions } from "../UIElement";
import { getPlatformUnitIsOn } from "../../util/getPlatformUnitIsOn";
import { getProjectileCollisions } from "../../util/getProjectileCollisions";
import { getTerminalVelocity } from "../../util/getTerminalVelocity";
import { getUnitCollisions } from "../../util/getUnitCollisions";
import { transferKineticEnergy } from "../../util/transferKineticEnergy";
import { Unit } from "../../types/Unit";
import { Platform } from "../platforms/Platform";
import { Creature } from "../creatures/Creature";

export type MovementType = "walking" | "climbing" | "crouching" | "flying";
export type ProjectileType = "arrow" | "knife" | "homing" | "bomb";
export type ProjectileColorTheme = "red" | "blue" | "green";
export interface ProjectileOptions extends UIElementOptions {
  speedX: number;
  speedY: number;
  gravity: number;
  attackPower: number;
  createdBy: number;
  type: ProjectileType;
  colorTheme: ProjectileColorTheme;
}

export class Projectile extends Unit {
  private createdBy: number;
  private outOfBounds: boolean = false;
  private attachedToPlatform: Platform | null = null;
  private attachedToCreature: Creature | null = null;
  private despawnDuration: number = 10000;
  private despawnTime: number | null = null;
  // Used to prevent multiple hits on the same creature that has dodged
  private missedCreature: number | null = null;
  projectileMass: number = 1;
  speedX: number;
  speedY: number;
  gravity: number;
  attackPower: number;
  type: ProjectileType;
  colorTheme: ProjectileColorTheme;

  constructor({
    createdBy,
    speedX,
    speedY,
    gravity,
    attackPower,
    type,
    colorTheme,
    ...rest
  }: ProjectileOptions) {
    super({
      ...rest,
      uiElementType: "projectile",
    });
    this.createdBy = createdBy;
    this.speedX = speedX;
    this.speedY = speedY;
    this.gravity = gravity;
    this.attackPower = attackPower;
    this.type = type;
    this.colorTheme = colorTheme;
  }

  isOutOfBounds() {
    return this.outOfBounds;
  }

  setIsOutOfBounds(value: boolean) {
    this.outOfBounds = value;
  }

  private checkCollisions(): boolean {
    if (
      this.attachedToCreature ||
      this.attachedToPlatform ||
      this.outOfBounds
    ) {
      return false;
    }

    if (this.checkCollisionsWithPlatforms()) {
      return true;
    }
    if (this.checkCollisionsWithCreatures()) {
      return true;
    }

    if (this.checkCollisionsWithProjectiles()) {
      return true;
    }

    return false;
  }

  private checkCollisionsWithPlatforms() {
    const platform = getPlatformUnitIsOn(this, this.getGame.getPlatforms);
    // Hit a platform
    if (platform) {
      this.attachedToPlatform = platform;
      this.despawnTime = Date.now() + this.despawnDuration;
    }
    return platform;
  }

  applyDamageToCreature(creature: Creature): Creature | null {
    const hitTarget = creature.takeDamage(this.attackPower);
    if (!hitTarget) {
      this.missedCreature = creature.getId();
      return null;
    }
    if (creature.isAlive()) {
      this.attachedToCreature = creature;
      this.despawnTime = Date.now() + this.despawnDuration;
      this.speedX = 0;
      this.speedY = 0;
    } else {
      this.speedX = this.speedX / 10;
      this.speedY = this.speedY / 10;
    }
    return creature;
  }

  private lootByAdventurer(): boolean {
    if (!this.attachedToPlatform) {
      return false;
    }
    const adventurerUnit = getUnitCollisions(this, [
      this.getGame.getAdventurer,
    ])?.[0];
    const looted =
      adventurerUnit?.addAmmo({
        type: this.type,
        colorTheme: this.colorTheme,
      }) ?? false;
    if (looted) {
      this.outOfBounds = true;
    }
    return looted;
  }

  getPotentialTargets(): Creature[] {
    return this.getGame.getCreatures.filter(
      (unit) =>
        unit.isAlive() &&
        unit.getId() !== this.missedCreature &&
        unit.getId() !== this.createdBy
    );
  }

  private checkCollisionsWithCreatures(): Creature | null {
    const creatures = this.getPotentialTargets();
    const targets = getUnitCollisions(this, creatures).filter(
      (unit) => unit.getId() !== this.createdBy
    );

    if (targets.length === 0) {
      return null;
    }

    return this.applyDamageToCreature(targets[0]);
  }

  checkCollisionsWithProjectiles(): Projectile | null {
    const projectileCollison = getProjectileCollisions(
      this,
      this.getGame.getProjectiles.filter(
        (projectile) =>
          !projectile.attachedToPlatform && !projectile.attachedToCreature
      )
    );
    if (projectileCollison) {
      transferKineticEnergy(this, projectileCollison);
    }
    return projectileCollison;
  }

  private checkGameBounds() {
    if (this.outOfBounds) {
      return;
    }
    // Hit the left wall
    if (this.getX() < 0) {
      this.setX(0);
      this.outOfBounds = true;
      return;
    }
    // Hit the right wall
    if (this.getX() + this.getWidth() > this.getGame.getGameSize.width) {
      this.setX(this.getGame.getGameSize.width - this.getWidth());
      this.outOfBounds = true;
      return;
    }
  }

  get attachedPlatform() {
    return this.attachedToPlatform;
  }

  update() {
    // Clean up if attached to a creature that has died
    if (this.attachedToCreature?.isDead()) {
      this.attachedToCreature = null;
      this.despawnTime = null;
    }

    const collision = this.checkCollisions();

    if (!collision) {
      this.checkGameBounds();
    }

    if (this.lootByAdventurer()) {
      return;
    }

    if (
      !this.attachedToPlatform &&
      !this.outOfBounds &&
      !this.attachedToCreature
    ) {
      this.applyGravity();
      this.applyMovement();
      this.setAngle = Math.atan2(this.speedY, this.speedX);
    }

    // Move with creature
    if (this.attachedToCreature?.isAlive()) {
      const xBase = this.attachedToCreature.getX();
      const yBase =
        this.attachedToCreature.getY() +
        this.attachedToCreature.getHeight() / 2;
      const xOffset =
        Math.cos(this.getAngle) * (this.attachedToCreature.getWidth() / 2);
      const yOffset =
        Math.sin(this.getAngle) * (this.attachedToCreature.getHeight() / 2);
      this.setX(xBase - xOffset);
      this.setY(yBase - yOffset);
    }

    // Despawn
    if (this.despawnTime && Date.now() > this.despawnTime) {
      this.outOfBounds = true;
      this.despawnTime = null;
    }

    super.update();
  }

  draw(drawProps: DrawUIElementProps): void {
    if (this.outOfBounds) {
      return;
    }

    const { ctx } = drawProps;

    const xWithViewport = this.getXWithViewport;
    const yWithViewport = this.getYWithViewport;

    let rendered = false;
    ctx.save();

    if (this.despawnTime) {
      const timeToDespawn = this.despawnTime - Date.now();
      if (timeToDespawn < this.despawnDuration * 0.25) {
        const opacity = Math.sin(((timeToDespawn % 250) / 250) * Math.PI);
        ctx.globalAlpha = opacity;
      }
    }

    // Move to center of projectile
    ctx.translate(
      xWithViewport + this.getWidth() / 2,
      yWithViewport + this.getHeight() / 2
    );

    ctx.rotate(this.getAngle);

    if (this.type === "knife") {
      renderKnife({
        ctx,
        width: this.getWidth(),
        colorTheme: this.colorTheme,
      });
      rendered = true;
    } else if (this.type === "arrow" || this.type === "homing") {
      renderArrow({
        ctx,
        width: this.getWidth(),
        colorTheme: this.colorTheme,
      });
      rendered = true;
    }
    ctx.restore();
    if (!rendered) {
      ctx.fillStyle = "black";
      ctx.beginPath();
      ctx.moveTo(this.hitbox.topLeft.x, this.hitbox.topLeft.y);
      ctx.lineTo(this.hitbox.topRight.x, this.hitbox.topRight.y);
      ctx.lineTo(this.hitbox.bottomRight.x, this.hitbox.bottomRight.y);
      ctx.lineTo(this.hitbox.bottomLeft.x, this.hitbox.bottomLeft.y);
      ctx.closePath();
      ctx.fill();
    }
    super.draw(drawProps);
  }

  applyMovement() {
    // Move Projectile
    const xMovement = this.speedX * this.getGame.updateFactor;
    this.setX(this.getX() + xMovement);
  }

  applyGravity() {
    // Apply gravity to speedY
    const gravitySpeed = this.gravity * this.getGame.updateFactor;
    this.speedY = Math.min(
      this.speedY + gravitySpeed,
      getTerminalVelocity(this.getGame.getViewportSize)
    );

    this.setY(this.getY() + this.speedY * this.getGame.updateFactor);
  }
}
