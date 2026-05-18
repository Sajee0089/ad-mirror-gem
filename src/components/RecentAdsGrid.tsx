import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AdCard from "@/components/AdCard";
import type { AdType } from "@/components/AdCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

const RecentAdsGrid = () => {
  const [recentAds, setRecentAds] = useState<AdType[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ADS_PER_PAGE = 10;

  useEffect(() => {
    const fetchRecentAds = async () => {
      const { data } = await supabase
        .from("ads")
        .select("id, title, description, image_url, additional_image_urls, badge, cashback, category, created_at, approved_at, view_count, favorite_count, contact_phone, location, verified_member, slug")
        .eq("status", "approved")
        .order("approved_at", { ascending: false, nullsFirst: false })
        .limit(100);

      if (data) {
        const ads: AdType[] = (data as DbAd[]).map((ad, idx) => ({
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
        setRecentAds(ads);
      }
      setLoading(false);
    };

    fetchRecentAds();
  }, []);

  const totalPages = Math.ceil(recentAds.length / ADS_PER_PAGE);
  const paginatedAds = recentAds.slice((currentPage - 1) * ADS_PER_PAGE, currentPage * ADS_PER_PAGE);

  if (loading || recentAds.length === 0) return null;

  return (
    <section className="mt-8 mb-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">Recent Ads</h2>
        <Link to="/" className="text-sm text-primary hover:underline">View All</Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
        {paginatedAds.map((ad) => (
          <div key={ad.id} className="h-48">
            <AdCard ad={ad} />
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </section>
  );
};

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default RecentAdsGrid;
