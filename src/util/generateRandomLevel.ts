import { Adventurer } from "../models/classes/Adventurer";
import { MonsterTemplate, MonsterType } from "../models/creatures/Monster";
import { Level } from "../levels";
import { PlatformTemplate } from "../models/platforms/Platform";

export const generateLevel = (
  levelNumber: number,
  viewportSize: { width: number; height: number },
  adventurer: Adventurer
): Level => {
  // Base constants
  const BASE_PLATFORM_HEIGHT = 0.02;
  const LEVEL_SIZE = { width: 2, height: 2 };

  // Difficulty scaling factors
  const difficultyFactor = Math.min(1 + levelNumber * 0.1, 2.5); // Caps at 2.5x difficulty

  // Platform generation constants that scale with difficulty
  const platformConfig = {
    minWidth: Math.max(0.05, 0.1 / difficultyFactor), // Platforms get narrower
    maxWidth: Math.max(0.15, 0.3 / difficultyFactor),
    minCount: 5 + Math.floor(levelNumber / 3), // More platforms in higher levels
    maxCount: 10 + Math.floor(levelNumber / 2),
    minGap: 0.1 * difficultyFactor, // Larger gaps between platforms
    maxHeight: 0.8 + levelNumber * 0.02, // Platforms can be higher
    iceChance: Math.min(0.1 * levelNumber, 0.5), // More ice platforms in higher levels
  };

  // Physics calculations
  const MAX_JUMP_HEIGHT = viewportSize.width / 3 / adventurer.gravity;
  const SAFE_JUMP_DISTANCE = MAX_JUMP_HEIGHT * (0.7 / difficultyFactor); // Jumps become more precise

  function isJumpPossible(
    from: PlatformTemplate,
    to: PlatformTemplate
  ): boolean {
    const heightDiff = (to.y - from.y) * LEVEL_SIZE.height;
    const horizontalDist = Math.abs((to.x - from.x) * LEVEL_SIZE.width);

    if (heightDiff > SAFE_JUMP_DISTANCE) {
      return false;
    }

    const timeToJumpPeak = Math.sqrt(
      (2 * Math.abs(heightDiff)) / adventurer.gravity
    );
    const maxHorizontalDistance = adventurer.speedX * timeToJumpPeak * 2;

    return horizontalDist <= maxHorizontalDistance;
  }

  function getPlatformStyle(): PlatformTemplate["style"] {
    const rand = Math.random();
    if (rand < platformConfig.iceChance) return "ice";
    if (rand < 0.6) return "dirt";
    return "grass";
  }

  function generatePlatforms(): PlatformTemplate[] {
    const platforms: PlatformTemplate[] = [];

    // Add ground platform
    platforms.push({
      style: "grass",
      width: 1,
      height: 0.5,
      x: 0,
      y: 1,
    });

    const numPlatforms =
      platformConfig.minCount +
      Math.floor(
        Math.random() * (platformConfig.maxCount - platformConfig.minCount)
      );

    for (let i = 0; i < numPlatforms; i++) {
      let attempts = 0;
      let validPlatform = false;
      let newPlatform: PlatformTemplate | null = null;

      while (!validPlatform && attempts < 50) {
        const style = getPlatformStyle();
        const potentialPlatform: PlatformTemplate = {
          style,
          width:
            platformConfig.minWidth +
            Math.random() * (platformConfig.maxWidth - platformConfig.minWidth),
          height: BASE_PLATFORM_HEIGHT,
          x: Math.random() * (1 - platformConfig.minWidth),
          y: 0.2 + Math.random() * platformConfig.maxHeight,
          // Add friction for different platform types
          friction: style === "ice" ? 0.2 : style === "dirt" ? 1.2 : 1,
          // Add speed multiplier for different platform types
          speedMultiplier: style === "ice" ? 1.5 : 1,
        };

        // Ensure minimum gap between platforms
        const hasMinimumGap = platforms.every(
          (platform) =>
            Math.abs(platform.x - potentialPlatform.x) >=
              platformConfig.minGap ||
            Math.abs(platform.y - potentialPlatform.y) >= platformConfig.minGap
        );

        validPlatform =
          hasMinimumGap &&
          platforms.some(
            (platform) =>
              isJumpPossible(platform, potentialPlatform) ||
              isJumpPossible(potentialPlatform, platform)
          );

        if (validPlatform) {
          newPlatform = potentialPlatform;
        }

        attempts++;
      }

      if (validPlatform && newPlatform) {
        platforms.push(newPlatform);
      }
    }

    return platforms;
  }

  function generateMonsters(platforms: PlatformTemplate[]): MonsterTemplate[] {
    const monsters: MonsterTemplate[] = [];
    const NUM_MONSTERS = Math.min(
      platforms.length - 1,
      3 + Math.floor(levelNumber / 2)
    );

    const potentialMonsterTypes: MonsterType[] = [
      "goblin",
      "orc",
      "archer",
      "troll",
    ];
    // Monster types by difficulty
    const monsterTypes: MonsterType[] = [
      "goblin",
      ...(levelNumber >= 3 ? [potentialMonsterTypes[1]] : []),
      ...(levelNumber >= 5 ? [potentialMonsterTypes[2]] : []),
      ...(levelNumber >= 7 ? [potentialMonsterTypes[3]] : []),
    ];

    for (let i = 0; i < NUM_MONSTERS; i++) {
      const platformIndex =
        1 + Math.floor(Math.random() * (platforms.length - 1));
      const platform = platforms[platformIndex];
      const monsterType =
        monsterTypes[Math.floor(Math.random() * monsterTypes.length)];

      monsters.push({
        name: `${monsterType.charAt(0).toUpperCase() + monsterType.slice(1)} ${
          i + 1
        }`,
        hitpoints: 50 + levelNumber * 15,
        armor: Math.min(0.8, 0.2 + levelNumber * 0.05),
        attackPower: 10 + levelNumber * 3,
        attackCooldown: Math.max(1000 - levelNumber * 50, 500), // Faster attacks in higher levels
        attackDuration: 500,
        width: monsterType === "troll" ? 1.5 : 1,
        height: monsterType === "troll" ? 1.5 : 1,
        x: platform.x + platform.width * 0.5,
        y: platform.y - (monsterType === "troll" ? 0.15 : 0.1),
        speedX: 0.5 * difficultyFactor,
        speedY: monsterType === "troll" ? 0.3 : 0,
        movementType: "walking",
        intelligence: "dumb",
        monster: monsterType,
        directionX: Math.random() > 0.5 ? "left" : "right",
      });
    }

    return monsters;
  }

  const platforms = generatePlatforms();
  const monsters = generateMonsters(platforms);

  // Generate level-appropriate tips
  const tips: string[] = ["Use platforms to reach higher areas"];
  if (levelNumber >= 3) tips.push("Watch out for stronger monsters!");
  if (platforms.some((p) => p.style === "ice"))
    tips.push("Ice platforms are slippery!");
  if (monsters.some((m) => m.monster === "troll"))
    tips.push("Trolls are tough, but slow!");

  return {
    name: `Level ${levelNumber}`,
    level: levelNumber,
    tips,
    monsters,
    platforms,
    initialAdventurerPosition: {
      x: platforms[0].x + platforms[0].width * 0.5,
      y: platforms[0].y - 0.1,
    },
    levelSize: LEVEL_SIZE,
  };
};
