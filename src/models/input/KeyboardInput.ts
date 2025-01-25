import { Game } from "../../Game";

export class KeyboardInput {
  private game: Game;
  private pressedKeys: { [key: string]: boolean } = {};
  private allowedPauseKeys = ["p", "P", "Escape"];

  constructor(game: Game) {
    this.game = game;
    this.pressedKeys = {};
    window.addEventListener("keydown", this.keyDownHandler);
    window.addEventListener("keyup", this.keyUpHandler);
  }

  get getPressedKeys() {
    return this.pressedKeys;
  }

  private keyDownHandler = (e: KeyboardEvent) => {
    if (this.pressedKeys[e.keyCode]) {
      return;
    }
    let performGameAction = true;

    if (this.game.isPaused && !this.allowedPauseKeys.includes(e.key)) {
      performGameAction = false;
    }
    this.pressedKeys[e.keyCode] = true;
    if (performGameAction) {
      switch (e.key) {
        // Movement
        case "ArrowUp":
        case "w":
        case "W":
          e.preventDefault();
          break;
        case "ArrowDown":
        case "s":
        case "S":
          e.preventDefault();
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          e.preventDefault();
          break;
        case "ArrowRight":
        case "d":
        case "D":
          e.preventDefault();
          break;
        // Stop movement
        // Jump
        case " ":
          e.preventDefault();
          this.game.getAdventurer.jump();
          break;
        // Attacks
        case "f":
        case "F":
          e.preventDefault();
          this.game.getAdventurer.chargeRangedAttack();
          break;

        case "p":
        case "P":
          e.preventDefault();
          this.game.togglePaused();
          break;

        // Escape
        case "Escape":
          e.preventDefault();
          this.game.showGameMenu();
          break;
      }
    }
  };

  private keyUpHandler = (e: KeyboardEvent) => {
    this.pressedKeys[e.keyCode] = false;
    let performGameAction = true;

    if (this.game.isPaused && !this.allowedPauseKeys.includes(e.key)) {
      performGameAction = false;
    }

    switch (e.key) {
      // Special abilities
      case "1":
        e.preventDefault();
        if (performGameAction) {
          const projectile =
            this.game.getAdventurer.useSpecialAbility("Guided Arrow");
          if (projectile) {
            this.game.addProjectile(projectile);
          }
        }
        break;
      case "2":
        e.preventDefault();
        if (performGameAction) {
          const projectile = this.game.getAdventurer.useSpecialAbility("Bomb");
          if (projectile) {
            this.game.addProjectile(projectile);
          }
        }
        break;
      // Crouch
      case "c":
      case "C":
        e.preventDefault();
        if (performGameAction) {
          this.game.getAdventurer.toggleCrouch();
        }
        break;
    }
  };

  destroy() {
    window.removeEventListener("keydown", this.keyDownHandler);
    window.removeEventListener("keyup", this.keyUpHandler);
  }
}
