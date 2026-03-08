import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import Sidebar from "@/components/Sidebar";
import AdCard from "@/components/AdCard";
import type { AdType } from "@/components/AdCard";
import AdDetailModal from "@/components/AdDetailModal";
import { sampleAds } from "@/data/sampleAds";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type DbAd = {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  additional_image_urls: string[] | null;
  badge: string | null;
  category: string;
  created_at: string;
  view_count: number;
  favorite_count: number;
  contact_phone: string | null;
};

const Index = () => {
  const [dbAds, setDbAds] = useState<DbAd[]>([]);
  const [selectedAd, setSelectedAd] = useState<AdType | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchAds = async () => {
      const { data } = await supabase
        .from("ads")
        .select("id, title, description, image_url, additional_image_urls, badge, category, created_at, view_count, favorite_count, contact_phone")
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
    cashback: false,
    likes: String(ad.favorite_count || 0),
    views: String(ad.view_count || 0),
    timeAgo: getTimeAgo(ad.created_at),
    category: ad.category,
    contact_phone: ad.contact_phone || undefined,
    additionalImages: ad.additional_image_urls || [],
  }));

  const allAds = [...dbAdCards, ...sampleAds];
  const filteredAds = selectedCategory
    ? allAds.filter((ad) => ad.category === selectedCategory)
    : allAds;

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
            />
          </div>
          <main className="flex-1 min-w-0">
            <HeroBanner />
            <div className="md:hidden mb-4">
              <Sidebar
                selectedCategory={selectedCategory}
                onCategorySelect={setSelectedCategory}
              />
            </div>

            {selectedCategory && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-medium text-foreground">
                  Showing: <span className="text-primary">{selectedCategory}</span>
                </span>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="text-xs text-muted-foreground hover:text-foreground underline"
                >
                  Show All
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
