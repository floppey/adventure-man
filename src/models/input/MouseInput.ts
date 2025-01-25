import { Game } from "../../Game";

export class MouseInput {
  private game: Game;

  constructor(game: Game) {
    this.game = game;
    window.addEventListener("click", this.handleClick);
    window.addEventListener("mousemove", this.handleMouseMove);
    window.addEventListener("mousedown", this.handleMouseDown);
    window.addEventListener("mouseup", this.handleMouseUp);
  }

  handleClick = (e: MouseEvent) => {
    const clickX = e.clientX;
    const clickY = e.clientY;
    const clickedWindow = this.game.getWindows.findLast((window) =>
      window.isClicked(clickX, clickY)
    );
    const clickedElement = clickedWindow
      ?.getUIElements()
      .findLast((element) => element.isClicked(clickX, clickY));


    if (clickedElement) {
      clickedElement.onClick();
    }
  };

  private handleMouseMove = (e: MouseEvent) => {
    // get mouse position inside canvas
    const rect = (e.target as HTMLElement).getBoundingClientRect();

    const gameWindowWidth = this.game.getViewportSize.width;
    const gameWindowHeight = this.game.getViewportSize.height;

    const actualMousePosition = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    const mousePositionInGame = {
      x:
        Math.max(Math.min(gameWindowWidth, actualMousePosition.x), 0) +
        this.game.getViewportCoordinates.x,
      y:
        Math.max(Math.min(gameWindowHeight, actualMousePosition.y), 0) +
        this.game.getViewportCoordinates.y,
    };

    this.game.setMousePosition = mousePositionInGame;
    this.game.setMouseIsInsideViewport =
      mousePositionInGame.x === actualMousePosition.x &&
      mousePositionInGame.y === actualMousePosition.y;
  };

  private handleMouseDown = () => {
    if (!this.game.isPaused) {
      this.game.getAdventurer.chargeRangedAttack();
    }
  };

  private handleMouseUp = () => {
    if (!this.game.isPaused) {
      const projectile = this.game.getAdventurer.rangedMouseAttack();
      if (projectile) {
        this.game.addProjectile(projectile);
      }
    }

    if (this.game.isDebug) {
      this.game.getAdventurer.setFloatingText(
        `Clicked at ${Math.round(this.game.getMousePosition.x)}, ${Math.round(
          this.game.getMousePosition.y
        )}`,
        1500
      );
    }
  };

  destroy() {
    window.removeEventListener("click", this.handleClick);
    window.removeEventListener("mousemove", this.handleMouseMove);
    window.removeEventListener("mousedown", this.handleMouseDown);
    window.removeEventListener("mouseup", this.handleMouseUp);
  }
}
