import { Viewport } from "../types/Viewport";

export const getBaseSpeedX = (viewport: Viewport): number => {
    return viewport.width / 100;
}