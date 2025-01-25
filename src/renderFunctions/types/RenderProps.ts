import { Adventurer } from "../../models/classes/Adventurer";
import { Coordinates } from "../../types/Coordinates";

export interface RenderProps {
  ctx: CanvasRenderingContext2D;
  viewportCoordinates: Coordinates;
  canvasWidth: number;
  canvasHeight: number;
  gameWindowWidth: number;
  gameWindowHeight: number;
  adventurer: Adventurer;
  pressedKeys: Record<string, boolean>;
  paused: boolean;
  mousePosition: Coordinates;
  isTest?: boolean;
}
