/**
 * Anonymous Supabase client used ONLY for public reads (ads, blog posts).
 *
 * It never reads or sends the visitor's saved login, so a stale/expired/corrupted
 * session in a returning browser can't make ad listings fail with 401 errors.
 * Requests time out and retry once, so a slow network doesn't leave the page
 * stuck on skeletons forever.
 */
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || "https://webpiillbgbwgjzkbece.supabase.co";
const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlYnBpaWxsYmdid2dqemtiZWNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1NTI5NjQsImV4cCI6MjA5NjEyODk2NH0.yUz9IRPjWa1iTgRiMH1RP0E01h_fhvLA2xlP55_gYTs";

const TIMEOUT_MS = 15000;

const fetchWithTimeoutAndRetry: typeof fetch = async (input, init) => {
  const attempt = async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      return await fetch(input, { ...init, cache: "no-store", signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
  };
  try {
    const res = await attempt();
    if (res.status >= 500) return await attempt();
    return res;
  } catch {
    await new Promise((r) => setTimeout(r, 800));
    return attempt();
  }
};

const memoryStorage = new Map<string, string>();

export const publicSupabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
    storageKey: "ads-sl-public-anon",
    storage: {
      getItem: (k) => memoryStorage.get(k) ?? null,
      setItem: (k, v) => void memoryStorage.set(k, v),
      removeItem: (k) => void memoryStorage.delete(k),
    },
  },
  global: { fetch: fetchWithTimeoutAndRetry },
});
