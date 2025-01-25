import { Item } from "../items/Item";
import { DrawUIElementProps } from "../UIElement";
import { InstantaneousPowerup, InstantaneousPowerupOptions } from "./Powerup";

interface ItemPowerupOptions extends InstantaneousPowerupOptions {
    item: Item;
}

export class ItemPowerup extends InstantaneousPowerup {
    private item: Item;

    constructor({ item, ...rest }: ItemPowerupOptions) {
        super({ ...rest });
        this.duration = 0; // Item powerups are instantaneous
        this.item = item;
    }

    draw(drawProps: DrawUIElementProps): void {
        if (this.isActivated) {
            return;
        }
        super.draw(drawProps);

        this.item.setX(this.getX());
        this.item.setY(this.getY());
        this.item.setWidth(this.getWidth());
        this.item.setHeight(this.getHeight());
        console.log(this.item.getWidth());
        this.item.draw(drawProps);
    }

    applyEffect(): boolean {

        if (this.getGame.getAdventurer.addItem(this.item)) {
            this.getGame.getAdventurer.setFloatingText(`+${this.item.name}`, 1000, "green");
            return super.applyEffect();
        }
        return false;
    }
}
