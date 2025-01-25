import { Coordinates } from "./types/Coordinates";
import { Projectile } from "./models/projectiles/Projectile";
import { Size } from "./types/Size";
import { Adventurer } from "./models/classes/Adventurer";
import { Monster } from "./models/creatures/Monster";
import { Door } from "./models/portals/Door";
import { Platform } from "./models/platforms/Platform";
import { Window } from "./models/gui/Window";
import { Creature } from "./models/creatures/Creature";
import { KeyboardInput } from "./models/input/KeyboardInput";
import { MouseInput } from "./models/input/MouseInput";
import { getUnitCollisions } from "./util/getUnitCollisions";
import { renderBackground } from "./renderFunctions/renderBackground";
import { Level, levels, testLevel } from "./levels";
import { getLevelupWindow } from "./util/getLevelupWindow";
import { placeDoorOnPlatforms } from "./util/placeDoorOnPlatforms";
import { placeMonstersOnPlatforms } from "./util/placeMonstersOnPlatforms";
import { renderGameUi } from "./renderFunctions/renderGameUi";
import { getViewportPosition } from "./util/getViewportPosition";
import { Powerup } from "./models/powerups/Powerup";
import { renderCrosshairs } from "./renderFunctions/renderCrosshairs";
import { getGameMenuWindow } from "./util/getGameMenuWindow";

type CanvasTypes =
  | "adventurer"
  | "monster"
  | "platform"
  | "projectile"
  | "gameui"
  | "background";

interface InitGameProps {
  gameSize: Size;
  viewportSize: Size;
  canvases: Record<CanvasTypes, HTMLCanvasElement>;
  toolbarSize: Size;
}

export class Game {
  // Game and viewport sizes
  private gameSize: Size;
  private viewportSize: Size;
  private viewportCoordinates: Coordinates;
  private mousePosition: Coordinates;
  private mouseIsInsideViewport: boolean;
  private aspectRatio = 21 / 9;

  // Units
  private adventurer: Adventurer;
  private monsters: Monster[];
  /** A combination of monsters and adventurer */
  private creatures: Creature[];
  private platforms: Platform[];
  private projectiles: Projectile[];
  private levelDoor: Door | null;
  private powerups: Powerup[];

  // Game state
  private paused: boolean;
  private gameOver: boolean;
  private gameWon: boolean;
  private debug: boolean;
  private elapsedTime: number;
  private lastUpdate: number;
  // 30hz update rate
  private _updateInterval: number = 1000 / 30;
  private _updateFactor: number = 0;
  private lastRender: Record<CanvasTypes, number>;
  private renderConditions: Record<CanvasTypes, boolean>;
  private defaultRenderConditions: Record<CanvasTypes, boolean> = {
    adventurer: true,
    monster: true,
    projectile: true,
    platform: true,
    gameui: true,
    background: true,
  };
  private levelIndex: number = 0;
  private level: Level | null = null;

  // Input
  private keyboardInput: KeyboardInput;
  private mouseInput: MouseInput;

  // UI Elements
  private windows: Window[];
  private canvases: Record<CanvasTypes, HTMLCanvasElement>;
  private contexts: Record<CanvasTypes, CanvasRenderingContext2D>;
  private toolbarSize: Size;

