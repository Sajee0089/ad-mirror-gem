import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import AdCard from "@/components/AdCard";
import type { AdType } from "@/components/AdCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { districts } from "@/data/districts";
import { SITE_URL, districtFromSlug, districtToSlug, categorySlugMap, getDistrictUrl, getAdUrl } from "@/lib/seo";

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const districtDescriptions: Record<string, string> = {
  "Colombo": "Colombo, Sri Lanka's commercial capital, is the most active city for classified ads. Find spa services, personal ads, rooms, and more in Colombo on Ads SL.",
  "Kandy": "Kandy, the cultural capital of Sri Lanka, offers a vibrant classified ads market. Browse ads for services, rooms, and personal listings in Kandy.",
  "Galle": "Galle, known for its historic fort and coastal beauty, is a growing market for classified ads. Find services and listings in Galle on Ads SL.",
  "Jaffna": "Jaffna, the capital of Sri Lanka's Northern Province, has a growing online presence. Browse classified ads and services in Jaffna.",
  "Matara": "Matara is a major city in southern Sri Lanka. Find classified ads for services, rooms, and personal listings in Matara.",
  "Kurunegala": "Kurunegala is a key city in North Western Province. Browse free classified ads and services in Kurunegala on Ads SL.",
  "Gampaha": "Gampaha district, adjacent to Colombo, is one of the most populated areas. Find classified ads for various services in Gampaha.",
  "Badulla": "Badulla, in the hill country of Sri Lanka, offers unique local services. Browse classified ads in Badulla on Ads SL.",
  "Ratnapura": "Ratnapura, the gem capital of Sri Lanka, offers classified ads for various services. Browse listings in Ratnapura.",
};

const DistrictPage = () => {
  const { district: districtSlug } = useParams<{ district: string }>();
  const district = districtFromSlug(districtSlug || "", districts);
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ADS_PER_PAGE = 15;

  useEffect(() => {
    const fetchAds = async () => {
      if (!district) { setLoading(false); return; }
      setLoading(true);
      const { data } = await (supabase
        .from("ads")
        .select("id, title, description, image_url, additional_image_urls, badge, cashback, category, created_at, approved_at, view_count, favorite_count, contact_phone, location, verified_member, slug")
        .eq("status", "approved")
        .eq("location", district)
        .order("approved_at", { ascending: false }) as any);
      if (data) setAds(data);
      setLoading(false);
    };
    fetchAds();
    setCurrentPage(1);
  }, [district]);

  if (!district) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">District Not Found</h1>
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

  const metaTitle = `Free Classified Ads ${district} - Ads in ${district}, Sri Lanka | Ads SL`;
  const metaDesc = `Browse ${ads.length}+ free classified ads in ${district}, Sri Lanka. Find spa services, personal ads, rooms & more in ${district}. Post free ads on Ads SL.`;
  const canonicalUrl = `${SITE_URL}/district/${districtSlug}`;
  const districtDesc = districtDescriptions[district] || `Browse free classified ads in ${district}, Sri Lanka. Find services, rooms, personal ads, and more on Ads SL.`;

  const categories = Object.keys(categorySlugMap);

  // Structured data
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: district },
    ],
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: metaTitle,
    description: metaDesc,
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

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `How to post free ads in ${district}?`,
        acceptedAnswer: { "@type": "Answer", text: `Create a free account on Ads SL, click 'Post Ad', select ${district} as your location, fill in your ad details, and submit. Your ad will be reviewed and published within hours.` },
      },
      {
        "@type": "Question",
        name: `What types of ads can I find in ${district}?`,
        acceptedAnswer: { "@type": "Answer", text: `You can find spa services, personal ads, rooms for rent, marriage proposals, toys & accessories, and more in ${district} on Ads SL.` },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDesc} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDesc} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Ads SL" />
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(itemListJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>

      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-4" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground">{district}</span>
        </nav>

        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-6 h-6 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Free Ads in {district}</h1>
        </div>
        <p className="text-muted-foreground mb-4">
          {districtDesc}
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          {ads.length} classified ads available in {district}.
        </p>

        {/* Category links */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => (
            <Link key={cat} to={`/${districtToSlug(district)}/${categorySlugMap[cat]}`} className="text-xs px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors">
              {cat} in {district}
            </Link>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground py-12">Loading...</p>
        ) : ads.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No ads found in {district}.</p>
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

        {/* FAQ */}
        <div className="border-t border-border pt-6 mt-8">
          <h2 className="font-semibold text-lg text-foreground mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-foreground text-sm">How to post free ads in {district}?</h3>
              <p className="text-sm text-muted-foreground mt-1">Create a free account on Ads SL, click 'Post Ad', select {district} as your location, add details and images, and submit. Your ad will be reviewed and published.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground text-sm">What types of ads can I find in {district}?</h3>
              <p className="text-sm text-muted-foreground mt-1">You can find spa services, personal ads, rooms for rent, marriage proposals, live cam shows, toys & accessories, and more in {district} on Ads SL.</p>
            </div>
          </div>
        </div>

        {/* Other districts */}
        <div className="border-t border-border pt-6 mt-8">
          <h2 className="font-semibold text-lg text-foreground mb-3">Browse Other Districts</h2>
          <div className="flex flex-wrap gap-2">
            {districts.filter((d) => d !== district).map((d) => (
              <Link key={d} to={getDistrictUrl(d)} className="text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                {d}
              </Link>
            ))}
          </div>
        </div>

        <footer className="mt-8 border-t border-border pt-6 pb-4 text-muted-foreground text-xs space-y-2">
          <p>Ads SL is Sri Lanka's leading free classified ads platform. Find the best services, deals, and listings in {district} and across all 25 districts of Sri Lanka.</p>
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

export default DistrictPage;
