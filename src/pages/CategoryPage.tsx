import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import AdCard from "@/components/AdCard";
import type { AdType } from "@/components/AdCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Tag, MapPin } from "lucide-react";
import { districts } from "@/data/districts";
import { SITE_URL, categoryFromSlug, districtFromSlug, districtToSlug, categorySlugMap, getDistrictUrl, getAdUrl } from "@/lib/seo";
import PageSeo from "@/components/PageSeo";

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const categoryFaqs: Record<string, { q: string; a: string }[]> = {
  "Spa": [
    { q: "How to find spa ada / srilankan spa services in Sri Lanka?", a: "Browse Ads SL's Spa category to find verified spa ada and srilankan spa services across all 25 districts. Filter by your location." },
    { q: "Is it free to post spa ada ads on Ads SL?", a: "Yes! Posting spa ada and srilankan spa classified ads on Ads SL is completely free. Create an account and post your sl spa ada listing in minutes." },
    { q: "How to verify srilankan spa service providers?", a: "Look for the 'Verified Member' badge on Ads SL. Verified spa ada members have been authenticated by our team for added trust." },
    { q: "Where can I find srilankan spa near me?", a: "Use the district filter on Ads SL to instantly find srilankan spa and spa ada listings in your area — Colombo, Gampaha, Kandy, Galle, Negombo and more." },
  ],
  "Live Cam": [
    { q: "How do live cam shows work on Ads SL?", a: "Browse live cam ads on Ads SL to find performers. Contact them directly via WhatsApp or phone for details." },
    { q: "Are live cam ads free to post?", a: "Yes, posting all types of classified ads on Ads SL is free." },
  ],
  "Girls Personal": [
    { q: "How to post personal ads in Sri Lanka?", a: "Sign up on Ads SL, go to 'Post Ad', select 'Girls Personal' category, add your details, and submit for review." },
    { q: "Are personal ads safe on Ads SL?", a: "All ads are reviewed by our moderation team. We recommend meeting in public places and verifying identities." },
  ],
  "Boys Personal": [
    { q: "How to find personal ads for boys in Sri Lanka?", a: "Browse the Boys Personal category on Ads SL. Filter by district to find listings near you." },
  ],
  "Rooms": [
    { q: "How to find rooms for rent in Sri Lanka?", a: "Browse the Rooms category on Ads SL. Filter by district like Colombo, Kandy, or Galle to find rooms near you." },
    { q: "How to post a room rental ad?", a: "Create a free account on Ads SL, post your room listing with photos, location, and contact details." },
  ],
  "Marriage Proposals": [
    { q: "How to find marriage proposals in Sri Lanka?", a: "Browse the Marriage Proposals category on Ads SL to find genuine proposals from all 25 districts across Sri Lanka." },
    { q: "Is it safe to browse marriage proposals online?", a: "Ads SL moderates all listings. We recommend verifying identities and meeting in safe, public places." },
  ],
  "Toys & Accessories": [
    { q: "How to buy adult toys in Sri Lanka?", a: "Browse the Toys & Accessories category on Ads SL. Contact sellers directly for discreet purchasing and delivery options." },
  ],
  "Shemale Personal": [
    { q: "How to find shemale personal ads in Sri Lanka?", a: "Browse the Shemale Personal category on Ads SL. Filter by district to find listings near you." },
  ],
};

