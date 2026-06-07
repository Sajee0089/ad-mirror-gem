-- Create blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  slug VARCHAR(500) UNIQUE NOT NULL,
  author_id UUID,
  category VARCHAR(100),
  tags JSONB DEFAULT '[]'::jsonb,
  featured_image VARCHAR(1000),
  view_count INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  seo_title VARCHAR(500),
  seo_description VARCHAR(500),
  seo_keywords VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  published_at TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX idx_blog_posts_author_id ON blog_posts(author_id);

-- Add RLS policies
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published blog posts" ON blog_posts
  FOR SELECT USING (status = 'published');

CREATE POLICY "Authors can view their own posts" ON blog_posts
  FOR SELECT USING (auth.uid() = author_id);

CREATE POLICY "Authors can create posts" ON blog_posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own posts" ON blog_posts
  FOR UPDATE USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);
