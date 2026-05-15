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
