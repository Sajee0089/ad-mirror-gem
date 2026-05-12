import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import Sidebar from "@/components/Sidebar";
import AdCard from "@/components/AdCard";
import type { AdType } from "@/components/AdCard";
import AdDetailModal from "@/components/AdDetailModal";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { districts } from "@/data/districts";
import { getDistrictUrl, getCategoryUrl, categorySlugMap, getAdUrl, SITE_URL } from "@/lib/seo";
import { Helmet } from "react-helmet-async";

type DbAd = {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  additional_image_urls: string[] | null;
  badge: string | null;
  cashback: boolean;
  category: string;
  created_at: string;
  approved_at: string | null;
  view_count: number;
  favorite_count: number;
  contact_phone: string | null;
  location: string | null;
  verified_member: boolean;
  slug: string | null;
};

const Index = () => {
  const [dbAds, setDbAds] = useState<DbAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAd, setSelectedAd] = useState<AdType | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ADS_PER_PAGE = 15;

  useEffect(() => {
    // Two-phase fetch: first page fast (lighter payload), then rest in background
    const fetchAds = async () => {
      // Phase 1: First 15 ads, minimal columns for fast render
      const { data: firstPage } = await supabase
        .from("ads")
        .select("id, title, description, image_url, additional_image_urls, badge, cashback, category, created_at, approved_at, view_count, favorite_count, contact_phone, location, verified_member, slug")
        .eq("status", "approved")
        .order("approved_at", { ascending: false, nullsFirst: false })
        .limit(15);
      if (firstPage) {
        setDbAds(firstPage as any);
        setLoading(false);
      }

      // Phase 2: Fetch remaining ads in background for filters/pagination
      const { data: rest } = await supabase
        .from("ads")
        .select("id, title, description, image_url, additional_image_urls, badge, cashback, category, created_at, approved_at, view_count, favorite_count, contact_phone, location, verified_member, slug")
        .eq("status", "approved")
        .order("approved_at", { ascending: false, nullsFirst: false })
        .range(15, 999);
      if (rest && rest.length > 0) {
        setDbAds((prev) => {
          const ids = new Set(prev.map((a) => a.id));
          const merged = [...prev, ...(rest as any).filter((a: DbAd) => !ids.has(a.id))];
          return merged;
        });
      }
      setLoading(false);
    };
    fetchAds();

    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "admin");
        setIsAdmin(!!(data && data.length > 0));
      }
    };
    checkAdmin();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAdmin();
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchAds = async () => {
    const { data } = await supabase
      .from("ads")
      .select("id, title, description, image_url, additional_image_urls, badge, cashback, category, created_at, approved_at, view_count, favorite_count, contact_phone, location, verified_member, slug")
      .eq("status", "approved")
      .order("approved_at", { ascending: false, nullsFirst: false });
    if (data) setDbAds(data as any);
  };

  const handleDeleteAd = async (ad: AdType) => {
    if (!ad.dbId) return;
    if (!confirm("Are you sure you want to delete this ad?")) return;
    const { error } = await supabase.from("ads").delete().eq("id", ad.dbId);
    if (error) {
      toast.error("Failed to delete ad");
    } else {
      toast.success("Ad deleted");
      fetchAds();
    }
  };

  const dbAdCards: AdType[] = dbAds.map((ad, idx) => ({
    id: 1000 + idx,
    dbId: ad.id,
    title: ad.title,
    description: ad.description,
    image: ad.image_url || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&h=200&fit=crop",
    badge: (ad.badge || "nra") as "super" | "vip" | "nra",
    cashback: ad.cashback || false,
    likes: String(ad.favorite_count || 0),
    views: String(ad.view_count || 0),
    timeAgo: getTimeAgo(ad.approved_at || ad.created_at),
    category: ad.category,
    contact_phone: ad.contact_phone || undefined,
    additionalImages: ad.additional_image_urls || [],
    location: ad.location || undefined,
    verified_member: ad.verified_member || false,
    slug: ad.slug || undefined,
  }));

  const allAds = dbAdCards;
  const filteredAds = allAds.filter((ad) => {
    if (selectedCategory && ad.category !== selectedCategory) return false;
    if (selectedDistrict && (ad as any).location !== selectedDistrict) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!ad.title.toLowerCase().includes(q) && !ad.description.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredAds.length / ADS_PER_PAGE);
  const paginatedAds = filteredAds.slice((currentPage - 1) * ADS_PER_PAGE, currentPage * ADS_PER_PAGE);

  // Scroll to ad grid area when page changes
  const adGridRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (adGridRef.current) {
      const offset = adGridRef.current.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: offset, behavior: "smooth" });
    }
  }, [currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedDistrict, searchQuery]);

  const navigate = useNavigate();

  const handleAdClick = (ad: AdType) => {
    // If ad has a slug, the AdCard <Link> already navigates — don't push twice.
    if (ad.slug) return;
    setSelectedAd(ad);
    setModalOpen(true);
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Ads SL",
    "alternateName": ["SL Ads", "Lanka Ads", "Ada SL", "Srilankan Ads", "Spa Ada"],
    "url": SITE_URL,
    "description": "Sri Lanka free classified ads platform",
    "inLanguage": "en-LK",
    "potentialAction": {
      "@type": "SearchAction",
      "target": { "@type": "EntryPoint", "urlTemplate": `${SITE_URL}/?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
    "publisher": {
      "@type": "Organization",
      "name": "Ads SL",
      "url": SITE_URL,
      "logo": { "@type": "ImageObject", "url": `${SITE_URL}/favicon.png` },
    },
  };

  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Ads SL",
    "description": "Free classified ads platform in Sri Lanka for SL ads, spa ads, personal ads",
    "url": SITE_URL,
    "areaServed": { "@type": "Country", "name": "Sri Lanka" },
    "serviceType": "Classified Advertising Platform",
    "priceRange": "Free",
  };

  const homeTitle = "Ads SL | Free Classified Ads Sri Lanka — SL Ads, Spa Ads, Lanka Ads — Post Free";
  const homeDesc = "Ads SL is Sri Lanka's #1 free classified ads platform. Post free SL ads, browse spa ads, personal ads, rooms for rent and marriage proposals across all 25 districts. Free. Fast. Trusted.";

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{homeTitle}</title>
        <meta name="description" content={homeDesc} />
        <meta name="keywords" content="SL ads, ads SL, Sri Lanka classified ads, spa ads Sri Lanka, lanka ads, personal ads Sri Lanka, free ads Sri Lanka, srilankan ads, hela ads, post free ad Sri Lanka, ada sl, spa ada sri lanka, sl classified ads" />
        <link rel="canonical" href={`${SITE_URL}/`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE_URL}/`} />
        <meta property="og:title" content="Ads SL | Free Classified Ads Sri Lanka" />
        <meta property="og:description" content="Sri Lanka's #1 free classified ads platform. Post free SL ads, spa ads, personal ads across all 25 districts." />
        <meta property="og:image" content={`${SITE_URL}/og-image.jpg`} />
        <meta property="og:site_name" content="Ads SL" />
        <meta property="og:locale" content="en_LK" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Ads SL | Free Classified Ads Sri Lanka" />
        <meta name="twitter:description" content="Sri Lanka's #1 free classified ads platform. Post SL ads free." />
        <meta name="twitter:image" content={`${SITE_URL}/og-image.jpg`} />
        <script type="application/ld+json">{JSON.stringify(websiteJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(localBusinessJsonLd)}</script>
      </Helmet>
      <Navbar />
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-4">
        <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
          <div className="hidden md:block">
            <Sidebar
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
              selectedDistrict={selectedDistrict}
              onDistrictSelect={setSelectedDistrict}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>
          <main className="flex-1 min-w-0">
            <HeroBanner />
            <div className="md:hidden mb-3">
              <Sidebar
                selectedCategory={selectedCategory}
                onCategorySelect={setSelectedCategory}
                selectedDistrict={selectedDistrict}
                onDistrictSelect={setSelectedDistrict}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            </div>

            {(selectedCategory || selectedDistrict) && (
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                {selectedCategory && (
                  <span className="text-sm font-medium text-foreground">
                    Category: <span className="text-primary">{selectedCategory}</span>
                  </span>
                )}
                {selectedDistrict && (
                  <span className="text-sm font-medium text-foreground">
                    District: <span className="text-primary">{selectedDistrict}</span>
                  </span>
                )}
                <button
                  onClick={() => { setSelectedCategory(null); setSelectedDistrict(null); }}
                  className="text-xs text-muted-foreground hover:text-foreground underline"
                >
                  Clear Filters
                </button>
              </div>
            )}

            <div ref={adGridRef} className="bg-card/50 rounded-lg shadow-[0_4px_24px_-6px_hsl(354_80%_55%/0.12),0_2px_8px_-2px_hsl(0_0%_0%/0.08)]" style={{ borderImage: 'linear-gradient(135deg, hsl(0 0% 10%), hsl(354 80% 55%)) 1', borderWidth: '2px', borderStyle: 'solid' }}>
              {totalPages > 1 && (
                <p className="text-center text-xs text-muted-foreground pt-2">Page {currentPage} of {totalPages}</p>
              )}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rounded-lg bg-muted animate-pulse h-48" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4">
                {paginatedAds.map((ad) => (
                  <AdCard
                    key={`${ad.category}-${ad.id}`}
                    ad={ad}
                    onClick={() => handleAdClick(ad)}
                    isAdmin={isAdmin}
                    onDelete={handleDeleteAd}
                  />
                ))}
                </div>
              )}
            </div>

            {filteredAds.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No ads found in this category.
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-6 mb-4 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Prev
                </Button>
                {getPageNumbers().map((page, idx) =>
                  typeof page === "string" ? (
                    <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">…</span>
                  ) : (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      className="min-w-[36px]"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  )
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="gap-1"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* SEO Content */}
            <footer className="mt-12 border-t border-border pt-8 pb-4 text-muted-foreground text-xs leading-relaxed space-y-4">
              <h2 className="text-sm font-semibold text-foreground">SL Ads & Srilankan Spa Ada – Sri Lanka's #1 Free Classified Platform</h2>
              <p>
                Welcome to Ads SL (also known as <strong>Ada SL</strong>), the leading <strong>SL ads</strong> platform for browsing and posting free classified ads across all 25 districts in Sri Lanka.
                Whether you're searching for <strong>spa ada</strong> in Colombo, <strong>srilankan spa</strong> services in Kandy or Galle, <strong>srilankan ads</strong> for rooms and rentals, live cam shows, or personal listings —
                Ads SL connects buyers and sellers across Sri Lanka instantly.
              </p>
              <p>
                Our platform features verified <strong>sl spa ada</strong> providers, genuine personal ads, and trusted marriage proposals from every district.
                Post your free ad today and reach thousands of users browsing <strong>ada sl</strong>, <strong>srilankan ads</strong>, and <strong>spa ada</strong> listings every day.
              </p>

              {/* Internal links - Categories */}
              <div>
                <h3 className="text-xs font-semibold text-foreground mb-2">Browse by Category</h3>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(categorySlugMap).map(([cat, slug]) => (
                    <Link key={cat} to={`/${slug}`} className="px-2 py-1 rounded bg-muted hover:bg-primary/10 hover:text-primary transition-colors">
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Internal links - Districts */}
              <div>
                <h3 className="text-xs font-semibold text-foreground mb-2">Browse by District</h3>
                <div className="flex flex-wrap gap-1.5">
                  {districts.map((d) => (
                    <Link key={d} to={getDistrictUrl(d)} className="px-2 py-1 rounded bg-muted hover:bg-primary/10 hover:text-primary transition-colors">
                      {d}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-foreground mb-2">Popular Searches</h3>
                <div className="flex flex-wrap gap-1.5">
                  <Link to="/spa-ads" className="px-2 py-1 rounded bg-muted hover:bg-primary/10 hover:text-primary transition-colors">SL ads</Link>
                  <Link to="/spa-ads" className="px-2 py-1 rounded bg-muted hover:bg-primary/10 hover:text-primary transition-colors">Spa ada</Link>
                  <Link to="/spa-ads" className="px-2 py-1 rounded bg-muted hover:bg-primary/10 hover:text-primary transition-colors">SL spa ada</Link>
                  <Link to="/spa-ads" className="px-2 py-1 rounded bg-muted hover:bg-primary/10 hover:text-primary transition-colors">Srilankan spa</Link>
                  <Link to="/" className="px-2 py-1 rounded bg-muted hover:bg-primary/10 hover:text-primary transition-colors">Srilankan ads</Link>
                  <Link to="/" className="px-2 py-1 rounded bg-muted hover:bg-primary/10 hover:text-primary transition-colors">Ada SL</Link>
                  <Link to="/district/colombo" className="px-2 py-1 rounded bg-muted hover:bg-primary/10 hover:text-primary transition-colors">Colombo spa</Link>
                  <Link to="/district/kandy" className="px-2 py-1 rounded bg-muted hover:bg-primary/10 hover:text-primary transition-colors">Kandy ads</Link>
                  <Link to="/district/galle" className="px-2 py-1 rounded bg-muted hover:bg-primary/10 hover:text-primary transition-colors">Galle spa</Link>
                  <Link to="/live-cam-ads" className="px-2 py-1 rounded bg-muted hover:bg-primary/10 hover:text-primary transition-colors">Live cam Sri Lanka</Link>
                  <Link to="/rooms-ads" className="px-2 py-1 rounded bg-muted hover:bg-primary/10 hover:text-primary transition-colors">Rooms Sri Lanka</Link>
                </div>
              </div>
            </footer>
          </main>
        </div>
      </div>

      <AdDetailModal
        ad={selectedAd}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default Index;
