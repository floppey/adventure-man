import { Unit } from "../types/Unit";

let firstRender = true;

export type SpriteRenderMode = "loop" | "once" | "bounce" | "fixed";
export interface SpriteRenderProps {
  /** The unit the sprite is rendered for */
  unit: Unit;
  /** The canvas context for rendering */
  ctx: CanvasRenderingContext2D;
  /** The sprite image */
  sprite: HTMLImageElement;
  /** The width of a single sprite unit */
  spriteUnitWidth: number;
  /** The height of a single sprite unit */
  spriteUnitHeight: number;
  /** The duration of a single loop in milliseconds */
  loopDuration: number;
  /** The number of frames in the sprite */
  numberOfFrames: number;
  /** The start time of the animation */
  startTime?: number | null;
  /** Whether the sprite should be mirrored on the x-axis */
  mirrorX?: boolean;
  /** The amount of whitespace on the x-axis */
  whitespaceX?: number;
  /** The amount of whitespace on the y-axis */
  whitespaceY?: number;
  /** Whether to show debug information */
  debug?: boolean;
  /** When renderMode is fixed, this is the frame that will render */
  fixedFrame?: number | null;
  /** The render mode of the sprite */
  renderMode?: SpriteRenderMode;
  /** The x offset of the sprite, applied equally to each frame */
  xStartOffset?: number;
  /** The y offset of the sprite, applied equally to each frame */
  yStartOffset?: number;
  /** The number of frames to increase by in each iteration */
  frameStep?: number;
  /** The number of frames to offset the start frame */
  frameStepOffset?: number;
}

export const renderSprite = ({
  unit,
  ctx,
  sprite,
  loopDuration,
  numberOfFrames,
  startTime,
  mirrorX,
  spriteUnitHeight,
  spriteUnitWidth,
  whitespaceX = 0,
  whitespaceY = 0,
  xStartOffset = 0,
  yStartOffset = 0,
  debug = false,
  fixedFrame,
  renderMode = "loop",
  frameStep = 1,
  frameStepOffset = 0,
}: SpriteRenderProps) => {
  let xWithViewport = unit.getXWithViewport;
  const yWithViewport = unit.getYWithViewport;

  const xScale = spriteUnitWidth / unit.getWidth();
  const yScale = spriteUnitHeight / unit.getHeight();
  const xScaleInverse = unit.getWidth() / spriteUnitWidth;
  const yScaleInverse = unit.getHeight() / spriteUnitHeight;

  const imageWidth = (spriteUnitWidth + 2 * whitespaceX) * xScaleInverse;
  const imageHeight = (spriteUnitHeight + whitespaceY) * yScaleInverse;

  let spriteX = 0;
  let spriteY = 0;

  const xOffset = (-1 * (imageWidth - unit.getWidth())) / 2;
  const yOffset = unit.getHeight() - imageHeight;

  let frame = Math.floor(Date.now() / loopDuration) % numberOfFrames;

  if (renderMode === "once" && startTime) {
    const timeSinceDeath = Date.now() - startTime;
    frame = Math.min(
      Math.floor((timeSinceDeath / loopDuration) * numberOfFrames - 1),
      numberOfFrames - 1
    );
  }

  if (renderMode === "bounce") {
    const totalFrames = numberOfFrames * 2 - 1;
    frame = Math.floor(Date.now() / loopDuration) % totalFrames;
    frame = frame < numberOfFrames ? frame : totalFrames - frame;
  }

  if (renderMode === "fixed") {
    frame = fixedFrame ?? 0;
  }

  frame = frame * frameStep + frameStepOffset;

  spriteX = frame * spriteUnitWidth;
  spriteY = 0;

  // flip the sprite if the unit is facing left
  if (mirrorX) {
    ctx.save();
    ctx.scale(-1, 1);
    xWithViewport = -xWithViewport - unit.getWidth();
  }

  if (debug) {
    ctx.fillStyle = "rgba(0,255,0,0.5)";
    ctx.fillRect(
      xWithViewport + xOffset,
      yWithViewport + yOffset,
      imageWidth, //* xScale,
      imageHeight //* yScale
    );

    if (firstRender && debug) {
      console.table({
        name: unit.name,
        xWithViewport,
        yWithViewport,
        xOffset,
        yOffset,
        spriteUnitWidth,
        spriteUnitHeight,
        xScale,
        xScaleInverse,
        yScale,
        yScaleInverse,
        spriteX,
        spriteY,
        unitWidth: unit.getWidth(),
        unitHeight: unit.getHeight(),
      });
      firstRender = false;
    }
  }

  ctx.drawImage(
    // The image of the sprite
    sprite,
    // The x and y coordinates of the sprite
    spriteX + xStartOffset,
    spriteY + yStartOffset + 1, // +1 to avoid the black line between sprites
    // The width and height of the sprite
    spriteUnitWidth,
    spriteUnitHeight - 1, // -1 to avoid the black line between sprites
    // The x and y coordinates on the canvas
    xWithViewport + xOffset,
    yWithViewport + yOffset,
    // The width and height of the image on the canvas
    imageWidth,
    imageHeight
  );

  if (debug) {
    // Draw horizontal center line
    ctx.beginPath();
    ctx.moveTo(xWithViewport, yWithViewport + unit.getHeight() / 2);
    ctx.lineTo(
      xWithViewport + unit.getWidth(),
      yWithViewport + unit.getHeight() / 2
    );
    ctx.stroke();

    // Draw vertical center line
    ctx.beginPath();
    ctx.moveTo(xWithViewport + unit.getWidth() / 2, yWithViewport);
    ctx.lineTo(
      xWithViewport + unit.getWidth() / 2,
      yWithViewport + unit.getHeight()
    );
    ctx.stroke();
  }

  if (mirrorX) {
    ctx.restore();
  }
};
