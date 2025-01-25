import { Monster } from "../../models/creatures/Monster";
import { getBaseJumpSpeed } from "../../util/getBaseJumpSpeed";
import { getTerminalVelocity } from "../../util/getTerminalVelocity";
import { renderSprite, SpriteRenderMode } from "../renderSprite";

type SkeletonState = "Attack_1" | "Hurt" | "Dead" | "Idle" | "Walk" | "Jump";

export const renderSkeleton = (
  monster: Monster,
  ctx: CanvasRenderingContext2D,
  debug = false
) => {
  const spriteUnitWidth = 128;
  const spriteUnitHeight = 128;

  let row = 0;
  let renderMode: SpriteRenderMode = "loop";
  let fixedFrame: number | null = null;
  let startTime: number | null = null;
  let loopDuration = 100;

  let state: SkeletonState = "Walk";

  const numberOfFrames: Record<SkeletonState, number> = {
    Attack_1: 7,
    Hurt: 3,
    Dead: 3,
    Idle: 7,
    Walk: 8,
    Jump: 10,
  };

  if (monster.isAttacking()) {
    state = `Attack_1`;
    loopDuration = monster.attackDuration;
    row = 5;
  } else if (monster.isTemporaryInvincible()) {
    state = "Hurt";
    loopDuration = 2000;
    renderMode = "bounce";
    row = 7;
  } else if (monster.isDead()) {
    state = "Dead";
    startTime = monster.timeOfDeath;
    renderMode = "once";
    loopDuration = 500;
    row = 6;
  } else if (monster.isJumping()) {
    state = "Jump";
    const maxJumpSpeed = getBaseJumpSpeed(
      monster.getGame.getViewportSize,
      monster.getJumpCount()
    );
    const jumpSpeed = monster.speedY;
    fixedFrame = Math.floor((jumpSpeed / maxJumpSpeed) * 5);
    renderMode = "fixed";
    row = 9;
  } else if (monster.isFalling()) {
    state = "Jump";
    const maxFallSpeed = getTerminalVelocity(monster.getGame.getViewportSize);
    const jumpSpeed = monster.speedY;
    fixedFrame = 5 + Math.floor((jumpSpeed / maxFallSpeed) * 6);
    renderMode = "fixed";
    row = 9;
  } else if (monster.speedX === 0) {
    state = "Idle";
    row = 8;
    loopDuration = 200;
  } else {
    state = "Walk";
    row = 2;
  }

  const sprite = getSprite();

  const mirrorX =
    monster.getDirectionX() === "left" ||
    (["Dead", "Idle", "Hurt"].includes(state) &&
      monster.getDirectionX() === "none" &&
      monster.getLastDirection() === "left");

  renderSprite({
    unit: monster,
    ctx,
    sprite,
    loopDuration,
    numberOfFrames: numberOfFrames[state],
    renderMode,
    spriteUnitHeight,
    spriteUnitWidth,
    mirrorX,
    startTime,
    whitespaceX: 132,
    whitespaceY: 106,
    xStartOffset: 0,
    yStartOffset: (row - 1) * spriteUnitHeight,
    debug,
    fixedFrame,
  });
};

const getSprite = (): HTMLImageElement => {
  return document.querySelector("#skeleton-sprite") as HTMLImageElement;
};
