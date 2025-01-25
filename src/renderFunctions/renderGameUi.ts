import { createMetallicGradient } from "../canvasTools/createMetallicGradient";
import { renderArrow } from "../canvasTools/renderArrow";
import { renderKnife } from "../canvasTools/renderKnife";
import { Game } from "../Game";

let lastFpsCalculation = Date.now();
let recentFps: number[] = [];
let lastDraw = Date.now();

interface Props {
  ctx: CanvasRenderingContext2D;
  game: Game;
}

export const renderGameUi = ({ ctx, game }: Props) => {
  // Draw health bar in top right corner, based on adventurer hitpoints
  ctx.fillStyle = "black";
  const healthBarWidth = game.getViewportSize.width / 4;
  const healthBarHeight = game.getViewportSize.height / 20;
  const healthWidth = (game.getAdventurer.hitpoints / 100) * healthBarWidth;
  const healthBarX = game.getViewportSize.width - healthBarWidth - 10;
  const healthBarY = 10;
  ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

  ctx.fillStyle = "red";

  ctx.fillRect(
    healthBarX + healthBarWidth - healthWidth,
    healthBarY,
    healthWidth,
    healthBarHeight
  );

  // Draw fps counter in top left corner as white text with black stroke
  const millisecondsSinceLastFpsCalculation = Date.now() - lastFpsCalculation;
  if (millisecondsSinceLastFpsCalculation > 50) {
    const millisecondsSinceLastDraw = Date.now() - lastDraw;
    const fps = Math.round(1000 / millisecondsSinceLastDraw);
    recentFps.push(fps);
    // keep only the last 20 fps values
    recentFps = recentFps.slice(-20).filter((fps) => fps > 0);

    lastFpsCalculation = Date.now();
  }
  const averageFps = Math.round(
    recentFps.reduce((sum, fps) => sum + fps, 0) / recentFps.length
  );

  ctx.font = "16px Arial";
  ctx.textAlign = "left";
  ctx.fillStyle = "white";
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.strokeText(`FPS: ${averageFps}`, 10, 20);
  ctx.fillText(`FPS: ${averageFps}`, 10, 20);

  // Draw ability icons in top left corner
  const abilityIconSize = game.getToolbarSize.height / 2;
  const abilityIconPadding = abilityIconSize / 8;
  const abilityIconY = game.getViewportSize.height + abilityIconSize / 2;

  const abilities = [
    {
      name: "attack",
      label: "lmb",
      icon: "🏹",
      disabled: !game.getAdventurer.canAttack(),
      cooldown: game.getAdventurer.remainingAttackCooldown,
      hotkeys: [
        // keycode for f
        70,
      ],
    },
    {
      name: "homing attack",
      label: "1",
      icon: "🚀",
      disabled: !game.getAdventurer.canUseSpecialAbility("Guided Arrow"),
      cooldown: game.getAdventurer.getSpecialAbilityCooldown("Guided Arrow"),
      hotkeys: [
        // keycode for 1
        49,
      ],
    },
    {
      name: "throw bomb",
      label: "2",
      icon: "💣",
      disabled: !game.getAdventurer.canUseSpecialAbility("Bomb"),
      cooldown: game.getAdventurer.getSpecialAbilityCooldown("Bomb"),
      hotkeys: [
        // keycode for 2
        50,
      ],
    },
  ];

  // Draw toolbar background
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = "#36454f";
  ctx.fillRect(
    0,
    game.getViewportSize.height,
    game.getViewportSize.width,
    game.getToolbarSize.height
  );

  ctx.globalAlpha = 1;
  // Draw ability icons from the left
  abilities.forEach((ability, index) => {
    const iconXValue =
      abilityIconPadding + index * (abilityIconSize + abilityIconPadding);

    ctx.fillStyle = createMetallicGradient({
      ctx,
      x: iconXValue,
      y: abilityIconY,
      width: abilityIconSize,
      height: abilityIconSize,
    });
    ctx.fillRect(iconXValue, abilityIconY, abilityIconSize, abilityIconSize);

    if (ability.disabled) {
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
    } else if (ability.hotkeys.find((key) => game.getPressedKeys[key])) {
      // green background when key is pressed
      ctx.fillStyle = "rgba(0, 255, 0, 0.75)";
    } else {
      ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
    }
    ctx.fillRect(
      iconXValue + abilityIconPadding,
      abilityIconY + abilityIconPadding,
      abilityIconSize - abilityIconPadding * 2,
      abilityIconSize - abilityIconPadding * 2
    );

    if (ability.name === "attack") {
      const weapon = game.getAdventurer.equipment["mainHand"];
      if (!weapon) { return; }
      weapon.setX(iconXValue + abilityIconPadding);
      weapon.setY(abilityIconY + abilityIconPadding);
      weapon.setWidth(abilityIconSize - abilityIconPadding * 2);
      weapon.setHeight(abilityIconSize - abilityIconPadding * 2);
      weapon.draw({ ctx });
    } else {
      ctx.fillStyle = "white";
      ctx.font = `${abilityIconSize / 2}px Arial`;
      ctx.textAlign = "center";
      ctx.fillText(
        ability.icon,
        iconXValue + abilityIconSize / 2,
        abilityIconY + abilityIconSize / 2
      );
    }
    ctx.globalAlpha = 1;

    // Draw cooldown above icon
    if (ability.cooldown.remaining > 0) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
      ctx.fillRect(
        iconXValue,
        abilityIconY,
        abilityIconSize,
        abilityIconSize * ability.cooldown.percentage
      );

      if (ability.cooldown.remaining > 500) {
        ctx.fillStyle = "white";
        ctx.font = `${abilityIconSize / 3}px Arial`;
        ctx.fillText(
          (ability.cooldown.remaining / 1000).toFixed(1),
          iconXValue + abilityIconSize / 2,
          abilityIconY - 15
        );
      }
    }

    // Draw Hotkey below icon
    ctx.fillStyle = "white";
    ctx.font = `${abilityIconSize / 3}px Arial`;
    ctx.fillText(
      ability.label,
      iconXValue + abilityIconSize / 2,
      abilityIconY + abilityIconSize + 15
    );
  });

  // Draw adventurer ammo from the right
  const ammoIconSize = game.getToolbarSize.height / 2;
  const ammoIconPadding = ammoIconSize / 8;
  const ammoIconY = game.getViewportSize.height + ammoIconSize / 2;
  const ammoIconX = game.getViewportSize.width - ammoIconSize - ammoIconPadding;
  game.getAdventurer.ammo.forEach((ammo, index) => {
    const iconXValue = ammoIconX - index * (ammoIconSize + ammoIconPadding);

    ctx.fillStyle = createMetallicGradient({
      ctx,
      x: iconXValue,
      y: ammoIconY,
      width: ammoIconSize,
      height: ammoIconSize,
    });
    ctx.fillRect(iconXValue, ammoIconY, ammoIconSize, ammoIconSize);

    ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
    ctx.fillRect(
      iconXValue + ammoIconPadding,
      ammoIconY + ammoIconPadding,
      ammoIconSize - ammoIconPadding * 2,
      ammoIconSize - ammoIconPadding * 2
    );

    const xOffset = iconXValue + ammoIconSize / 2;
    const yOffset = ammoIconY + ammoIconSize / 2;
    const renderProps = {
      ctx,
      width: ammoIconSize - ammoIconPadding * 2,
      colorTheme: ammo.colorTheme,
    };
    // rotate 45 degrees
    ctx.save();
    ctx.translate(xOffset, yOffset);
    ctx.rotate((-45 * Math.PI) / 180);

    if (ammo.type === "arrow") {
      renderArrow(renderProps);
    } else if (ammo.type === "knife") {
      renderKnife(renderProps);
    }
    ctx.restore();
  });

  if (game.isGameOver) {
    ctx.font = "60px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText(
      "Game Over",
      game.getViewportSize.width / 2,
      game.getViewportSize.height / 2
    );
  } else if (game.isGameWon) {
    ctx.font = "60px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText(
      "You Win!",
      game.getViewportSize.width / 2,
      game.getViewportSize.height / 2
    );
  } else if (game.isPaused) {
    ctx.font = "60px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText(
      "Paused",
      game.getViewportSize.width / 2,
      game.getViewportSize.height / 2
    );
  }

  lastDraw = Date.now();

  if (game.isDebug) {
    // draw 50x50 px grid
    ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";

    for (let x = 0; x < game.getViewportSize.width; x += 50) {
      // draw X value at top
      ctx.font = "16px Arial";
      ctx.fillStyle = "black";
      ctx.textAlign = "center";
      ctx.fillText(`${x}`, x, 15);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, game.getViewportSize.height);
      ctx.stroke();
    }
    for (let y = game.getViewportSize.height; y >= 0; y -= 50) {
      // draw Y value at left
      ctx.font = "16px Arial";
      ctx.fillStyle = "black";
      ctx.textAlign = "center";
      ctx.fillText(`${game.getViewportSize.height - y}`, 15, y);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(game.getViewportSize.width, y);
      ctx.stroke();
    }
  }
};
