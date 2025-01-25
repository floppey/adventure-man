import { getUnitCollisions } from "../../util/getUnitCollisions";
import { Creature, CreatureOptions } from "../creatures/Creature";
import {
  Projectile,
  ProjectileColorTheme,
  ProjectileType,
} from "../projectiles/Projectile";
import { manualRangedAttack } from "../../attacks/manualRangedAttack";
import { renderRogue } from "../../renderFunctions/renderRogue";
import { DrawUIElementProps } from "../UIElement";
import { homingRangedAttack } from "../../attacks/homingRangedAttack";
import { Cooldown } from "../../types/Cooldown";
import { getClosesCreatureToCoordinates } from "../../util/getClosestCreatureToCoordinates";
import { Item, ItemSlot, Weapon } from "../items/Item";

interface AdventurerOptions extends CreatureOptions {
  name: string;
  adventurerClass: AdventurerClass;
}

type AdventurerClass = "rogue" | "warrior" | "mage";
interface Ammo {
  type: ProjectileType;
  colorTheme: ProjectileColorTheme;
}

export type SpecialAbilities = "Guided Arrow" | "Bomb";

interface SpecialAbility {
  name: string;
  cooldown: number;
  lastUsed: number;
  activate: () => Projectile | null;
}

export class Adventurer extends Creature {
  adventurerClass: AdventurerClass;
  equipment: Partial<Record<ItemSlot, Item>> = {};
  inventory: Item[] = [];
  specialAbilities: Record<SpecialAbilities, SpecialAbility> = {
    "Guided Arrow": {
      name: "Guided Arrow",
      cooldown: 10000,
      lastUsed: 0,
      activate: () => this.fireHomingArrow(),
    },
    Bomb: {
      name: "Bomb",
      cooldown: 15000,
      lastUsed: 0,
      activate: () => this.throwBomb(),
    },
  };
  ammo: Ammo[] = [];
  private allowedAmmoTypes: ProjectileType[] = ["arrow", "knife"];
  private maxAmmo: number = 5;
  lastAmmoRecharge: number = Date.now();

  constructor({ adventurerClass, ...rest }: AdventurerOptions) {
    super({
      ...rest,
      uiElementType: "adventurer",
    });
    this.adventurerClass = adventurerClass;
    this.equipItem("mainHand", new Weapon({
      game: rest.game,
      name: "Simple Bow",
      slot: "mainHand",
      rarity: "common",
      attackPower: rest.attackPower,
      attackDuration: rest.attackDuration,
      attackCooldown: rest.attackCooldown,
      weaponType: "bow",
    }));
  }

  equipItem(slot: ItemSlot, item: Item): boolean {
    if (item.slot !== slot) {
      return false;
    }
    this.equipment[slot] = item;
    if (slot === "mainHand" && item instanceof Weapon) {
      this.attackCooldown = item.attackCooldown;
      this.attackDuration = item.attackDuration;
      this.attackPower = item.attackPower;

      const allowedAmmo: ProjectileType[] = [];
      if (item.weaponType === "bow") {
        allowedAmmo.push("arrow");
      }
      if (item.weaponType === "dagger") {
        allowedAmmo.push("knife");
      }
      this.allowedAmmoTypes = allowedAmmo;
      this.resetAmmo();
    }
    return true;
  }

  addItem(Item: Item): boolean {
    if (this.equipment[Item.slot] === undefined) {
      return this.equipItem(Item.slot, Item);
    }
    this.inventory.push(Item);
    return true;
  }

  resetAmmo() {
    const newAmmo: Ammo[] = [];
    const amount = Math.ceil(this.maxAmmo / 2);

    for (let i = 0; i < amount; i++) {
      newAmmo.push({
        type: this.allowedAmmoTypes[Math.floor(Math.random() * this.allowedAmmoTypes.length)],
        colorTheme: "green",
      });
    }

    this.ammo = newAmmo;
  }

  canUseSpecialAbility(specialAbility: SpecialAbilities): boolean {
    if (this.isDead()) {
      return false;
    }
    const ability = this.specialAbilities[specialAbility];
    if (ability && ability.lastUsed < Date.now() - ability.cooldown) {
      return true;
    }
    return false;
  }

  getSpecialAbilityCooldown(specialAbility: SpecialAbilities): Cooldown {
    const ability = this.specialAbilities[specialAbility];
    const remaining = Math.max(
      0,
      ability.lastUsed + ability.cooldown - Date.now()
    );

    return {
      remaining,
      total: ability.cooldown,
      percentage: remaining / ability.cooldown,
    };
  }

  useSpecialAbility(specialAbility: SpecialAbilities): Projectile | null {
    if (this.canUseSpecialAbility(specialAbility)) {
      const ability = this.specialAbilities[specialAbility];
      ability.lastUsed = Date.now();
      return ability.activate();
    }
    return null;
  }

  private throwBomb(): Projectile | null {
    const projectile = manualRangedAttack({
      self: this,
      chargePercent: 0,
      attackPowerOverride: this.attackPower * 3,
      target: this.getGame.getMousePosition,
      projectileType: "bomb",
      colorTheme: "red",
    });

    return projectile;
  }

  private fireHomingArrow(): Projectile | null {
    const monster = getClosesCreatureToCoordinates(
      this.getGame.getMousePosition,
      this.getGame.getCreatures.filter(
        (creature) => creature.isAlive() && creature.isAdventurer() === false
      )
    );

    if (!monster) {
      return null;
    }

    const projectile = homingRangedAttack({
      self: this,
      target: monster,
      projectileType: "arrow",
      colorTheme: "blue",
      chargePercent: 1,
    });

    return projectile;
  }

