-- Create function to increment view count
CREATE OR REPLACE FUNCTION increment_view_count_by(_ad_id UUID, _count INT)
RETURNS void AS $$
BEGIN
  UPDATE ads 
  SET view_count = LEAST(view_count + _count, 100000),
      updated_at = NOW()
  WHERE id = _ad_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to increment favorite count
CREATE OR REPLACE FUNCTION increment_favorite_count_by(_ad_id UUID, _count INT)
RETURNS void AS $$
BEGIN
  UPDATE ads 
  SET favorite_count = favorite_count + _count,
      updated_at = NOW()
  WHERE id = _ad_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to publish scheduled ads
CREATE OR REPLACE FUNCTION publish_scheduled_ads()
RETURNS TABLE(id UUID, title VARCHAR, status VARCHAR) AS $$
BEGIN
  RETURN QUERY
  UPDATE ads 
  SET status = 'approved', 
      approved_at = NOW(),
      updated_at = NOW()
  WHERE status = 'scheduled' AND scheduled_at <= NOW()
  RETURNING ads.id, ads.title, ads.status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users for edge functions
GRANT EXECUTE ON FUNCTION increment_view_count_by(UUID, INT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION increment_favorite_count_by(UUID, INT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION publish_scheduled_ads() TO authenticated, service_role;