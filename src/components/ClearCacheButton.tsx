import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { clearAllBrowserState } from "@/lib/sessionManager";

interface Props {
  className?: string;
  label?: string;
}

const ClearCacheButton = ({ className, label = "Clear Cache & Restart" }: Props) => {
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    if (busy) return;
    setBusy(true);
    toast.success("Cache cleared, page reloading...");
    try {
      await clearAllBrowserState({ reload: true });
    } catch {
      window.location.reload();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className={
        className ??
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-border text-xs hover:bg-muted transition-colors disabled:opacity-60"
      }
      title="Clears local storage, cookies and service workers, then reloads (Ctrl+Shift+F)"
    >
      <RefreshCw className={`w-3.5 h-3.5 ${busy ? "animate-spin" : ""}`} />
      {busy ? "Clearing..." : label}
    </button>
  );
};

export default ClearCacheButton;
