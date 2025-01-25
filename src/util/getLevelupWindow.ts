import { Game } from "../Game";
import { Button } from "../models/gui/Button";
import { Label } from "../models/gui/Label";
import { Window } from "../models/gui/Window";

export const getLevelupWindow = (game: Game) => {
  const level = game.getLevel;
  if (!level) {
    return;
  }
  // add window with level information
  const levelupWindowBorder = game.getViewportSize.width / 10;
  const levelupWindowWidth =
    game.getViewportSize.width - levelupWindowBorder * 2;
  const levelupWindowHeight =
    game.getViewportSize.height - levelupWindowBorder * 2;
  const levelupWindow = new Window({
    game,
    x: levelupWindowBorder,
    y: levelupWindowBorder,
    width: levelupWindowWidth,
    height: levelupWindowHeight,
    uiElements: [],
    name: "Level info",
  });

  levelupWindow.addUIElement(
    new Label({
      game,
      x: levelupWindowWidth / 4,
      y: levelupWindowHeight / 10,
      width: levelupWindowWidth / 2,
      height: levelupWindowHeight / 10,
      parentWindow: levelupWindow,
      label: `Level ${level.level}`,
      textAlign: "center",
      name: "Level label",
    })
  );

  const randomLevelTip = level.tips
    ? level.tips[Math.floor(Math.random() * level.tips.length)]
    : undefined;
  if (randomLevelTip) {
    levelupWindow.addUIElement(
      new Label({
        game,
        x: levelupWindowWidth / 4,
        y: levelupWindowHeight / 10 + levelupWindowHeight / 10,
        width: levelupWindowWidth / 2,
        height: levelupWindowHeight / 20,
        parentWindow: levelupWindow,
        label: `Hint: ${randomLevelTip}`,
        textAlign: "center",
        name: "level tip",
      })
    );
  }

  // Show level info
  const uniqueMonsterTypes = [...new Set(level.monsters.map((m) => m.monster))];
  uniqueMonsterTypes.forEach((monsterType, index) => {
    const monsterCount = level.monsters.filter(
      (m) => m.monster === monsterType
    ).length;
    levelupWindow.addUIElement(
      new Label({
        game,
        x: levelupWindowWidth / 4,
        y:
          levelupWindowHeight / 10 +
          levelupWindowHeight / 10 +
          (index + 1) * 30,
        width: levelupWindowWidth / 2,
        height: levelupWindowHeight / 20,
        parentWindow: levelupWindow,
        label: `${monsterType}: ${monsterCount}`,
        textAlign: "center",
        name: "monster count",
      })
    );
  });

  // Start game button
  levelupWindow.addUIElement(
    new Button({
      game,
      x: levelupWindowWidth / 4,
      y: levelupWindowHeight - levelupWindowHeight / 7.5,

      width: levelupWindowWidth / 2,
      height: levelupWindowHeight / 10,
      parentWindow: levelupWindow,
      label: "Start",
      onClick: () => {
        levelupWindow.close();
        game.setPaused = false;
      },
      name: "Start button",
    })
  );

  return levelupWindow;
};
