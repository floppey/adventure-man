import { Game } from "../../Game";
import { DrawUIElementProps, UIElement, UIElementOptions } from "../UIElement";

export type ItemType = 'weapon' | 'armor' | 'consumable' | 'misc';

export type ItemSlot = 'head' | 'chest' | 'legs' | 'feet' | 'hands' | 'mainHand' | 'offHand' | 'ring' | 'necklace';

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface InitItemProps extends Omit<UIElementOptions, 'height' | 'width' | 'x' | 'y'> {
    game: Game;
    name: string;
    itemType: ItemType;
    slot: ItemSlot;
    rarity: ItemRarity;
}

export class Item extends UIElement {
    itemType: ItemType;
    slot: ItemSlot;
    rarity: ItemRarity;

    constructor({ itemType, slot, rarity, ...rest }: InitItemProps) {
        super({ ...rest, uiElementType: 'item', height: rest.game.baseUnitSize, width: rest.game.baseUnitSize, x: 0, y: 0 });
        this.itemType = itemType;
        this.slot = slot;
        this.rarity = rarity;
    }

    draw({ ctx }: DrawUIElementProps) {
        super.draw({ ctx });
    }
}

export interface InitWeaponProps extends Omit<InitItemProps, 'itemType'> {
    weaponType: WeaponType;
    attackPower: number;
    attackDuration: number;
    attackCooldown: number;
}

export type WeaponType = 'dagger' | 'bow' | 'wand';

export class Weapon extends Item {
    attackPower: number;
    attackDuration: number;
    attackCooldown: number;
    weaponType: WeaponType;

    constructor({ attackPower, attackCooldown, attackDuration, weaponType, ...rest }: InitWeaponProps) {
        super({ ...rest, itemType: 'weapon' });
        this.attackPower = attackPower;
        this.attackDuration = attackDuration;
        this.attackCooldown = attackCooldown;
        this.weaponType = weaponType;
    }

    draw({ ctx }: DrawUIElementProps): void {
        super.draw({ ctx });
        ctx.fillStyle = 'black';
        ctx.font = `${this.getWidth() / 1.25}px Arial`;
        ctx.textAlign = 'center';
        const icons: Record<WeaponType, string> = {
            dagger: '🗡️',
            bow: '🏹',
            wand: '🪄',
        }
        ctx.fillText(icons[this.weaponType], this.getX() + this.getWidth() / 2, this.getY() + this.getHeight() / 2);
    }

}