import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import Sidebar from "@/components/Sidebar";
import AdCard from "@/components/AdCard";
import type { AdType } from "@/components/AdCard";
import AdDetailModal from "@/components/AdDetailModal";
import { sampleAds } from "@/data/sampleAds";
import { districtAds } from "@/data/districtAds";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
};

const Index = () => {
  const [dbAds, setDbAds] = useState<DbAd[]>([]);
  const [selectedAd, setSelectedAd] = useState<AdType | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ADS_PER_PAGE = 8;

  useEffect(() => {
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
      .select("id, title, description, image_url, additional_image_urls, badge, cashback, category, created_at, approved_at, view_count, favorite_count, contact_phone, location")
      .eq("status", "approved")
      .order("approved_at", { ascending: false, nullsFirst: false });
    if (data) setDbAds(data as DbAd[]);
  };

  useEffect(() => {
    fetchAds();
  }, []);

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
  }));

  const allAds = [...dbAdCards, ...districtAds, ...sampleAds];
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

  const handleAdClick = (ad: AdType) => {
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

  return (
    <div className="min-h-screen bg-background">
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
            <div className="md:hidden mb-4">
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

            <div ref={adGridRef} className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 bg-card/50 rounded-lg p-3 sm:p-4 shadow-[0_4px_24px_-6px_hsl(354_80%_55%/0.12),0_2px_8px_-2px_hsl(0_0%_0%/0.08)]" style={{ borderImage: 'linear-gradient(135deg, hsl(0 0% 10%), hsl(354 80% 55%)) 1', borderWidth: '2px', borderStyle: 'solid' }}>
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
            <footer className="mt-12 border-t border-border pt-8 pb-4 text-muted-foreground text-xs leading-relaxed space-y-3">
              <h2 className="text-sm font-semibold text-foreground">Ads SL - Sri Lanka's Top Free Classified Ads Platform</h2>
              <p>
                Welcome to Ads SL, the leading SL ads platform for browsing and posting free classified ads across all 25 districts in Sri Lanka. 
                Whether you're looking for spa services in Colombo, Lanka ads for rooms and rentals, live cam shows, or any other service — 
                Ads SL connects buyers and sellers across Sri Lanka instantly.
              </p>
              <p>
                Browse ads Lanka wide — from Colombo to Kandy, Galle to Jaffna. Post your own Lanka ads for free and reach thousands of Sri Lankan users daily. 
                Our platform covers categories including spa, wellness, services, electronics, vehicles, real estate, jobs, and live entertainment across Sri Lanka.
              </p>
              <p className="text-muted-foreground/60">
                Popular searches: SL ads, spa Sri Lanka, ads Lanka, Lanka ads, live cam show Sri Lanka, classified ads Sri Lanka, free ads SL, Colombo spa, Lankan ads platform
              </p>
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
