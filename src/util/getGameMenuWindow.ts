import { Game } from "../Game";
import { Button } from "../models/gui/Button";
import { Window } from "../models/gui/Window";
import { getKeybindsWindow } from "./getKeybindsWindow";

export const getGameMenuWindow = (game: Game) => {
    const windowWidth = game.getViewportSize.width / 2;
    const windowHeight = game.getViewportSize.height / 2;
    const windowX = game.getViewportSize.width / 4;
    const windowY = game.getViewportSize.height / 4;
    const gameWindow = new Window({
        game: game,
        x: windowX,
        y: windowY,
        width: windowWidth,
        height: windowHeight,
        name: "Game Menu",
        uiElements: [],
    });

    gameWindow.addUIElement(new Button({
        game,
        height: windowHeight / 10,
        width: windowWidth / 2,
        x: windowWidth / 4,
        y: (windowHeight / 10) * 6,
        parentWindow: gameWindow,
        label: "Key Bindings",
        onClick: () => {
            game.addWindow(getKeybindsWindow(game));
        },
        name: "Key Bindings",
    }));

    gameWindow.addUIElement(new Button({
        game,
        height: windowHeight / 10,
        width: windowWidth / 2,
        x: windowWidth / 4,
        y: (windowHeight / 10) * 8,
        parentWindow: gameWindow,
        label: "Resume",
        onClick: () => {
            game.setPaused = false;
            gameWindow.close();
        },
        name: "Resume Button",
    }));

    return gameWindow
};