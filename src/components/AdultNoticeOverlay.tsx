import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

const STORAGE_KEY = "ads_sl_18plus_ack";

/**
 * Dismissible 18+ notice overlay for adult categories/ads.
 * Renders as a non-blocking overlay after hydration so Googlebot and crawlers
 * always read the full page HTML without any redirect or hidden content.
 */
export default function AdultNoticeOverlay() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) !== "1") {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const handleConfirm = () => {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {}
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="adult-notice-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-sm p-4"
    >
      <div className="max-w-md w-full rounded-lg border border-border bg-card p-6 shadow-lg space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <h2 id="adult-notice-title" className="text-lg font-bold text-foreground">
            18+ Adult Content Notice
          </h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          This section of Ads SL contains adult-oriented classified listings intended strictly for adults aged 18 and older. By continuing, you confirm that you are at least 18 years old and agree to our{" "}
          <Link to="/posting-rules" className="text-primary underline">Posting Rules</Link> and{" "}
          <Link to="/safety-tips" className="text-primary underline">Safety Tips</Link>.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <Button onClick={handleConfirm} className="flex-1">
            I am 18+ — Continue
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link to="/">Leave Section</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