  constructor({
    gameSize,
    viewportSize,
    canvases,
    toolbarSize,
  }: InitGameProps) {
    this.gameSize = gameSize;
    this.viewportSize = viewportSize;
    this.viewportCoordinates = { x: 0, y: 0 };
    this.mousePosition = { x: 0, y: 0 };
    this.mouseIsInsideViewport = true;

    this.adventurer = new Adventurer({
      game: this,
      adventurerClass: "rogue",
      armor: 0,
      attackCooldown: 100,
      attackPower: 10,
      hitpoints: 100,
      maxSpeedX: this.baseUnitSpeed,
      speedY: 0,
      width: this.baseUnitSize,
      height: this.baseUnitSize * 1.5,
      x: 0,
      y: 0,
      directionX: "none",
      attackDuration: 100,
      jumpCount: 0,
      directionY: "none",
      gravity: this.baseGravity,
      movementType: "walking",
      name: "Adventurer",
    });

    this.platforms = [];
    this.projectiles = [];
    this.monsters = [];
    this.creatures = [];
    this.powerups = [];
    this.levelDoor = null;
    this.windows = [];
    this.canvases = canvases;
    this.contexts = {
      adventurer: canvases.adventurer.getContext("2d")!,
      monster: canvases.monster.getContext("2d")!,
      platform: canvases.platform.getContext("2d")!,
      projectile: canvases.projectile.getContext("2d")!,
      gameui: canvases.gameui.getContext("2d")!,
      background: canvases.background.getContext("2d")!,
    };

    this.toolbarSize = toolbarSize;

    this.paused = true;
    this.gameOver = false;
    this.gameWon = false;
    this.debug = false;
    this.lastUpdate = Date.now();
    this.lastRender = {
      adventurer: Date.now(),
      monster: Date.now(),
      projectile: Date.now(),
      platform: Date.now(),
      gameui: Date.now(),
      background: Date.now(),
    };
    this.elapsedTime = 0;
    this.renderConditions = {
      adventurer: true,
      monster: true,
      projectile: true,
      platform: true,
      gameui: true,
      background: true,
    };

    this.keyboardInput = new KeyboardInput(this);
    this.mouseInput = new MouseInput(this);
  }

  start() {
    this.levelIndex = 0;
    if (this.debug) {
      this.level = testLevel;
    } else {
      this.level = levels[this.levelIndex];
    }
    this.paused = true;

    this.setViewportSize = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    this.setGameSize = {
      width: this.viewportSize.width,
      height: this.viewportSize.height,
    };

    this.initLevel();

    requestAnimationFrame((timeStamp) => this.updateLoop(timeStamp));
    requestAnimationFrame(() => this.renderLoop());
  }

  get getGameSize() {
    return this.gameSize;
  }

  get getViewportSize() {
    return this.viewportSize;
  }

  get getViewportCoordinates() {
    return this.viewportCoordinates;
  }

  get getMousePosition() {
    return this.mousePosition;
  }

  get getAdventurer() {
    return this.adventurer;
  }

  get getPlatforms() {
    return this.platforms;
  }

  get getMonsters() {
    return this.monsters;
  }

  get getCreatures() {
    return this.creatures;
  }

  get getDoors() {
    return this.levelDoor;
  }

  get getPowerups() {
    return this.powerups;
  }

  get getWindows() {
    return this.windows;
  }

  get getCanvases() {
    return this.canvases;
  }

  getCanvas = (canvasType: CanvasTypes) => {
    return this.canvases[canvasType];
  };

  get getContexts() {
    return this.contexts;
  }

  getContext = (canvasType: CanvasTypes) => {
    return this.contexts[canvasType];
  };

  get getLastUpdate() {
    return this.lastUpdate;
  }

  get updateInterval() {
    return this._updateInterval;
  }

  get updateFactor() {
    return this._updateFactor;
  }

  get getLastRender() {
    return this.lastRender;
  }

  get getToolbarSize() {
    return this.toolbarSize;
  }

  get isPaused() {
    return this.paused;
  }

  get isGameOver() {
    return this.gameOver;
  }

  get isGameWon() {
    return this.gameWon;
  }

  get isDebug() {
    return this.debug;
  }

  get getPressedKeys() {
    return this.keyboardInput.getPressedKeys;
  }

  get getProjectiles() {
    return this.projectiles;
  }

  setRenderCondition(canvasType: CanvasTypes, condition: boolean) {
    this.renderConditions[canvasType] = condition;
  }

  setRenderConditions(conditions: Record<CanvasTypes, boolean>) {
    this.renderConditions = conditions;
  }

  set setGameSize(size: Size) {
    this.gameSize = size;
  }

