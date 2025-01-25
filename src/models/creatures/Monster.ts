import { Creature, CreatureOptions, MovementType } from "./Creature";
import { Projectile } from "../projectiles/Projectile";
import { creaturesAreOnSamePlatform } from "../../util/creaturesAreOnSamePlatform";
import { creatureCanDropToPlatform } from "../../util/creatureCanDropToPlatform";
import { rangedAttackAimedAtCreature } from "../../attacks/rangedAttackAimedAtCreature";
import { renderGoblin } from "../../renderFunctions/monsters/renderGoblin";
import { renderSkeleton } from "../../renderFunctions/monsters/renderSkeleton";
import { DrawUIElementProps } from "../UIElement";
import { RangedAttack } from "../../attacks/types";
import { rangedAttackAimedAtCreatureWithMovementPrediction } from "../../attacks/rangedAttackAimedAtCreatureWithMovementPrediction";
import { homingRangedAttack } from "../../attacks/homingRangedAttack";

export type MonsterType = "goblin" | "orc" | "troll" | "archer" | "skeleton";

export type MonsterIntelligence = "dumb" | "normal" | "smart";

export type MonsterRangedAttack = "arrow" | "homingArrow";

interface MonsterOptions extends CreatureOptions {
  monster: MonsterType;
  intelligence: MonsterIntelligence;
  rangedAttack?: MonsterRangedAttack;
}

export interface MonsterTemplate {
  /** The monsters name */
  name: string;
  /** The monsters hitpoints */
  hitpoints: number;
  /** The monsters armor, this is a value between 0 and 1 which is applied multiplicatively to the damage a creature takes.
   * A creature with 0 armor takes full damage,
   * a creature with 0.5 armor takes half damage,
   * and a creature with 1 armor takes no damage.  */
  armor: number;
  /** The amount of damage a creature deals with it's attack */
  attackPower: number;
  /** The time in milliseconds between attacks */
  attackCooldown: number;
  /** The time in milliseconds that the attack animation lasts */
  attackDuration: number;
  /** The width of the monster. This is a value that is multiplied with baseUnitSize and is usually 1 */
  width: number;
  /** The height of the monster. This is a value that is multiplied with baseUnitSize and is usually 1 */
  height: number;
  /** The y position of the top of the monster, the value is a percentage of the level height. 0 is at the top of the level and 1 is at the bottom. */
  y: number;
  /** The x position of the left side of the monster, the value is a percentage of the level width. 0 is at the left of the level and 1 is at the right. */
  x: number;
  /** The x-axis movement type of the monster, the value is applied multiplicatively to a base speed for monsters */
  speedX: number;
  /** The y-axis movement type of the monster, the value is applied multiplicatively to a base speed for monsters */
  speedY: number;
  /** The way the monster moves, e.g. walking or flying */
  movementType: MovementType;
  /** The type of monster */
  monster: MonsterType;
  /** The direction the monster is facing */
  directionX: "left" | "right" | "none";
  /** The monsters intelligence */
  intelligence: MonsterIntelligence;
  rangedAttack?: MonsterRangedAttack;
}

export class Monster extends Creature {
  monster: MonsterType;
  canBeJumpedOn: boolean;
  attackMode: "melee" | "ranged";
  lastThinkingBreak: number = Date.now();
  thinkingBreakInterval: number = 5000;
  thinkingBreakDuration: number = 500;
  lockedTarget: Creature | null = null;
  intelligence: MonsterIntelligence;
  rangedAttack: MonsterRangedAttack;

  constructor({
    monster,
    intelligence,
    rangedAttack = "arrow",
    ...rest
  }: MonsterOptions) {
    super({
      ...rest,
      uiElementType: "monster",
    });
    this.monster = monster;
    this.canBeJumpedOn = ["goblin", "archer"].includes(monster);
    this.attackMode = ["archer"].includes(monster) ? "ranged" : "melee";
    this.rangedAttack = rangedAttack;
    this.intelligence = intelligence;
    if (this.intelligence === "dumb") {
      this.thinkingBreakInterval = 5000;
      this.thinkingBreakDuration = 1000;
    } else if (this.intelligence === "normal") {
      this.thinkingBreakInterval = 3000;
      this.thinkingBreakDuration = 500;
    } else if (this.intelligence === "smart") {
      this.thinkingBreakInterval = 1000;
      this.thinkingBreakDuration = 250;
    }
  }

  draw(drawProps: DrawUIElementProps): void {
    const { ctx } = drawProps;

    const xWithViewport = this.getXWithViewport;
    const yWithViewport = this.getYWithViewport;

    // Pulsing opacity if temporary invincible
    if (this.isTemporaryInvincible()) {
      const now = Date.now();
      const opacity = Math.sin(((now % 250) / 250) * Math.PI);
      ctx.globalAlpha = opacity;
    }

    if (this.lockedTarget) {
      // set red filter for locked target
      ctx.filter = "hue-rotate(90deg)"; // TODO: Fix this
    } else if (!["goblin", "skeleton"].includes(this.monster)) {
      // set black and white filter for non-goblin monsters
      ctx.filter = "grayscale(100%)";
    }

    if (this.monster === "goblin") {
      renderGoblin(this, ctx);
    } else if (this.monster === "skeleton") {
      renderSkeleton(this, ctx);
    } else {
      renderGoblin(this, ctx);
    }
    ctx.filter = "none";
    ctx.globalAlpha = 1;
    // Draw health bar
    const hpPercentage = this.hitpoints / this.maxHitpoints;
    ctx.fillStyle = "red";
    ctx.fillRect(
      xWithViewport,
      yWithViewport - 10,
      this.getWidth() * hpPercentage,
      5
    );

    super.draw(drawProps);
  }

