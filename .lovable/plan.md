## Why your pages dropped

You changed the domain **and** the URL structure. Google now sees the old URLs as 404s and the new URLs as brand-new pages with no history. Until Google re-crawls, re-verifies, and re-indexes them, they sit in "Not indexed". This is recoverable — nothing is broken in the code.

## Recovery plan (no code changes required for most steps)

### 1. Verify the new domain is the one indexed
- In Search Console, confirm you have a **Domain property** for `ads-sl.com` (covers `www`, `https`, all paths). If you only added the URL-prefix property, add the Domain property too.
- Set your **preferred canonical host** (either `www.ads-sl.com` or `ads-sl.com`) and make sure the other 301-redirects to it.

### 2. Submit the fresh sitemap
- Sitemaps → remove any old sitemap entries → submit `https://www.ads-sl.com/sitemap.xml`.
- Confirm status = "Success" and "Discovered URLs" matches roughly your live ad count.

### 3. Use URL Inspection + Request Indexing on the top 10–20 pages
- Homepage, `/spa-ads`, `/colombo/spa-ads`, top district pages, top category pages, and 5–10 popular ad detail pages.
- For each: URL Inspection → "Test live URL" → "Request Indexing". This is the fastest signal to Googlebot.

### 4. Handle the old URLs (if the URL structure changed)
- If old paths still exist somewhere → add **301 redirects** from old → new URLs so Google transfers ranking signal instead of dropping it.
- If the old domain is still live → keep it up with a **site-wide 301** to the new domain for at least 6 months.
- In Search Console (old property) → **Settings → Change of Address** pointing to the new domain. This is the single most important step after a domain move.

### 5. Check the "Pages" report for the real reason
Open **Indexing → Pages** and read the exact reason under "Why pages aren't indexed":
- *Crawled – currently not indexed* → normal after a big change; just wait + request indexing on priority pages.
- *Discovered – currently not indexed* → Google is deprioritizing; internal linking + sitemap freshness helps.
- *Duplicate, Google chose different canonical* → your canonical tag points somewhere else; needs a code fix.
- *Blocked by robots.txt* → robots.txt issue; needs a code fix.
- *Soft 404* → thin content or empty pages; needs a code fix.
- *Redirect error / Not found (404)* → old URLs need proper 301s.

Tell me which of these reasons appears most often and I'll write a targeted code fix.

### 6. Rebuild external signals
- Update backlinks pointing to the old domain (social profiles, directories, WhatsApp bio, business listings).
- Re-share top pages on Facebook groups and any Sri Lankan classified directories that accept links.

### 7. Give it time
After a domain + URL change, full re-indexing normally takes **2–6 weeks**. Rankings usually dip further before they recover.

## What I'd like from you before making code changes
Please open **Search Console → Indexing → Pages** and tell me:
1. The exact reason(s) listed under "Why pages aren't indexed" (copy the wording).
2. Whether the **old domain** is still live and redirecting, or fully offline.
3. Whether you filed **Change of Address** in the old property.

Once I know those three things I can plan the exact code fixes (redirects, canonicals, sitemap tweaks, robots.txt) needed on the Lovable side.
