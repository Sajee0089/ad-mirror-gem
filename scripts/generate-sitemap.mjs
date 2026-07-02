// Generates public/sitemap.xml at build time.
// - Pulls approved ads + blog posts from Supabase REST.
// - Excludes district / category / district+category pages with ZERO active listings
//   (avoids "Thin Content" / "Soft 404" flags).
// - Sets <lastmod> from the most recent updated_at per scope.
// - Homepage: daily. Categories & districts: weekly. Ads/blogs: weekly.
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const SITE_URL = "https://www.ads-sl.com";
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://webpiillbgbwgjzkbece.supabase.co";
const SUPABASE_ANON =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlYnBpaWxsYmdid2dqemtiZWNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1NTI5NjQsImV4cCI6MjA5NjEyODk2NH0.yUz9IRPjWa1iTgRiMH1RP0E01h_fhvLA2xlP55_gYTs";

export const categorySlugMap = {
  Spa: "spa-ads",
  "Live Cam": "live-cam-ads",
  "Girls Personal": "girls-personal-ads",
  "Boys Personal": "boys-personal-ads",
  "Shemale Personal": "shemale-personal-ads",
  "Marriage Proposals": "marriage-proposals",
  Rooms: "rooms-ads",
  "Toys & Accessories": "toys-accessories-ads",
};

export const districts = [
  "Colombo","Gampaha","Kalutara","Kandy","Matale","Nuwara Eliya","Galle","Matara",
  "Hambantota","Jaffna","Kilinochchi","Mannar","Mullaitivu","Vavuniya","Batticaloa",
  "Ampara","Trincomalee","Kurunegala","Puttalam","Anuradhapura","Polonnaruwa",
  "Badulla","Monaragala","Ratnapura","Kegalle",
];
export const districtToSlug = (d) => d.toLowerCase().replace(/\s+/g, "-");

async function fetchTable(path) {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` },
    });
    if (!r.ok) return [];
    return await r.json();
  } catch {
    return [];
  }
}

const datePart = (iso) => (iso ? String(iso).split("T")[0] : null);
const maxDate = (a, b) => (!a ? b : !b ? a : a > b ? a : b);

export async function generateSitemap() {
  // Pull all approved ads with the fields we need to compute lastmods + counts.
  const ads = await fetchTable(
    "ads?select=slug,updated_at,approved_at,category,location&status=eq.approved&slug=not.is.null&limit=10000",
  );
  const blogs = await fetchTable("blog_posts?select=slug,updated_at");

  // Aggregate counts + lastmods per scope
  const perCategory = new Map();   // categoryName -> { count, lastmod }
  const perDistrict = new Map();   // districtName -> { count, lastmod }
  const perCombo = new Map();      // `${district}|${category}` -> { count, lastmod }
  let homepageLastmod = null;

  for (const a of ads) {
    const lm = datePart(a.updated_at) || datePart(a.approved_at);
    homepageLastmod = maxDate(homepageLastmod, lm);

    if (a.category) {
      const cur = perCategory.get(a.category) || { count: 0, lastmod: null };
      cur.count++;
      cur.lastmod = maxDate(cur.lastmod, lm);
      perCategory.set(a.category, cur);
    }
    if (a.location) {
      const cur = perDistrict.get(a.location) || { count: 0, lastmod: null };
      cur.count++;
      cur.lastmod = maxDate(cur.lastmod, lm);
      perDistrict.set(a.location, cur);
    }
    if (a.location && a.category) {
      const k = `${a.location}|${a.category}`;
      const cur = perCombo.get(k) || { count: 0, lastmod: null };
      cur.count++;
      cur.lastmod = maxDate(cur.lastmod, lm);
      perCombo.set(k, cur);
    }
  }

  const today = new Date().toISOString().split("T")[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  const url = (loc, cf, p, lm) =>
    `  <url><loc>${loc}</loc><changefreq>${cf}</changefreq><priority>${p}</priority>${lm ? `<lastmod>${lm}</lastmod>` : ""}</url>\n`;

  // Static pages
  xml += url(`${SITE_URL}/`, "daily", "1.0", homepageLastmod || today);
  xml += url(`${SITE_URL}/blogs`, "weekly", "0.6", today);
  xml += url(`${SITE_URL}/about`, "monthly", "0.5");
  xml += url(`${SITE_URL}/contact`, "monthly", "0.5");
  xml += url(`${SITE_URL}/privacy`, "monthly", "0.3");
  xml += url(`${SITE_URL}/terms`, "monthly", "0.3");

  // Blog posts
  for (const b of blogs) {
    xml += url(`${SITE_URL}/blog/${b.slug}`, "weekly", "0.7", datePart(b.updated_at));
  }

  // Districts — only if they have at least 1 active ad
  for (const d of districts) {
    const info = perDistrict.get(d);
    if (!info || info.count === 0) continue;
    xml += url(`${SITE_URL}/district/${districtToSlug(d)}`, "weekly", "0.8", info.lastmod || today);
  }

  // Categories — only if they have at least 1 active ad
  for (const [catName, slug] of Object.entries(categorySlugMap)) {
    const info = perCategory.get(catName);
    if (!info || info.count === 0) continue;
    xml += url(`${SITE_URL}/${slug}`, "weekly", "0.8", info.lastmod || today);
  }

  // District + Category combos — only if non-empty
  for (const d of districts) {
    for (const [catName, slug] of Object.entries(categorySlugMap)) {
      const info = perCombo.get(`${d}|${catName}`);
      if (!info || info.count === 0) continue;
      xml += url(`${SITE_URL}/${districtToSlug(d)}/${slug}`, "weekly", "0.6", info.lastmod || today);
    }
  }

  // Individual ads
  for (const a of ads) {
    xml += url(`${SITE_URL}/ad/${a.slug}`, "weekly", "0.5", datePart(a.updated_at) || datePart(a.approved_at));
  }

  xml += `</urlset>\n`;

  const __dirname = dirname(fileURLToPath(import.meta.url));
  const out = resolve(__dirname, "..", "public", "sitemap.xml");
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, xml, "utf8");
  console.log(
    `[sitemap] wrote ${out} — ${ads.length} ads, ${blogs.length} blogs, ${perDistrict.size} districts, ${perCategory.size} categories, ${perCombo.size} combos`,
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  generateSitemap();
}
