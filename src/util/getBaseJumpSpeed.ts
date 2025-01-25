import { Viewport } from "../types/Viewport";

export const getBaseJumpSpeed = (
  viewport: Viewport,
  jumpCount: number
): number => {
  // Negative value to move upward
  const baseJumpSpeed = -viewport.height / 15;
  const jumpCountIncrement = baseJumpSpeed / 10;
  return baseJumpSpeed + Math.min(5, jumpCount) * jumpCountIncrement;
};