  set setViewportSize(size: Size) {
    this.toolbarSize = {
      width: size.width,
      height: Math.max(64, size.height / 10),
    };

    // Maintain aspect ratio

    this.viewportSize.width = Math.min(
      size.width,
      size.height * this.aspectRatio + this.toolbarSize.height
    );
    this.viewportSize.height = Math.min(
      (1 / this.aspectRatio) * size.width,
      size.height + this.toolbarSize.height
    );

    Object.keys(this.canvases).forEach((key) => {
      const canvasType = key as CanvasTypes;
      this.canvases[canvasType].width = this.viewportSize.width;
      this.canvases[canvasType].height =
        this.viewportSize.height + this.toolbarSize.height;
    });

    this.adventurer.setWidth(this.baseUnitSize);
    this.adventurer.setHeight(this.baseUnitSize * 1.5);
    this.adventurer.maxSpeedX = this.baseUnitSpeed;
    this.adventurer.gravity = this.baseGravity;
  }

  set setViewportCoordinates(coordinates: Coordinates) {
    if (
      this.viewportCoordinates.x !== coordinates.x ||
      this.viewportCoordinates.y !== coordinates.y
    ) {
      this.viewportCoordinates = coordinates;
      this.setRenderCondition("platform", true);
      this.setRenderCondition("gameui", true);
    }
  }

  set setMousePosition(position: Coordinates) {
    this.mousePosition = position;
  }

  get getMouseIsInsideViewport() {
    return this.mouseIsInsideViewport;
  }

  set setMouseIsInsideViewport(isInside: boolean) {
    this.mouseIsInsideViewport = isInside;
  }

  set setAdventurer(adventurer: Adventurer) {
    this.adventurer = adventurer;
    this.adventurer.setGame = this;
    this.creatures = [this.adventurer, ...this.monsters];
  }

  set setPlatforms(platforms: Platform[]) {
    this.platforms = platforms;
    this.setRenderCondition("platform", true);
  }

  set setMonsters(monsters: Monster[]) {
    this.monsters = monsters;
    this.creatures = [this.adventurer, ...this.monsters];
    this.setRenderCondition("monster", true);
  }

  set setPowerups(powerups: Powerup[]) {
    this.powerups = powerups;
    // powerups are currently rendered on monster canvas
    this.setRenderCondition("monster", true);
  }

  set setLevelDoor(door: Door) {
    this.levelDoor = door;
    this.setRenderCondition("platform", true);
  }

  set setWindows(windows: Window[]) {
    this.windows = windows;
    this.setRenderCondition("gameui", true);
  }

  addWindow(window: Window) {
    this.windows.push(window);
  }

  removeWindow(window: Window) {
    this.windows = this.windows.filter((w) => w.getId() !== window.getId());
  }

  set setCanvases(canvases: Record<CanvasTypes, HTMLCanvasElement>) {
    this.canvases = canvases;
  }

  set setToolbarSize(size: Size) {
    this.toolbarSize = size;
  }

  set setPaused(paused: boolean) {
    this.paused = paused;
    if (!paused) {
      this.setWindows = [];
    }
  }

  togglePaused() {
    this.paused = !this.paused;
  }

  set setGameOver(gameOver: boolean) {
    this.gameOver = gameOver;
  }

  set setGameWon(gameWon: boolean) {
    this.gameWon = gameWon;
  }

  set setDebug(debug: boolean) {
    this.debug = debug;
  }

  set setProjectiles(projectiles: Projectile[]) {
    this.projectiles = projectiles;
  }

  private removeOutOfBoundProjectiles() {
    this.projectiles = this.projectiles.filter(
      (projectile) => !projectile.isOutOfBounds()
    );
  }

  addProjectile(projectile: Projectile) {
    this.projectiles.push(projectile);
  }

  get baseProjectileSpeed() {
    return this.viewportSize.width / 30;
  }

  get baseUnitSpeed() {
    return this.viewportSize.width / 100;
  }

  get baseUnitSize() {
    return this.viewportSize.width / 30;
  }

  get baseGravity() {
    return this.viewportSize.height / 100;
  }

  get getLevel() {
    return this.level;
  }

  private levelUp() {
    this.levelIndex++;
    if (this.debug) {
      this.level = testLevel;
    } else {
      this.level = levels[this.levelIndex];
    }
    if (!this.getLevel) {
      this.paused = false;
      this.setGameWon = true;

      return;
    }
    this.setPaused = true;

    this.initLevel();
  }