// Unique SEO titles and descriptions per category
const categorySeo: Record<string, { title: string; description: string }> = {
  "Spa": {
    title: "Spa Ada Sri Lanka | Srilankan Spa & SL Spa Ads – ads-sl.com",
    description: "Find verified spa ada, srilankan spa & sl spa ada services across Sri Lanka. Browse spa ads from Colombo, Kandy, Galle and all 25 districts on Ads SL.",
  },
  "Girls Personal": {
    title: "Girls Personal Ads Sri Lanka | Srilankan Personal Ads – ads-sl.com",
    description: "Browse girls personal ads, srilankan ads and ada sl listings from all 25 Sri Lankan districts.",
  },
  "Boys Personal": {
    title: "Boys Personal Ads Sri Lanka | Srilankan Personal Ads – ads-sl.com",
    description: "Browse boys personal ads, srilankan ads and ada sl listings from all 25 Sri Lankan districts.",
  },
  "Live Cam": {
    title: "Live Cam Ads Sri Lanka | ads-sl.com",
    description: "Browse live cam ads in Sri Lanka.",
  },
  "Shemale Personal": {
    title: "Shemale Personal Ads Sri Lanka | ads-sl.com",
    description: "Browse shemale personal ads in Sri Lanka from all districts.",
  },
  "Marriage Proposals": {
    title: "Marriage Proposals Sri Lanka | ads-sl.com",
    description: "Find genuine marriage proposals in Sri Lanka. Browse listings from all districts.",
  },
  "Rooms": {
    title: "Rooms for Rent Sri Lanka | ads-sl.com",
    description: "Find rooms for rent across Sri Lanka. Browse listings from Colombo, Kandy, Galle and all districts.",
  },
  "Toys & Accessories": {
    title: "Adult Toys & Accessories Sri Lanka | ads-sl.com",
    description: "Buy adult toys and accessories in Sri Lanka. Discreet delivery available.",
  },
};

// SEO content sections per category
const categorySeoContent: Record<string, { heading: string; paragraphs: string[] }> = {
  "Spa": {
    heading: "Spa Ada Sri Lanka – Srilankan Spa & SL Spa Services",
    paragraphs: [
      "Sri Lanka offers a wide range of spa ada and srilankan spa services across all major cities. From traditional Ayurvedic treatments to modern wellness centers, you'll find the perfect sl spa service on Ads SL.",
      "Whether you're searching for spa ada in Colombo, srilankan spa in Kandy, or wellness services in Galle, Negombo, Matara or any other district, our platform connects you with verified spa providers.",
      "Looking for srilankan spa near me? Use the district filter to instantly view sl spa ada listings in your area. Every spa ada listing on Ads SL is moderated for safety and authenticity.",
      "Post your spa ada service ad for free and reach thousands of customers searching srilankan spa, sl ads and ada sl every day. Join Sri Lanka's largest community of spa providers on Ads SL.",
    ],
  },
  "Girls Personal": {
    heading: "Girls Personal Ads in Sri Lanka",
    paragraphs: [
      "Find girls personal ads, srilankan ads and ada sl listings from all 25 districts of Sri Lanka. Our platform features verified listings with photos and contact details for genuine connections.",
      "Ads SL is Sri Lanka's most trusted platform for srilankan personal classified ads. All listings are moderated for safety and authenticity.",
    ],
  },
  "Boys Personal": {
    heading: "Boys Personal Ads in Sri Lanka",
    paragraphs: [
      "Browse boys personal ads, srilankan ads and ada sl listings from across Sri Lanka. Find genuine listings from Colombo, Kandy, Galle, and all other districts.",
      "Post your personal ad for free on Ads SL and connect with people across Sri Lanka. All ads are reviewed by our moderation team.",
    ],
  },
  "Live Cam": {
    heading: "Live Cam Ads in Sri Lanka",
    paragraphs: [
      "Discover live cam performers and services across Sri Lanka. Browse ads with details and contact information on Ads SL.",
      "Post your live cam ad for free and reach an audience across all 25 districts of Sri Lanka.",
    ],
  },
  "Shemale Personal": {
    heading: "Shemale Personal Ads in Sri Lanka",
    paragraphs: [
      "Browse shemale personal ads from all districts in Sri Lanka. Find verified listings with photos and contact details on Ads SL.",
      "Post your personal ad for free and connect with people across Sri Lanka's 25 districts.",
    ],
  },
  "Marriage Proposals": {
    heading: "Marriage Proposals in Sri Lanka",
    paragraphs: [
      "Find genuine marriage proposals from all 25 districts of Sri Lanka. Ads SL connects families and individuals looking for meaningful relationships.",
      "Post your marriage proposal for free on Ads SL. Our moderation team ensures all listings are genuine and respectful.",
    ],
  },
  "Rooms": {
    heading: "Rooms for Rent in Sri Lanka",
    paragraphs: [
      "Find rooms for rent across Sri Lanka including Colombo, Kandy, Galle, Matara, and all 25 districts. Browse listings with photos, prices, and location details.",
      "Whether you're looking for a furnished room, a shared apartment, or a studio, Ads SL has the widest selection of room rental ads in Sri Lanka.",
      "List your room for rent for free on Ads SL and reach thousands of potential tenants across the country.",
    ],
  },
  "Toys & Accessories": {
    heading: "Adult Toys & Accessories in Sri Lanka",
    paragraphs: [
      "Browse adult toys and accessories available in Sri Lanka. Find products with discreet delivery options from sellers across the country.",
      "Post your product listing for free on Ads SL and reach buyers across all 25 districts of Sri Lanka.",
    ],
  },
};

