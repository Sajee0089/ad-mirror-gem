export const MAIN_SITE_URL = "https://www.ads-sl.com";
export const ADS_PER_PAGE = 24;
export const MIN_COMBO_ADS_FOR_INDEX = 3;
export const THIN_AD_DESC_LEN = 40;

export interface ApiCategory {
  name: string;
  slug: string;
  adult: boolean;
}

export const API_CATEGORIES: ApiCategory[] = [
  { name: "Spa", slug: "spa-ads", adult: false },
  { name: "Live Cam", slug: "live-cam-ads", adult: true },
  { name: "Girls Personal", slug: "girls-personal-ads", adult: true },
  { name: "Boys Personal", slug: "boys-personal-ads", adult: true },
  { name: "Shemale Personal", slug: "shemale-personal-ads", adult: true },
  { name: "Marriage Proposals", slug: "marriage-proposals", adult: false },
  { name: "Rooms", slug: "rooms-ads", adult: false },
  { name: "Toys & Accessories", slug: "toys-accessories-ads", adult: true },
];

export const API_DISTRICTS: string[] = [
  "Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", "Nuwara Eliya",
  "Galle", "Matara", "Hambantota", "Jaffna", "Kilinochchi", "Mannar",
  "Mullaitivu", "Vavuniya", "Batticaloa", "Ampara", "Trincomalee",
  "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa", "Badulla",
  "Monaragala", "Ratnapura", "Kegalle",
];

export const districtToSlug = (d: string) => d.toLowerCase().replace(/\s+/g, "-");
export const districtFromSlug = (slug: string) =>
  API_DISTRICTS.find((d) => districtToSlug(d) === slug.toLowerCase()) || null;
export const categoryFromSlug = (slug: string) =>
  API_CATEGORIES.find((c) => c.slug === slug.toLowerCase()) || null;
export const categoryByName = (name?: string | null) =>
  API_CATEGORIES.find((c) => c.name === name) || null;

export function getAdultBaseUrl(): string | null {
  const raw = process.env.VITE_ADULT_BASE_URL || process.env.ADULT_BASE_URL || "";
  const clean = raw.trim().replace(/\/+$/, "");
  return clean || null;
}

export function getCanonicalBase(isAdult: boolean): string {
  return isAdult ? getAdultBaseUrl() || MAIN_SITE_URL : MAIN_SITE_URL;
}

export function getSupabaseConfig(): { url: string; anonKey: string } | null {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim().replace(/\/+$/, "");
  const anonKey = (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "").trim();
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

export async function fetchSupabase<T = any>(restPath: string): Promise<T[]> {
  const cfg = getSupabaseConfig();
  if (!cfg) return [];
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(`${cfg.url}/rest/v1/${restPath}`, {
      headers: {
        apikey: cfg.anonKey,
        Authorization: `Bearer ${cfg.anonKey}`,
        Accept: "application/json",
      },
      signal: controller.signal,
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

export function escapeHtml(str = ""): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function escapeXml(str = ""): string {
  return escapeHtml(str);
}

export function truncate(str: string, max: number): string {
  const clean = String(str || "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const sp = cut.lastIndexOf(" ");
  return `${(sp > max * 0.6 ? cut.slice(0, sp) : cut).trim()}…`;
}

export function isThinAdRow(ad: { description?: string | null; image_url?: string | null }): boolean {
  return (ad.description || "").trim().length < THIN_AD_DESC_LEN || !(ad.image_url || "").trim();
}

export function extractValidPrice(text?: string | null): number | null {
  if (!text) return null;
  const m = text.match(/\b(?:Rs\.?|LKR|SLR)\s*([1-9][0-9]{2,7}(?:,[0-9]{3})*)\b/i);
  if (!m?.[1]) return null;
  const n = Number(m[1].replace(/,/g, ""));
  return Number.isFinite(n) && n >= 100 && n <= 500000000 ? n : null;
}

export function toIsoDate(iso?: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().split("T")[0];
}
