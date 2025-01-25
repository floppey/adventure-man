"use client";
import { initAdventureMan } from "../adventureMan";
import { useEffect, useRef } from "react";
import { AdventureManSprites } from "./AdventureManSprites";

export const AdventureManGame = () => {
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);
  const monsterCanvasRef = useRef<HTMLCanvasElement>(null);
  const platformCanvasRef = useRef<HTMLCanvasElement>(null);
  const adventurerCanvasRef = useRef<HTMLCanvasElement>(null);
  const projectileCanvasRef = useRef<HTMLCanvasElement>(null);
  const gameUiCanvasRef = useRef<HTMLCanvasElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (
      !initialized.current &&
      adventurerCanvasRef.current &&
      platformCanvasRef.current &&
      monsterCanvasRef.current &&
      projectileCanvasRef.current &&
      backgroundCanvasRef.current &&
      gameUiCanvasRef.current
    ) {
      initialized.current = true;
      initAdventureMan({
        adventurerCanvas: adventurerCanvasRef.current,
        platformCanvas: platformCanvasRef.current,
        monsterCanvas: monsterCanvasRef.current,
        backgroundCanvas: backgroundCanvasRef.current,
        projectileCanvas: projectileCanvasRef.current,
        gameUiCanvas: gameUiCanvasRef.current,
      });
    }
  }, []);

  return (
    <>
      <canvas ref={backgroundCanvasRef} width={1000} height={1000} />
      <canvas ref={platformCanvasRef} width={1000} height={1000} />
      <canvas ref={monsterCanvasRef} width={1000} height={1000} />
      <canvas ref={projectileCanvasRef} width={1000} height={1000} />
      <canvas ref={adventurerCanvasRef} width={1000} height={1000} />
      <canvas ref={gameUiCanvasRef} width={1000} height={1000} />
      <AdventureManSprites />
    </>
  );
};
