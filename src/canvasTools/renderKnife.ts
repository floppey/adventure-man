import { ProjectileColorTheme } from "../models/projectiles/Projectile";

interface Props {
  width: number;
  xOffset?: number;
  yOffset?: number;
  ctx: CanvasRenderingContext2D;
  colorTheme: ProjectileColorTheme;
}
export const renderKnife = ({
  width,
  ctx,
  xOffset = 0,
  yOffset = 0,
}: Props) => {
  // Get dimensions
  const scale = width / colorMap[0].length;
  const pixelWidth = colorMap[0].length * scale;
  const pixelHeight = colorMap.length * scale;

  // Draw the projectile centered at origin
  for (let y = 0; y < colorMap.length; y++) {
    for (let x = 0; x < colorMap[y].length; x++) {
      const color = colorMap[y][x];
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(
          xOffset - pixelWidth / 2 + x * scale,
          yOffset - pixelHeight / 2 + y * scale,
          scale,
          scale
        );
      }
    }
  }
};

const colorMap: (string | null)[][] = [
  [
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    "black",
    "black",
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
  ],
  [
    null,
    "black",
    "black",
    "black",
    "black",
    "black",
    "black",
    "#9E7800",
    "#BE9101",
    "black",
    "black",
    "black",
    "black",
    "black",
    "black",
    "black",
    "black",
    "black",
    "black",
    "black",
    "black",
    "black",
    null,
  ],
  [
    "black",
    "#3F1E03",
    "#763600",
    "#763600",
    "#763600",
    "#763600",
    "#3F1E03",
    "#9E7800",
    "#BE9101",
    "#252D2F",
    "#252D2F",
    "#252D2F",
    "#252D2F",
    "#252D2F",
    "#252D2F",
    "#252D2F",
    "#252D2F",
    "#252D2F",
    "#252D2F",
    "#252D2F",
    "#252D2F",
    "#252D2F",
    "black",
  ],
  [
    "black",
    "#3F1E03",
    "#3F1E03",
    "#3F1E03",
    "#3F1E03",
    "#3F1E03",
    "#3F1E03",
    "#9E7800",
    "#BE9101",
    "#FAFBFC",
    "#FAFBFC",
    "#FAFBFC",
    "#FAFBFC",
    "#FAFBFC",
    "#FAFBFC",
    "#FAFBFC",
    "#FAFBFC",
    "#FAFBFC",
    "#FAFBFC",
    "#FAFBFC",
    "#FAFBFC",
    "black",
    null,
  ],
  [
    null,
    "black",
    "black",
    "black",
    "black",
    "black",
    "black",
    "#9E7800",
    "#BE9101",
    "black",
    "black",
    "black",
    "black",
    "black",
    "black",
    "black",
    "black",
    "black",
    "black",
    "black",
    "black",
    null,
    null,
  ],
  [
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    "black",
    "black",
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
  ],
];
