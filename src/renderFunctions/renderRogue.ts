import { Adventurer } from "../models/classes/Adventurer";
import { getBaseJumpSpeed } from "../util/getBaseJumpSpeed";
import { getTerminalVelocity } from "../util/getTerminalVelocity";
import { renderSprite, SpriteRenderMode } from "./renderSprite";

type SpriteState = "Attack_1" | "Hurt" | "Dead" | "Idle" | "Walk" | "Jump";

export const renderRogue = (
  adventurer: Adventurer,
  ctx: CanvasRenderingContext2D,
  debug = false
) => {
  const spriteUnitWidth = 128;
  const spriteUnitHeight = 72;
  let yStartOffset = 0;
  let renderMode: SpriteRenderMode = "loop";
  let fixedFrame: number | null = null;
  let startTime: number | null = null;
  let loopDuration = 100;
  let frameStep = 1;

  let state: SpriteState = "Walk";
  const numberOfFrames: Record<SpriteState, number> = {
    Attack_1: 7,
    Hurt: 4,
    Dead: 11, // 1 aditional frame so the character disappears
    Idle: 17,
    Walk: 6,
    Jump: 7,
  };

  if (adventurer.isAttacking()) {
    state = `Attack_1`;
    loopDuration = adventurer.attackDuration;
    yStartOffset = 0;
  } else if (adventurer.isTemporaryInvincible()) {
    state = "Hurt";
    loopDuration = 2000;
    renderMode = "bounce";
    yStartOffset = spriteUnitHeight * 2;
  } else if (adventurer.isDead()) {
    state = "Dead";
    startTime = adventurer.timeOfDeath;
    loopDuration = 750;
    renderMode = "once";
    yStartOffset = spriteUnitHeight * 1;
    frameStep = 2;
  } else if (adventurer.isJumping()) {
    state = "Jump";
    const maxJumpSpeed = getBaseJumpSpeed(
      adventurer.getGame.getViewportSize,
      adventurer.getJumpCount()
    );
    const jumpSpeed = adventurer.speedY;
    fixedFrame = Math.floor((jumpSpeed / maxJumpSpeed) * 4);
    renderMode = "fixed";
    yStartOffset = spriteUnitHeight * 4;
  } else if (adventurer.isFalling()) {
    state = "Jump";
    const maxFallSpeed = getTerminalVelocity(
      adventurer.getGame.getViewportSize
    );
    const jumpSpeed = adventurer.speedY;
    fixedFrame = 4 + Math.floor((jumpSpeed / maxFallSpeed) * 2);
    renderMode = "fixed";
    yStartOffset = spriteUnitHeight * 4;
  } else if (adventurer.speedX === 0) {
    state = "Idle";
    yStartOffset = spriteUnitHeight * 3;

    const timeSinceLastMovement = Date.now() - (adventurer.lastAction ?? 0);
    const idleTime = numberOfFrames[state] * 200;
    // Stand still for a bit before going to idle
    if (timeSinceLastMovement < idleTime) {
      fixedFrame = 6;
      renderMode = "fixed";
    } else {
      loopDuration = 200;
    }
  } else {
    state = "Walk";
    yStartOffset = spriteUnitHeight * 5;
  }
  const sprite = getSprite();

  const mirrorX =
    adventurer.getDirectionX() === "left" ||
    (["Dead", "Idle", "Hurt"].includes(state) &&
      adventurer.getDirectionX() === "none" &&
      adventurer.getLastDirection() === "left");

  renderSprite({
    unit: adventurer,
    ctx,
    sprite,
    loopDuration,
    numberOfFrames: numberOfFrames[state],
    renderMode,
    spriteUnitHeight,
    spriteUnitWidth,
    mirrorX,
    startTime,
    whitespaceX: 128,
    whitespaceY: 32,
    xStartOffset: -20,
    yStartOffset,
    debug,
    fixedFrame,
    frameStep,
  });
};

const getSprite = (): HTMLImageElement => {
  return document.querySelector("#rogue-sprite") as HTMLImageElement;
};
