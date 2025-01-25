import { createBlueSkyGradient } from "../canvasTools/createBlueSkyGradient";
import { Game } from "../Game";

interface BackgroundProps {
  ctx: CanvasRenderingContext2D;
  game: Game;
}

export const renderBackground = ({ ctx, game }: BackgroundProps) => {
  // Light blue gradient sky
  ctx.fillStyle = createBlueSkyGradient({
    ctx,
    y: game.getViewportCoordinates.y,
  });
  ctx.fillRect(0, 0, game.getViewportSize.width, game.getViewportSize.height);
};
