import { Game } from "../Game";
import { Coordinates } from "../types/Coordinates";

interface RenderCrosshairsProps {
  game: Game;
  ctx: CanvasRenderingContext2D;
  position: Coordinates;
}

export const renderCrosshairs = ({
  game,
  ctx,
  position,
}: RenderCrosshairsProps) => {
  const crosshairSize = game.baseUnitSize * 0.75;
  const xOffset = (-crosshairSize) / 2;
  const yOffset = (-crosshairSize) / 2;
  const crosshairColor = "red";
  const crosshairLineWidth = 2;

  ctx.lineWidth = crosshairLineWidth;
  ctx.strokeStyle = crosshairColor;

  // Horizontal line
  ctx.beginPath();
  ctx.moveTo(xOffset + position.x, yOffset + position.y + crosshairSize / 2);
  ctx.lineTo(
    xOffset + position.x + crosshairSize,
    yOffset + position.y + crosshairSize / 2
  );
  ctx.stroke();

  // Vertical line
  ctx.beginPath();
  ctx.moveTo(xOffset + position.x + crosshairSize / 2, yOffset + position.y);
  ctx.lineTo(
    xOffset + position.x + crosshairSize / 2,
    yOffset + position.y + crosshairSize
  );
  ctx.stroke();

  // Circle
  ctx.beginPath();
  ctx.arc(
    xOffset + position.x + crosshairSize / 2,
    yOffset + position.y + crosshairSize / 2,
    crosshairSize / 2,
    0,
    2 * Math.PI
  );
  ctx.stroke();
};
