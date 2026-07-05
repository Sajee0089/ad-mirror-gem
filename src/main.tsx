import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

// Recover from stale cached index.html referencing missing/old JS chunks
// after a fresh deploy (common cause of "white screen" in previously opened tabs)
const RELOAD_KEY = "__chunk_reload_at";
const handleChunkFailure = (err: unknown) => {
  const msg = String((err as any)?.message || err || "");
  if (
    /Loading chunk|Failed to fetch dynamically imported module|Importing a module script failed|ChunkLoadError|MIME type|Unexpected token '<'/i.test(
      msg,
    )
  ) {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
    if (Date.now() - last > 10_000) {
      sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
      window.location.reload();
    }
  }
};
window.addEventListener("error", (e) => handleChunkFailure(e.error || e.message));
window.addEventListener("unhandledrejection", (e) => handleChunkFailure(e.reason));

// Unregister any legacy service workers that could be serving stale HTML/JS
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations?.().then((regs) => {
    regs.forEach((r) => r.unregister().catch(() => {}));
  }).catch(() => {});
}

createRoot(document.getElementById("root")!).render(<App />);
