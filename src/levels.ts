import { MonsterTemplate } from "./models/creatures/Monster";
import { createArcher } from "./creators/monsters/createArcher";
import { createGoblin } from "./creators/monsters/createGoblin";
import { createSkeleton } from "./creators/monsters/createSkeleton";
import { PlatformTemplate } from "./models/platforms/Platform";
import { Coordinates } from "./types/Coordinates";
import { Powerup } from "./models/powerups/Powerup";
import { HealingPowerup } from "./models/powerups/HealingPowerup";
import { Game } from "./Game";
import { ItemPowerup } from "./models/powerups/ItemPowerup";
import { Weapon } from "./models/items/Item";

const standardPlatforms: PlatformTemplate[] = [
  { style: "dirt", width: 0.5, height: 0.6, y: 0.4, x: 0.5 },
  { style: "dirt", width: 0.15, height: 0.1, y: 0.45, x: 0.3125 },
  { style: "dirt", width: 0.15, height: 0.1, y: 0.6, x: 0.25 },
  { style: "dirt", width: 0.25, height: 0.2, y: 0.8, x: 0 },
  // Ground
  { style: "dirt", width: 1, height: 1 / 2, y: 0.95, x: 0 },
];
export interface Level {
  /** The name of the level */
  name: string;
  /** A list of tips that can be displayed before the level starts */
  tips?: string[];
  /** The level number */
  level: number;
  /** The monsters that spawn on this level */
  monsters: MonsterTemplate[];
  /** The platforms on the level */
  platforms: PlatformTemplate[];
  /** The initial position of the adventurer, the adventurer will be moved here when the level loads if it is set */
  initialAdventurerPosition?: Coordinates;
  /** The initial position of the viewport, the viewport will be moved here when the level loads if it is set */
  initialViewportPosition?: Coordinates;
  /** The size of the level, the values are a factor of the screen size and should never be lower than 1 */
  levelSize?: { width: number; height: number };
  /** The powerups on this level */
  powerups?: Powerup[];
}

const tips = [
  "Use the arrow keys or WASD to move",
  "Press space to jump",
  "You can double jump",
  "Use the mouse to aim and click to shoot",
  "Defeat all enemies to proceed to the next level",
];

const levels: Level[] = [
  {
    name: "Tutorial",
    level: 0,
    tips,
    monsters: [
      createSkeleton({
        attackPower: 0,
      }),
    ],
    initialAdventurerPosition: { x: 0.5, y: 0.875 },
    levelSize: { width: 1, height: 1 },
    platforms: standardPlatforms,
  },
  {
    name: "Level 1",
    level: 1,
    tips,
    monsters: [createSkeleton()],
    initialAdventurerPosition: { x: 0.5, y: 0.875 },
    platforms: [
      { style: "dirt", width: 0.5, height: 0.6, y: 0.4, x: 0.5 },
      { style: "dirt", width: 0.15, height: 0.1, y: 0.6, x: 0.25 },
      { style: "dirt", width: 0.25, height: 0.2, y: 0.8, x: 0 },
      // Ground
      { style: "dirt", width: 1, height: 1 / 2, y: 1, x: 0 },
    ],
  },
  {
    name: "Level 2",
    level: 2,
    tips,
    monsters: [createSkeleton(), createSkeleton()],
    initialAdventurerPosition: { x: 0.5, y: 0.875 },
    platforms: [
      { style: "dirt", width: 0.5, height: 0.6, y: 0.4, x: 0.5 },
      { style: "dirt", width: 0.15, height: 0.1, y: 0.6, x: 0.25 },
      { style: "dirt", width: 0.25, height: 0.2, y: 0.8, x: 0 },
      // Ground
      { style: "dirt", width: 1, height: 1 / 2, y: 1, x: 0 },
    ],
  },
  {
    name: "Level 3",
    level: 3,
    tips,
    monsters: [createSkeleton(), createGoblin()],
    initialAdventurerPosition: { x: 0.5, y: 0.875 },
    platforms: [
      { style: "dirt", width: 0.5, height: 0.6, y: 0.4, x: 0.5 },
      { style: "dirt", width: 0.15, height: 0.1, y: 0.6, x: 0.25 },
      { style: "dirt", width: 0.25, height: 0.2, y: 0.8, x: 0 },
      // Ground
      { style: "dirt", width: 1, height: 1 / 2, y: 1, x: 0 },
    ],
  },
  {
    name: "Level 4",
    level: 4,
    tips,
    monsters: [createSkeleton(), createGoblin(), createGoblin()],
    initialAdventurerPosition: { x: 0.5, y: 0.875 },
    platforms: [
      { style: "dirt", width: 0.5, height: 0.6, y: 0.4, x: 0.5 },
      { style: "dirt", width: 0.15, height: 0.1, y: 0.6, x: 0.25 },
      { style: "dirt", width: 0.25, height: 0.2, y: 0.8, x: 0 },
      // Ground
      { style: "dirt", width: 1, height: 1 / 2, y: 1, x: 0 },
    ],
  },
  {
    name: "Level 5",
    level: 5,
    tips,
    monsters: [createArcher()],
    initialAdventurerPosition: { x: 0.5, y: 0.875 },
    platforms: [
      { style: "dirt", width: 0.5, height: 0.6, y: 0.4, x: 0.5 },
      { style: "dirt", width: 0.15, height: 0.1, y: 0.6, x: 0.25 },
      { style: "dirt", width: 0.25, height: 0.2, y: 0.8, x: 0 },
      // Ground
      { style: "dirt", width: 1, height: 1 / 2, y: 1, x: 0 },
    ],
  },
  {
    name: "Level 6",
    level: 6,
    tips,
    monsters: [
      createArcher({
        rangedAttack: "homingArrow",
      }),
    ],
    initialAdventurerPosition: { x: 0.5, y: 0.875 },
    platforms: [
      { style: "dirt", width: 0.5, height: 0.6, y: 0.4, x: 0.5 },
      { style: "dirt", width: 0.15, height: 0.1, y: 0.6, x: 0.25 },
      { style: "dirt", width: 0.25, height: 0.2, y: 0.8, x: 0 },
      // Ground
      { style: "dirt", width: 1, height: 1 / 2, y: 1, x: 0 },
    ],
  },
];

const testSize = { width: 1920, height: 1920 * (9 / 21) };
const testLevelSizeFactors = { width: 1, height: 1 };
// const testLevelSize = {
//   width: testSize.width * testLevelSizeFactors.width,
//   height: testSize.height * testLevelSizeFactors.height,
// };
const testLevel: Level = {
  name: "Test Level",
  level: 0,
  monsters: [
    createArcher({
      attackPower: 5,
    }),
  ],
  platforms: standardPlatforms,
  initialAdventurerPosition: { x: 0.5, y: 0.8 },
  levelSize: testLevelSizeFactors,
  powerups: [
    new HealingPowerup({
      name: "Test Healing Powerup",
      game: {} as unknown as Game,
      healingAmount: 1,
      height: 1,
      width: 1,
      x: 0.5,
      y: 0.5,
    }),
    new ItemPowerup({
      name: "Test Item Powerup",
      game: {} as unknown as Game,
      height: 1,
      width: 1,
      x: 0.3,
      y: 0.3,
      item: new Weapon({
        game: {} as unknown as Game,
        attackPower: 25,
        attackCooldown: 50,
        attackDuration: 50,
        slot: "mainHand",
        rarity: "common",
        weaponType: "dagger",
        name: "Test Weapon",
      }),
    }),
  ],
};

export { levels, testLevel, testSize };
