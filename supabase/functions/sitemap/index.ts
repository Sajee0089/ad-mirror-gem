import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SITE_URL = "https://www.ads-sl.com";

const categorySlugMap: Record<string, string> = {
  "Spa": "spa-ads",
  "Live Cam": "live-cam-ads",
  "Girls Personal": "girls-personal-ads",
  "Boys Personal": "boys-personal-ads",
  "Shemale Personal": "shemale-personal-ads",
  "Marriage Proposals": "marriage-proposals",
  "Rooms": "rooms-ads",
  "Toys & Accessories": "toys-accessories-ads",
};

const districts = [
  "Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", "Nuwara Eliya",
  "Galle", "Matara", "Hambantota", "Jaffna", "Kilinochchi", "Mannar",
  "Mullaitivu", "Vavuniya", "Batticaloa", "Ampara", "Trincomalee",
  "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa", "Badulla",
  "Monaragala", "Ratnapura", "Kegalle",
];

const districtToSlug = (d: string) => d.toLowerCase().replace(/\s+/g, "-");

serve(async () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: ads } = await supabase
    .from("ads")
    .select("slug, updated_at")
    .eq("status", "approved")
    .not("slug", "is", null);

  const { data: blogPosts } = await supabase
    .from("blog_posts")
    .select("slug, updated_at");

  const now = new Date().toISOString().split("T")[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <!-- Homepage -->
  <url>
    <loc>${SITE_URL}/</loc>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
    <lastmod>${now}</lastmod>
  </url>

  <!-- Static pages -->
  <url>
    <loc>${SITE_URL}/blogs</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${SITE_URL}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${SITE_URL}/privacy</loc>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${SITE_URL}/terms</loc>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
`;

  // Blog posts
  if (blogPosts) {
    for (const post of blogPosts) {
      xml += `
  <url>
    <loc>${SITE_URL}/blog/${post.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <lastmod>${post.updated_at?.split("T")[0] || now}</lastmod>
  </url>`;
    }
  }

  // District pages
  for (const d of districts) {
    xml += `
  <url>
    <loc>${SITE_URL}/district/${districtToSlug(d)}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
  }

  // Category pages
  for (const [, slug] of Object.entries(categorySlugMap)) {
    xml += `
  <url>
    <loc>${SITE_URL}/${slug}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
  }

  // District + Category
  for (const d of districts) {
    for (const [, catSlug] of Object.entries(categorySlugMap)) {
      xml += `
  <url>
    <loc>${SITE_URL}/${districtToSlug(d)}/${catSlug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    }
  }

  // Individual ad pages
  if (ads) {
    for (const ad of ads) {
      xml += `
  <url>
    <loc>${SITE_URL}/ad/${ad.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
    <lastmod>${ad.updated_at?.split("T")[0] || now}</lastmod>
  </url>`;
    }
  }

  xml += `
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
});