  update(): void {
    this.think();
    super.update();
  }

  isThinking() {
    return Date.now() - this.lastThinkingBreak < this.thinkingBreakDuration;
  }
  isDoneThinking() {
    return Date.now() - this.lastThinkingBreak > this.thinkingBreakInterval;
  }

  think() {
    if (this.isDead()) {
      this.lockedTarget = null;
      return;
    }
    const adventurer = this.getGame.getAdventurer;
    if (this.lockedTarget && this.lockedTarget.isDead()) {
      this.lockedTarget = null;
    }
    const now = Date.now();
    const needsToThink =
      this.lockedTarget === null ||
      !creaturesAreOnSamePlatform(this, this.lockedTarget, true);

    // Thinking break
    if (needsToThink && this.isThinking()) {
      this.setDirectionX("none");
      this.setDirectionY("none");
    } else if (needsToThink && this.isDoneThinking()) {
      this.lastThinkingBreak = now;

      // Melee monsters will always move towards adventurer
      if (
        this.attackMode === "melee" &&
        adventurer.isAlive() &&
        (creaturesAreOnSamePlatform(this, adventurer, true) ||
          creatureCanDropToPlatform(this, adventurer.getPlatform(true)))
      ) {
        this.lockedTarget = adventurer;
      }
      // random chance to change direction
      else {
        this.lockedTarget = null;
        if (this.getDirectionX() === "none") {
          this.setDirectionX(Math.random() > 0.5 ? "left" : "right");
        } else if (Math.random() > 0.75) {
          this.reverseDirectionX();
        }
      }
    }

    if (!this.isThinking()) {
      if (this.canAttack() && adventurer?.isAlive()) {
        if (this.attackMode === "melee") {
          this.attack(adventurer);
        } else if (this.attackMode === "ranged") {
          const newProjectiles = this.attack(adventurer) ?? [];
          newProjectiles.forEach((projectile) => {
            this.getGame.addProjectile(projectile);
          });
        }
      }

      if (!this.isAttacking()) {
        if (this.getDirectionX() === "none") {
          this.setDirectionX(this.getLastDirection());
        }
        this.setMovementDirection();
      }
    }
  }

  moveTowardsTarget() {
    if (!this.lockedTarget) {
      return;
    }
    if (this.getX() + this.getWidth() < this.lockedTarget.getX()) {
      this.setDirectionX("right");
    } else if (
      this.getX() >
      this.lockedTarget.getX() + this.lockedTarget.getWidth()
    ) {
      this.setDirectionX("left");
    } else {
      this.setDirectionX("none");
    }
  }

  isWithinMeleeRange(target: Creature): boolean {
    // Return false if target is not on the same platform
    if (!creaturesAreOnSamePlatform(this, target)) {
      return false;
    }

    const monsterLeft = this.getX();
    const monsterRight = this.getX() + this.getWidth();
    const reach = this.getWidth() / 2;
    const targetLeft = target.getX();
    const targetRight = target.getX() + target.getWidth();

    const directionToTarget = target.getX() > this.getX() ? "right" : "left";

    const canAttack =
      monsterLeft - reach <= targetRight && monsterRight + reach >= targetLeft;

    if (canAttack) {
      this.setDirectionX(directionToTarget);
    }

    return canAttack;
  }

  attack(target: Creature): Projectile[] | undefined {
    if (!this.canAttack()) {
      return;
    }
    if (this.attackMode === "melee") {
      if (this.isWithinMeleeRange(target)) {
        target.takeDamage(this.attackPower);
        this.setLastAttack();
      }
    } else if (
      this.attackMode === "ranged" &&
      this.rangedAttack === "homingArrow"
    ) {
      const projectile = homingRangedAttack({
        self: this,
        target,
        chargePercent: Math.random() * 0.5,
      });

      this.setLastAttack();
      if (projectile) {
        return [projectile];
      }
    } else if (this.attackMode === "ranged") {
      const rangedAttacks: Record<MonsterIntelligence, RangedAttack> = {
        dumb: rangedAttackAimedAtCreature,
        normal: rangedAttackAimedAtCreature,
        smart: rangedAttackAimedAtCreatureWithMovementPrediction,
      };

      const projectile = rangedAttacks[this.intelligence]({
        self: this,
        target,
        chargePercent: Math.random() * 0.5,
      });

      this.setLastAttack();
      if (projectile) {
        return [projectile];
      }
    }
  }

  setMovementDirection() {
    if (this.isDead() || this.isTemporaryInvincible()) {
      this.setDirectionX("none");
      this.setDirectionY("none");
      return;
    }
    const platform = this.getPlatform();
    if (this.lockedTarget) {
      this.moveTowardsTarget();
    }
    const targetPlatform = this.lockedTarget?.getPlatform(true) ?? null;
    if (this.lockedTarget && creatureCanDropToPlatform(this, targetPlatform)) {
      // Don't stop creature from moving off platform
    } else if (platform) {
      // Move unless at edge of platform, then turn around
      if (
        this.getDirectionX() === "right" &&
        this.getX() + this.getWidth() >= platform.getX() + platform.getWidth()
      ) {
        this.setDirectionX(this.lockedTarget ? "none" : "left");
      } else if (
        this.getDirectionX() === "left" &&
        this.getX() <= platform.getX()
      ) {
        this.setDirectionX(this.lockedTarget ? "none" : "right");
      }
    }
  }
}
