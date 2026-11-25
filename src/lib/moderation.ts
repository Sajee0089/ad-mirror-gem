export const MIN_TITLE_LENGTH = 10;
export const MIN_DESCRIPTION_LENGTH = 60;
export const THIN_AD_DESCRIPTION_LENGTH = 40;

// Blocklist for minor-related and illegal/explicit terms
const BLOCKED_PATTERNS: { pattern: RegExp; label: string }[] = [
  { pattern: /\b(underage|minor|minors|child|children|kid|kids|teen|teens|schoolgirl|schoolboy|loli|shota|pedophil|cp\b|preteen)\b/i, label: "minor-related content" },
  { pattern: /\b(rape|incest|bestiality|zoophilia|snuff|non-consensual|forced sex)\b/i, label: "prohibited explicit content" },
  { pattern: /\b(hardcore porn|xxx video|pornography|explicit sex|blowjob|handjob|cumshot|gangbang|anal sex|oral sex)\b/i, label: "explicit sexual terminology" },
];

export function checkContentSafety(text: string): { blocked: boolean; reason?: string } {
  const normalized = String(text || "");
  for (const rule of BLOCKED_PATTERNS) {
    if (rule.pattern.test(normalized)) {
      return {
        blocked: true,
        reason: `Your listing contains prohibited ${rule.label}. Please remove explicit or unsafe terms before submitting.`,
      };
    }
  }
  return { blocked: false };
}

export function isThinAd(ad: { description?: string | null; image_url?: string | null }): boolean {
  const descLen = (ad.description || "").trim().length;
  const hasPhoto = Boolean(ad.image_url && ad.image_url.trim().length > 0);
  return descLen < THIN_AD_DESCRIPTION_LENGTH || !hasPhoto;
}

/**
 * Extracts an explicit LKR price from text only when clearly stated (e.g., "Rs. 5,000", "LKR 12000").
 * Returns null if no clear valid price exists so JSON-LD never emits fake Offer prices.
 */
export function extractValidPrice(text?: string | null): number | null {
  if (!text) return null;
  const match = text.match(/\b(?:Rs\.?|LKR|SLR)\s*([1-9][0-9]{2,7}(?:,[0-9]{3})*)\b/i);
  if (!match?.[1]) return null;
  const num = Number(match[1].replace(/,/g, ""));
  if (!Number.isFinite(num) || num < 100 || num > 500000000) return null;
  return num;
}

export function truncateMeta(text: string, maxLen: number): string {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (clean.length <= maxLen) return clean;
  const sliced = clean.slice(0, maxLen - 1);
  const lastSpace = sliced.lastIndexOf(" ");
  return `${(lastSpace > maxLen * 0.6 ? sliced.slice(0, lastSpace) : sliced).trim()}…`;
}

export interface TextSegment {
  type: "text" | "link";
  value: string;
  href?: string;
}

export function splitTextWithLinks(text: string): TextSegment[] {
  const regex = /(https?:\/\/[^\s<>"']+)/gi;
  const parts = String(text || "").split(regex);
  return parts
    .filter((p) => p.length > 0)
    .map((part) => {
      if (/^https?:\/\//i.test(part)) {
        return { type: "link", value: part, href: part };
      }
      return { type: "text", value: part };
    });
}