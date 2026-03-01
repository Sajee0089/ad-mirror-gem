import { ThumbsUp, Eye } from "lucide-react";

export type AdType = {
  id: number;
  title: string;
  description: string;
  image: string;
  badge: "super" | "vip" | "nra" | null;
  cashback: boolean;
  likes: string;
  views: string;
  timeAgo: string;
};

const badgeStyles: Record<string, string> = {
  super: "bg-badge-super text-primary-foreground",
  vip: "bg-badge-vip text-foreground",
  nra: "bg-badge-nra text-primary-foreground",
};

const AdCard = ({ ad }: { ad: AdType }) => {
  return (
    <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
      <div className="flex">
        {/* Image */}
        <div className="w-32 h-32 md:w-40 md:h-36 shrink-0 overflow-hidden bg-muted">
          <img
            src={ad.image}
            alt={ad.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Content */}
        <div className="flex-1 p-3 relative min-w-0">
          {/* Badges */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {ad.cashback && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-badge-cashback text-primary-foreground">
                Cash Back Guaranteed
              </span>
            )}
            {ad.badge && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded absolute top-2 right-2 ${badgeStyles[ad.badge]}`}>
                {ad.badge === "super" ? "Super Ad" : ad.badge === "vip" ? "VIP Ad" : "NRA Ad"}
              </span>
            )}
          </div>

          <h3 className="font-semibold text-sm leading-snug line-clamp-2 mb-1 pr-16">
            {ad.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
            {ad.description}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-auto">
            <div className="flex items-center gap-3">
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
