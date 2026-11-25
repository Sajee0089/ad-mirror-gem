import { Share2, MessageCircle, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ShareButtonsProps {
  title: string;
  url: string;
  text?: string;
}

export default function ShareButtons({ title, url, text }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const shareText = text || `${title} — Ads SL`;

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text: shareText, url });
        return;
      } catch {
        // User cancelled or unsupported
      }
    }
    handleCopy();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link");
    }
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${url}`)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {typeof navigator !== "undefined" && "share" in navigator && (
        <Button type="button" variant="outline" size="sm" onClick={handleNativeShare} className="gap-1.5">
          <Share2 className="w-4 h-4" /> Share
        </Button>
      )}
      <Button asChild variant="outline" size="sm" className="gap-1.5">
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
          <MessageCircle className="w-4 h-4" /> WhatsApp
        </a>
      </Button>
      <Button asChild variant="outline" size="sm" className="gap-1.5">
        <a href={facebookUrl} target="_blank" rel="noopener noreferrer">
          Facebook
        </a>
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        {copied ? "Copied" : "Copy Link"}
      </Button>
    </div>
  );
}