const topDistricts = ["Colombo", "Gampaha", "Kandy", "Galle", "Matara", "Kurunegala", "Jaffna", "Kalutara", "Badulla", "Ratnapura"];

const CategoryPage = () => {
  const { category: catSlug, district: districtSlug } = useParams<{ category: string; district?: string }>();
  const category = categoryFromSlug[catSlug || ""] || null;
  const district = districtSlug ? districtFromSlug(districtSlug, districts) : null;
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ADS_PER_PAGE = 15;

  useEffect(() => {
    const fetchAds = async () => {
      if (!category) { setLoading(false); return; }
      setLoading(true);
      let query = supabase
        .from("ads")
        .select("id, title, description, image_url, additional_image_urls, badge, cashback, category, created_at, approved_at, view_count, favorite_count, contact_phone, location, verified_member, slug");
      query = query.eq("status", "approved").eq("category", category).order("approved_at", { ascending: false });
      if (district) query = query.eq("location", district);
      const { data } = await query;
      if (data) setAds(data);
      setLoading(false);
    };
    fetchAds();
    setCurrentPage(1);
  }, [category, district]);

  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
          <Link to="/" className="text-primary hover:underline">← Back to Home</Link>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(ads.length / ADS_PER_PAGE);
  const paginatedAds = ads.slice((currentPage - 1) * ADS_PER_PAGE, currentPage * ADS_PER_PAGE);

  const adCards: AdType[] = paginatedAds.map((ad, i) => ({
    id: i,
    dbId: ad.id,
    title: ad.title,
    description: ad.description,
    image: ad.image_url || "/placeholder.svg",
    badge: (ad.badge || "nra") as "super" | "vip" | "nra",
    cashback: ad.cashback,
    likes: String(ad.favorite_count || 0),
    views: String(ad.view_count || 0),
    timeAgo: getTimeAgo(ad.approved_at || ad.created_at),
    category: ad.category,
    contact_phone: ad.contact_phone || undefined,
    additionalImages: ad.additional_image_urls || [],
    location: ad.location || undefined,
    verified_member: ad.verified_member,
    slug: ad.slug || undefined,
  }));

  // Use unique SEO titles/descriptions
  const seo = categorySeo[category];
  const pageTitle = district
    ? `${category} Ads in ${district}, Sri Lanka | ads-sl.com`
    : (seo?.title || `${category} Ads Sri Lanka | ads-sl.com`);
  const pageDesc = district
    ? `Browse ${category.toLowerCase()} ads in ${district}, Sri Lanka. Find verified ${category.toLowerCase()} services in ${district}. Post free ads on ads-sl.com.`
    : (seo?.description || `Browse ${category.toLowerCase()} classified ads across Sri Lanka. Find the best ${category.toLowerCase()} services on ads-sl.com.`);
  const canonicalUrl = district
    ? `${SITE_URL}/${districtToSlug(district)}/${catSlug}`
    : `${SITE_URL}/${catSlug}`;

  const faqs = categoryFaqs[category] || [];
  const seoContent = categorySeoContent[category];

  // Structured data - ItemList
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: pageTitle,
    description: pageDesc,
    url: canonicalUrl,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: ads.length,
      itemListElement: paginatedAds.slice(0, 10).map((ad: any, i: number) => ({
        "@type": "ListItem",
        position: i + 1,
        url: ad.slug ? `${SITE_URL}/ad/${ad.slug}` : canonicalUrl,
        name: ad.title,
      })),
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      ...(district ? [{ "@type": "ListItem", position: 2, name: district, item: `${SITE_URL}/district/${districtToSlug(district)}` }] : []),
      { "@type": "ListItem", position: district ? 3 : 2, name: category },
    ],
  };

  const faqJsonLd = faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  } : null;

  return (
    <div className="min-h-screen bg-background">
      <PageSeo
        title={pageTitle}
        description={pageDesc}
        canonical={canonicalUrl}
        schema={itemListJsonLd}
      />

      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-4 flex-wrap" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="w-3 h-3" />
          {district && (
            <>
              <Link to={getDistrictUrl(district)} className="hover:text-primary">{district}</Link>
              <ChevronRight className="w-3 h-3" />
            </>
          )}
          <span className="text-foreground">{category}</span>
        </nav>

        <div className="flex items-center gap-2 mb-2">
          <Tag className="w-6 h-6 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {category} Ads{district ? ` in ${district}` : " - Sri Lanka"}
          </h1>
        </div>
        <p className="text-muted-foreground mb-6">
          {ads.length} {category.toLowerCase()} ads available{district ? ` in ${district}` : " across Sri Lanka"}.
          {!district && ` Browse free ${category.toLowerCase()} classified ads and post your own ad for free.`}
        </p>

        {/* District links */}
        {!district && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1">
              <MapPin className="w-4 h-4" /> Browse {category} by District
            </h2>
            <div className="flex flex-wrap gap-2">
              {districts.map((d) => (
                <Link key={d} to={`/${districtToSlug(d)}/${catSlug}`} className="text-xs px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors">
                  {category} in {d}
                </Link>
              ))}
            </div>
          </div>
        )}

        {district && (
          <div className="flex flex-wrap gap-2 mb-6">
            <Link to={`/${catSlug}`} className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20">
              All {category} ads in Sri Lanka
            </Link>
            <Link to={getDistrictUrl(district)} className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20">
              All ads in {district}
            </Link>
          </div>
        )}

        {loading ? (
          <p className="text-center text-muted-foreground py-12">Loading...</p>
        ) : ads.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No {category.toLowerCase()} ads found{district ? ` in ${district}` : ""}.</p>
        ) : (
          <>
            {totalPages > 1 && (
              <p className="text-sm text-muted-foreground mb-3">Page {currentPage} of {totalPages}</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {adCards.map((ad) => (
                <Link key={ad.dbId} to={ad.slug ? getAdUrl(ad.slug) : "#"}>
                  <AdCard ad={ad} />
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                  <ChevronLeft className="w-4 h-4" /> Prev
                </Button>
                <span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}

        {/* SEO Content Section */}
        {seoContent && (
          <div className="border-t border-border pt-6 mt-8">
            <h2 className="font-semibold text-lg text-foreground mb-3">{seoContent.heading}</h2>
            {seoContent.paragraphs.map((p, i) => (
              <p key={i} className="text-sm text-muted-foreground mb-3 leading-relaxed">{p}</p>
            ))}
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-foreground mb-2">Top Districts for {category}</h3>
              <div className="flex flex-wrap gap-2">
                {topDistricts.map((d) => (
                  <Link key={d} to={`/${districtToSlug(d)}/${catSlug}`} className="text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                    {d}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* FAQ Section */}
        {faqs.length > 0 && (
          <div className="border-t border-border pt-6 mt-8">
            <h2 className="font-semibold text-lg text-foreground mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i}>
                  <h3 className="font-medium text-foreground text-sm">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Other categories */}
        <div className="border-t border-border pt-6 mt-8">
          <h2 className="font-semibold text-lg text-foreground mb-3">Browse Other Categories</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(categorySlugMap)
              .filter(([cat]) => cat !== category)
              .map(([cat, slug]) => (
                <Link key={cat} to={district ? `/${districtToSlug(district)}/${slug}` : `/${slug}`} className="text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                  {cat}
                </Link>
              ))}
          </div>
        </div>

        <footer className="mt-8 border-t border-border pt-6 pb-4 text-muted-foreground text-xs space-y-2">
          <p>Find the best {category.toLowerCase()} ads{district ? ` in ${district}` : " across Sri Lanka"} on Ads SL. Post free classified ads and connect with buyers and sellers across all 25 districts of Sri Lanka.</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <Link to="/about" className="hover:text-primary">About Us</Link>
            <span>·</span>
            <Link to="/privacy" className="hover:text-primary">Privacy Policy</Link>
            <span>·</span>
            <Link to="/terms" className="hover:text-primary">Terms</Link>
            <span>·</span>
            <Link to="/blogs" className="hover:text-primary">Blog</Link>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default CategoryPage;
