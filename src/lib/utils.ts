import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number into a short, human-readable string (e.g. 1.2k, 5k, 1.3M).
 * Used for displaying view/like counts in a more realistic, social-style way.
 */
export function formatCount(value: number | string | null | undefined): string {
  const n = typeof value === "number" ? value : parseInt(String(value ?? "0").replace(/[^0-9]/g, ""), 10);
  if (!n || isNaN(n) || n < 0) return "0";
  if (n < 1000) return String(n);
  if (n < 10_000) {
    // 1.2k, 9.9k
    const v = n / 1000;
    const rounded = Math.floor(v * 10) / 10;
    return `${rounded}k`.replace(".0k", "k");
  }
  if (n < 1_000_000) {
    // 12k, 999k
    return `${Math.floor(n / 1000)}k`;
  }
  const m = n / 1_000_000;
  const rounded = Math.floor(m * 10) / 10;
  return `${rounded}M`.replace(".0M", "M");
}
