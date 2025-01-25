interface DrawProps {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  startX: number;
  startY: number;
}

export const draw8BitHeart = ({
  ctx,
  width,
  height,
  startX,
  startY,
}: DrawProps) => {
  // Get the canvas and context

  // Define the 8-bit heart pattern
  const heartPattern = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 2, 1, 0, 0, 1, 2, 0, 0],
    [0, 1, 3, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 2, 1, 1, 2, 1, 1, 0],
    [0, 1, 1, 1, 3, 3, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 2, 2, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ];

  // Calculate pixel size based on desired width and height
  const patternWidth = heartPattern[0].length;
  const patternHeight = heartPattern.length;
  const pixelSizeX = Math.floor(width / patternWidth);
  const pixelSizeY = Math.floor(height / patternHeight);
  const pixelSize = Math.min(pixelSizeX, pixelSizeY);

  // Color palette for the heart
  const colorPalette = {
    0: "rgba(0,0,0,0)", // Transparent
    1: "#FF3333", // Base red
    2: "#FF6666", // Lighter red highlight
    3: "#CC0000", // Darker red shade
  };

  // Draw the heart pixel by pixel
  heartPattern.forEach((row, y) => {
    row.forEach((pixel, x) => {
      if (pixel !== 0) {
        // Set the fill color based on the pixel value
        ctx.fillStyle = colorPalette[pixel as keyof typeof colorPalette];

        // Draw the pixel
        ctx.fillRect(
          startX + x * pixelSize,
          startY + y * pixelSize,
          pixelSize,
          pixelSize
        );
      }
    });
  });

  // Optional: Add a subtle shadow or outline effect
  ctx.strokeStyle = "rgba(0,0,0,0.1)";
  ctx.lineWidth = 1;
  heartPattern.forEach((row, y) => {
    row.forEach((pixel, x) => {
      if (pixel !== 0) {
        ctx.strokeRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      }
    });
  });
};
