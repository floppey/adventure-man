import { Game } from "./Game";

interface InitAdventureManProps {
  adventurerCanvas: HTMLCanvasElement;
  platformCanvas: HTMLCanvasElement;
  monsterCanvas: HTMLCanvasElement;
  backgroundCanvas: HTMLCanvasElement;
  projectileCanvas: HTMLCanvasElement;
  gameUiCanvas: HTMLCanvasElement;
}

export const initAdventureMan = (initProps: InitAdventureManProps) => {
  const game = new Game({
    canvases: {
      adventurer: initProps.adventurerCanvas,
      monster: initProps.monsterCanvas,
      projectile: initProps.projectileCanvas,
      platform: initProps.platformCanvas,
      gameui: initProps.gameUiCanvas,
      background: initProps.backgroundCanvas,
    },
    toolbarSize: { width: 0, height: 0 },
    gameSize: { width: 0, height: 0 },
    viewportSize: { width: 0, height: 0 },
  });

  // check test query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const testMode = urlParams.has("test");
  game.setDebug = testMode;

  game.start();
};
