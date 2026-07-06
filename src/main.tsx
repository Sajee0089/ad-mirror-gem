import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

// Normalize legacy/static-host refresh URLs before React Router reads them.
// - /index and /index.html must render the homepage, not the dynamic category route.
// - public/404.html encodes deep links as ?p=/path on static hosts; restore them here.
const normalizeRefreshUrl = () => {
  const url = new URL(window.location.href);
  const redirectedPath = url.searchParams.get("p");
  const cacheRefresh = url.searchParams.has("__cache_refresh");

  if (redirectedPath?.startsWith("/") && !redirectedPath.startsWith("//")) {
    window.history.replaceState(null, "", redirectedPath);
    return;
  }

  if (cacheRefresh) {
    url.searchParams.delete("__cache_refresh");
    window.history.replaceState(
      null,
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
    return;
  }

  if (/^\/index(?:\.html)?\/?$/.test(url.pathname)) {
    window.history.replaceState(null, "", `/${url.search}${url.hash}`);
  }
};

normalizeRefreshUrl();

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
      const recover = (window as any).__ADS_SL_RECOVER_STALE_CACHE__;
      if (typeof recover === "function") {
        recover();
      } else {
        const url = new URL(window.location.href);
        url.searchParams.set("__cache_refresh", String(Date.now()));
        window.location.replace(url.toString());
      }
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
