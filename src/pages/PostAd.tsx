import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Send, AlertCircle } from "lucide-react";
import MultiImageUpload from "@/components/MultiImageUpload";

const categories = [
  "Lanka Ads",
  "Girls Personal",
  "Boys Personal",
  "Shemale Personal",
  "Marriage Proposals",
  "Live Cam",
  "Spa & Wellness Services",
  "Rooms",
  "Sales",
  "Toys & Accessories",
];

const PostAd = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [adsToday, setAdsToday] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) navigate("/auth");
      else setUserId(session.user.id);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/auth");
      else setUserId(session.user.id);
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (userId) {
      supabase.rpc("count_user_ads_today", { _user_id: userId }).then(({ data }) => {
        setAdsToday(data ?? 0);
      });
    }
  }, [userId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !category) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (!userId) {
      toast.error("You must be logged in");
      return;
    }
    if (adsToday >= 5) {
      toast.error("You can only post 5 ads per day");
      return;
    }

    setLoading(true);
    try {
      let imageUrl: string | null = null;

      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const path = `${userId}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("ad-images")
          .upload(path, imageFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage
          .from("ad-images")
          .getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from("ads").insert({
        user_id: userId,
        title: title.trim(),
        description: description.trim(),
        category,
        image_url: imageUrl,
        contact_phone: contactPhone.trim() || null,
        status: "pending",
      });
      if (error) throw error;
      toast.success("Ad submitted for approval! It will be visible once approved.");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const remaining = 5 - adsToday;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Button>

        <div className="mb-4 rounded-lg border border-border bg-card p-4 flex items-center gap-3">
          <span className="text-2xl">📱</span>
          <div>
            <p className="text-sm font-medium text-foreground">Need help posting? Contact our agent</p>
            <a
              href="https://wa.me/94789663179"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline font-semibold"
            >
              WhatsApp: 0789663179
            </a>
          </div>
        </div>
        <Card className="border-border shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" /> Post a New Ad
            </CardTitle>
            <CardDescription>
              Fill in the details to submit your ad for approval
            </CardDescription>
            <div className="flex items-center gap-2 mt-2 text-sm">
              <AlertCircle className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {remaining > 0
                  ? `You can post ${remaining} more ad${remaining !== 1 ? "s" : ""} today`
                  : "You've reached the daily limit of 5 ads"}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g. Spa Services in Colombo"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={200}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your service or ad in detail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={2000}
                  rows={5}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone Number</Label>
                <Input
                  id="contactPhone"
                  placeholder="e.g. 0771234567"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  maxLength={15}
                />
                <p className="text-xs text-muted-foreground">
                  This number will be shown to people viewing your ad.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="imageFile" className="flex items-center gap-1">
                  <ImagePlus className="w-4 h-4" /> Image (optional)
                </Label>
                <Input
                  id="imageFile"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="cursor-pointer"
                />
                {imagePreview && (
                  <div className="mt-2 rounded-md overflow-hidden border border-border">
                    <img src={imagePreview} alt="Preview" className="w-full max-h-48 object-cover" />
                  </div>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={loading || remaining <= 0}>
                {loading ? "Submitting..." : "Submit Ad for Approval"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PostAd;
