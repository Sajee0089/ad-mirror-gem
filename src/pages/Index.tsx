import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import Sidebar from "@/components/Sidebar";
import AdCard from "@/components/AdCard";
import type { AdType } from "@/components/AdCard";
import AdDetailModal from "@/components/AdDetailModal";
import { sampleAds } from "@/data/sampleAds";
import { districtAds } from "@/data/districtAds";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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

  useEffect(() => {
    const fetchAds = async () => {
      const { data } = await supabase
        .from("ads")
        .select("id, title, description, image_url, additional_image_urls, badge, cashback, category, created_at, view_count, favorite_count, contact_phone, location")
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      if (data) setDbAds(data as DbAd[]);
    };
    fetchAds();
  }, []);

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
    timeAgo: getTimeAgo(ad.created_at),
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

  const handleAdClick = (ad: AdType) => {
    setSelectedAd(ad);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {filteredAds.map((ad) => (
                <AdCard key={`${ad.category}-${ad.id}`} ad={ad} onClick={() => handleAdClick(ad)} />
              ))}
            </div>

            {filteredAds.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No ads found in this category.
              </div>
            )}

            {/* SEO Content - visible to crawlers */}
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
