# ADS-SL.COM — HREFLANG FIX ONLY
# Paste this entire file into GitHub Copilot Chat

---

You are an expert SEO developer. Fix the "Missing reciprocal hreflang
(no return-tag)" issue on my React/Vite website ads-sl.com.
This affects 1500+ pages. Do NOT touch any other files or features.

## WHY THIS IS HAPPENING

My site currently has hreflang tags that point pages to each other
in a group. But not every page has a return tag, so the group is
incomplete. Google requires ALL pages in a hreflang group to link
back to every other page in the group — if even one is missing,
Ahrefs flags the whole group.

## THE CORRECT FIX

Since ads-sl.com serves both English (en) and Sinhala (si) on the
EXACT SAME URLs (no /si/ subfolder, no si.ads-sl.com subdomain),
the correct solution is SELF-REFERENCING hreflang per page.

Every page should only reference ITSELF — no cross-page group needed:

```html
<link rel="alternate" hreflang="en-LK" href="https://www.ads-sl.com/THIS-PAGE" />
<link rel="alternate" hreflang="si-LK" href="https://www.ads-sl.com/THIS-PAGE" />
<link rel="alternate" hreflang="x-default" href="https://www.ads-sl.com/THIS-PAGE" />
```

This is 100% valid per Google's hreflang specification and completely
eliminates the reciprocal requirement because no cross-page group exists.

## MY TECH STACK
- React 18 + Vite
- react-helmet-async (already installed)
- React Router v6
- Deployed on Vercel

## MY PAGE TYPES (all need the fix)
- Homepage: https://www.ads-sl.com/
- Category pages: /spa-ads, /girls-personal-ads, /boys-personal-ads,
  /shemale-personal-ads, /live-cam-ads, /marriage-proposals, /rooms-ads
- District pages: /district/colombo ... (all 25 districts)
- District+Category: /colombo/spa-ads, /kandy/girls-personal-ads ...
- Individual ads: /ad/[slug]
- Blog list: /blogs
- Blog posts: /blog/[slug]
- Static: /privacy, /terms, /contact

---

## STEP 1 — Create src/hooks/useHreflang.js

Create this new file:

```javascript
// src/hooks/useHreflang.js
// Returns self-referencing hreflang link objects for any page URL.
// No cross-page group — each page only references itself.

export function useHreflang(canonicalUrl) {
  // Always normalize to https + www
  const url = canonicalUrl
    .replace('http://', 'https://')
    .replace('https://ads-sl.com/', 'https://www.ads-sl.com/')
    .replace('https://ads-sl.com', 'https://www.ads-sl.com');

  return [
    { rel: 'alternate', hreflang: 'en-LK', href: url },
    { rel: 'alternate', hreflang: 'si-LK', href: url },
    { rel: 'alternate', hreflang: 'x-default', href: url },
  ];
}
```

---

## STEP 2 — Create src/components/PageSeo.jsx

Create this new file. This is the SINGLE component that handles
all hreflang tags across the entire site:

```jsx
// src/components/PageSeo.jsx
import { Helmet } from 'react-helmet-async';
import { useHreflang } from '../hooks/useHreflang';

const DEFAULT_OG_IMAGE = 'https://www.ads-sl.com/og-image-1200x630.jpg';

export default function PageSeo({
  title,
  description,
  canonical,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  noIndex = false,
  schema = null,
}) {
  // Normalize canonical URL
  const safeCanonical = canonical
    .replace('http://', 'https://')
    .replace('https://ads-sl.com/', 'https://www.ads-sl.com/')
    .replace('https://ads-sl.com', 'https://www.ads-sl.com');

  // Self-referencing hreflang — no group, no reciprocal needed
  const hreflangLinks = useHreflang(safeCanonical);

  return (
    <Helmet>
      {/* Basic SEO */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={safeCanonical} />
      <meta
        name="robots"
        content={
          noIndex
            ? 'noindex, nofollow'
            : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
        }
      />

      {/* Hreflang — self-referencing per page, no cross-page group */}
      {hreflangLinks.map((link) => (
        <link
          key={link.hreflang}
          rel={link.rel}
          hreflang={link.hreflang}
          href={link.href}
        />
      ))}

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={safeCanonical} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Ads SL" />
      <meta property="og:locale" content="en_LK" />
      <meta property="og:locale:alternate" content="si_LK" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD Schema (optional) */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}
```

