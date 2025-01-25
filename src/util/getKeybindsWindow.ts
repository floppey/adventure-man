import { Game } from "../Game";
import { SpecialAbilities } from "../models/classes/Adventurer";
import { Button } from "../models/gui/Button";
import { Label } from "../models/gui/Label";
import { Window } from "../models/gui/Window";



export const getKeybindsWindow = (game: Game): Window => {
    const windowWidth = game.getViewportSize.width / 2;
    const windowHeight = game.getViewportSize.height / 2;
    const windowX = game.getViewportSize.width / 4;
    const windowY = game.getViewportSize.height / 4;
    const lineHeight = windowHeight / 20;
    const keybindWindow = new Window({
        game: game,
        x: windowX,
        y: windowY,
        width: windowWidth,
        height: windowHeight,
        name: "Key Bindings",
        uiElements: [],
    });

    keybindWindow.addUIElement(new Label({
        game,
        height: lineHeight * 2,
        width: windowWidth / 2,
        x: windowWidth / 4,
        y: lineHeight * 1,
        parentWindow: keybindWindow,
        label: "Key Bindings",
        textAlign: "center",
        name: "Key Bindings",
    }));

    const keys = [{
        key: 'A',
        label: 'Move left'
    },
    {
        key: 'D',
        label: 'Move right'
    },
    {
        key: 'Space',
        label: 'Jump'
    },
    {
        key: "Mouse",
        label: 'Aim'
    },
    {
        key: "LMB",
        label: 'Attack'
    },
    ...Object.keys(game.getAdventurer.specialAbilities).map((key, index) => ({

        key: `${index + 1}`,
        label: game.getAdventurer.specialAbilities[key as SpecialAbilities].name,

    })),

    {
        key: 'W',
        label: 'Climb up'
    },
    {
        key: 'S',
        label: 'Climb down'
    },
    {
        key: 'P',
        label: 'Pause'
    },
    {
        key: 'Escape',
        label: 'Open menu'
    }

    ]




    keys.forEach((key, index) => {
        const numberOfRowsPerColumn = 6;
        const column = index % numberOfRowsPerColumn;
        const row = Math.floor(index / numberOfRowsPerColumn);
        const y = lineHeight * 3 + lineHeight * column * 2;
        const xUnit = windowWidth / 6;
        const x = (row * 2 - 1) * xUnit;
        keybindWindow.addUIElement(new Label({
            game,
            height: lineHeight * 1.5,
            width: windowWidth / 2,
            x,
            y,
            parentWindow: keybindWindow,
            label: key.label,
            textAlign: "left",
            name: key.label,
        }));
        keybindWindow.addUIElement(new Label({
            game,
            height: lineHeight * 1.5,
            width: windowWidth / 2,
            x: x + xUnit,
            y,
            parentWindow: keybindWindow,
            label: key.key,
            textAlign: "left",
            name: key.key,
        }));
    })



    keybindWindow.addUIElement(new Button({
        game,
        height: lineHeight * 2,
        width: windowWidth / 2,
        x: windowWidth / 4,
        y: (windowHeight / 10) * 8,
        parentWindow: keybindWindow,
        label: "Back",
        onClick: () => {
            game.removeWindow(keybindWindow);
        },
        name: "Back Button",
    }));

    return keybindWindow
};