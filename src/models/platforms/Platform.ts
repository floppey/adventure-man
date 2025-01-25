import { DrawUIElementProps, UIElement, UIElementOptions } from "../UIElement";

type PlatformStyle = "grass" | "dirt" | "stone" | "wood" | "ice" | "glue";
type PatternValue = "1" | "2" | "3";
type ColorPalette = Record<PatternValue, string>;
interface PlatformProps extends UIElementOptions {
  style: PlatformStyle;
  friction?: number;
  speedMultiplier?: number;
  label?: string;
}

export interface PlatformTemplate {
  /** The style of the platform, e.g. dirt, grass or ice */
  style: PlatformStyle;
  /** The width of the platform, the value is a percentage (0-1) of the level width */
  width: number;
  /** The height of the platform, the value is a percentage (0-1) of the level height */
  height: number;
  /** The y position of the top of the platform, the value is a percentage of the level height. 0 is at the top of the level and 1 is at the bottom. */
  y: number;
  /** The x position of the left side of the platform, the value is a percentage of the level width. 0 is at the left of the level and 1 is at the right. */
  x: number;
  /** This is a number greater than 0, that is applied multiplicatively to the players acceleration while on the platform */
  friction?: number;
  /** This is a number greater than 0, that is applied multiplicatively to the players top speed while on the platform */
  speedMultiplier?: number;
  /** A label to display on the platform, mainly used for debugging */
  label?: string;
}

export class Platform extends UIElement {
  private friction: number = 1;
  private speedMultiplier: number = 1;
  private textureScale: number;
  private foregroundScale: number;
  style: PlatformStyle;
  pattern: { bottom: number; top: number }[] = [];
  label?: string;

  constructor({
    style,
    friction,
    speedMultiplier,
    label,
    ...rest
  }: PlatformProps) {
    super({ ...rest, uiElementType: "platform" });
    this.style = style;
    // Scale factor based on window width (adjust base value to taste)
    this.textureScale = Math.floor(this.getGame.getViewportSize.width / 250);
    this.foregroundScale = Math.floor(
      this.getGame.getViewportSize.width / 1250
    );
    this.friction = friction ?? getDefaultFriciton(style);
    this.speedMultiplier = speedMultiplier ?? getDefaultSpeedMultiplier(style);
    this.label = label;

    // if (this.style === "dirt") {
    //   this.createGrassPattern();
    // }
  }

  getAccelerationFactor() {
    return this.friction;
  }

  getSpeedMultiplier() {
    return this.speedMultiplier;
  }

  // Generic tile pattern that creates a varied texture
  static tilePattern: PatternValue[][] = [
    ["1", "2", "1", "2"],
    ["2", "3", "2", "1"],
    ["1", "2", "3", "2"],
    ["2", "1", "2", "1"],
  ];

  // Color palettes for different platform types
  static stylePalettes: Record<PlatformStyle, ColorPalette> = {
    dirt: {
      "1": "#693B29", // Base brown
      "2": "#7B4B35", // Light brown
      "3": "#593225", // Dark brown
    },
    stone: {
      "1": "#7B7B7B", // Base gray
      "2": "#8C8C8C", // Light gray
      "3": "#686868", // Dark gray
    },
    wood: {
      "1": "#8B4513", // Base wood
      "2": "#A0522D", // Light wood
      "3": "#6B3811", // Dark wood
    },
    grass: {
      "1": "#2D7A3D", // Base green
      "2": "#45992C", // Light green
      "3": "#1F592C", // Dark green
    },
    ice: {
      "1": "#AEE5FF", // Base blue
      "2": "#E1F5FF", // Light blue
      "3": "#62CCFF", // Dark blue
    },
    glue: {
      "1": "#FFD700", // Base yellow
      "2": "#FFE34D", // Light yellow
      "3": "#B39600", // Dark yellow
    },
  };

  createGrassPattern() {
    // Create chunky grass blocks
    // Base sizes are multiplied by scale for responsive sizing
    const baseGrassWidth = 8 * this.foregroundScale; // Width of each grass chunk
    const spacing = 2 * this.foregroundScale; // Space between chunks
    let currentX = 0;

    while (currentX < this.getWidth()) {
      // Random height between 2-4 blocks (scaled)
      const heightVariation = Math.floor(Math.random() * 3) + 2;
      const height = heightVariation * this.foregroundScale * 4;

      this.pattern.push({
        bottom: currentX,
        top: height,
      });

      // Move to next grass chunk position
      currentX += baseGrassWidth + spacing;
    }
  }

  draw(props: DrawUIElementProps) {
    const { ctx } = props;
    this.renderTexturedPlatform(ctx);
    super.draw(props);
  }

