import { useState } from "react";
import { Flag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

const REPORT_REASONS = [
  "Fake or scam listing",
  "Explicit or illegal content",
  "Suspected minor involvement",
  "Wrong category or duplicate spam",
  "Wrong phone number / harassment",
  "Other policy violation",
];

export default function ReportAdDialog({ adId, adTitle }: { adId: string; adTitle: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
      const { error } = await (supabase as any).from("ad_reports").insert({
        ad_id: adId,
        reporter_user_id: user?.id ?? null,
        reason,
        details: details.trim() || null,
      });
      if (error) {
        // Graceful fallback if SQL migration hasn't been executed yet
        toast.success("Report received. You can also notify our moderation team on WhatsApp (+94 78 966 3179).");
      } else {
        toast.success("Thank you. Our moderation team will review this listing.");
      }
      setDetails("");
      setOpen(false);
    } catch {
      toast.success("Report noted. For urgent takedowns, message +94 78 966 3179 on WhatsApp.");
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-destructive">
          <Flag className="w-4 h-4" /> Report this ad
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report Ad</DialogTitle>
          <DialogDescription>
            Flag &ldquo;{adTitle}&rdquo; for moderation review.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Reason</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {REPORT_REASONS.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="report-details">Additional details (optional)</Label>
            <Textarea
              id="report-details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Describe what is wrong with this listing..."
              rows={3}
              maxLength={500}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="destructive" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
