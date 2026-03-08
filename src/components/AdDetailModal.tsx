import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Eye, Phone, MessageCircle, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import type { AdType } from "@/components/AdCard";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

const badgeStyles: Record<string, string> = {
  super: "bg-badge-super text-primary-foreground",
  vip: "bg-badge-vip text-foreground",
  nra: "bg-badge-nra text-primary-foreground",
};

interface AdDetailModalProps {
  ad: AdType | null;
  open: boolean;
  onClose: () => void;
}

const AdDetailContent = ({ ad, onClose }: { ad: AdType; onClose: () => void }) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [favCount, setFavCount] = useState(parseInt(ad.likes.replace(/[^0-9]/g, '')) || 0);
  const [viewCount, setViewCount] = useState(parseInt(ad.views.replace(/[^0-9]/g, '')) || 0);
  const [imageExpanded, setImageExpanded] = useState(false);

  useEffect(() => {
    if (ad.dbId) {
      supabase.rpc('increment_view_count', { _ad_id: ad.dbId }).then(() => {
        setViewCount(v => v + 1);
      });
    }

    const checkFavorite = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && ad.dbId) {
        const { data } = await supabase
          .from('ad_favorites')
          .select('id')
          .eq('ad_id', ad.dbId)
          .eq('user_id', session.user.id)
          .maybeSingle();
        setIsFavorited(!!data);
      }
    };
    checkFavorite();
  }, [ad.dbId]);

  const toggleFavorite = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    if (!ad.dbId) return;

    if (isFavorited) {
      await supabase.from('ad_favorites').delete().eq('ad_id', ad.dbId).eq('user_id', session.user.id);
      setIsFavorited(false);
      setFavCount(c => Math.max(0, c - 1));
    } else {
      await supabase.from('ad_favorites').insert({ ad_id: ad.dbId, user_id: session.user.id });
      setIsFavorited(true);
      setFavCount(c => c + 1);
    }
  };

  // Use the ad's own contact_phone; no fallback to agent number
  const phone = ad.contact_phone || null;

  return (
    <div className="space-y-4">
      {/* Image - clickable to expand */}
      <div
        className={`w-full rounded-lg overflow-hidden bg-muted cursor-pointer transition-all duration-300 ${
          imageExpanded ? "max-h-[80vh]" : "aspect-video"
        }`}
        onClick={() => setImageExpanded(!imageExpanded)}
      >
        <img
          src={ad.image}
          alt={ad.title}
          className={`w-full h-full transition-all duration-300 ${
            imageExpanded ? "object-contain" : "object-cover"
          }`}
        />
      </div>
      {imageExpanded && (
        <p className="text-xs text-muted-foreground text-center">Click image to collapse</p>
      )}

      {/* Badges */}
      <div className="flex items-center gap-2 flex-wrap">
        {ad.badge && (
          <span className={`text-xs font-semibold px-3 py-1 rounded ${badgeStyles[ad.badge]}`}>
            {ad.badge === "super" ? "Super Ad" : ad.badge === "vip" ? "VIP Ad" : "NRA Ad"}
          </span>
        )}
        {ad.cashback && (
          <span className="text-xs font-semibold px-3 py-1 rounded bg-badge-cashback text-primary-foreground">
            Cash Back Guaranteed
          </span>
        )}
        {ad.category && (
          <span className="text-xs font-medium px-3 py-1 rounded bg-secondary text-secondary-foreground">
            {ad.category}
          </span>
        )}
      </div>

      {/* Title */}
      <h2 className="text-lg sm:text-xl font-bold text-foreground leading-tight">{ad.title}</h2>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <button
          onClick={toggleFavorite}
          className="flex items-center gap-1 hover:text-primary transition-colors"
        >
          <Heart className={`w-4 h-4 ${isFavorited ? "fill-primary text-primary" : ""}`} />
          {favCount}
        </button>
        <span className="flex items-center gap-1">
          <Eye className="w-4 h-4" />
          {viewCount}
        </span>
        <span className="ml-auto text-xs">{ad.timeAgo}</span>
      </div>

      {/* Description */}
      <div className="border-t border-border pt-4">
        <h3 className="font-semibold text-sm text-foreground mb-2">Description</h3>
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{ad.description}</p>
      </div>

      {/* Contact - only show if ad has contact details */}
      {phone ? (
        <div className="border-t border-border pt-4">
          <h3 className="font-semibold text-sm text-foreground mb-3">Contact</h3>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              className="flex-1 gap-2"
              onClick={() => window.open(`https://wa.me/94${phone.replace(/^0/, '')}`, '_blank')}
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </Button>
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => window.open(`tel:${phone}`, '_self')}
            >
              <Phone className="w-4 h-4" />
              {phone}
            </Button>
          </div>
        </div>
      ) : (
        <div className="border-t border-border pt-4">
          <p className="text-sm text-muted-foreground italic">No contact details provided for this ad.</p>
        </div>
      )}
    </div>
  );
};

const AdDetailModal = ({ ad, open, onClose }: AdDetailModalProps) => {
  const isMobile = useIsMobile();

  if (!ad) return null;

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="sr-only">
            <DrawerTitle>{ad.title}</DrawerTitle>
            <DrawerDescription>Ad details</DrawerDescription>
          </DrawerHeader>
          <div className="overflow-y-auto px-4 pb-6">
            <AdDetailContent ad={ad} onClose={onClose} />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sr-only">
          <DialogTitle>{ad.title}</DialogTitle>
          <DialogDescription>Ad details</DialogDescription>
        </DialogHeader>
        <AdDetailContent ad={ad} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
};

export default AdDetailModal;
