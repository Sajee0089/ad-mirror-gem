import Navbar from "@/components/Navbar";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { BookOpen, PenLine, Calendar, ArrowLeft, Sparkles, ImagePlus, X } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { SITE_URL } from "@/lib/seo";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  author: string;
  image_url: string | null;
  created_at: string;
};

const Blogs = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newExcerpt, setNewExcerpt] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newAuthor, setNewAuthor] = useState("Ads SL Team");
  const [newImage, setNewImage] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchBlogs();
    checkAdmin();
  }, []);

  const fetchBlogs = async () => {
    const { data } = await supabase
      .from("blog_posts")
      .select("id, title, slug, excerpt, content, author, image_url, created_at")
      .order("created_at", { ascending: false });
    setBlogs(data || []);
    setLoading(false);
  };

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
    setIsAdmin(!!data);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setNewImage(file);
    const reader = new FileReader();
    reader.onload = () => setNewImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCreate = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    setPublishing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Please log in"); return; }

      let imageUrl: string | null = null;
      if (newImage) {
        const ext = newImage.name.split(".").pop();
        const path = `blog/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("ad-images")
          .upload(path, newImage);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("ad-images").getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from("blog_posts").insert({
        title: newTitle.trim(),
        slug: "temp-" + Date.now(),
        excerpt: newExcerpt.trim() || null,
        content: newContent.trim(),
        author: newAuthor.trim() || "Ads SL Team",
        image_url: imageUrl,
        user_id: user.id,
      } as any);

      if (error) throw error;

      toast.success("Blog post published!");
      setShowCreateForm(false);
      setNewTitle("");
      setNewExcerpt("");
      setNewContent("");
      setNewAuthor("Ads SL Team");
      setNewImage(null);
      setNewImagePreview(null);
      fetchBlogs();
    } catch (err: any) {
      toast.error(err.message || "Failed to publish");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Blog - Tips & Insights | Ads SL</title>
        <meta name="description" content="Read tips, insights, and stories from Sri Lanka's leading classified ads platform. Stay safe, find the best deals, and learn about Ads SL." />
        <link rel="canonical" href={`${SITE_URL}/blogs`} />
      </Helmet>

      <Navbar />

      {/* Hero section */}
      <div className="relative overflow-hidden">
        <div className="hero-gradient py-12 px-4 text-center">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=1200&h=400&fit=crop')", backgroundSize: "cover", backgroundPosition: "center" }} />
          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-3">
              <BookOpen className="w-8 h-8 text-primary-foreground" />
              <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground tracking-tight">
                Ads SL Blog
              </h1>
            </div>
            <p className="text-primary-foreground/80 text-base md:text-lg mb-6">
              Tips, insights, and stories from Sri Lanka's leading classified ads platform
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Button variant="secondary" size="sm" onClick={() => navigate("/")} className="gap-1">
                <ArrowLeft className="w-4 h-4" /> Back to Ads
              </Button>
              {isAdmin && (
                <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1" onClick={() => setShowCreateForm(true)}>
                  <PenLine className="w-4 h-4" /> Write a Post
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Blog grid */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Latest Posts</h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : blogs.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No blog posts yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <Link key={blog.id} to={`/blog/${blog.slug}`}>
                <Card className="group cursor-pointer overflow-hidden border-border/60 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 h-full">
                  {blog.image_url && (
                    <div className="aspect-video overflow-hidden">
                      <img src={blog.image_url} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    </div>
                  )}
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {new Date(blog.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </div>
                    <h3 className="font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                      {blog.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {blog.excerpt || blog.content.substring(0, 120) + "..."}
                    </p>
                    <p className="text-xs font-medium text-primary pt-1">Read more →</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Create blog post form */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PenLine className="w-5 h-5 text-primary" /> Write a New Blog Post
            </DialogTitle>
            <DialogDescription>Share your thoughts with the Ads SL community.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Title</label>
              <Input placeholder="Blog post title..." value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Author</label>
              <Input placeholder="Your name..." value={newAuthor} onChange={(e) => setNewAuthor(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Excerpt</label>
              <Input placeholder="Short summary for SEO..." value={newExcerpt} onChange={(e) => setNewExcerpt(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Image</label>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageSelect} className="hidden" />
              {newImagePreview ? (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border">
                  <img src={newImagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button onClick={() => { setNewImage(null); setNewImagePreview(null); }} className="absolute top-2 right-2 bg-background/80 rounded-full p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Button type="button" variant="outline" className="w-full gap-2" onClick={() => fileInputRef.current?.click()}>
                  <ImagePlus className="w-4 h-4" /> Add Cover Image
                </Button>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Content</label>
              <Textarea placeholder="Write your blog post..." rows={6} value={newContent} onChange={(e) => setNewContent(e.target.value)} />
            </div>
            <Button className="w-full" onClick={handleCreate} disabled={!newTitle.trim() || !newContent.trim() || publishing}>
              {publishing ? "Publishing..." : "Publish Post"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Blogs;
