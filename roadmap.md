# Ads SL Technical SEO & Safety Upgrade Roadmap

- [x] Phase 0: Audit routes, meta tags, sitemap/robots, vercel.json, expired ads, and Googlebot HTML
- [ ] Phase 1: Vercel serverless renderer (`api/render.ts`) with 200/404/410 status codes, semantic `#root` HTML, and `vercel.json` rewrites
- [ ] Phase 2: Indexing hygiene — host/slash 301s, `robots.txt`, dynamic sitemap index (`api/sitemap.ts` + build fallback), >=3 ads threshold for combos, thin-ad noindex, posting validation & duplicate flagging, `rel="ugc nofollow noopener"`, remove keywords/revisit-after
- [ ] Phase 3: On-page templates (titles <=60, descriptions <=155, 1 H1, homepage 200-300w intro + 6-Q FAQ, varied category/district intros, breadcrumbs, image alt, related ads, valid JSON-LD)
- [ ] Phase 4: Adult-content safety (`src/config/categories.ts`, `rating=adult`, dismissible 18+ overlay, `VITE_ADULT_BASE_URL`, Report Ad + admin queue, blocklist, 18+ checkbox, `/safety-tips` & `/posting-rules`)
- [ ] Phase 5: Speed (route-level `React.lazy`, Supabase preconnect, non-blocking fonts, 1200px WebP + 400px thumb upload, image dimensions + fetchpriority, 24/page pagination, SQL indexes)
- [ ] Phase 6: Sharing & freshness (Web Share/WhatsApp/Facebook/Copy buttons, post-ad success screen with WhatsApp share, 24h Renew Ad, real-data Latest Ads & Popular Districts, `/blog` pagination + Article JSON-LD + category links)
- [ ] Verification: Test `api/render.ts` and `api/sitemap.ts` outputs (simulating `Googlebot`), run vitest + Playwright checks, check build logs, commit
