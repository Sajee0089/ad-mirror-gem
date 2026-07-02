// Per-route static HTML generator. Runs after `vite build` (postbuild npm script).
// For every public route, writes dist/<route>/index.html with:
//   - real <title>, meta description, canonical, OG tags, JSON-LD
//   - a crawler-readable content block (h1 + intro + link list) inside #root
// React's createRoot replaces the #root children on hydration, so users see the
// normal SPA. Crawlers (including those that don't execute JS) see real content.
//
// This solves Google's "empty <div id=\"root\"></div>" indexing problem on a
// pure-SPA Vite build deployed to GitHub Pages — no Puppeteer, no SSR refactor.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { categorySlugMap, districts, districtToSlug } from "./generate-sitemap.mjs";

const SITE_URL = "https://www.ads-sl.com";
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://webpiillbgbwgjzkbece.supabase.co";
const SUPABASE_ANON =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlYnBpaWxsYmdid2dqemtiZWNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1NTI5NjQsImV4cCI6MjA5NjEyODk2NH0.yUz9IRPjWa1iTgRiMH1RP0E01h_fhvLA2xlP55_gYTs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, "..", "dist");

const escape = (s = "") =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

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

/**
 * Re-write the head of dist/index.html for one route.
 * @param {object} cfg
 * @param {string} cfg.routePath  e.g. "/spa-ads"  (no trailing slash, "/" for home)
 * @param {string} cfg.title
 * @param {string} cfg.description
 * @param {string} cfg.h1
 * @param {string} cfg.intro      Paragraph of visible content
 * @param {Array<{href:string,label:string}>} [cfg.links]
 * @param {object} [cfg.jsonLd]   Extra JSON-LD object to inject
 * @param {string} [cfg.image]
 */
