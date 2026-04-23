

## SEO Optimization Plan – Target Keywords: "sl ads", "ada sl", "sl spa ada", "spa", "srilankan ads", "srilankan spa"

Your site already has strong SEO bones (sitemap, JSON-LD, canonical URLs, dynamic meta tags). The issue is **keyword targeting** — your current copy emphasizes "Ads SL" / "SL ads" / "Lanka ads" but misses high-volume Sinhala-style searches like **"ada sl"**, **"spa ada"**, **"sl spa ada"**, and **"srilankan spa / srilankan ads"** (one-word "srilankan" — a very common search variant). We'll add these naturally across titles, descriptions, headings, and structured data without keyword stuffing.

### What will change

**1. Homepage (`src/pages/Index.tsx` + `index.html`)**
- Update `<title>` to include the new target terms:
  - `Ads SL | SL Ads, Spa Ada, Srilankan Spa & Classified Ads Sri Lanka`
- Rewrite meta description to weave in: *sl ads, ada sl, spa ada, srilankan ads, srilankan spa*.
- Expand the `<meta name="keywords">` list (already low-impact for Google but used by other engines).
- Update the H2/H3 footer SEO block:
  - New H2: "SL Ads & Srilankan Spa Ada – Sri Lanka's #1 Free Classified Platform"
  - Add a paragraph naturally using "ada sl", "spa ada", "srilankan spa", "srilankan ads".
  - Expand the "Popular searches" line with the new terms.
- Add an `alternateName` array to the Organization JSON-LD: `["SL Ads", "Ada SL", "Srilankan Ads", "Srilankan Spa", "Spa Ada", "Lanka Ads"]`.

**2. Category Pages (`src/pages/CategoryPage.tsx`)**
- Spa category gets the biggest rewrite (highest-value keyword cluster):
  - Title: `Spa Ada Sri Lanka | Srilankan Spa & SL Spa Ads – ads-sl.com`
  - Description includes "spa ada", "sl spa ada", "srilankan spa".
  - Add 1-2 new SEO paragraphs and 2 new FAQ entries targeting "spa ada", "sl spa ada", "srilankan spa near me".
- Other adult/personal categories: add "srilankan" variant phrases to descriptions and SEO paragraphs.

**3. District Pages (`src/pages/DistrictPage.tsx`)**
- Update titles/descriptions to include "Srilankan ads in {District}" and (for Colombo/Kandy/Galle/Negombo) "Spa ada {District}".
- Add a sentence in the district description block mentioning "srilankan spa" and "ada sl".

**4. `index.html` (static fallback for crawlers)**
- Update `<title>`, meta description, OG title/description, Twitter card with the new keyword set.
- Expand keywords meta + Organization `alternateName` in the JSON-LD `@graph`.

**5. `public/robots.txt`**
- Already correct — confirm it allows `/` and lists the sitemap. No change needed unless we add a sitemap index.

**6. Sitemap (`supabase/functions/sitemap/index.ts`)**
- Already comprehensive. We'll bump homepage `<changefreq>` priority signals — minor tweak only.

**7. Internal linking boost**
- In the homepage footer "Popular searches" block, convert the plain-text list into actual `<Link>` elements pointing to `/spa-ads`, `/district/colombo`, etc. Internal anchor text using the target keywords helps ranking significantly.

### Technical details

- All meta changes use `react-helmet-async` (already installed and wired via `HelmetProvider` in `App.tsx`).
- `index.html` static tags are the fallback crawlers see before JS renders — these matter for first-pass indexing.
- JSON-LD `alternateName` tells Google these are all names for the same brand → consolidates ranking signal.
- No schema changes, no new dependencies, no backend changes.
- After deploy: request re-indexing in Google Search Console for `/`, `/spa-ads`, and 2-3 top district pages to accelerate pickup. Results typically appear in 2-6 weeks.

### Files to edit
1. `index.html`
2. `src/pages/Index.tsx`
3. `src/pages/CategoryPage.tsx`
4. `src/pages/DistrictPage.tsx`

### Out of scope (can be follow-ups)
- Submitting sitemap to Bing Webmaster Tools.
- Building backlinks (off-site SEO — not a code change).
- Adding a Sinhala-language version of pages (would significantly expand reach but is a larger project).