---

## STEP 3 — Remove ALL old hreflang tags

Search the ENTIRE codebase for these strings and delete them:

Search term 1: hreflang
Search term 2: rel="alternate"

Delete every line that contains these in:
- Any existing Helmet or react-helmet components
- public/index.html
- Any SEO utility files

Also remove these obsolete meta tags from public/index.html:
- <meta name="keywords" ...>
- <meta name="revisit-after" ...>
- <meta name="language" ...>

PageSeo.jsx is now the ONLY place hreflang is ever set.

---

## STEP 4 — Replace Helmet usage on every page

Find the existing Helmet or SEO component in each page file
and replace with PageSeo. Here is what to use for each:

**HomePage.jsx:**
```jsx
import PageSeo from '../components/PageSeo';

<PageSeo
  title="SL Ads | Free Classified Ads Sri Lanka — Personal Ads, Spa Ads"
  description="Ads SL is Sri Lanka's free classified ads platform. Browse SL personal ads, spa ads, marriage proposals and more across all 25 districts. Post your ad free."
  canonical="https://www.ads-sl.com/"
/>
```

**CategoryPage.jsx** (categorySlug from useParams or props):
```jsx
import PageSeo from '../components/PageSeo';

// Put this label map at top of file:
const CATEGORY_LABELS = {
  'spa-ads': 'Spa Ads',
  'girls-personal-ads': 'Girls Personal Ads',
  'boys-personal-ads': 'Boys Personal Ads',
  'shemale-personal-ads': 'Shemale Personal Ads',
  'live-cam-ads': 'Live Cam Ads',
  'marriage-proposals': 'Marriage Proposals',
  'rooms-ads': 'Rooms Ads',
  'toys-accessories-ads': 'Toys & Accessories Ads',
};
const label = CATEGORY_LABELS[categorySlug] || categorySlug;

<PageSeo
  title={`${label} in Sri Lanka | Ads SL`}
  description={`Browse free ${label.toLowerCase()} in Sri Lanka on Ads SL. Find listings across Colombo, Kandy, Galle and all 25 districts. Post your ad free today.`}
  canonical={`https://www.ads-sl.com/${categorySlug}`}
/>
```

**DistrictPage.jsx** (district from useParams):
```jsx
import PageSeo from '../components/PageSeo';

const districtLabel = district
  .split('-')
  .map(w => w.charAt(0).toUpperCase() + w.slice(1))
  .join(' ');

<PageSeo
  title={`Classified Ads in ${districtLabel} | Ads SL Sri Lanka`}
  description={`Browse free classified ads in ${districtLabel}, Sri Lanka. Find spa ads, personal ads, marriage proposals and more on Ads SL. Post your ${districtLabel} ad free.`}
  canonical={`https://www.ads-sl.com/district/${district}`}
/>
```

**DistrictCategoryPage.jsx** (district + category from useParams):
```jsx
import PageSeo from '../components/PageSeo';

const districtLabel = district
  .split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
const categoryLabel = CATEGORY_LABELS[category] || category;

<PageSeo
  title={`${categoryLabel} in ${districtLabel} | Ads SL`}
  description={`Find free ${categoryLabel.toLowerCase()} in ${districtLabel}, Sri Lanka. Browse verified listings on Ads SL — Sri Lanka's trusted classified ads platform.`}
  canonical={`https://www.ads-sl.com/${district}/${category}`}
