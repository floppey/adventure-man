import { getPlatformUnitIsOn } from "../../util/getPlatformUnitIsOn";
import { Unit } from "../../types/Unit";
import { canCreatureJumpToPlatform } from "../../util/creatureCanJumpToPlatform";
import { getBaseJumpSpeed } from "../../util/getBaseJumpSpeed";
import { Adventurer } from "../classes/Adventurer";
import { getTerminalVelocity } from "../../util/getTerminalVelocity";
import { Platform } from "../platforms/Platform";
import { UIElementOptions } from "../UIElement";
import { Cooldown } from "../../types/Cooldown";

export type MovementType = "walking" | "climbing" | "crouching" | "flying";

declare global {
  interface Window {
    maxY?: number;
  }
}
export type Direction = "left" | "right" | "none";
export type DirectionY = "up" | "down" | "none";

export interface CreatureOptions extends UIElementOptions {
  maxSpeedX: number;
  speedY: number;
  accelerationFactor?: number;
  gravity: number;
  directionX: Direction;
  directionY: DirectionY;
  movementType: MovementType;
  hitpoints: number;
  armor: number;
  attackPower: number;
  attackDuration: number;
  attackCooldown: number;
  jumpCount?: number;
}

export class Creature extends Unit {
  private jumpCount: number = 0;
  private maxJumpCount: number = 2;
  private platform: Platform | null = null;
  private lastPlatform: Platform | null = null;
  private directionX: Direction;
  private directionY: DirectionY;
  private lastDirection: Direction = "none";
  private lastAttack: number = 0;
  private perfectDoubleJump: boolean = false;
  timeOfDeath: number | null = null;
  maxSpeedX: number;
  speedX: number = 0;
  speedY: number;
  gravity: number;
  movementType: MovementType;
  hitpoints: number;
  maxHitpoints: number;
  armor: number;
  temporaryInvincibility: number = 0;
  attackPower: number;
  attackCooldown: number;
  attackDuration: number;
  attackChargeStart: number | null = null;
  accelerationFactor: number = 1;
  dealsContactDamage: boolean = false;
  lastAction: number = Date.now();

  constructor({
    maxSpeedX,
    speedY,
    accelerationFactor,
    gravity,
    directionX,
    directionY,
    movementType,
    hitpoints,
    armor,
    attackPower,
    attackCooldown,
    attackDuration,
    jumpCount,
    ...rest
  }: CreatureOptions) {
    super({
      ...rest,
    });
    this.maxSpeedX = maxSpeedX;
    this.speedY = speedY;
    this.gravity = gravity;
    this.directionX = directionX;
    this.directionY = directionY;
    this.movementType = movementType;
    this.hitpoints = hitpoints;
    this.maxHitpoints = hitpoints;
    this.armor = armor;
    this.attackPower = attackPower;
    this.attackCooldown = attackCooldown;
    this.attackDuration = attackDuration;
    this.jumpCount = jumpCount ?? 0;
    if (accelerationFactor) {
      this.accelerationFactor = accelerationFactor;
    }
  }

  get remainingAttackCooldown(): Cooldown {
    const remaining = Math.max(
      0,
      this.lastAttack + this.attackCooldown - Date.now()
    );
    return {
      remaining,
      total: this.attackCooldown,
      percentage: remaining / this.attackCooldown,
    };
  }

  reverseDirectionX() {
    if (this.directionX === "left") {
      this.directionX = "right";
    } else if (this.directionX === "right") {
      this.directionX = "left";
    }
  }

  setDirectionX(direction: Direction) {
    if (this.directionX === direction) {
      return;
    }
    this.lastDirection = this.directionX;
    this.directionX = direction;
  }

  getDirectionX() {
    return this.directionX;
  }

  setDirectionY(direction: DirectionY) {
    this.directionY = direction;
  }

  getDirectionY() {
    return this.directionY;
  }

  getLastDirection() {
    return this.lastDirection;
  }

  setPlatform(platform: Platform | null) {
    if (this.platform !== null) {
      this.lastPlatform = this.platform;
    }
    this.platform = platform;
  }

  getPlatform(fallbackToLast = false) {
    if (fallbackToLast) {
      return this.platform ?? this.lastPlatform;
    }
    return this.platform;
  }

  getLastAttack() {
    return this.lastAttack;
  }

  setLastAttack(time = Date.now(), randomOffset = false) {
    let lastAttackTime = time;
    if (randomOffset) {
      lastAttackTime += Math.random() * this.attackCooldown;
    }
    this.lastAttack = lastAttackTime;
    this.setLastAction(lastAttackTime);
  }

  setJumpCount(jumpCount: number) {
    this.jumpCount = jumpCount;
  }

  getJumpCount() {
    return this.jumpCount;
  }

  canJump() {
    return this.jumpCount < this.maxJumpCount;
  }

  jump(perfectDoubleJump = false) {
    if (this.canJump()) {
      this.perfectDoubleJump = perfectDoubleJump;
      this.speedY = getBaseJumpSpeed(
        this.getGame.getViewportSize,
        this.jumpCount
      );
      this.jumpCount++;
      // Creature jumped
      this.setLastAction();
    }
  }

  isJumping() {
    return this.speedY < 0;
  }

  isFalling() {
    return this.speedY > 0;
  }

  canJumpToPlatform(platform: Platform) {
    return canCreatureJumpToPlatform(this, platform);
  }

  isAdventurer(): this is Adventurer {
    return false;
  }

