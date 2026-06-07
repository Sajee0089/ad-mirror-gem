-- Create ads table
CREATE TABLE IF NOT EXISTS ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  district VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'approved', 'rejected')),
  view_count INT DEFAULT 0 CHECK (view_count >= 0 AND view_count <= 100000),
  favorite_count INT DEFAULT 0 CHECK (favorite_count >= 0),
  slug VARCHAR(500) UNIQUE,
  user_id UUID,
  phone VARCHAR(20),
  email VARCHAR(255),
  images JSONB DEFAULT '[]'::jsonb,
  price DECIMAL(10, 2),
  duration_days INT DEFAULT 30,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  scheduled_at TIMESTAMP,
  approved_at TIMESTAMP,
  rejected_at TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_ads_status ON ads(status);
CREATE INDEX idx_ads_category ON ads(category);
CREATE INDEX idx_ads_district ON ads(district);
CREATE INDEX idx_ads_slug ON ads(slug);
CREATE INDEX idx_ads_user_id ON ads(user_id);
CREATE INDEX idx_ads_created_at ON ads(created_at DESC);
CREATE INDEX idx_ads_scheduled_at ON ads(scheduled_at);

-- Add RLS policies
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved ads" ON ads
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Users can view their own ads" ON ads
  FOR SELECT USING (auth.uid() = user_id OR status = 'approved');

CREATE POLICY "Users can create ads" ON ads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ads" ON ads
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ads" ON ads
  FOR DELETE USING (auth.uid() = user_id);
