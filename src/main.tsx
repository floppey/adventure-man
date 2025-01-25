import React from "react";
import { createRoot } from "react-dom/client";
import { AdventureManGame } from "./components/AdventureManGame";

const container = document.getElementById("root") as HTMLElement;
const root = createRoot(container);
root.render(<AdventureManGame />);