  chargeRangedAttack(): void {
    if (!this.canAttack()) {
      return;
    }
    if (!this.attackChargeStart) {
      this.attackChargeStart = Date.now();
    }
  }

  addAmmo(ammo: Ammo): boolean {
    if (
      this.ammo.length < this.maxAmmo &&
      this.allowedAmmoTypes.includes(ammo.type)
    ) {
      this.ammo.push(ammo);
      return true;
    }
    return false;
  }

  canAttack(): boolean {
    if (this.ammo.length <= 0) {
      const timeUntilRecharge = Math.min(
        3000 - (Date.now() - this.lastAmmoRecharge),
        1000
      );
      this.setFloatingText("Out of ammo!", timeUntilRecharge);
      return false;
    }
    return super.canAttack();
  }

  jump(perfectDoubleJump = false) {
    super.jump(perfectDoubleJump);
  }

  rangedMouseAttack(): Projectile | null {
    if (!this.canAttack()) {
      return null;
    }

    // Charge time is between 0 and 2000ms
    const minChargeTime = 1;
    const maxChargeTime = 1500;
    const chargeTime = this.attackChargeStart
      ? Date.now() - this.attackChargeStart
      : 0;
    const chargePercent = Math.min(
      1,
      (chargeTime - minChargeTime) / (maxChargeTime - minChargeTime)
    );

    const { colorTheme, type: projectileType } = this.ammo.shift() as Ammo;

    const projectile = manualRangedAttack({
      self: this,
      chargePercent,
      target: this.getGame.getMousePosition,
      projectileType,
      colorTheme: colorTheme,
    });

    this.setLastAttack(Date.now());
    this.attackChargeStart = null;

    return projectile;
  }

  update() {
    const creatures = this.getGame.getCreatures;
    const unitCollisions = getUnitCollisions(this, creatures);
    unitCollisions.forEach((monster) => {
      if (!this.isTemporaryInvincible()) {
        if (monster.dealsContactDamage) {
          this.takeDamage(monster.attackPower);
        }
      }
    });
    if (this.lastAmmoRecharge < Date.now() - 3000) {
      this.lastAmmoRecharge = Date.now();
      if (this.ammo.length < 3) {
        this.ammo.push({
          type: this.allowedAmmoTypes[Math.floor(Math.random() * this.allowedAmmoTypes.length)],
          colorTheme: "green",
        });
      }
    }

    const moveLeft =
      this.getGame.getPressedKeys[65] || // keycode for a
      this.getGame.getPressedKeys[37]; // keycode for left arrow

    const moveRight =
      this.getGame.getPressedKeys[68] || // keycode for d
      this.getGame.getPressedKeys[39]; // keycode for right arrow

    const moveUp =
      this.getGame.getPressedKeys[87] || // keycode for w
      this.getGame.getPressedKeys[38]; // keycode for up arrow

    const moveDown =
      this.getGame.getPressedKeys[83] || // keycode for s
      this.getGame.getPressedKeys[40]; // keycode for down arrow

    if (moveLeft && !moveRight) {
      this.setDirectionX("left");
    } else if (moveRight) {
      this.setDirectionX("right");
    } else {
      this.setDirectionX("none");
    }

    if (moveUp && !moveDown) {
      this.setDirectionY("up");
    } else if (moveDown) {
      this.setDirectionY("down");
    } else {
      this.setDirectionY("none");
    }

    super.update();
  }

  draw(drawProps: DrawUIElementProps): void {
    const { ctx } = drawProps;
    const xWithViewport = this.getXWithViewport;
    const yWithViewport = this.getYWithViewport;

    if (this.getGame.isDebug) {
      // Draw x and y speed
      ctx.fillStyle = "black";
      ctx.font = "12px Arial";
      ctx.fillText(
        `Speed: (${this.speedX.toFixed(2)}, ${this.speedY.toFixed(2)})`,
        xWithViewport,
        yWithViewport - 10
      );
    }

    // Pulsing opacity if temporary invincible
    if (this.isTemporaryInvincible()) {
      const now = Date.now();
      const opacity = Math.sin(((now % 250) / 250) * Math.PI);
      ctx.globalAlpha = opacity;
    }

    renderRogue(this, ctx);

    ctx.globalAlpha = 1;

    // draw charge bar
    if (this.attackChargeStart) {
      const chargeTime = Date.now() - this.attackChargeStart;
      const chargePercent = Math.min(1, chargeTime / 1500);
      if (chargePercent < 0.2) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      } else if (chargePercent < 0.4) {
        ctx.fillStyle = "rgba(255, 255, 0, 0.5)";
      } else if (chargePercent < 0.6) {
        ctx.fillStyle = "rgba(255, 165, 0, 0.5)";
      } else {
        ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
      }

      const baseHeight = this.getHeight() / 10;

      ctx.fillRect(
        xWithViewport,
        yWithViewport - baseHeight * 2 - baseHeight * chargePercent,
        this.getWidth() * chargePercent,
        baseHeight + baseHeight * chargePercent
      );
    }

    super.draw(drawProps);
  }
  takeDamage(damage: number): boolean {
    // Rogue has a 50% chance to dodge
    if (this.adventurerClass === "rogue" && Math.random() < 0.5) {
      this.setFloatingText("Dodge!", 1000);
      return false;
    }
    const tookDamage = super.takeDamage(damage);
    if (this.isDead()) {
      this.getGame.setGameOver = true;
    }
    return tookDamage;
  }

  isAdventurer(): this is Adventurer {
    return true;
  }
}
