/**
 * sessionManager.ts
 *
 * Central utility for keeping the browser session healthy for ads-sl.com.
 * Handles cache clearing, Supabase session validation, service worker cleanup,
 * cookie management, extension detection and runtime error monitoring.
 */
import { supabase } from "@/integrations/supabase/client";

const APP_VERSION = "2026-07-08-session-manager-v1";
const APP_VERSION_KEY = "__ads_sl_app_version";

const log = (...args: unknown[]) => {
  // eslint-disable-next-line no-console
  console.log("[sessionManager]", ...args);
};

const warn = (...args: unknown[]) => {
  // eslint-disable-next-line no-console
  console.warn("[sessionManager]", ...args);
};

/** Delete every cookie the page can see. */
export const clearAllCookies = () => {
  try {
    const cookies = document.cookie ? document.cookie.split(";") : [];
    const host = window.location.hostname;
    const hostParts = host.split(".");
    const domains = new Set<string>(["", host]);
    for (let i = 0; i < hostParts.length - 1; i++) {
      domains.add("." + hostParts.slice(i).join("."));
    }
    cookies.forEach((raw) => {
      const eq = raw.indexOf("=");
      const name = (eq > -1 ? raw.substr(0, eq) : raw).trim();
      if (!name) return;
      domains.forEach((d) => {
        const domainPart = d ? `; domain=${d}` : "";
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domainPart}`;
      });
    });
    log("cookies cleared");
  } catch (e) {
    warn("cookie clear failed", e);
  }
};

/** Unregister every service worker and delete every Cache Storage entry. */
export const unregisterServiceWorkers = async () => {
  try {
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister().catch(() => false)));
      log(`unregistered ${regs.length} service worker(s)`);
    }
    if (typeof caches !== "undefined") {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
      log(`deleted ${keys.length} cache storage entrie(s)`);
    }
  } catch (e) {
    warn("service worker cleanup failed", e);
  }
};

/** Clear localStorage + sessionStorage + cookies + service workers, then hard reload. */
export const clearAllBrowserState = async (options?: { reload?: boolean }) => {
  const reload = options?.reload ?? true;
  log("clearing all browser state...");
  try {
    localStorage.clear();
  } catch (e) {
    warn("localStorage clear failed", e);
  }
  try {
    sessionStorage.clear();
  } catch (e) {
    warn("sessionStorage clear failed", e);
  }
  clearAllCookies();
  await unregisterServiceWorkers();

  if (reload) {
    const url = new URL(window.location.href);
    url.searchParams.set("v", String(Date.now()));
    window.location.replace(url.toString());
  }
};

/** Basic sanity check on a Supabase session stored in localStorage. */
export const validateAndRefreshSession = async () => {
  try {
    // Find any Supabase auth token localStorage entry.
    const keys = Object.keys(localStorage).filter((k) =>
      k.startsWith("sb-") && k.endsWith("-auth-token"),
    );
    for (const key of keys) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw);
        const expiresAt: number | undefined =
          parsed?.expires_at ?? parsed?.currentSession?.expires_at;
        if (expiresAt && Date.now() / 1000 > expiresAt) {
          warn("expired supabase token, clearing", key);
          localStorage.removeItem(key);
        }
      } catch {
        warn("malformed supabase token, clearing", key);
        localStorage.removeItem(key);
      }
    }

    const { data, error } = await supabase.auth.getUser();
    if (error) {
      log("no valid user session:", error.message);
      return null;
    }
    if (data.user) {
      log("session valid for", data.user.email);
      // Best-effort refresh; ignore failures (offline, etc.)
      supabase.auth.refreshSession().catch(() => undefined);
    }
    return data.user;
  } catch (e) {
    warn("session validation failed", e);
    return null;
  }
};

/** Bump app version — if changed since last visit, wipe stale app caches. */
export const enforceAppVersion = async () => {
  try {
    const prev = localStorage.getItem(APP_VERSION_KEY);
    if (prev !== APP_VERSION) {
      log(`app version changed ${prev} -> ${APP_VERSION}, clearing caches`);
      sessionStorage.removeItem("indexAdsCache");
      sessionStorage.removeItem("indexCurrentPage");
      sessionStorage.removeItem("indexScrollY");
      await unregisterServiceWorkers();
      localStorage.setItem(APP_VERSION_KEY, APP_VERSION);
    }
  } catch (e) {
    warn("version check failed", e);
  }
};

/** Detect obvious extension DOM injection. Non-fatal, just logs. */
export const detectExtensionInterference = () => {
  try {
    const suspects = [
      'script[src*="chrome-extension://"]',
      'script[src*="moz-extension://"]',
      'iframe[src*="chrome-extension://"]',
      '[id^="__extension"]',
    ];
    const hits: string[] = [];
    suspects.forEach((sel) => {
      if (document.querySelector(sel)) hits.push(sel);
    });
    if (hits.length) {
      warn("possible browser extension interference detected:", hits);
    }
    return hits;
  } catch {
    return [];
  }
};

/** Log 4xx/5xx fetches and network failures for later debugging. */
export const installRuntimeErrorMonitor = () => {
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (...args) => {
    try {
      const res = await originalFetch(...args);
      if (res.status === 401 || res.status === 403) {
        warn(`auth error ${res.status} on`, args[0]);
      } else if (res.status >= 500) {
        warn(`server error ${res.status} on`, args[0]);
      }
      return res;
    } catch (err) {
      warn("network failure on", args[0], err);
      throw err;
    }
  };

  window.addEventListener("error", (e) => {
    if (/Mixed Content|CORS|blocked by CORS/i.test(String(e.message || ""))) {
      warn("mixed content / CORS error:", e.message);
    }
  });
};

/** Ctrl+Shift+F / Cmd+Shift+F force refresh. */
export const installForceRefreshShortcut = () => {
  window.addEventListener("keydown", (e) => {
    const combo = (e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "f";
    if (combo) {
      e.preventDefault();
      log("force refresh shortcut triggered");
      clearAllBrowserState({ reload: true });
    }
  });
};

/** Single entry point called from App on mount. */
export const initializeSession = async () => {
  log("initializing session, version", APP_VERSION);
  await enforceAppVersion();
  await validateAndRefreshSession();
  detectExtensionInterference();
  installRuntimeErrorMonitor();
  installForceRefreshShortcut();
};
