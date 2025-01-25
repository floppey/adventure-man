import { Unit } from "../../types/Unit";
import { getUnitCollisions } from "../../util/getUnitCollisions";
import { DrawUIElementProps, UIElementOptions } from "../UIElement";

export interface PowerupOptions extends UIElementOptions {
  /** Duration in milliseconds, or null for instantanious effects */
  duration?: number | null;
}

export class Powerup extends Unit {
  private activatedAt: number | null = null;
  private yOffset: number;
  activated: boolean = true;
  /** Duration in milliseconds, or null for instantanious effects */
  duration: number | null;

  constructor({ duration, ...rest }: PowerupOptions) {
    super({ ...rest, uiElementType: "powerup" });
    this.duration = duration ?? null;
    this.yOffset = 0;
  }

  get getYWithViewport(): number {
    return super.getYWithViewport + this.yOffset;
  }

  get isActivated(): boolean {
    return (
      this.activated &&
      this.activatedAt !== null &&
      (!this.duration || Date.now() - this.activatedAt < this.duration)
    );
  }

  getY(): number {
    return super.getY() + this.yOffset;
  }

  draw(drawProps: DrawUIElementProps): void {
    if (this.isActivated) {
      return;
    }

    super.draw(drawProps);
  }

  update(): void {
    if (this.isActivated) {
      return;
    }
    const collision = getUnitCollisions(this, [this.getGame.getAdventurer]);
    if (collision.length > 0) {
      this.applyEffect();
    }
    // Make the powerup bob up and down slightly, over 2 seconds
    this.yOffset =
      (Math.sin(Date.now() / 1000) * this.getGame.baseUnitSize) / 8;
  }

  applyEffect(): boolean {
    this.activatedAt = Date.now();
    return true;
  }

  get isActive(): boolean {
    return this.activated;
  }
}

export interface InstantaneousPowerupOptions
  extends Omit<PowerupOptions, "duration"> {
  duration?: null;
}

export class InstantaneousPowerup extends Powerup {
  constructor(options: InstantaneousPowerupOptions) {
    super({ ...options, duration: null });
  }
}
