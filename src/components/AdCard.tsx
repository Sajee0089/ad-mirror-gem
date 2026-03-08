import { ThumbsUp, Eye, MapPin, Trash2 } from "lucide-react";

export type AdType = {
  id: number | string;
  title: string;
  description: string;
  image: string;
  badge: "super" | "vip" | "nra" | null;
  cashback: boolean;
  likes: string;
  views: string;
  timeAgo: string;
  category?: string;
  contact_phone?: string;
  dbId?: string;
  additionalImages?: string[];
  location?: string;
};

const badgeStyles: Record<string, string> = {
  super: "bg-badge-super text-primary-foreground",
  vip: "bg-badge-vip text-foreground",
  nra: "bg-badge-nra text-primary-foreground",
};

const AdCard = ({ ad, onClick, isAdmin, onDelete }: { ad: AdType; onClick?: () => void; isAdmin?: boolean; onDelete?: (ad: AdType) => void }) => {
  return (
    <div
      className="bg-card rounded-lg border border-border shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer group relative"
      onClick={onClick}
    >
      {isAdmin && ad.dbId && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(ad);
          }}
          className="absolute top-1.5 right-1.5 z-10 bg-destructive text-destructive-foreground rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/80"
          title="Delete ad"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
      <div className="flex">
        <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-36 shrink-0 overflow-hidden bg-muted">
          <img
            src={ad.image}
            alt={ad.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
        <div className="flex-1 p-2 sm:p-3 relative min-w-0">
          <div className="flex items-center gap-1 sm:gap-2 mb-1 flex-wrap">
            {ad.cashback && (
              <span className="text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded bg-badge-cashback text-primary-foreground">
                Cash Back
              </span>
            )}
            {ad.badge && ad.badge !== "nra" && (
              <span className={`text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded absolute top-1.5 sm:top-2 right-1.5 sm:right-2 ${badgeStyles[ad.badge]}`}>
                {ad.badge === "super" ? "Super" : "VIP"}
              </span>
            )}
          </div>
          <h3 className="font-semibold text-xs sm:text-sm leading-snug line-clamp-2 mb-0.5 sm:mb-1 pr-12 sm:pr-16">
            {ad.title}
          </h3>
          <p className="text-[11px] sm:text-xs text-muted-foreground line-clamp-2 mb-2 sm:mb-3">
            {ad.description}
          </p>
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-muted-foreground mt-auto">
            <div className="flex items-center gap-2 sm:gap-3">
              {ad.location && (
                <span className="flex items-center gap-0.5">
                  <MapPin className="w-3 h-3" />
                  {ad.location}
                </span>
              )}
              <span className="flex items-center gap-1">
                <ThumbsUp className="w-3 h-3" />
                {ad.likes}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {ad.views}
              </span>
            </div>
            <span>{ad.timeAgo}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdCard;
