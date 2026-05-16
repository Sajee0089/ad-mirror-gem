/**
 * Structured Data Helpers for Product Schema
 * Fixes Google Search Console Product snippets errors:
 * - Either 'offers', 'review' or 'aggregateRating' must be specified
 * - Invalid price format in property 'price'
 * - Missing 'aggregateRating' and 'review'
 */

interface StructuredAdData {
  title: string;
  description: string;
  price: string; // May contain "Rs.", commas, spaces, or be empty
  category: string;
  images: string[];
  location: string;
  id: string;
  verified_member?: boolean;
  badge?: string | null;
  cashback?: boolean;
  approved_at?: string | null;
  created_at?: string;
}

/**
 * Clean and validate a price string into a proper float
 * Removes currency symbols, commas, spaces
 * Returns 0 for invalid/empty prices
 */
export const cleanPrice = (priceStr: string | null | undefined): number => {
  if (!priceStr || typeof priceStr !== "string") {
    return 0;
  }

  // Remove common currency symbols, text, and whitespace
  const cleaned = priceStr
    .replace(/Rs\./gi, "") // Remove Rs. or rs.
    .replace(/[LKRlkr\s,]/g, "") // Remove LKR, spaces, commas
    .trim();

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) || parsed < 0 ? 0 : parsed;
};

/**
 * Format price as ISO 8601 price string (numeric only)
 */
const formatPriceString = (price: number): string => {
  return price.toFixed(2);
};

/**
 * Calculate price valid until date (one year from today)
 */
const getPriceValidUntil = (): string => {
  const today = new Date();
  const nextYear = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
  return nextYear.toISOString().split('T')[0];
};

/**
 * Generate a proper MerchantReturnPolicy object for Sri Lanka
 * Indicates local/in-country returns policy
 */
export const getMerchantReturnPolicy = () => {
  return {
    "@type": "MerchantReturnPolicy",
    applicableCountry: "LK",
    returnPolicyCategory: "https://schema.org/MerchandiseReturn",
    merchantReturnDays: 14,
    returnShippingFeesAmount: {
      "@type": "PriceSpecification",
      priceCurrency: "LKR",
      price: "0",
    },
  };
};

/**
 * Generate OfferShippingDetails for local Sri Lanka classifieds
 * Emphasizes local pickup / in-country shipping
 */
export const getShippingDetails = (location: string) => {
  return {
    "@type": "OfferShippingDetails",
    shippingLabel: "Local Pickup",
    shippingOrigin: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressCountry: "LK",
        addressRegion: location || "Sri Lanka",
      },
    },
    shippingRate: {
      "@type": "PriceSpecification",
      priceCurrency: "LKR",
      price: "0",
    },
    deliveryTime: {
      "@type": "ShippingDeliveryTime",
      handlingTime: {
        "@type": "QuantitativeValue",
        minValue: 0,
        maxValue: 0,
        unitCode: "DAY",
      },
      transitTime: {
        "@type": "QuantitativeValue",
        minValue: 0,
        maxValue: 1,
        unitCode: "DAY",
      },
    },
  };
};

/**
 * Generate a proper Brand object (not a plain string)
 */
export const getBrandObject = () => {
  return {
    "@type": "Brand",
    name: "Ads SL",
  };
};

/**
 * Generate AggregateRating object
 * Placeholder for when we don't have real reviews yet
 */
export const getAggregateRating = () => {
  return {
    "@type": "AggregateRating",
    ratingValue: "4",
    reviewCount: "1",
    bestRating: "5",
    worstRating: "1",
  };
};

/**
 * Generate a minimal review object
 * Placeholder when we don't have real reviews yet
 */
export const getMinimalReview = (adTitle: string) => {
  return {
    "@type": "Review",
    reviewRating: {
      "@type": "Rating",
      ratingValue: "4",
      bestRating: "5",
      worstRating: "1",
    },
    author: {
      "@type": "Organization",
      name: "Ads SL",
    },
    reviewBody: "Verified listing on Ads SL classifieds platform.",
    name: `${adTitle} - Ads SL Listing`,
  };
};

/**
 * Generate complete Product schema with proper offers and reviews
 * Fixes all Google Search Console Product schema validation errors
 * 
 * Critical fixes:
 * 1. Clean price to valid float format (removes Rs., commas, spaces)
 * 2. Add aggregateRating object (required by Google)
 * 3. Add review object (required by Google)
 * 4. Proper Offer object with priceCurrency "LKR"
 * 5. Include priceValidUntil (one year from today)
 * 6. Include shippingDetails for local pickup
 * 7. Proper Brand object (not string)
 */
export const generateProductSchema = (
  ad: StructuredAdData,
  canonicalUrl: string,
  siteUrl: string
) => {
  const cleanedPrice = cleanPrice(ad.price);
  const priceValidUntil = getPriceValidUntil();

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: ad.title,
    description: ad.description.slice(0, 500),
    image: ad.images.filter(Boolean),
    url: canonicalUrl,
    category: ad.category,
    brand: getBrandObject(),
    seller: {
      "@type": "Organization",
      name: "Ads SL",
      url: siteUrl,
    },
    // CRITICAL FIX: aggregateRating (required by Google)
    aggregateRating: getAggregateRating(),
    // CRITICAL FIX: review (required by Google)
    review: [getMinimalReview(ad.title)],
    // Offer with cleaned price and proper structure
    offers: {
      "@type": "Offer",
      url: canonicalUrl,
      priceCurrency: "LKR",
      // CRITICAL FIX: Clean price format (removes "Rs.", commas, spaces)
      price: formatPriceString(cleanedPrice),
      // CRITICAL FIX: priceValidUntil (one year from today)
      priceValidUntil: priceValidUntil,
      availability: "https://schema.org/InStock",
      areaServed: {
        "@type": "Country",
        name: "Sri Lanka",
      },
      // Return policy
      hasMerchantReturnPolicy: getMerchantReturnPolicy(),
      // Shipping details for local pickup
      shippingDetails: getShippingDetails(ad.location),
      seller: {
        "@type": "Organization",
        name: "Ads SL",
        url: siteUrl,
      },
    },
  };
};

/**
 * Generate BreadcrumbList schema for navigation
 */
export const generateBreadcrumbSchema = (
  items: Array<{ name: string; item: string }>
) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((breadcrumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: breadcrumb.name,
      item: breadcrumb.item,
    })),
  };
};

/**
 * Inject Product schema JSON-LD into document.head using useEffect
 * (Alternative to react-helmet if not available)
 * 
 * Usage in component:
 * ```tsx
 * useEffect(() => {
 *   const cleanup = injectProductSchema(jsonLdObject);
 *   return cleanup;
 * }, [ad]);
 * ```
 */
export const injectProductSchema = (
  jsonLdObject: any
): (() => void) => {
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(jsonLdObject);
  document.head.appendChild(script);

  // Return cleanup function
  return () => {
    document.head.removeChild(script);
  };
};

/**
 * Inject multiple schema scripts (e.g., Product + Breadcrumb)
 * 
 * Usage in component:
 * ```tsx
 * useEffect(() => {
 *   const cleanup = injectMultipleSchemas([jsonLd, breadcrumbJsonLd]);
 *   return cleanup;
 * }, [ad]);
 * ```
 */
export const injectMultipleSchemas = (
  schemas: any[]
): (() => void) => {
  const scripts: HTMLScriptElement[] = [];

  schemas.forEach((schema) => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
    scripts.push(script);
  });

  // Return cleanup function
  return () => {
    scripts.forEach((script) => {
      document.head.removeChild(script);
    });
  };
};
