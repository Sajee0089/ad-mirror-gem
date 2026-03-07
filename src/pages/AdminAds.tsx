import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle, XCircle, Clock } from "lucide-react";

type Ad = {
  id: string;
  title: string;
  description: string;
  category: string;
  image_url: string | null;
  status: string;
  created_at: string;
  user_id: string;
};

const AdminAds = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected">("pending");
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin");

      if (!roles || roles.length === 0) {
        toast.error("Access denied");
        navigate("/");
        return;
      }
      setIsAdmin(true);
      fetchAds();
    };
    init();
  }, [navigate]);

  const fetchAds = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("ads")
      .select("id, title, description, category, image_url, status, created_at, user_id")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setAds((data as Ad[]) || []);
    setLoading(false);
  };

  const handleApprove = async (id: string) => {
    const { error } = await supabase.from("ads").update({ status: "approved", rejection_reason: null }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      setAds((prev) => prev.map((a) => a.id === id ? { ...a, status: "approved" } : a));
      toast.success("Ad approved");
    }
  };

  const handleReject = async () => {
    if (!rejectId) return;
    const { error } = await supabase.from("ads").update({ status: "rejected", rejection_reason: rejectReason.trim() || null }).eq("id", rejectId);
    if (error) toast.error(error.message);
    else {
      setAds((prev) => prev.map((a) => a.id === rejectId ? { ...a, status: "rejected" } : a));
      toast.success("Ad rejected");
    }
    setRejectId(null);
    setRejectReason("");
  };

  const filtered = ads.filter((a) => a.status === filter);

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Button>
        <h1 className="text-2xl font-bold mb-4">Admin — Manage Ads</h1>

        <div className="flex gap-2 mb-6">
          {(["pending", "approved", "rejected"] as const).map((s) => (
            <Button
              key={s}
              variant={filter === s ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(s)}
            >
              {s === "pending" && <Clock className="w-3 h-3 mr-1" />}
              {s === "approved" && <CheckCircle className="w-3 h-3 mr-1" />}
              {s === "rejected" && <XCircle className="w-3 h-3 mr-1" />}
              {s.charAt(0).toUpperCase() + s.slice(1)} ({ads.filter((a) => a.status === s).length})
            </Button>
          ))}
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-muted-foreground">No {filter} ads.</p>
        ) : (
          <div className="space-y-4">
            {filtered.map((ad) => (
              <Card key={ad.id} className="border-border">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {ad.image_url && (
                      <img src={ad.image_url} alt={ad.title} className="w-28 h-28 rounded-md object-cover flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground">{ad.title}</h3>
                      <p className="text-sm text-muted-foreground">{ad.category} · {new Date(ad.created_at).toLocaleDateString()}</p>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{ad.description}</p>
                      {ad.status === "pending" && (
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" onClick={() => handleApprove(ad.id)}>
                            <CheckCircle className="w-3 h-3 mr-1" /> Approve
                          </Button>
                          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => setRejectId(ad.id)}>
                            <XCircle className="w-3 h-3 mr-1" /> Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={!!rejectId} onOpenChange={(open) => { if (!open) { setRejectId(null); setRejectReason(""); } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Ad</DialogTitle>
            </DialogHeader>
            <Textarea
              placeholder="Reason for rejection (optional)..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectId(null)}>Cancel</Button>
              <Button variant="destructive" onClick={handleReject}>Reject</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminAds;
