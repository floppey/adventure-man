import { ProjectileColorTheme } from "../models/projectiles/Projectile";
import { repeatColor } from "../util/repeatColor";

interface Props {
  width: number;
  xOffset?: number;
  yOffset?: number;
  ctx: CanvasRenderingContext2D;
  colorTheme: ProjectileColorTheme;
}
export const renderArrow = ({
  width,
  ctx,
  xOffset = 0,
  yOffset = 0,
  colorTheme,
}: Props) => {
  // Get dimensions
  const colorMap = getColorMap(colorTheme);
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

const themeColors: Record<
  ProjectileColorTheme,
  { light: string; dark: string }
> = {
  blue: { light: "#6995EC", dark: "#596ED2" },
  red: { light: "#EC6A6A", dark: "#D25959" },
  green: { light: "#6EEC6A", dark: "#59D259" },
};
const getColorMap = (colorTheme: ProjectileColorTheme): (string | null)[][] => {
  const lightThemeColor = themeColors[colorTheme].light;
  const darkThemeColor = themeColors[colorTheme].dark;

  const lightMetal = "#817D83";
  const darkMetal = "#594E5D";
  const lightWood = "#643933";
  const darkWood = "#45273D";
  const colorMap: (string | null)[][] = [
    [
      ...repeatColor(lightThemeColor, 4),
      darkThemeColor,
      ...repeatColor(null, 9),
      lightMetal,
      ...repeatColor(null, 4),
    ],
    [
      null,
      ...repeatColor(lightThemeColor, 4),
      darkThemeColor,
      ...repeatColor(null, 8),
      ...repeatColor(lightMetal, 4),
      ...repeatColor(null, 3),
    ],
    [null, null, ...repeatColor(lightWood, 12), ...repeatColor(lightMetal, 6)],
    [null, null, ...repeatColor(darkWood, 12), ...repeatColor(darkMetal, 6)],
    [
      null,
      ...repeatColor(darkThemeColor, 5),
      ...repeatColor(null, 8),
      ...repeatColor(darkMetal, 4),
      ...repeatColor(null, 3),
    ],
    [
      ...repeatColor(darkThemeColor, 5),
      ...repeatColor(null, 9),
      darkMetal,
      ...repeatColor(null, 4),
    ],
  ];
  return colorMap;
};
