import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle, XCircle, Clock, Trash2, Users, Send, ImagePlus, ShieldBan, ShieldCheck } from "lucide-react";
import MultiImageUpload from "@/components/MultiImageUpload";

type Ad = {
  id: string;
  title: string;
  description: string;
  category: string;
  image_url: string | null;
  status: string;
  badge: string | null;
  created_at: string;
  user_id: string;
};

type Member = {
  user_id: string;
  ad_count: number;
  is_blocked: boolean;
};

const categories = [
  "Spa",
  "Live Cam",
  "Girls Personal",
  "Boys Personal",
  "Shemale Personal",
  "Marriage Proposals",
  "Rooms",
  "Toys & Accessories",
];

const AdminAds = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [blockedIds, setBlockedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUserId, setAdminUserId] = useState<string>("");
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected">("pending");
  const navigate = useNavigate();

  // Manual post form
  const [postTitle, setPostTitle] = useState("");
  const [postDesc, setPostDesc] = useState("");
  const [postCategory, setPostCategory] = useState("");
  const [postContactPhone, setPostContactPhone] = useState("");
  const [postImages, setPostImages] = useState<{ file: File; preview: string }[]>([]);
  const [postMainIndex, setPostMainIndex] = useState(0);
  const [posting, setPosting] = useState(false);

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
      setAdminUserId(session.user.id);
      fetchAll();
    };
    init();
  }, [navigate]);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchAds(), fetchMembers(), fetchBlocked()]);
    setLoading(false);
  };

  const fetchAds = async () => {
    const { data } = await supabase
      .from("ads")
      .select("id, title, description, category, image_url, status, badge, created_at, user_id")
      .order("created_at", { ascending: false });
    if (data) setAds(data as Ad[]);
  };

  const fetchBlocked = async () => {
    const { data } = await supabase.from("blocked_users").select("user_id");
    if (data) setBlockedIds(new Set(data.map((b) => b.user_id)));
  };

  const fetchMembers = async () => {
    // Get unique users from ads table
    const { data: adsData } = await supabase
      .from("ads")
      .select("user_id");
    if (!adsData) return;

    const counts: Record<string, number> = {};
    adsData.forEach((a) => {
      counts[a.user_id] = (counts[a.user_id] || 0) + 1;
    });

    const { data: blocked } = await supabase.from("blocked_users").select("user_id");
    const blockedSet = new Set((blocked || []).map((b) => b.user_id));

    const memberList: Member[] = Object.entries(counts).map(([uid, count]) => ({
      user_id: uid,
      ad_count: count,
      is_blocked: blockedSet.has(uid),
    }));
    setMembers(memberList);
  };

  // Approval dialog state
  const [approveId, setApproveId] = useState<string | null>(null);
  const [approveBadge, setApproveBadge] = useState<string>("nra");
  const [approveCashback, setApproveCashback] = useState(false);

  const handleApprove = async () => {
    if (!approveId) return;
    const now = new Date().toISOString();
    const { error } = await supabase.from("ads").update({
      status: "approved",
      rejection_reason: null,
      badge: approveBadge,
      cashback: approveCashback,
      approved_at: now,
      created_at: now,
    }).eq("id", approveId);
    if (error) toast.error(error.message);
    else {
      setAds((prev) => prev.map((a) => a.id === approveId ? { ...a, status: "approved", badge: approveBadge } : a));
      toast.success("Ad approved");
    }
    setApproveId(null);
    setApproveBadge("nra");
    setApproveCashback(false);
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

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("ads").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      setAds((prev) => prev.filter((a) => a.id !== id));
      toast.success("Ad deleted");
    }
  };

  const handleBadge = async (id: string, badge: string) => {
    const { error } = await supabase.from("ads").update({ badge }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      setAds((prev) => prev.map((a) => a.id === id ? { ...a, badge } : a));
      toast.success("Label updated");
    }
  };

  const handleBlock = async (userId: string) => {
    const { error } = await supabase.from("blocked_users").insert({ user_id: userId, blocked_by: adminUserId });
    if (error) toast.error(error.message);
    else {
      setBlockedIds((prev) => new Set([...prev, userId]));
      setMembers((prev) => prev.map((m) => m.user_id === userId ? { ...m, is_blocked: true } : m));
      toast.success("User blocked");
    }
  };

  const handleUnblock = async (userId: string) => {
    const { error } = await supabase.from("blocked_users").delete().eq("user_id", userId);
    if (error) toast.error(error.message);
    else {
      setBlockedIds((prev) => { const s = new Set(prev); s.delete(userId); return s; });
      setMembers((prev) => prev.map((m) => m.user_id === userId ? { ...m, is_blocked: false } : m));
      toast.success("User unblocked");
    }
  };

  const uploadImage = async (file: File) => {
    const ext = file.name.split(".").pop();
    const path = `${adminUserId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("ad-images").upload(path, file);
    if (uploadError) throw uploadError;
    const { data: urlData } = supabase.storage.from("ad-images").getPublicUrl(path);
    return urlData.publicUrl;
  };

  const handleManualPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postDesc.trim() || !postCategory) {
      toast.error("Fill in all required fields");
      return;
    }
    setPosting(true);
    try {
      let mainImageUrl: string | null = null;
      const additionalUrls: string[] = [];

      if (postImages.length > 0) {
        const urls = await Promise.all(postImages.map((img) => uploadImage(img.file)));
        mainImageUrl = urls[postMainIndex];
        urls.forEach((url, i) => {
          if (i !== postMainIndex) additionalUrls.push(url);
        });
      }

      const { error } = await supabase.from("ads").insert({
        user_id: adminUserId,
        title: postTitle.trim(),
        description: postDesc.trim(),
        category: postCategory,
        contact_phone: postContactPhone.trim() || null,
        image_url: mainImageUrl,
        additional_image_urls: additionalUrls,
        status: "approved",
      });
      if (error) throw error;
      toast.success("Ad posted and approved!");
      setPostTitle(""); setPostDesc(""); setPostCategory(""); setPostContactPhone("");
      setPostImages([]); setPostMainIndex(0);
      fetchAds();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setPosting(false);
    }
  };

  const filtered = ads.filter((a) => a.status === filter);

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-5xl mx-auto">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Button>
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

        <Tabs defaultValue="ads">
          <TabsList className="mb-4">
            <TabsTrigger value="ads">Ads Management</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="post">Post Ad</TabsTrigger>
          </TabsList>

          {/* TAB 1: Ads Management */}
          <TabsContent value="ads">
            <div className="flex gap-2 mb-4 flex-wrap">
              {(["pending", "approved", "rejected"] as const).map((s) => (
                <Button key={s} variant={filter === s ? "default" : "outline"} size="sm" onClick={() => setFilter(s)}>
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
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{ad.description}</p>

                          <div className="flex flex-wrap items-center gap-2 mt-3">
                            {ad.status === "pending" && (
                              <>
                                <Button size="sm" onClick={() => { setApproveId(ad.id); setApproveBadge(ad.badge || "nra"); setApproveCashback(false); }}>
                                  <CheckCircle className="w-3 h-3 mr-1" /> Approve
                                </Button>
                                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => setRejectId(ad.id)}>
                                  <XCircle className="w-3 h-3 mr-1" /> Reject
                                </Button>
                              </>
                            )}
                            <Button variant="destructive" size="sm" onClick={() => handleDelete(ad.id)}>
                              <Trash2 className="w-3 h-3 mr-1" /> Delete
                            </Button>
                            <Button
                              variant={(ad as any).verified_member ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleToggleVerified(ad.id, !(ad as any).verified_member)}
                              className={(ad as any).verified_member ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                            >
                              <ShieldCheck className="w-3 h-3 mr-1" />
                              {(ad as any).verified_member ? "Verified ✓" : "Verify Member"}
                            </Button>
                            <Select value={ad.badge || "nra"} onValueChange={(v) => handleBadge(ad.id, v)}>
                              <SelectTrigger className="w-32 h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="super">Super Ad</SelectItem>
                                <SelectItem value="vip">VIP Ad</SelectItem>
                                <SelectItem value="nra">Normal</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* TAB 2: Members */}
          <TabsContent value="members">
            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : members.length === 0 ? (
              <p className="text-muted-foreground">No members found.</p>
            ) : (
              <div className="space-y-3">
                {members.map((m) => (
                  <Card key={m.user_id} className="border-border">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-mono text-foreground">{m.user_id.slice(0, 8)}...</p>
                        <p className="text-xs text-muted-foreground">{m.ad_count} ad{m.ad_count !== 1 ? "s" : ""} posted</p>
                      </div>
                      {m.is_blocked ? (
                        <Button variant="outline" size="sm" onClick={() => handleUnblock(m.user_id)}>
                          <ShieldCheck className="w-3 h-3 mr-1" /> Unblock
                        </Button>
                      ) : (
                        <Button variant="destructive" size="sm" onClick={() => handleBlock(m.user_id)}>
                          <ShieldBan className="w-3 h-3 mr-1" /> Block
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* TAB 3: Manual Post */}
          <TabsContent value="post">
            <Card className="border-border">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Send className="w-5 h-5 text-primary" /> Post Ad (Auto-Approved)
                </h2>
                <form onSubmit={handleManualPost} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-title">Title *</Label>
                    <Input id="admin-title" placeholder="Ad title" value={postTitle} onChange={(e) => setPostTitle(e.target.value)} maxLength={200} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-category">Category *</Label>
                    <Select value={postCategory} onValueChange={setPostCategory}>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-desc">Description *</Label>
                    <Textarea id="admin-desc" placeholder="Description..." value={postDesc} onChange={(e) => setPostDesc(e.target.value)} maxLength={2000} rows={4} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-phone">Contact Phone</Label>
                    <Input id="admin-phone" placeholder="e.g. 0771234567" value={postContactPhone} onChange={(e) => setPostContactPhone(e.target.value)} maxLength={15} />
                    <p className="text-xs text-muted-foreground">This number will be shown to viewers.</p>
                  </div>
                  <MultiImageUpload
                    images={postImages}
                    onChange={setPostImages}
                    mainIndex={postMainIndex}
                    onMainIndexChange={setPostMainIndex}
                  />
                  <Button type="submit" className="w-full" disabled={posting}>
                    {posting ? "Posting..." : "Post Ad (Auto-Approved)"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Approve Dialog */}
        <Dialog open={!!approveId} onOpenChange={(open) => { if (!open) { setApproveId(null); setApproveBadge("nra"); setApproveCashback(false); } }}>
          <DialogContent>
            <DialogHeader><DialogTitle>Approve Ad</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Ad Label</Label>
                <Select value={approveBadge} onValueChange={setApproveBadge}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super">Super Ad</SelectItem>
                    <SelectItem value="vip">VIP Ad</SelectItem>
                    <SelectItem value="nra">Normal Ad</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="cashback-check"
                  checked={approveCashback}
                  onChange={(e) => setApproveCashback(e.target.checked)}
                  className="h-4 w-4 rounded border-primary text-primary focus:ring-primary"
                />
                <Label htmlFor="cashback-check">Money Back Guaranteed</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setApproveId(null)}>Cancel</Button>
              <Button onClick={handleApprove}>Approve</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={!!rejectId} onOpenChange={(open) => { if (!open) { setRejectId(null); setRejectReason(""); } }}>
          <DialogContent>
            <DialogHeader><DialogTitle>Reject Ad</DialogTitle></DialogHeader>
            <Textarea placeholder="Reason for rejection (optional)..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3} />
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
