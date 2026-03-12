import Navbar from "@/components/Navbar";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { BookOpen, PenLine, Calendar, ArrowLeft, Sparkles, ImagePlus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

type BlogPost = {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  image: string;
};

const sampleBlogs: BlogPost[] = [
  {
    id: 1,
    title: "How to Stay Safe While Using Classified Ads",
    excerpt: "Tips and tricks for safe transactions when buying or selling through online classifieds in Sri Lanka.",
    content: "Online classified ads have become a popular way to buy and sell goods and services in Sri Lanka. However, it's important to stay safe. Always meet in public places, verify the seller's identity, and never send money in advance. Use our verified member system for added security. Report suspicious ads immediately to help keep the community safe.",
    author: "Ads SL Team",
    date: "2026-03-10",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=400&fit=crop",
  },
  {
    id: 2,
    title: "Top 5 Districts for Spa & Wellness Services",
    excerpt: "Discover the most popular districts in Sri Lanka for spa and wellness services on Ads SL.",
    content: "Sri Lanka is home to a vibrant wellness industry. Colombo leads the way with the highest number of spa listings, followed by Kandy, Galle, Negombo, and Matara. Whether you're looking for traditional Ayurvedic treatments or modern spa experiences, Ads SL connects you with verified providers across all 25 districts.",
    author: "Ads SL Team",
    date: "2026-03-08",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=400&fit=crop",
  },
  {
    id: 3,
    title: "Why Verified Membership Matters",
    excerpt: "Learn about the benefits of becoming a verified member on Ads SL and how it builds trust.",
    content: "Verified membership on Ads SL is more than just a badge — it's a mark of trust. Verified members go through an identity check process, ensuring that their ads are legitimate. This helps buyers feel confident and increases the visibility of your listings. Become a verified member today and stand out from the crowd.",
    author: "Ads SL Team",
    date: "2026-03-05",
    image: "https://images.unsplash.com/photo-1553484771-047a44eee27b?w=600&h=400&fit=crop",
  },
];

const Blogs = () => {
  const navigate = useNavigate();
  const [blogs] = useState<BlogPost[]>(sampleBlogs);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newExcerpt, setNewExcerpt] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newImage, setNewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = () => setNewImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCreate = () => {
    setShowCreateForm(false);
    setNewTitle("");
    setNewExcerpt("");
    setNewContent("");
    setNewAuthor("");
    setNewImage(null);
  };

  return (
    <div className="min-h-screen bg-background">
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
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate("/")}
                className="gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Ads
              </Button>
              <Button
                size="sm"
                className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1"
                onClick={() => setShowCreateForm(true)}
              >
                <PenLine className="w-4 h-4" />
                Write a Post
              </Button>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <Card
              key={blog.id}
              className="group cursor-pointer overflow-hidden border-border/60 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1"
              onClick={() => setSelectedBlog(blog)}
            >
              <div className="aspect-video overflow-hidden">
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {new Date(blog.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                </div>
                <h3 className="font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                  {blog.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {blog.excerpt}
                </p>
                <p className="text-xs font-medium text-primary pt-1">Read more →</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Blog detail modal */}
      <Dialog open={!!selectedBlog} onOpenChange={() => setSelectedBlog(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedBlog && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl leading-snug">{selectedBlog.title}</DialogTitle>
                <DialogDescription className="flex items-center gap-3 text-sm">
                  <span>{selectedBlog.author}</span>
                  <span>•</span>
                  <span>{new Date(selectedBlog.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                </DialogDescription>
              </DialogHeader>
              <div className="aspect-video overflow-hidden rounded-lg mt-2">
                <img src={selectedBlog.image} alt={selectedBlog.title} className="w-full h-full object-cover" />
              </div>
              <div className="prose prose-sm max-w-none mt-4 text-foreground leading-relaxed whitespace-pre-wrap">
                {selectedBlog.content}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create blog post form */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PenLine className="w-5 h-5 text-primary" />
              Write a New Blog Post
            </DialogTitle>
            <DialogDescription>
              Share your thoughts and experiences with the Ads SL community.
            </DialogDescription>
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
              <Input placeholder="Short summary..." value={newExcerpt} onChange={(e) => setNewExcerpt(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Image</label>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageSelect} className="hidden" />
              {newImage ? (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border">
                  <img src={newImage} alt="Preview" className="w-full h-full object-cover" />
                  <button onClick={() => setNewImage(null)} className="absolute top-2 right-2 bg-background/80 rounded-full p-1">
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
            <Button className="w-full" onClick={handleCreate} disabled={!newTitle.trim() || !newContent.trim()}>
              Publish Post
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Blogs;