/>
```

**AdPage.jsx** (ad object fetched from Supabase):
```jsx
import PageSeo from '../components/PageSeo';

<PageSeo
  title={`${ad.title} | Ads SL`}
  description={
    ad.description?.substring(0, 155) ||
    `${ad.title} — Browse this ad in ${ad.district} on Ads SL Sri Lanka.`
  }
  canonical={`https://www.ads-sl.com/ad/${ad.slug}`}
  ogType="article"
  ogImage={ad.thumbnail_url || 'https://www.ads-sl.com/og-image-1200x630.jpg'}
/>
```

**BlogsPage.jsx:**
```jsx
<PageSeo
  title="Ads SL Blog | Tips, Guides & Sri Lanka Classifieds News"
  description="Read the Ads SL blog for tips on posting free classified ads in Sri Lanka, guides for spa and personal ads, and the latest classifieds news."
  canonical="https://www.ads-sl.com/blogs"
/>
```

**BlogPostPage.jsx** (blog fetched from Supabase or static):
```jsx
<PageSeo
  title={`${blog.title} | Ads SL Blog`}
  description={blog.excerpt || blog.content?.substring(0, 155)}
  canonical={`https://www.ads-sl.com/blog/${blog.slug}`}
  ogType="article"
/>
```

**PrivacyPage.jsx:**
```jsx
<PageSeo
  title="Privacy Policy | Ads SL"
  description="Read Ads SL's privacy policy. Learn how we collect, use and protect your personal information on Sri Lanka's free classified ads platform."
  canonical="https://www.ads-sl.com/privacy"
/>
```

**TermsPage.jsx:**
```jsx
<PageSeo
  title="Terms of Service | Ads SL"
  description="Read the Terms of Service for Ads SL — Sri Lanka's free classified ads platform."
  canonical="https://www.ads-sl.com/terms"
/>
```

**ContactPage.jsx:**
```jsx
<PageSeo
  title="Contact Ads SL | Support"
  description="Contact Ads SL for support, ad removal or business inquiries. Reach our team via WhatsApp or email."
  canonical="https://www.ads-sl.com/contact"
/>
```

---

## STEP 5 — Verify output is correct

After implementation, open any page in browser → View Page Source.
You should see EXACTLY this pattern (URL changes per page):

```html
<link rel="alternate" hreflang="en-LK" href="https://www.ads-sl.com/spa-ads" />
<link rel="alternate" hreflang="si-LK" href="https://www.ads-sl.com/spa-ads" />
<link rel="alternate" hreflang="x-default" href="https://www.ads-sl.com/spa-ads" />
<link rel="canonical" href="https://www.ads-sl.com/spa-ads" />
```

MUST verify:
✅ All 3 hreflang href values match the canonical URL exactly
✅ No hreflang tag points to the homepage from an inner page
✅ No duplicate hreflang tags on any page
✅ https://www (not http or no-www) in every URL
✅ Zero remaining hreflang tags in public/index.html

---

## FILES TO CREATE
1. src/hooks/useHreflang.js        — NEW
2. src/components/PageSeo.jsx      — NEW

## FILES TO UPDATE
3. src/pages/HomePage.jsx
4. src/pages/CategoryPage.jsx
5. src/pages/DistrictPage.jsx
6. src/pages/DistrictCategoryPage.jsx
7. src/pages/AdPage.jsx
8. src/pages/BlogsPage.jsx
9. src/pages/BlogPostPage.jsx
10. src/pages/PrivacyPage.jsx
11. src/pages/TermsPage.jsx
12. src/pages/ContactPage.jsx
13. public/index.html

## DO NOT TOUCH
- App.jsx routing
- Supabase queries
- Footer, Navbar
- Any component not listed above
- CSS or Tailwind classes

Start with Step 1 and Step 2 first, then work through
Step 4 page by page. Show me each file before moving on.
