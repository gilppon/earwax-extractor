import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { ErrorBoundary } from "./ErrorBoundary";
import { synth } from "./game/AsmrSynth";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary
      gameName="Earwax Miner"
      accent="#fb923c"
      saveKeys={["extreme-earwax-miner-v1"]}
      onCrash={() => synth.stopMusic()}
    >
      <App />
    </ErrorBoundary>
  </StrictMode>
);
