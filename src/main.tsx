import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { ErrorBoundary } from "./ErrorBoundary";
import { synth } from "./game/AsmrSynth";
import { DevHudPreview } from "./components/DevHudPreview";
import { DevResultPreview } from "./components/DevResultPreview";

const App = lazy(() => import("./App"));
const qaMode = import.meta.env.DEV ? new URLSearchParams(window.location.search).get("qa") : null;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {qaMode === "hud" ? (
      <DevHudPreview />
    ) : qaMode === "result" ? (
      <DevResultPreview />
    ) : (
      <ErrorBoundary
        gameName="Earwax Miner"
        accent="#fb923c"
        saveKeys={["extreme-earwax-miner-v1"]}
        onCrash={() => synth.stopMusic()}
      >
        <Suspense fallback={null}>
          <App />
        </Suspense>
      </ErrorBoundary>
    )}
  </StrictMode>
);
