import test, { describe } from "node:test";
import { Platform } from "../../models/platforms/Platform";
import { canCreatureJumpToPlatform } from "../../util/creatureCanJumpToPlatform";
import { createCreature } from "../testUtils";
import { getBaseJumpSpeed } from "../../util/getBaseJumpSpeed";
import { getMaxJumpHeight } from "../../util/getMaxJumpHeight";
import { Game } from "../../Game";

describe("canCreatureJumpToPlatform", () => {
  // Common test setup
  const gameSize = {
    width: 1920,
    // 21:9
    height: 1920 * (9 / 21),
  };
  const viewportSize = { ...gameSize };

  const createPlatform = (x: number, y: number, width = 100): Platform => {
    return new Platform({
      x,
      y,
      width,
      height: 1,
      game: {} as unknown as Game,
      name: "test",
      style: "dirt",
    });
  };
  describe("Basic jump mechanics", () => {
    test("should return false when creature is already moving upward", () => {
      const creature = createCreature({}, gameSize, viewportSize);
      creature.speedY = -100; // Moving upward
      const platform = createPlatform(100, 400);

      expect(canCreatureJumpToPlatform(creature, platform)).toBe(false);
    });

    test("should return false when creature has no jumps left", () => {
      const creature = createCreature(
        {
          jumpCount: 2,
        },
        gameSize,
        viewportSize
      );

      const platform = createPlatform(100, 400);

      expect(canCreatureJumpToPlatform(creature, platform)).toBe(false);
    });
  });

  describe("Vertical jumps", () => {
    test("should succeed for platform directly above within single jump height", () => {
      const creature = createCreature({}, gameSize, viewportSize);
      // Platform is 1/3 of viewport height above creature
      const platform = createPlatform(100, 300);

      expect(canCreatureJumpToPlatform(creature, platform)).toBe(true);
    });

    test("should succeed for platform directly above within double jump height", () => {
      const creature = createCreature({}, gameSize, viewportSize);
      // Platform is 2/3 of viewport height above creature
      const platform = createPlatform(100, 100);

      expect(canCreatureJumpToPlatform(creature, platform)).toBe(true);
    });

    test("should fail for platform too high even with double jump", () => {
      const creature = createCreature({}, gameSize, viewportSize);
      // Platform is above maximum double jump height
      const platform = createPlatform(100, 0);

      expect(canCreatureJumpToPlatform(creature, platform)).toBe(false);
    });
  });

  describe("Horizontal jumps", () => {
    test("should succeed for nearby platform at same height", () => {
      const creature = createCreature({}, gameSize, viewportSize);
      // Platform is within horizontal reach
      const platform = createPlatform(200, 500);
      expect(canCreatureJumpToPlatform(creature, platform)).toBe(true);
    });
    test("should fail for platform too far horizontally", () => {
      const creature = createCreature({}, gameSize, viewportSize);
      // Platform is too far to reach within jump time
      const platform = createPlatform(800, 500);
      expect(canCreatureJumpToPlatform(creature, platform)).toBe(false);
    });
  });

  describe("Diagonal jumps", () => {
    test("should succeed for reachable diagonal platform", () => {
      const creature = createCreature({}, gameSize, viewportSize);
      // Platform is both higher and to the right, but within reach
      const platform = createPlatform(250, 400);
      expect(canCreatureJumpToPlatform(creature, platform)).toBe(true);
    });
    test("should succeed for reachable platform with double jump", () => {
      const creature = createCreature({}, gameSize, viewportSize);
      // Platform requires both horizontal movement and double jump
      const platform = createPlatform(300, 200);
      expect(canCreatureJumpToPlatform(creature, platform)).toBe(true);
    });
    test("should fail for unreachable diagonal platform", () => {
      const creature = createCreature({}, gameSize, viewportSize);
      // Platform is too far both horizontally and vertically
      const platform = createPlatform(700, 100);
      expect(canCreatureJumpToPlatform(creature, platform)).toBe(false);
    });
  });

  describe("Edge cases", () => {
    test("should handle platforms at same height", () => {
      const creature = createCreature({}, gameSize, viewportSize);
      const platform = createPlatform(150, 500);
      expect(canCreatureJumpToPlatform(creature, platform)).toBe(true);
    });
    test("should handle platforms below creature", () => {
      const creature = createCreature({}, gameSize, viewportSize);
      const platform = createPlatform(200, 600);
      expect(canCreatureJumpToPlatform(creature, platform)).toBe(true);
    });
    test("should fail for platform directly above but too high", () => {
      const creature = createCreature({}, gameSize, viewportSize);

      const maxJumpHeight = getMaxJumpHeight(creature, viewportSize);
      // Platform is just beyond double jump height
      const platform = createPlatform(maxJumpHeight, 50);
      expect(canCreatureJumpToPlatform(creature, platform)).toBe(false);
    });
    test("should handle platform at max horizontal range", () => {
      const creature = createCreature({}, gameSize, viewportSize);
      // Platform is at the edge of horizontal reach
      const maxJumpTime =
        Math.abs(-getBaseJumpSpeed(viewportSize, 0) / creature.gravity) * 2;
      const maxDistance = creature.maxSpeedX * maxJumpTime;
      const platform = createPlatform(100 + maxDistance * 0.9, 500); // 90% of max distance
      expect(canCreatureJumpToPlatform(creature, platform)).toBe(true);
    });
  });
});
