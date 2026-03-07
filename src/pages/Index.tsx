import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import Sidebar from "@/components/Sidebar";
import AdCard from "@/components/AdCard";
import { sampleAds } from "@/data/sampleAds";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type DbAd = {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  badge: string | null;
  category: string;
  created_at: string;
};

const Index = () => {
  const [dbAds, setDbAds] = useState<DbAd[]>([]);

  useEffect(() => {
    const fetchAds = async () => {
      const { data } = await supabase
        .from("ads")
        .select("id, title, description, image_url, badge, category, created_at")
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      if (data) setDbAds(data);
    };
    fetchAds();
  }, []);

  const dbAdCards = dbAds.map((ad, idx) => ({
    id: 1000 + idx,
    title: ad.title,
    description: ad.description,
    image: ad.image_url || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&h=200&fit=crop",
    badge: (ad.badge || "nra") as "super" | "vip" | "nra",
    cashback: false,
    likes: "0 Likes",
    views: "0 Views",
    timeAgo: getTimeAgo(ad.created_at),
  }));

  const allAds = [...dbAdCards, ...sampleAds];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <Sidebar />
          <main className="flex-1 min-w-0">
            <HeroBanner />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allAds.map((ad) => (
                <AdCard key={ad.id} ad={ad} />
              ))}
            </div>
          </main>
        </div>
      </div>
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
