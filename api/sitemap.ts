import {
  API_CATEGORIES,
  API_DISTRICTS,
  MAIN_SITE_URL,
  MIN_COMBO_ADS_FOR_INDEX,
  categoryByName,
  districtToSlug,
  escapeXml,
  fetchSupabase,
  getCanonicalBase,
  isThinAdRow,
  toIsoDate,
} from "./_seoShared";

const MAX_URLS_PER_FILE = 10000;

interface AdSitemapRow {
  slug: string;
  category: string;
  location: string | null;
  description: string | null;
  image_url: string | null;
  updated_at: string | null;
  approved_at: string | null;
}

interface BlogSitemapRow {
  slug: string;
  updated_at: string | null;
  created_at: string | null;
}

function urlTag(loc: string, lastmod?: string | null): string {
  return `  <url><loc>${escapeXml(loc)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}</url>\n`;
}

function wrapUrlset(body: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}</urlset>\n`;
}

function maxDate(a: string | null, b: string | null): string | null {
  if (!a) return b;
  if (!b) return a;
  return a > b ? a : b;
}

export async function buildSitemapXml(type: string): Promise<{ status: number; xml: string }> {
  const ads = await fetchSupabase<AdSitemapRow>(
    "ads?select=slug,category,location,description,image_url,updated_at,approved_at&status=eq.approved&slug=not.is.null&order=updated_at.desc&limit=50000",
  );
  const blogs = await fetchSupabase<BlogSitemapRow>(
    "blog_posts?select=slug,updated_at,created_at&order=updated_at.desc&limit=5000",
  );

  const indexableAds = ads.filter((a) => a.slug && !isThinAdRow(a));
  const nonAdultAds = indexableAds.filter((a) => !categoryByName(a.category)?.adult);
  const adultAds = indexableAds.filter((a) => Boolean(categoryByName(a.category)?.adult));

  const perCategory = new Map<string, { count: number; lastmod: string | null }>();
  const perDistrict = new Map<string, { count: number; lastmod: string | null }>();
  const perCombo = new Map<string, { count: number; lastmod: string | null }>();
  let latestAdDate: string | null = null;

  for (const a of ads) {
    const lm = toIsoDate(a.updated_at || a.approved_at);
    latestAdDate = maxDate(latestAdDate, lm);
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

  if (type === "index") {
    const adChunks = Math.max(1, Math.ceil(nonAdultAds.length / MAX_URLS_PER_FILE));
    const files = [
      "static",
      "categories",
      "districts",
      ...Array.from({ length: adChunks }, (_, i) => `ads-${i + 1}`),
      "blog",
      "adult",
    ];
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    for (const f of files) {
      xml += `  <sitemap><loc>${MAIN_SITE_URL}/sitemaps/${f}.xml</loc>${latestAdDate ? `<lastmod>${latestAdDate}</lastmod>` : ""}</sitemap>\n`;
    }
    xml += `</sitemapindex>\n`;
    return { status: 200, xml };
  }

  if (type === "static") {
    let body = "";
    body += urlTag(`${MAIN_SITE_URL}/`, latestAdDate);
    body += urlTag(`${MAIN_SITE_URL}/about`);
    body += urlTag(`${MAIN_SITE_URL}/contact`);
    body += urlTag(`${MAIN_SITE_URL}/safety-tips`);
    body += urlTag(`${MAIN_SITE_URL}/posting-rules`);
    body += urlTag(`${MAIN_SITE_URL}/terms`);
    body += urlTag(`${MAIN_SITE_URL}/privacy`);
    return { status: 200, xml: wrapUrlset(body) };
  }

  if (type === "categories") {
    let body = "";
    for (const cat of API_CATEGORIES.filter((c) => !c.adult)) {
      const info = perCategory.get(cat.name);
      if (!info || info.count === 0) continue;
      body += urlTag(`${MAIN_SITE_URL}/${cat.slug}`, info.lastmod);
      for (const d of API_DISTRICTS) {
        const combo = perCombo.get(`${d}|${cat.name}`);
        if (combo && combo.count >= MIN_COMBO_ADS_FOR_INDEX) {
          body += urlTag(`${MAIN_SITE_URL}/${districtToSlug(d)}/${cat.slug}`, combo.lastmod);
        }
      }
    }
    return { status: 200, xml: wrapUrlset(body) };
  }

  if (type === "districts") {
    let body = "";
    for (const d of API_DISTRICTS) {
      const info = perDistrict.get(d);
      if (!info || info.count === 0) continue;
      body += urlTag(`${MAIN_SITE_URL}/district/${districtToSlug(d)}`, info.lastmod);
    }
    return { status: 200, xml: wrapUrlset(body) };
  }

  if (type === "blog") {
    let body = "";
    let latestBlog: string | null = null;
    for (const b of blogs) {
      latestBlog = maxDate(latestBlog, toIsoDate(b.updated_at || b.created_at));
    }
    body += urlTag(`${MAIN_SITE_URL}/blog`, latestBlog);
    for (const b of blogs) {
      if (!b.slug) continue;
      body += urlTag(`${MAIN_SITE_URL}/blog/${b.slug}`, toIsoDate(b.updated_at || b.created_at));
    }
    return { status: 200, xml: wrapUrlset(body) };
  }

  if (type === "adult") {
    const adultBase = getCanonicalBase(true);
    let body = "";
    for (const cat of API_CATEGORIES.filter((c) => c.adult)) {
      const info = perCategory.get(cat.name);
      if (!info || info.count === 0) continue;
      body += urlTag(`${adultBase}/${cat.slug}`, info.lastmod);
      for (const d of API_DISTRICTS) {
        const combo = perCombo.get(`${d}|${cat.name}`);
        if (combo && combo.count >= MIN_COMBO_ADS_FOR_INDEX) {
          body += urlTag(`${adultBase}/${districtToSlug(d)}/${cat.slug}`, combo.lastmod);
        }
      }
    }
    for (const a of adultAds.slice(0, MAX_URLS_PER_FILE)) {
      body += urlTag(`${adultBase}/ad/${a.slug}`, toIsoDate(a.updated_at || a.approved_at));
    }
    return { status: 200, xml: wrapUrlset(body) };
  }

  const adsMatch = /^ads-(\d+)$/.exec(type);
  if (adsMatch) {
    const pageIdx = Math.max(1, parseInt(adsMatch[1], 10)) - 1;
    const slice = nonAdultAds.slice(pageIdx * MAX_URLS_PER_FILE, (pageIdx + 1) * MAX_URLS_PER_FILE);
    let body = "";
    for (const a of slice) {
      body += urlTag(`${MAIN_SITE_URL}/ad/${a.slug}`, toIsoDate(a.updated_at || a.approved_at));
    }
    return { status: 200, xml: wrapUrlset(body) };
  }

  return { status: 404, xml: `<?xml version="1.0" encoding="UTF-8"?><error>Unknown sitemap</error>` };
}

export default async function handler(req: any, res: any) {
  const type = String(req.query?.type || "index").replace(/\.xml$/i, "");
  const { status, xml } = await buildSitemapXml(type);
  res.statusCode = status;
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=3600");
  res.end(xml);
}
