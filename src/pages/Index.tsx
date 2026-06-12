import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import Sidebar from "@/components/Sidebar";
import AdCard from "@/components/AdCard";
import type { AdType } from "@/components/AdCard";
import AdDetailModal from "@/components/AdDetailModal";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { districts } from "@/data/districts";
import { getDistrictUrl, getCategoryUrl, categorySlugMap, getAdUrl, SITE_URL } from "@/lib/seo";
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
  const cachedAds = (() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = sessionStorage.getItem("indexAdsCache");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed as DbAd[];
    } catch {}
    return null;
  })();

  const [dbAds, setDbAds] = useState<DbAd[]>(cachedAds || []);
  const [loading, setLoading] = useState(!cachedAds);
  const [selectedAd, setSelectedAd] = useState<AdType | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentPage, setCurrentPage] = useState(() => {
    if (typeof window === "undefined") return 1;
    const saved = sessionStorage.getItem("indexCurrentPage");
    return saved ? Math.max(1, parseInt(saved, 10) || 1) : 1;
  });

  const isInitialPageRender = useRef(true);
  const ADS_PER_PAGE = 15;

  useEffect(() => {
    const fetchAds = async () => {
      const { data: firstPage } = await supabase
        .from("ads")
        .select("id, title, description, image_url, additional_image_urls, badge, cashback, category, created_at, approved_at, view_count, favorite_count, contact_phone, location, verified_member, slug")
        .eq("status", "approved")
        .order("approved_at", { ascending: false, nullsFirst: false })
        .limit(15);

      if (firstPage && !cachedAds) {
        setDbAds(firstPage as any);
        setLoading(false);
      }

      const { data: rest } = await supabase
        .from("ads")
        .select("id, title, description, image_url, additional_image_urls, badge, cashback, category, created_at, approved_at, view_count, favorite_count, contact_phone, location, verified_member, slug")
        .eq("status", "approved")
        .order("approved_at", { ascending: false, nullsFirst: false })
        .range(15, 999);

      if (rest && rest.length > 0) {
        setDbAds((prev) => {
          const base = cachedAds && firstPage
            ? [...(firstPage as any), ...(rest as any)] as DbAd[]
            : prev;
          const ids = new Set(base.map((a) => a.id));
          const merged = [...base, ...(rest as any).filter((a: DbAd) => !ids.has(a.id))];
          try { sessionStorage.setItem("indexAdsCache", JSON.stringify(merged.slice(0, 300))); } catch {}
          return merged;
        });
      } else if (firstPage) {
        try { sessionStorage.setItem("indexAdsCache", JSON.stringify(firstPage)); } catch {}
        setLoading(false);
      }
    };

    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin");
        setIsAdmin(!!(data && data.length > 0));
      }
    };

    fetchAds();
    checkAdmin();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => checkAdmin());
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
    if (error) toast.error("Failed to delete ad");
    else { toast.success("Ad deleted"); fetchAds(); }
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

  const filteredAds = dbAdCards.filter((ad) => {
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
  const adGridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    sessionStorage.setItem("indexCurrentPage", String(currentPage));
    if (isInitialPageRender.current) { isInitialPageRender.current = false; return; }
    if (adGridRef.current) {
      const offset = adGridRef.current.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: offset, behavior: "smooth" });
    }
  }, [currentPage]);

  const isInitialFilterRender = useRef(true);
  useEffect(() => {
    if (isInitialFilterRender.current) { isInitialFilterRender.current = false; return; }
    setCurrentPage(1);
    if (adGridRef.current) {
      const offset = adGridRef.current.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: offset, behavior: "smooth" });
    }
  }, [selectedCategory, selectedDistrict, searchQuery]);

  useEffect(() => {
    const handleSave = () => sessionStorage.setItem("indexScrollY", String(window.scrollY));
    window.addEventListener("pagehide", handleSave);
    window.addEventListener("beforeunload", handleSave);
    return () => {
      handleSave();
      window.removeEventListener("pagehide", handleSave);
      window.removeEventListener("beforeunload", handleSave);
    };
  }, []);

  const didRestoreScroll = useRef(false);
  useLayoutEffect(() => {
    if (didRestoreScroll.current) return;
    if (loading || dbAds.length === 0) return;
    const saved = sessionStorage.getItem("indexScrollY");
    if (saved) {
      const y = parseInt(saved, 10);
      if (!isNaN(y) && y > 0) window.scrollTo({ top: y, behavior: "auto" });
    }
    didRestoreScroll.current = true;
  }, [loading, dbAds.length]);

  const handleAdClick = (ad: AdType) => {
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
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="min-h-screen bg-background">
      <PageSeo
        title="SL Ads | Free Classified Ads Sri Lanka"
        description="Ads SL is Sri Lanka's free classified ads platform."
        canonical="https://www.ads-sl.com/"
      />
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
                  <span className="text-sm">Category: <span className="text-primary">{selectedCategory}</span></span>
                )}
                {selectedDistrict && (
                  <span className="text-sm">District: <span className="text-primary">{selectedDistrict}</span></span>
                )}
                <button
                  onClick={() => { setSelectedCategory(null); setSelectedDistrict(null); }}
                  className="text-xs text-muted-foreground underline"
                >
                  Clear Filters
                </button>
              </div>
            )}
            <div ref={adGridRef} className="bg-card/50 rounded-lg shadow-sm" style={{ border: "1px solid #e2e8f0" }}>
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rounded-lg bg-muted animate-pulse h-48" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3">
                  {paginatedAds.map((ad) => (
                    <AdCard
                      key={`${ad.category}-${ad.dbId}`}
                      ad={ad}
                      onClick={() => handleAdClick(ad)}
                      isAdmin={isAdmin}
                      onDelete={handleDeleteAd}
                    />
                  ))}
                </div>
              )}
              {filteredAds.length === 0 && !loading && (
                <div className="text-center py-12">No ads found.</div>
              )}
              {totalPages > 1 && (
                <div className="flex justify-center gap-1.5 mt-6 pb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Prev
                  </Button>
                  {getPageNumbers().map((p, i) =>
                    typeof p === "string" ? (
                      <span key={i} className="px-2">...</span>
                    ) : (
                      <Button
                        key={p}
                        variant={currentPage === p ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(p as number)}
                      >
                        {p}
                      </Button>
                    )
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
      {/* FIX: use open={modalOpen} not isOpen={modalOpen} */}
      {selectedAd && (
        <AdDetailModal
          ad={selectedAd}
          open={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Index;