  private initLevel() {
    if (!this.getLevel) {
      console.log("No level to initialize");
      return;
    }

    this.setGameSize = {
      height: this.viewportSize.height * (this.getLevel.levelSize?.height ?? 1),
      width: this.viewportSize.width * (this.getLevel.levelSize?.width ?? 1),
    };
    this.setViewportCoordinates = {
      x:
        this.viewportSize.width *
        (this.getLevel.initialViewportPosition?.x ?? 0),
      y:
        this.viewportSize.height *
        (this.getLevel.initialViewportPosition?.y ?? 0),
    };

    // Clear all units
    this.setMonsters = [];
    this.setPlatforms = [];
    this.setProjectiles = [];
    this.setWindows = [];

    // Add platforms
    const levelPlatforms = this.getLevel.platforms.map((template) => {
      return new Platform({
        name: "Platform",
        game: this,
        x: this.gameSize.width * template.x,
        y: this.gameSize.height * template.y,
        width: this.gameSize.width * template.width,
        height: this.gameSize.height * template.height,
        style: template.style,
        label: this.isDebug ? `${template.x}, ${template.y}` : undefined,
      });
    });
    this.setPlatforms = levelPlatforms;

    // Set up level door
    this.levelDoor = placeDoorOnPlatforms(
      new Door({
        game: this,
        name: `Level ${this.levelIndex} door`,
        x: 0,
        y: 0,
        width: this.baseUnitSize * 2,
        height: this.baseUnitSize * 2,
        open: false,
      }),
      this.platforms
    );

    // Add monsters
    const monstersOnPlatforms = placeMonstersOnPlatforms(
      this.getLevel.monsters,
      this.getLevel.platforms,
      this.gameSize,
      this.viewportSize
    );
    const levelMonsters = monstersOnPlatforms.map(
      (template) =>
        new Monster({
          game: this,
          ...template,
          x: this.gameSize.width * template.x,
          y: this.gameSize.height * template.y,
          height: this.baseUnitSize * template.height,
          width: this.baseUnitSize * template.width,
          maxSpeedX: this.baseUnitSpeed * template.speedX,
          speedY: this.baseUnitSpeed * template.speedY,
          gravity: this.baseGravity,
          directionY: "none",
        })
    );
    this.setMonsters = levelMonsters;

    this.setPowerups =
      this.getLevel.powerups?.map((template) => {
        template.setGame = this;
        template.setX(this.gameSize.width * template.getX());
        template.setY(this.gameSize.height * template.getY());
        template.setWidth(this.baseUnitSize * template.getWidth());
        template.setHeight(this.baseUnitSize * template.getHeight());
        return template;
      }) ?? [];

    // Add levelup window
    const levelupWindow = getLevelupWindow(this);
    if (levelupWindow) {
      this.windows.push(levelupWindow);
    }

    // Set adventurer position
    if (this.getLevel.initialAdventurerPosition) {
      this.adventurer.setX(
        this.gameSize.width * this.getLevel.initialAdventurerPosition.x
      );
      this.adventurer.setY(
        this.gameSize.height * this.getLevel.initialAdventurerPosition.y
      );
      this.adventurer.speedY = 0;
      this.adventurer.setDirectionY("none");
      this.adventurer.setDirectionX("none");
    }

    this.renderConditions = {
      adventurer: true,
      monster: true,
      projectile: true,
      platform: true,
      gameui: true,
      background: true,
    };
  }

