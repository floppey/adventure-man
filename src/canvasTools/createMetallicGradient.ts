export const createMetallicGradient = ({
  ctx,
  x,
  y,
  width,
  height,
}: {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  width: number;
  height: number;
}) => {
  const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
  gradient.addColorStop(0, "#8a8a8a");
  gradient.addColorStop(0.2, "#c0c0c0");
  gradient.addColorStop(0.4, "#8a8a8a");
  gradient.addColorStop(0.6, "#c0c0c0");
  gradient.addColorStop(0.8, "#8a8a8a");
  gradient.addColorStop(1, "#707070");
  return gradient;
};

export const createGoldenGradient = ({
  ctx,
  x,
  y,
  width,
  height,
}: {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  width: number;
  height: number;
}) => {
  const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
  gradient.addColorStop(0, "#b78628");
  gradient.addColorStop(0.2, "#c69320");
  gradient.addColorStop(0.4, "#dba514");
  gradient.addColorStop(0.6, "#eeb609");
  gradient.addColorStop(0.8, "#fcc201");
  gradient.addColorStop(1, "#fcc201");
  return gradient;
};
