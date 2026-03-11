import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import AdCard from "@/components/AdCard";
import type { AdType } from "@/components/AdCard";
import { Button } from "@/components/ui/button";
import { Eye, Heart, Phone, MessageCircle, MapPin, Tag, ArrowLeft, ChevronRight } from "lucide-react";
import { SITE_URL, getDistrictUrl, getCategoryUrl, getAdUrl } from "@/lib/seo";

const badgeStyles: Record<string, string> = {
  super: "bg-badge-super text-primary-foreground",
  vip: "bg-badge-vip text-foreground",
  nra: "bg-badge-nra text-primary-foreground",
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

const AdPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [ad, setAd] = useState<DbAd | null>(null);
  const [relatedAds, setRelatedAds] = useState<DbAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favCount, setFavCount] = useState(0);
  const [viewCount, setViewCount] = useState(0);

  useEffect(() => {
    const fetchAd = async () => {
      setLoading(true);
      const { data } = await (supabase as any)
        .from("ads")
        .select("id, title, description, image_url, additional_image_urls, badge, cashback, category, created_at, approved_at, view_count, favorite_count, contact_phone, location, verified_member, slug")
        .eq("slug", slug)
        .eq("status", "approved")
        .maybeSingle();

      if (data) {
        setAd(data as DbAd);
        setFavCount(data.favorite_count || 0);
        setViewCount(data.view_count || 0);

        // Increment view count
        supabase.rpc("increment_view_count", { _ad_id: data.id });
        setViewCount((v) => v + 1);

        // Fetch related ads (same category, exclude current)
        const { data: related } = await (supabase as any)
          .from("ads")
          .select("id, title, description, image_url, additional_image_urls, badge, cashback, category, created_at, approved_at, view_count, favorite_count, contact_phone, location, verified_member, slug")
          .eq("status", "approved")
          .eq("category", data.category)
          .neq("id", data.id)
          .order("approved_at", { ascending: false })
          .limit(6);
        if (related) setRelatedAds(related as DbAd[]);

        // Check favorite status
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: fav } = await supabase
            .from("ad_favorites")
            .select("id")
            .eq("ad_id", data.id)
            .eq("user_id", session.user.id)
            .maybeSingle();
          setIsFavorited(!!fav);
        }
      }
      setLoading(false);
    };
    if (slug) fetchAd();
  }, [slug]);

  const toggleFavorite = async () => {
    if (!ad) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      const { toast } = await import("sonner");
      toast.error("Please login to save ads");
      return;
    }
    if (isFavorited) {
      await supabase.from("ad_favorites").delete().eq("ad_id", ad.id).eq("user_id", session.user.id);
      setIsFavorited(false);
      setFavCount((c) => Math.max(0, c - 1));
    } else {
      const { error } = await supabase.from("ad_favorites").insert({ ad_id: ad.id, user_id: session.user.id });
      if (!error || error.code === "23505") {
        setIsFavorited(true);
        if (!error) setFavCount((c) => c + 1);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Ad Not Found</h1>
          <Link to="/" className="text-primary hover:underline">← Back to Home</Link>
        </div>
      </div>
    );
  }

  const allImages = [ad.image_url, ...(ad.additional_image_urls || [])].filter(Boolean) as string[];
  const phone = ad.contact_phone || null;
  const canonicalUrl = `${SITE_URL}/ad/${ad.slug}`;
  const metaTitle = `${ad.title}${ad.location ? ` - ${ad.location}` : ""} | Ads SL`;
  const metaDesc = `${ad.description.slice(0, 150)}... Find ${ad.category} ads in ${ad.location || "Sri Lanka"} on Ads SL.`;

  const relatedAdCards: AdType[] = relatedAds.map((r, i) => ({
    id: i,
    dbId: r.id,
    title: r.title,
    description: r.description,
    image: r.image_url || "/placeholder.svg",
    badge: (r.badge || "nra") as "super" | "vip" | "nra",
    cashback: r.cashback,
    likes: String(r.favorite_count || 0),
    views: String(r.view_count || 0),
    timeAgo: getTimeAgo(r.approved_at || r.created_at),
    category: r.category,
    contact_phone: r.contact_phone || undefined,
    additionalImages: r.additional_image_urls || [],
    location: r.location || undefined,
    verified_member: r.verified_member,
    slug: r.slug || undefined,
  }));

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDesc} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDesc} />
        <meta property="og:url" content={canonicalUrl} />
        {allImages[0] && <meta property="og:image" content={allImages[0]} />}
        <meta property="og:type" content="article" />
      </Helmet>

      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-4 flex-wrap" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="w-3 h-3" />
          {ad.location && (
            <>
              <Link to={getDistrictUrl(ad.location)} className="hover:text-primary">{ad.location}</Link>
              <ChevronRight className="w-3 h-3" />
            </>
          )}
          <Link to={getCategoryUrl(ad.category)} className="hover:text-primary">{ad.category}</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground truncate max-w-[200px]">{ad.title}</span>
        </nav>

        {/* Main Image */}
        <div className="w-full rounded-lg overflow-hidden bg-muted aspect-video mb-4">
          <img
            src={allImages[selectedImageIndex] || "/placeholder.svg"}
            alt={ad.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Thumbnails */}
        {allImages.length > 1 && (
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {allImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImageIndex(i)}
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden border-2 shrink-0 ${i === selectedImageIndex ? "border-primary" : "border-border"}`}
              >
                <img src={img} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          {ad.verified_member && (
            <span className="text-xs font-semibold px-3 py-1 rounded bg-primary text-primary-foreground">✅ Verified Member</span>
          )}
          {ad.badge && ad.badge !== "nra" && (
            <span className={`text-xs font-semibold px-3 py-1 rounded ${badgeStyles[ad.badge]}`}>
              {ad.badge === "super" ? "Super Ad" : "VIP Ad"}
            </span>
          )}
          {ad.cashback && (
            <span className="text-xs font-semibold px-3 py-1 rounded bg-badge-cashback text-primary-foreground">Cash Back</span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{ad.title}</h1>

        {/* Meta info */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4 flex-wrap">
          {ad.location && (
            <Link to={getDistrictUrl(ad.location)} className="flex items-center gap-1 hover:text-primary">
              <MapPin className="w-4 h-4" /> {ad.location}
            </Link>
          )}
          <Link to={getCategoryUrl(ad.category)} className="flex items-center gap-1 hover:text-primary">
            <Tag className="w-4 h-4" /> {ad.category}
          </Link>
          <button onClick={toggleFavorite} className="flex items-center gap-1 hover:text-primary">
            <Heart className={`w-4 h-4 ${isFavorited ? "fill-primary text-primary" : ""}`} /> {favCount}
          </button>
          <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {viewCount}</span>
          <span className="text-xs">{getTimeAgo(ad.approved_at || ad.created_at)}</span>
        </div>

        {/* Description */}
        <div className="border-t border-border pt-4 mb-6">
          <h2 className="font-semibold text-lg text-foreground mb-2">Description</h2>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{ad.description}</p>
        </div>

        {/* Contact */}
        {phone ? (
          <div className="border-t border-border pt-4 mb-6">
            <h2 className="font-semibold text-lg text-foreground mb-3">Contact</h2>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button className="flex-1 gap-2" onClick={() => window.open(`https://wa.me/94${phone.replace(/^0/, "")}`, "_blank")}>
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </Button>
              <Button variant="outline" className="flex-1 gap-2" onClick={() => window.open(`tel:${phone}`, "_self")}>
                <Phone className="w-4 h-4" /> {phone}
              </Button>
            </div>
          </div>
        ) : (
          <div className="border-t border-border pt-4 mb-6">
            <p className="text-sm text-muted-foreground italic">No contact details provided.</p>
          </div>
        )}

        {/* Internal links */}
        <div className="border-t border-border pt-4 mb-8">
          <h2 className="font-semibold text-lg text-foreground mb-3">Browse More</h2>
          <div className="flex flex-wrap gap-2">
            {ad.location && (
              <Link to={getDistrictUrl(ad.location)} className="text-sm px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80">
                All ads in {ad.location}
              </Link>
            )}
            <Link to={getCategoryUrl(ad.category)} className="text-sm px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80">
              All {ad.category} ads
            </Link>
            {ad.location && (
              <Link
                to={`/${ad.location.toLowerCase().replace(/\s+/g, "-")}/${getCategoryUrl(ad.category).slice(1)}`}
                className="text-sm px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80"
              >
                {ad.category} in {ad.location}
              </Link>
            )}
          </div>
        </div>

        {/* Related Ads */}
        {relatedAdCards.length > 0 && (
          <div className="border-t border-border pt-6">
            <h2 className="font-semibold text-lg text-foreground mb-4">Related Ads</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {relatedAdCards.map((ra) => (
                <Link key={ra.dbId} to={ra.slug ? getAdUrl(ra.slug) : "#"}>
                  <AdCard ad={ra} />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* SEO Footer */}
        <footer className="mt-12 border-t border-border pt-6 pb-4 text-muted-foreground text-xs space-y-2">
          <p>
            Find the best {ad.category} ads in {ad.location || "Sri Lanka"} on Ads SL.
            Browse classified ads across all 25 districts including Colombo, Kandy, Galle, and more.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default AdPage;