  private async updateLoop(timeStamp: number) {
    const now = Date.now();
    const deltaTimeInSeconds = now - this.getLastUpdate;

    // Calculate interval factor to scale speed
    this._updateFactor = deltaTimeInSeconds / this._updateInterval;

    if (!this.paused) {
      this.setViewportCoordinates = getViewportPosition({
        adventurer: this.adventurer,
        currentViewportPosition: this.viewportCoordinates,
        viewportSize: this.viewportSize,
        level: this.getLevel,
      });

      // Check if any monsters are alive
      if (
        !this.monsters.some((monster) => monster.isAlive()) &&
        this.levelDoor
      ) {
        this.levelDoor.isOpen = true;
        if (Date.now() % 10 === 0) {
          if (getUnitCollisions(this.adventurer, [this.levelDoor]).length > 0) {
            this.levelUp();
          }
        }
      }

      // Remove out of bound projectiles
      this.removeOutOfBoundProjectiles();

      // Update all units
      const updateTasks = [
        new Promise<void>((resolve) => {
          this.adventurer.update();
          resolve();
        }),
        new Promise<void>((resolve) => {
          this.monsters.forEach((monster) => monster.update());
          resolve();
        }),
        new Promise<void>((resolve) => {
          this.projectiles.forEach((projectile) => projectile.update());
          resolve();
        }),
        new Promise<void>((resolve) => {
          this.powerups.forEach((powerup) => powerup.update());
          resolve();
        }),
      ];

      await Promise.all(updateTasks);
    }
    this.lastUpdate = Date.now();
    this.elapsedTime = timeStamp;



    requestAnimationFrame((timeStamp) => this.updateLoop(timeStamp));
  }

  private async renderLoop() {
    // Clear canvases
    Object.keys(this.contexts).forEach((key) => {
      const canvasType = key as CanvasTypes;
      if (this.renderConditions[canvasType]) {
        this.contexts[canvasType].clearRect(
          0,
          0,
          this.viewportSize.width,
          this.viewportSize.height
        );
      }
    });

    const renderTasks = [
      new Promise<void>((resolve) => {
        if (this.renderConditions.adventurer) {
          this.adventurer.draw({
            ctx: this.contexts.adventurer,
          });
          renderCrosshairs({
            game: this,
            ctx: this.contexts.adventurer,
            position: this.mousePosition,
          });
        }
        resolve();
      }),
      new Promise<void>((resolve) => {
        if (this.renderConditions.monster) {
          this.monsters.forEach((monster) =>
            monster.draw({
              ctx: this.contexts.monster,
            })
          );
          this.powerups.forEach((powerup) =>
            powerup.draw({
              ctx: this.contexts.monster,
            })
          );
        }
        resolve();
      }),
      new Promise<void>((resolve) => {
        if (this.renderConditions.platform) {
          this.platforms.forEach((platform) =>
            platform.draw({
              ctx: this.contexts.platform,
            })
          );
          this.platforms.forEach((platform) =>
            platform.renderForeground({
              ctx: this.contexts.platform,
            })
          );
          this.levelDoor?.draw({
            ctx: this.contexts.platform,
          });
        }
        resolve();
      }),
      new Promise<void>((resolve) => {
        if (this.renderConditions.gameui) {
          renderGameUi({
            ctx: this.contexts.gameui,
            game: this,
          });
          this.windows.forEach((window) =>
            window.draw({
              ctx: this.contexts.gameui,
            })
          );
        }
        resolve();
      }),
      new Promise<void>((resolve) => {
        if (this.renderConditions.background) {
          renderBackground({
            ctx: this.contexts.background,
            game: this,
          });
        }
        resolve();
      }),
      new Promise<void>((resolve) => {
        if (this.renderConditions.projectile) {
          this.projectiles.forEach((projectile) =>
            projectile.draw({
              ctx: this.contexts.projectile,
            })
          );
        }
        resolve();
      }),
    ];

    await Promise.all(renderTasks);

    Object.keys(this.contexts).forEach((key) => {
      const canvasType = key as CanvasTypes;
      if (this.renderConditions[canvasType]) {
        this.lastRender[canvasType] = Date.now();
      }
    });

    if (this.paused) {

      this.setRenderConditions({
        adventurer: false,
        monster: false,
        projectile: false,
        platform: false,
        gameui: true,
        background: false,
      });
    } else {

      this.setRenderConditions({ ...this.defaultRenderConditions });
    }

    requestAnimationFrame(() => this.renderLoop());
  }

  showGameMenu() {
    if (this.paused) {
      this.setPaused = false;
      this.setWindows = this.windows.filter((window) => window.name !== "Game Menu");
      return;
    }
    this.setPaused = true;

    const gameMenuWindow = getGameMenuWindow(this);

    this.windows.push(gameMenuWindow);
  }
}
