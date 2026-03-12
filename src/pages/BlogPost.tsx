import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { SITE_URL } from "@/lib/seo";

type BlogPostType = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  author: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      const { data } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      setPost(data);
      setLoading(false);
    };
    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold text-foreground mb-4">Blog Post Not Found</h1>
          <Link to="/blogs">
            <Button variant="outline">Back to Blog</Button>
          </Link>
        </div>
      </div>
    );
  }

  const metaTitle = `${post.title} | Ads SL Blog`;
  const metaDescription = post.excerpt || post.content.substring(0, 155) + "...";
  const canonicalUrl = `${SITE_URL}/blog/${post.slug}`;
  const publishDate = new Date(post.created_at).toISOString();
  const modifiedDate = new Date(post.updated_at).toISOString();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: metaDescription,
    image: post.image_url || `${SITE_URL}/logo.png`,
    author: { "@type": "Person", name: post.author },
    publisher: {
      "@type": "Organization",
      name: "Ads SL",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
    },
    datePublished: publishDate,
    dateModified: modifiedDate,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    url: canonicalUrl,
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={canonicalUrl} />
        {post.image_url && <meta property="og:image" content={post.image_url} />}
        <meta property="article:published_time" content={publishDate} />
        <meta property="article:modified_time" content={modifiedDate} />
        <meta property="article:author" content={post.author} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <Navbar />

      <article className="max-w-3xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link to="/blogs" className="hover:text-primary transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-foreground truncate max-w-[200px]">{post.title}</span>
        </nav>

        <Link to="/blogs">
          <Button variant="ghost" size="sm" className="gap-1 mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Button>
        </Link>

        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4 leading-tight">
          {post.title}
        </h1>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
          <span className="flex items-center gap-1">
            <User className="w-4 h-4" /> {post.author}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {new Date(post.created_at).toLocaleDateString("en-US", {
              year: "numeric", month: "long", day: "numeric",
            })}
          </span>
        </div>

        {post.image_url && (
          <div className="aspect-video overflow-hidden rounded-lg mb-6">
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        <div className="prose prose-sm max-w-none text-foreground leading-relaxed whitespace-pre-wrap">
          {post.content}
        </div>
      </article>
    </div>
  );
};

export default BlogPost;
