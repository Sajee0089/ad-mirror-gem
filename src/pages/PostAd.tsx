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
import { districts } from "@/data/districts";

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

const PostAd = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [location, setLocation] = useState("");
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
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


  const uploadImage = async (file: File) => {
    const ext = file.name.split(".").pop();
    const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("ad-images").upload(path, file);
    if (uploadError) throw uploadError;
    const { data: urlData } = supabase.storage.from("ad-images").getPublicUrl(path);
    return urlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !category || !contactPhone.trim() || !location) {
      toast.error("Please fill in all fields including location");
      return;
    }
    if (images.length === 0) {
      toast.error("Please upload at least 1 image");
      return;
    }
    if (!userId) {
      toast.error("You must be logged in");
      return;
    }

    setLoading(true);
    try {
      let mainImageUrl: string | null = null;
      const additionalUrls: string[] = [];

      if (images.length > 0) {
        // Upload all images
        const urls = await Promise.all(images.map((img) => uploadImage(img.file)));
        mainImageUrl = urls[mainImageIndex];
        urls.forEach((url, i) => {
          if (i !== mainImageIndex) additionalUrls.push(url);
        });
      }

      const { error } = await supabase.from("ads").insert({
        user_id: userId,
        title: title.trim(),
        description: description.trim(),
        category,
        image_url: mainImageUrl,
        additional_image_urls: additionalUrls,
        contact_phone: contactPhone.trim() || null,
        location,
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

  

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 p-4">
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Button>

        <div className="mb-4 rounded-lg border border-border bg-card p-4 flex items-center gap-3">
          <span className="text-2xl">📱</span>
          <div>
            <p className="text-sm font-medium text-foreground">Please Contact agent before posting ads</p>
            <p className="text-xs text-muted-foreground mt-0.5">කරුණාකර දැන්වීම් පළකිරීමට පෙර අපව සම්බන්ධ කරගන්න, නැතහොත් දැන්වීම පළ නොකරනු ලැබේ.</p>
            <a
              href="https://wa.me/94789663179"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline font-semibold mt-1 inline-block"
            >
              WhatsApp: +94 78 966 3179
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
                <Label htmlFor="contactPhone">Contact Phone Number *</Label>
                <Input
                  id="contactPhone"
                  placeholder="e.g. 0771234567"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  maxLength={15}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location / District *</Label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your district" />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <MultiImageUpload
                images={images}
                onChange={setImages}
                mainIndex={mainImageIndex}
                onMainIndexChange={setMainImageIndex}
              />
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
