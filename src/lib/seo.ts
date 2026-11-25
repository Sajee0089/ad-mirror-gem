import { CATEGORIES, MAIN_SITE_URL, getAdultBaseUrl, isAdultCategory } from "@/config/categories";

export const SITE_URL = MAIN_SITE_URL;

export const categorySlugMap: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.name, c.slug]),
);

export const categoryFromSlug: Record<string, string> = Object.fromEntries(
  Object.entries(categorySlugMap).map(([k, v]) => [v, k])
);

export const allCategorySlugs = Object.values(categorySlugMap);

export const districtToSlug = (district: string) =>
  district.toLowerCase().replace(/\s+/g, "-");

export const districtFromSlug = (slug: string, districts: string[]) =>
  districts.find((d) => districtToSlug(d) === slug) || null;

export const getAdUrl = (slug: string) => `/ad/${slug}`;
export const getDistrictUrl = (district: string) => `/district/${districtToSlug(district)}`;
export const getCategoryUrl = (category: string) => `/${categorySlugMap[category] || category}`;
export const getDistrictCategoryUrl = (district: string, category: string) =>
  `/${districtToSlug(district)}/${categorySlugMap[category] || category}`;

export const getCanonicalHostForCategory = (category?: string | null) =>
  isAdultCategory(category) ? getAdultBaseUrl() || SITE_URL : SITE_URL;
