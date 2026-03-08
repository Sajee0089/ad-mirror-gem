import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AdCard from "@/components/AdCard";
import AdDetailModal from "@/components/AdDetailModal";
import type { AdType } from "@/components/AdCard";
import { ArrowLeft, Heart, HeartOff } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

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

const SavedAds = () => {
  const [ads, setAds] = useState<AdType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAd, setSelectedAd] = useState<AdType | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSavedAds = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }

      const { data, error } = await supabase
        .from("ad_favorites")
        .select("ad_id, ads(id, title, description, image_url, additional_image_urls, badge, cashback, category, created_at, view_count, favorite_count, contact_phone, location)")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }

      const mapped: AdType[] = (data || [])
        .filter((fav: any) => fav.ads)
        .map((fav: any, idx: number) => {
          const ad = fav.ads;
          return {
            id: 2000 + idx,
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
          };
        });

      setAds(mapped);
      setLoading(false);
    };
    fetchSavedAds();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Button>
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Heart className="w-6 h-6 text-primary" /> My Saved Ads
        </h1>

        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : ads.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              You haven't saved any ads yet.
              <br />
              <span className="text-sm">Click the heart icon on any ad to save it here.</span>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ads.map((ad) => (
              <AdCard key={ad.dbId} ad={ad} onClick={() => { setSelectedAd(ad); setModalOpen(true); }} />
            ))}
          </div>
        )}
      </div>

      <AdDetailModal ad={selectedAd} open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};

export default SavedAds;