  private renderTexturedPlatform(ctx: CanvasRenderingContext2D) {
    const colors = Platform.stylePalettes[this.style];

    // Base size of each texture pixel (larger for more pixelated look)
    // const pixelSize = 10 * this.textureScale;
    // const patternSize = Platform.tilePattern.length * pixelSize;

    const xWithViewport = this.getXWithViewport;
    const yWithViewport = this.getYWithViewport;

    const platformHeight = this.getHeight();
    const platformWidth = this.getWidth();

    ctx.fillStyle = colors["1"];
    ctx.fillRect(xWithViewport, yWithViewport, platformWidth, platformHeight);

    // for (
    //   let y = yWithViewport;
    //   y * patternSize < yWithViewport + platformHeight;
    //   y++
    // ) {
    //   for (
    //     let x = xWithViewport;
    //     x * patternSize < xWithViewport + platformWidth;
    //     x++
    //   ) {
    //     console.log(x, y);
    //     const colorKey = Platform.tilePattern[y][x];
    //     ctx.fillStyle = colors[colorKey];
    //     ctx.fillRect(y * patternSize, x * patternSize, pixelSize, pixelSize);
    //   }
    // }
    // // Draw the pattern
    // for (let y = 0; y < platformHeight / patternSize; y += patternSize) {
    //   for (let x = 0; x < platformWidth / patternSize; x += patternSize) {
    //     // Repeat the pattern in a deterministic way
    //     for (let py = 0; py < Platform.tilePattern.length; py++) {
    //       for (let px = 0; px < Platform.tilePattern[py].length; px++) {
    //         const drawX = xWithViewport + x + px * pixelSize;
    //         const drawY = yWithViewport + y + py * pixelSize;

    //         // Only draw if within platform bounds
    //         if (
    //           drawY < xWithViewport + platformHeight &&
    //           drawX < yWithViewport + platformWidth
    //         ) {
    //           // clip pixel if it goes outside platform bounds
    //           let width = pixelSize;
    //           let height = pixelSize;

    //           if (drawX + width > xWithViewport + platformWidth) {
    //             width = xWithViewport + width - drawX;
    //           }
    //           if (drawY + height > yWithViewport + platformHeight) {
    //             height = yWithViewport + height - drawY;
    //           }
    //           const colorKey = Platform.tilePattern[py][px];
    //           ctx.fillStyle = colors[colorKey];
    //           ctx.fillRect(drawX, drawY, width, height);
    //         }
    //       }
    //     }
    //   }
    // }
    // draw label as black text with white stroke, centered on platform
    if (this.label) {
      ctx.font = `${this.foregroundScale * 16}px Arial`;
      ctx.textAlign = "center";
      ctx.fillStyle = "black";
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.strokeText(
        this.label,
        xWithViewport + platformWidth / 2,
        yWithViewport + 5 + platformHeight / 2
      );
      ctx.fillText(
        this.label,
        xWithViewport + platformWidth / 2,
        yWithViewport + 5 + platformHeight / 2
      );
    }
  }

  renderForeground(props: DrawUIElementProps) {
    const { ctx } = props;
    const width = this.getWidth();
    const xWithViewport = this.getXWithViewport;
    const yWithViewport = this.getYWithViewport;

    if (this.style === "dirt") {
      const grassBottomColor = "#2D7A3D";
      const grassMiddleColor = "#45992C";
      // const grassTopColor = "#57BF2F";

      // Draw solid grass block at top
      ctx.fillStyle = grassBottomColor;
      ctx.fillRect(
        xWithViewport,
        yWithViewport,
        width,
        this.foregroundScale * 8
      );
      ctx.fillStyle = grassMiddleColor;
      ctx.fillRect(
        xWithViewport,
        yWithViewport,
        width,
        this.foregroundScale * 4
      );

      // // Draw each grass chunk
      // this.pattern.forEach((blade) => {
      //   const x = xWithViewport + blade.bottom;
      //   const height = blade.top;
      //   const blockWidth = 8 * this.foregroundScale;

      //   // Draw grass in chunky blocks
      //   // Bottom block (darker)
      //   ctx.fillStyle = grassBottomColor;
      //   ctx.fillRect(x, yWithViewport - height * 0.8, blockWidth, height);

      //   // Middle block
      //   ctx.fillStyle = grassMiddleColor;
      //   ctx.fillRect(
      //     x + this.foregroundScale,
      //     yWithViewport - height * 0.9,
      //     blockWidth - this.foregroundScale * 2,
      //     height * 0.8
      //   );

      //   // Top block
      //   ctx.fillStyle = grassTopColor;
      //   ctx.fillRect(
      //     x + this.foregroundScale * 2,
      //     yWithViewport - height,
      //     blockWidth - this.foregroundScale * 4,
      //     height * 0.4
      //   );
      // });
    } else if (this.style === "ice") {
      const iceColor = "#AEE5FF";
      ctx.fillStyle = iceColor;
      ctx.fillRect(
        xWithViewport,
        yWithViewport - 5,
        width,
        this.foregroundScale * 8
      );
    } else if (this.style === "glue") {
      const glueColor = "#FFC200";
      ctx.fillStyle = glueColor;
      ctx.fillRect(
        xWithViewport,
        yWithViewport,
        width,
        this.foregroundScale * 8
      );
    }
  }
}

const getDefaultFriciton = (style: PlatformStyle) => {
  const frictionMap: Record<PlatformStyle, number> = {
    dirt: 1,
    stone: 1,
    wood: 1,
    grass: 1,
    ice: 0.2,
    glue: 2,
  };
  return frictionMap[style];
};

const getDefaultSpeedMultiplier = (style: PlatformStyle) => {
  const speedMultipliedMap: Record<PlatformStyle, number> = {
    dirt: 1,
    stone: 1,
    wood: 1,
    grass: 1,
    ice: 0.8,
    glue: 0.1,
  };
  return speedMultipliedMap[style];
};
