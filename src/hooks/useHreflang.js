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
