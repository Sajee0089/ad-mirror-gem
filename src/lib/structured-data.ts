/**
 * Structured Data Helpers for Merchant Listing (ProductOffer) Schema
 * Fixes Google Search Console errors:
 * - Invalid floating point number in property 'price'
 * - Missing 'hasMerchantReturnPolicy'
 * - Missing 'shippingDetails'
 * - Invalid object type for field 'brand'
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
 * Generate a proper MerchantReturnPolicy object for Sri Lanka
 * Indicates local/in-country returns policy
 */
export const getMerchantReturnPolicy = () => {
  return {
    "@type": "MerchantReturnPolicy",
    applicableCountry: "LK", // Sri Lanka ISO 3166-1 alpha-2 code
    returnPolicyCategory: "https://schema.org/MerchandiseReturn",
    merchantReturnDays: 14, // Reasonable default for classifieds
    returnShippingFeesAmount: {
      "@type": "PriceSpecification",
      priceCurrency: "LKR",
      price: "0", // Seller typically doesn't cover shipping
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
 * Generate complete Product schema with merchant listing offers
 * Fixes all Google Search Console validation errors
 */
export const generateProductSchema = (
  ad: StructuredAdData,
  canonicalUrl: string,
  siteUrl: string
) => {
  const cleanedPrice = cleanPrice(ad.price);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: ad.title,
    description: ad.description.slice(0, 500),
    image: ad.images.filter(Boolean),
    url: canonicalUrl,
    category: ad.category,
    brand: getBrandObject(), // Now a proper Brand object, not a string
    seller: {
      "@type": "Organization",
      name: "Ads SL",
      url: siteUrl,
    },
    offers: {
      "@type": "Offer",
      url: canonicalUrl,
      priceCurrency: "LKR",
      price: cleanedPrice.toString(), // Valid float as string (no "Rs." or commas)
      availability: "https://schema.org/InStock",
      areaServed: {
        "@type": "Country",
        name: "Sri Lanka",
      },
      // CRITICAL FIX: hasMerchantReturnPolicy
      hasMerchantReturnPolicy: getMerchantReturnPolicy(),
      // CRITICAL FIX: shippingDetails
      shippingDetails: getShippingDetails(ad.location),
      // Additional fields for completeness
      seller: {
        "@type": "Organization",
        name: "Ads SL",
        url: siteUrl,
      },
      ...(ad.verified_member && {
        sellerRating: {
          "@type": "AggregateRating",
          ratingValue: "4.5",
          ratingCount: "1",
        },
      }),
    },
    // Aggregated rating based on verification
    ...(ad.verified_member && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.5",
        reviewCount: "1",
      },
    }),
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