  canAttack(): boolean {
    if (this.isAttacking() || this.isDead()) {
      return false;
    }
    return Date.now() - this.lastAttack > this.attackCooldown;
  }

  isAttacking(): boolean {
    return Date.now() - this.lastAttack < this.attackDuration;
  }

  heal(healing: number): boolean {
    if (this.hitpoints === this.maxHitpoints) {
      return false;
    }
    this.hitpoints = Math.min(this.hitpoints + healing, this.maxHitpoints);
    // Creature healed
    this.setLastAction();
    return true;
  }

  setLastAction(time = Date.now()) {
    this.lastAction = Math.max(this.lastAction, time);
  }

  /**
   *
   * @param damage The amount of pre mitigation damage to take
   * @returns true if the creature took damage, false if the creature blocked or avoided the damage
   */
  takeDamage(damage: number): boolean {
    const adjustedDamage = Number((damage * (1 - this.armor)).toFixed(0));
    const newHP = Math.max(0, this.hitpoints - adjustedDamage);
    this.hitpoints = newHP;

    this.setFloatingText(`-${adjustedDamage}`, 1000, "red", "black");

    if (this.hitpoints > 0) {
      this.temporaryInvincibility = Date.now() + 2000;
    } else {
      this.timeOfDeath = Date.now();
    }

    // Creature took damage
    this.setLastAction();

    return true;
  }

  isDead() {
    return this.hitpoints <= 0;
  }

  isAlive() {
    return this.hitpoints > 0;
  }

  isTemporaryInvincible() {
    return this.temporaryInvincibility > Date.now();
  }

  update() {
    this.applyGravity();
    this.applyMovement();
    super.update();
  }

  toggleCrouch() {
    if (this.movementType === "crouching") {
      this.movementType = "walking";
    } else {
      this.movementType = "crouching";
    }
    // Creature crouched
    this.setLastAction();
  }

  getDistanceFromBottom() {
    return this.getGame.getGameSize.height - this.getY() - this.getHeight();
  }

  applyMovement() {
    if (this.isDead()) {
      return;
    }

    let speedModifier = this.getPlatform()?.getSpeedMultiplier() ?? 1;
    if (this.movementType === "crouching") {
      speedModifier /= 2;
    }

    const hardCodedAccelerationFactor = 1 / 5;
    // Apply acceleration
    let acceleration = 0;
    const accelerationValue =
      this.maxSpeedX *
      this.accelerationFactor *
      this.getGame.updateFactor *
      hardCodedAccelerationFactor *
      (this.getPlatform()?.getAccelerationFactor() ?? 1);
    if (this.directionX === "right") {
      acceleration = accelerationValue;
    } else if (this.directionX === "left") {
      acceleration = accelerationValue * -1;
    } else if (this.directionX === "none") {
      if (this.speedX > 0) {
        acceleration = accelerationValue * -1;
      } else {
        acceleration = accelerationValue;
      }
      // if speedX is 0 or the acceleration would make speedX 0, set speedX to 0
      if (
        this.speedX === 0 ||
        Math.abs(this.speedX) - Math.abs(acceleration) <= 0
      ) {
        acceleration = 0;
        this.speedX = 0;
      }
    }

    // Limit speed to maxSpeedX or -maxSpeedX
    this.speedX = Math.max(
      -this.maxSpeedX,
      Math.min(this.maxSpeedX, this.speedX + acceleration)
    );

    // Move creature
    const xMovement = this.speedX * this.getGame.updateFactor * speedModifier;
    this.setX(this.getX() + xMovement);
    if (Math.abs(xMovement) > 0) {
      // Creature moved
      this.setLastAction();
    }

    // Prevent creature from going off screen
    // Hit the left wall
    if (this.getX() < 0) {
      this.setX(0);
      this.speedX = Math.max(0, this.speedX);
    }
    // Hit the right wall
    if (this.getX() + this.getWidth() > this.getGame.getGameSize.width) {
      this.setX(this.getGame.getGameSize.width - this.getWidth());
      this.speedX = Math.min(0, this.speedX);
    }
  }

  getGravity(): number {
    if (this.platform) {
      return 0;
    } else {
      return this.gravity;
    }
  }

  applyGravity() {
    const platform = getPlatformUnitIsOn(this, this.getGame.getPlatforms);
    this.setPlatform(platform ?? null);
    if (platform && this.speedY >= 0) {
      this.perfectDoubleJump = false;
      this.jumpCount = 0;
      this.speedY = 0;
      this.setY(platform.getY() - this.getHeight());
    } else if (!["climbing", "flying"].includes(this.movementType)) {
      const oldSpeedY = 0 + this.speedY;
      // Apply gravity to speedY
      const gravitySpeed = this.gravity * this.getGame.updateFactor;
      this.speedY = Math.min(
        this.speedY + gravitySpeed,
        getTerminalVelocity(this.getGame.getViewportSize)
      );

      this.setY(this.getY() + this.speedY * this.getGame.updateFactor);

      if (
        Math.sign(oldSpeedY) !== Math.sign(this.speedY) &&
        this.jumpCount > 0
      ) {
        if (this.perfectDoubleJump) {
          this.jump(true);
        }
      }
    }

    // Prevent creature from going off screen
    // Hit the ceiling
    if (this.getY() < 0) {
      this.setY(0);
      this.speedY = 0;
    }
    // Hit the floor
    if (this.getY() + this.getHeight() > this.getGame.getGameSize.height) {
      this.setY(this.getGame.getGameSize.height - this.getHeight());
      this.jumpCount = 0;
    }
  }
}
