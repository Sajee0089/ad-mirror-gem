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

const CategoryPage = () => {
  const { category: catSlug, district: districtSlug } = useParams<{ category: string; district?: string }>();
  const category = categoryFromSlug[catSlug || ""] || null;
  const district = districtSlug ? districtFromSlug(districtSlug, districts) : null;
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ADS_PER_PAGE = 12;

  useEffect(() => {
    const fetchAds = async () => {
      if (!category) { setLoading(false); return; }
      setLoading(true);
      let query = supabase
        .from("ads")
        .select("id, title, description, image_url, additional_image_urls, badge, cashback, category, created_at, approved_at, view_count, favorite_count, contact_phone, location, verified_member, slug") as any;
      query = query.eq("status", "approved").eq("category", category).order("approved_at", { ascending: false });

      if (district) {
        query = query.eq("location", district);
      }

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
    ? `${category} Ads in ${district} - ${district} ${category} | Ads SL`
    : `${category} Ads Sri Lanka - Browse ${category} Classified Ads | Ads SL`;
  const pageDesc = district
    ? `Browse ${ads.length}+ ${category} ads in ${district}, Sri Lanka. Find the best ${category.toLowerCase()} services in ${district} on Ads SL.`
    : `Browse ${ads.length}+ ${category} classified ads across Sri Lanka. Find the best ${category.toLowerCase()} services on Ads SL.`;
  const canonicalUrl = district
    ? `${SITE_URL}/${districtToSlug(district)}/${catSlug}`
    : `${SITE_URL}/${catSlug}`;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:url" content={canonicalUrl} />
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
        </p>

        {/* District links for this category */}
        {!district && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1">
              <MapPin className="w-4 h-4" /> Browse by District
            </h2>
            <div className="flex flex-wrap gap-2">
              {districts.map((d) => (
                <Link
                  key={d}
                  to={`/${districtToSlug(d)}/${catSlug}`}
                  className="text-xs px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                >
                  {category} in {d}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* If district+category, show link back to full category */}
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

        {/* Other categories */}
        <div className="border-t border-border pt-6 mt-8">
          <h2 className="font-semibold text-lg text-foreground mb-3">Browse Other Categories</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(categorySlugMap)
              .filter(([cat]) => cat !== category)
              .map(([cat, slug]) => (
                <Link
                  key={cat}
                  to={district ? `/${districtToSlug(district)}/${slug}` : `/${slug}`}
                  className="text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  {cat}
                </Link>
              ))}
          </div>
        </div>

        <footer className="mt-8 border-t border-border pt-6 pb-4 text-muted-foreground text-xs space-y-2">
          <p>Find the best {category.toLowerCase()} ads{district ? ` in ${district}` : " across Sri Lanka"} on Ads SL, Sri Lanka's leading classified ads platform.</p>
        </footer>
      </div>
    </div>
  );
};

export default CategoryPage;
