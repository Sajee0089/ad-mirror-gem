import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2, Clock, CheckCircle, XCircle } from "lucide-react";

const categories = [
  "Vehicles", "Property", "Electronics", "Jobs", "Services",
  "Education", "Pets", "Fashion", "Furniture", "General",
];

type Ad = {
  id: string;
  title: string;
  description: string;
  category: string;
  image_url: string | null;
  status: string;
  rejection_reason: string | null;
  created_at: string;
};

const statusConfig: Record<string, { label: string; icon: any; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pending", icon: Clock, variant: "secondary" },
  approved: { label: "Approved", icon: CheckCircle, variant: "default" },
  rejected: { label: "Rejected", icon: XCircle, variant: "destructive" },
};

const MyAds = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [editAd, setEditAd] = useState<Ad | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      fetchAds(session.user.id);
    };
    checkAuth();
  }, [navigate]);

  const fetchAds = async (uid: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("ads")
      .select("id, title, description, category, image_url, status, rejection_reason, created_at")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setAds((data as Ad[]) || []);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("ads").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      setAds((prev) => prev.filter((a) => a.id !== id));
      toast.success("Ad deleted");
    }
  };

  const openEdit = (ad: Ad) => {
    setEditAd(ad);
    setEditTitle(ad.title);
    setEditDescription(ad.description);
    setEditCategory(ad.category);
  };

  const handleSaveEdit = async () => {
    if (!editAd) return;
    setSaving(true);
    const { error } = await supabase.from("ads").update({
      title: editTitle.trim(),
      description: editDescription.trim(),
      category: editCategory,
      status: "pending", // re-submit for approval after edit
    }).eq("id", editAd.id);
    if (error) toast.error(error.message);
    else {
      setAds((prev) => prev.map((a) => a.id === editAd.id ? { ...a, title: editTitle.trim(), description: editDescription.trim(), category: editCategory, status: "pending", rejection_reason: null } : a));
      toast.success("Ad updated and resubmitted for approval");
      setEditAd(null);
    }
    setSaving(false);
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" /> {config.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Button>
        <h1 className="text-2xl font-bold mb-6">My Ads</h1>

        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : ads.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              You haven't posted any ads yet.
              <br />
              <Button className="mt-4" onClick={() => navigate("/post-ad")}>Post Your First Ad</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {ads.map((ad) => (
              <Card key={ad.id} className="border-border">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {ad.image_url && (
                      <img src={ad.image_url} alt={ad.title} className="w-24 h-24 rounded-md object-cover flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-foreground truncate">{ad.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{ad.category}</p>
                        </div>
                        <StatusBadge status={ad.status} />
                      </div>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{ad.description}</p>
                      {ad.status === "rejected" && ad.rejection_reason && (
                        <p className="text-sm text-destructive mt-2">
                          Reason: {ad.rejection_reason}
                        </p>
                      )}
                      <div className="flex gap-2 mt-3">
                        <Button variant="outline" size="sm" onClick={() => openEdit(ad)}>
                          <Pencil className="w-3 h-3 mr-1" /> Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                              <Trash2 className="w-3 h-3 mr-1" /> Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this ad?</AlertDialogTitle>
                              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(ad.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={!!editAd} onOpenChange={(open) => !open && setEditAd(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Ad</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} maxLength={200} />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={editCategory} onValueChange={setEditCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} maxLength={2000} rows={4} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditAd(null)}>Cancel</Button>
              <Button onClick={handleSaveEdit} disabled={saving}>
                {saving ? "Saving..." : "Save & Resubmit"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default MyAds;
