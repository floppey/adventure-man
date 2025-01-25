export const createBlueSkyGradient = ({
  ctx,
  y,
}: {
  ctx: CanvasRenderingContext2D;
  y: number;
}) => {
  const gradient = ctx.createConicGradient(0, 0, y);
  gradient.addColorStop(0, "#00bfff");
  gradient.addColorStop(0.5, "#87CEEB");
  gradient.addColorStop(1, "#00bfff");
  return gradient;
};
