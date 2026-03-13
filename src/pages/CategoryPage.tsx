import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import AdCard from "@/components/AdCard";
import type { AdType } from "@/components/AdCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Tag, MapPin } from "lucide-react";
import { districts } from "@/data/districts";
import { SITE_URL, categoryFromSlug, districtFromSlug, districtToSlug, categorySlugMap, getDistrictUrl, getAdUrl } from "@/lib/seo";

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
    { q: "How to find spa services in Sri Lanka?", a: "Browse Ads SL's Spa category to find verified spa services across all 25 districts. Filter by your city to find nearby spas." },
    { q: "Is it free to post spa ads on Ads SL?", a: "Yes! Posting classified ads on Ads SL is completely free. Create an account and post your spa service ad in minutes." },
    { q: "How to verify spa service providers?", a: "Look for the 'Verified Member' badge on Ads SL. Verified members have been authenticated by our team for added trust." },
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
};

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
        .select("id, title, description, image_url, additional_image_urls, badge, cashback, category, created_at, approved_at, view_count, favorite_count, contact_phone, location, verified_member, slug") as any;
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

  const pageTitle = district
    ? `${category} Ads in ${district} - Free ${category} Classified Ads | Ads SL`
    : `${category} Ads Sri Lanka - Free ${category} Classified Ads | Ads SL`;
  const pageDesc = district
    ? `Browse ${ads.length}+ free ${category} ads in ${district}, Sri Lanka. Find verified ${category.toLowerCase()} services in ${district}. Post free ads on Ads SL.`
    : `Browse ${ads.length}+ free ${category} classified ads across Sri Lanka. Find the best ${category.toLowerCase()} services. Post your ad free on Ads SL.`;
  const canonicalUrl = district
    ? `${SITE_URL}/${districtToSlug(district)}/${catSlug}`
    : `${SITE_URL}/${catSlug}`;

  const faqs = categoryFaqs[category] || [];

  // Structured data
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
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Ads SL" />
        <script type="application/ld+json">{JSON.stringify(itemListJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
        {faqJsonLd && <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>}
      </Helmet>

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
