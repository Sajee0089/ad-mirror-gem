-- Create increment_view_count_by RPC function
CREATE OR REPLACE FUNCTION increment_view_count_by(_ad_id uuid, _count int)
RETURNS int AS $$
DECLARE
  v_current_views int;
  v_new_views int;
BEGIN
  -- Get current view count and calculate new count
  SELECT view_count INTO v_current_views
  FROM ads
  WHERE id = _ad_id;

  -- Calculate new views with 100,000 cap
  v_new_views := LEAST(v_current_views + _count, 100000);

  -- Update the views
  UPDATE ads
  SET view_count = v_new_views,
      updated_at = NOW()
  WHERE id = _ad_id;

  -- Return the views that were actually added
  RETURN v_new_views - v_current_views;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create increment_favorite_count_by RPC function
CREATE OR REPLACE FUNCTION increment_favorite_count_by(_ad_id uuid, _count int)
RETURNS int AS $$
DECLARE
  v_current_favorites int;
  v_new_favorites int;
BEGIN
  -- Get current favorite count and calculate new count
  SELECT favorite_count INTO v_current_favorites
  FROM ads
  WHERE id = _ad_id;

  -- Calculate new favorites
  v_new_favorites := v_current_favorites + _count;

  -- Update the favorites
  UPDATE ads
  SET favorite_count = v_new_favorites,
      updated_at = NOW()
  WHERE id = _ad_id;

  -- Return the favorites that were added
  RETURN _count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
