export interface CategoryConfig {
  name: string;
  slug: string;
  adult: boolean;
  shortLabel: string;
  description: string;
}

export const CATEGORIES: CategoryConfig[] = [
  {
    name: "Spa",
    slug: "spa-ads",
    adult: false,
    shortLabel: "Spa & Wellness",
    description: "Ayurvedic, massage, and wellness spa listings across Sri Lanka.",
  },
  {
    name: "Live Cam",
    slug: "live-cam-ads",
    adult: true,
    shortLabel: "Live Cam",
    description: "Online live cam services from verified adult performers.",
  },
  {
    name: "Girls Personal",
    slug: "girls-personal-ads",
    adult: true,
    shortLabel: "Girls Personal",
    description: "Adult personal classifieds posted by women across Sri Lanka.",
  },
  {
    name: "Boys Personal",
    slug: "boys-personal-ads",
    adult: true,
    shortLabel: "Boys Personal",
    description: "Adult personal classifieds posted by men across Sri Lanka.",
  },
  {
    name: "Shemale Personal",
    slug: "shemale-personal-ads",
    adult: true,
    shortLabel: "Shemale Personal",
    description: "Adult personal classifieds across Sri Lanka.",
  },
  {
    name: "Marriage Proposals",
    slug: "marriage-proposals",
    adult: false,
    shortLabel: "Marriage Proposals",
    description: "Genuine matrimonial and marriage proposal listings from Sri Lankan families.",
  },
  {
    name: "Rooms",
    slug: "rooms-ads",
    adult: false,
    shortLabel: "Rooms",
    description: "Short-stay and monthly rooms for rent across all 25 Sri Lankan districts.",
  },
  {
    name: "Toys & Accessories",
    slug: "toys-accessories-ads",
    adult: true,
    shortLabel: "Toys & Accessories",
    description: "Adult wellness accessories with discreet island-wide delivery.",
  },
];

export const MAIN_SITE_URL = "https://www.ads-sl.com";

export function getAdultBaseUrl(): string | null {
  const raw =
    (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_ADULT_BASE_URL) ||
    (typeof process !== "undefined" && process.env?.VITE_ADULT_BASE_URL) ||
    "";
  const trimmed = String(raw).trim().replace(/\/+$/, "");
  return trimmed ? trimmed : null;
}

export function getCategoryByName(name?: string | null): CategoryConfig | undefined {
  if (!name) return undefined;
  return CATEGORIES.find((c) => c.name === name);
}

export function getCategoryBySlug(slug?: string | null): CategoryConfig | undefined {
  if (!slug) return undefined;
  return CATEGORIES.find((c) => c.slug === slug);
}

export function isAdultCategory(categoryName?: string | null): boolean {
  return Boolean(getCategoryByName(categoryName)?.adult);
}

export function getBaseUrlForCategory(categoryName?: string | null): string {
  if (isAdultCategory(categoryName)) {
    return getAdultBaseUrl() || MAIN_SITE_URL;
  }
  return MAIN_SITE_URL;
}

export function buildCanonicalUrl(path: string, isAdult = false): string {
  const base = isAdult ? getAdultBaseUrl() || MAIN_SITE_URL : MAIN_SITE_URL;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}
