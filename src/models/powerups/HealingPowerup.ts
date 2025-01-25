import { draw8BitHeart } from "../../renderFunctions/powerups/draw8BitHeart";
import { DrawUIElementProps } from "../UIElement";
import { InstantaneousPowerup, InstantaneousPowerupOptions } from "./Powerup";

interface HealingPowerupOptions extends InstantaneousPowerupOptions {
  healingAmount: number;
}

export class HealingPowerup extends InstantaneousPowerup {
  private healingAmount: number;

  constructor({ healingAmount, ...rest }: HealingPowerupOptions) {
    super({ ...rest });
    this.duration = 0; // Healing powerups are instantaneous
    this.healingAmount = healingAmount;
  }

  draw(drawProps: DrawUIElementProps): void {
    if (this.isActivated) {
      return;
    }

    super.draw(drawProps);
    draw8BitHeart({
      ctx: drawProps.ctx,
      width: this.getWidth(),
      height: this.getHeight(),
      startX: this.getXWithViewport,
      startY: this.getYWithViewport,
    });
  }

  applyEffect(): boolean {
    if (this.getGame.getAdventurer.heal(this.healingAmount)) {
      this.getGame.getAdventurer.setFloatingText(`+${this.healingAmount} HP`, 1000, "green");
      return super.applyEffect();
    }
    return false;
  }
}
