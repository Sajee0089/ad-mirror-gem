// Generates public/sitemap.xml at build time by fetching approved ads + blog posts
// from Supabase REST. Runs as a Vite buildStart hook (see vite.config.ts).
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const SITE_URL = "https://www.ads-sl.com";
const SUPABASE_URL = "https://vlucxspeohjhrhdxkpqb.supabase.co";
const SUPABASE_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsdWN4c3Blb2hqaHJoZHhrcHFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzNTc3NzQsImV4cCI6MjA4NzkzMzc3NH0.iAbynpvY4xJcagOEIj1sL43vF64HczfGOT1foiv2f6Q";

const categorySlugMap = {
  Spa: "spa-ads",
  "Live Cam": "live-cam-ads",
  "Girls Personal": "girls-personal-ads",
  "Boys Personal": "boys-personal-ads",
  "Shemale Personal": "shemale-personal-ads",
  "Marriage Proposals": "marriage-proposals",
  Rooms: "rooms-ads",
  "Toys & Accessories": "toys-accessories-ads",
};

const districts = [
  "Colombo","Gampaha","Kalutara","Kandy","Matale","Nuwara Eliya","Galle","Matara",
  "Hambantota","Jaffna","Kilinochchi","Mannar","Mullaitivu","Vavuniya","Batticaloa",
  "Ampara","Trincomalee","Kurunegala","Puttalam","Anuradhapura","Polonnaruwa",
  "Badulla","Monaragala","Ratnapura","Kegalle",
];
const districtToSlug = (d) => d.toLowerCase().replace(/\s+/g, "-");

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

export async function generateSitemap() {
  const ads = await fetchTable("ads?select=slug,updated_at&status=eq.approved&slug=not.is.null&limit=5000");
  const blogs = await fetchTable("blog_posts?select=slug,updated_at");
  const now = new Date().toISOString().split("T")[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  const url = (loc, cf, p, lm) =>
    `  <url><loc>${loc}</loc><changefreq>${cf}</changefreq><priority>${p}</priority>${lm ? `<lastmod>${lm}</lastmod>` : ""}</url>\n`;

  xml += url(`${SITE_URL}/`, "hourly", "1.0", now);
  xml += url(`${SITE_URL}/blogs`, "daily", "0.6");
  xml += url(`${SITE_URL}/about`, "monthly", "0.5");
  xml += url(`${SITE_URL}/privacy`, "monthly", "0.3");
  xml += url(`${SITE_URL}/terms`, "monthly", "0.3");

  for (const b of blogs) xml += url(`${SITE_URL}/blog/${b.slug}`, "weekly", "0.7", b.updated_at?.split("T")[0]);
  for (const d of districts) xml += url(`${SITE_URL}/district/${districtToSlug(d)}`, "daily", "0.8");
  for (const slug of Object.values(categorySlugMap)) xml += url(`${SITE_URL}/${slug}`, "daily", "0.8");
  for (const d of districts)
    for (const slug of Object.values(categorySlugMap))
      xml += url(`${SITE_URL}/${districtToSlug(d)}/${slug}`, "weekly", "0.7");
  for (const a of ads) xml += url(`${SITE_URL}/ad/${a.slug}`, "weekly", "0.6", a.updated_at?.split("T")[0]);

  xml += `</urlset>\n`;

  const __dirname = dirname(fileURLToPath(import.meta.url));
  const out = resolve(__dirname, "..", "public", "sitemap.xml");
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, xml, "utf8");
  console.log(`[sitemap] wrote ${out} (${ads.length} ads, ${blogs.length} blogs)`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  generateSitemap();
}
