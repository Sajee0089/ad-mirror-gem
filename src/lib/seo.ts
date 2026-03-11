export const SITE_URL = "https://www.ads-sl.com";

export const categorySlugMap: Record<string, string> = {
  "Spa": "spa-ads",
  "Live Cam": "live-cam-ads",
  "Girls Personal": "girls-personal-ads",
  "Boys Personal": "boys-personal-ads",
  "Shemale Personal": "shemale-personal-ads",
  "Marriage Proposals": "marriage-proposals",
  "Rooms": "rooms-ads",
  "Toys & Accessories": "toys-accessories-ads",
};

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