function buildHtml(template, cfg) {
  const canonical = `${SITE_URL}${cfg.routePath === "/" ? "/" : cfg.routePath}`;
  let html = template;

  // Title
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escape(cfg.title)}</title>`);

  // Description
  html = html.replace(
    /<meta name="description"[\s\S]*?\/>/,
    `<meta name="description" content="${escape(cfg.description)}" />`,
  );

  // Inject canonical + OG/Twitter overrides + optional JSON-LD just before </head>
  const ogImage = cfg.image || `${SITE_URL}/logo.png`;
  const headInjects = [
    `<link rel="canonical" href="${canonical}" />`,
    `<link rel="alternate" hreflang="en" href="${canonical}" />`,
    `<meta property="og:title" content="${escape(cfg.title)}" />`,
    `<meta property="og:description" content="${escape(cfg.description)}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:image" content="${ogImage}" />`,
    `<meta name="twitter:title" content="${escape(cfg.title)}" />`,
    `<meta name="twitter:description" content="${escape(cfg.description)}" />`,
    `<meta name="twitter:image" content="${ogImage}" />`,
  ];
  if (cfg.jsonLd) {
    headInjects.push(
      `<script type="application/ld+json">${JSON.stringify(cfg.jsonLd)}</script>`,
    );
  }
  html = html.replace("</head>", `    ${headInjects.join("\n    ")}\n  </head>`);

  // Visible crawler content inside #root. React replaces this on hydration.
  const linkList = (cfg.links || [])
    .map((l) => `<li><a href="${l.href}">${escape(l.label)}</a></li>`)
    .join("");
  const fallback = `<div style="font-family:system-ui,sans-serif;max-width:960px;margin:24px auto;padding:0 16px;color:#1a2744">
      <h1>${escape(cfg.h1)}</h1>
      <p>${escape(cfg.intro)}</p>
      ${linkList ? `<ul>${linkList}</ul>` : ""}
      <p><a href="${SITE_URL}/">Browse all ads on Ads SL</a></p>
    </div>`;
  html = html.replace(
    /<div id="root">[\s\S]*?<\/div>/,
    `<div id="root">${fallback}</div>`,
  );

  return html;
}

function writeRoute(routePath, html) {
  const dir = routePath === "/" ? DIST : join(DIST, routePath);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), html, "utf8");
}

const STATIC_PAGES = [
  {
    path: "/",
    title: "Ads SL | Free Classified Ads Sri Lanka — Spa Ads, Personal Ads",
    description:
      "Ads SL is Sri Lanka's free classified ads platform. Browse spa ads, personal ads, marriage proposals, rooms and more across all 25 districts. Post your ad free.",
    h1: "Ads SL — Free Classified Ads in Sri Lanka",
    intro:
      "Browse and post free classified ads across Sri Lanka. Find spa services, personal ads, marriage proposals, rooms for rent and more in Colombo, Kandy, Galle and all 25 districts.",
  },
  {
    path: "/about",
    title: "About Ads SL | Sri Lanka's Free Classifieds",
    description:
      "Learn about Ads SL, Sri Lanka's free classified ads platform connecting buyers and sellers across all 25 districts.",
    h1: "About Ads SL",
    intro:
      "Ads SL is a free classified ads platform built for Sri Lanka, helping people post and discover spa, personal, marriage, room and other listings safely.",
  },
  {
    path: "/contact",
    title: "Contact Ads SL | Support & WhatsApp",
    description:
      "Get in touch with Ads SL via WhatsApp at +94 78 966 3179 for help posting or managing your classified ad.",
    h1: "Contact Ads SL",
    intro:
      "For help posting, editing or removing an ad, contact our support team on WhatsApp at +94 78 966 3179.",
  },
  {
    path: "/privacy",
    title: "Privacy Policy | Ads SL",
    description: "Read the Ads SL privacy policy covering account data, cookies and third-party services.",
    h1: "Privacy Policy",
    intro: "This page explains how Ads SL collects, uses and protects your personal information.",
  },
  {
    path: "/terms",
    title: "Terms of Service | Ads SL",
    description: "Terms of service governing use of Ads SL, the free classified ads platform for Sri Lanka.",
    h1: "Terms of Service",
    intro: "By using Ads SL you agree to these terms which govern posting, viewing and contacting through ads.",
  },
  {
    path: "/blogs",
    title: "Ads SL Blog | Tips, Guides & Sri Lanka Classifieds News",
    description: "Read tips, safety guides and stories from the Ads SL community across Sri Lanka.",
    h1: "Ads SL Blog",
    intro: "Tips, safety guides and updates for buyers and sellers using Ads SL across Sri Lanka.",
  },
];

async function main() {
  const templatePath = join(DIST, "index.html");
  if (!existsSync(templatePath)) {
    console.error("[prerender] dist/index.html not found — run vite build first.");
    process.exit(0);
  }
  const template = readFileSync(templatePath, "utf8");

  const ads = await fetchTable(
    "ads?select=slug,title,description,category,location,image_url,updated_at,approved_at&status=eq.approved&slug=not.is.null&limit=10000",
  );
  const blogs = await fetchTable("blog_posts?select=slug,title,excerpt,image_url,updated_at");

  // Build aggregations
  const adsByDistrict = new Map();
  const adsByCategory = new Map();
  const adsByCombo = new Map();
  for (const a of ads) {
    if (a.location) {
      const arr = adsByDistrict.get(a.location) || [];
      arr.push(a);
      adsByDistrict.set(a.location, arr);
    }
    if (a.category) {
      const arr = adsByCategory.get(a.category) || [];
      arr.push(a);
      adsByCategory.set(a.category, arr);
    }
    if (a.location && a.category) {
      const k = `${a.location}|${a.category}`;
      const arr = adsByCombo.get(k) || [];
      arr.push(a);
      adsByCombo.set(k, arr);
    }
  }

  let written = 0;

  // 1. Static pages
  for (const p of STATIC_PAGES) {
    const html = buildHtml(template, {
      routePath: p.path,
      title: p.title,
      description: p.description,
      h1: p.h1,
      intro: p.intro,
      links: p.path === "/"
        ? [
            ...Object.values(categorySlugMap).map((slug) => ({
              href: `/${slug}`,
              label: slug.replace(/-/g, " ").replace(/\bads\b/, "Ads"),
            })),
            ...districts.map((d) => ({ href: `/district/${districtToSlug(d)}`, label: `Ads in ${d}` })),
          ]
        : [],
    });
    writeRoute(p.path, html);
    written++;
  }

  // 2. Categories
  for (const [catName, slug] of Object.entries(categorySlugMap)) {
    const items = adsByCategory.get(catName) || [];
    if (items.length === 0) continue; // skip thin pages
    const html = buildHtml(template, {
      routePath: `/${slug}`,
      title: `${catName} Ads in Sri Lanka | Ads SL`,
      description: `Browse ${items.length}+ ${catName.toLowerCase()} ads across all 25 districts of Sri Lanka. Free to post and view on Ads SL.`,
      h1: `${catName} Ads in Sri Lanka`,
      intro: `Browse ${items.length} ${catName.toLowerCase()} listings across Sri Lanka. Find services in Colombo, Kandy, Galle, Negombo and every district.`,
      links: items.slice(0, 30).map((a) => ({ href: `/ad/${a.slug}`, label: a.title })),
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: `${catName} Ads in Sri Lanka`,
        url: `${SITE_URL}/${slug}`,
        numberOfItems: items.length,
      },
    });
    writeRoute(`/${slug}`, html);
    written++;
  }

  // 3. Districts
  for (const d of districts) {
    const items = adsByDistrict.get(d) || [];
    if (items.length === 0) continue;
    const slug = districtToSlug(d);
    const html = buildHtml(template, {
      routePath: `/district/${slug}`,
      title: `Classified Ads in ${d} | Ads SL Sri Lanka`,
      description: `Browse ${items.length}+ classified ads in ${d}, Sri Lanka. Spa, personal, rooms and marriage proposals. Post free on Ads SL.`,
      h1: `Classified Ads in ${d}`,
      intro: `Discover ${items.length} active classified listings in ${d}. Browse all categories or post your own ad free on Ads SL.`,
      links: items.slice(0, 30).map((a) => ({ href: `/ad/${a.slug}`, label: a.title })),
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: `Classified Ads in ${d}`,
        url: `${SITE_URL}/district/${slug}`,
        numberOfItems: items.length,
      },
    });
    writeRoute(`/district/${slug}`, html);
    written++;
  }

  // 4. District + Category combos
  for (const d of districts) {
    for (const [catName, catSlug] of Object.entries(categorySlugMap)) {
      const items = adsByCombo.get(`${d}|${catName}`) || [];
      if (items.length === 0) continue;
      const dSlug = districtToSlug(d);
      const html = buildHtml(template, {
        routePath: `/${dSlug}/${catSlug}`,
        title: `${catName} Ads in ${d} | Ads SL`,
        description: `Browse ${items.length}+ ${catName.toLowerCase()} ads in ${d}, Sri Lanka. Free classified ads on Ads SL.`,
        h1: `${catName} Ads in ${d}`,
        intro: `Find ${items.length} ${catName.toLowerCase()} listings in ${d}. Updated daily on Ads SL.`,
        links: items.slice(0, 30).map((a) => ({ href: `/ad/${a.slug}`, label: a.title })),
      });
      writeRoute(`/${dSlug}/${catSlug}`, html);
      written++;
    }
  }

  // 5. Individual ads
  for (const a of ads) {
    const html = buildHtml(template, {
      routePath: `/ad/${a.slug}`,
      title: `${a.title} | ${a.category || "Classifieds"} | Ads SL`,
      description: (a.description || "").slice(0, 160) || `${a.title} on Ads SL Sri Lanka.`,
      h1: a.title,
      intro: a.description || "",
      image: a.image_url || undefined,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Product",
        name: a.title,
        description: a.description || a.title,
        image: a.image_url || undefined,
        category: a.category || undefined,
        url: `${SITE_URL}/ad/${a.slug}`,
      },
    });
    writeRoute(`/ad/${a.slug}`, html);
    written++;
  }

  // 6. Blog posts
  for (const b of blogs) {
    const html = buildHtml(template, {
      routePath: `/blog/${b.slug}`,
      title: `${b.title} | Ads SL Blog`,
      description: (b.excerpt || b.title || "").slice(0, 160),
      h1: b.title,
      intro: b.excerpt || b.title,
      image: b.image_url || undefined,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: b.title,
        url: `${SITE_URL}/blog/${b.slug}`,
        image: b.image_url || undefined,
        dateModified: b.updated_at,
      },
    });
    writeRoute(`/blog/${b.slug}`, html);
    written++;
  }

  console.log(`[prerender] wrote ${written} static HTML files into dist/`);
}

main().catch((e) => {
  console.error("[prerender] failed:", e);
  process.exit(0); // don't fail the build
});
