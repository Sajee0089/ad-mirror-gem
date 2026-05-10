import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const VIEW_CAP = 100000;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Fetch all approved ads with current engagement metrics
    const { data: ads, error: fetchError } = await supabase
      .from("ads")
      .select("id, view_count, favorite_count")
      .eq("status", "approved");

    if (fetchError) throw fetchError;
    if (!ads || ads.length === 0) {
      return new Response(JSON.stringify({ message: "No ads to boost" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let updated = 0;
    let skipped = 0;
    let suppressed = 0;

    for (const ad of ads) {
      const currentViews = ad.view_count || 0;
      const currentFavs = ad.favorite_count || 0;
      const remaining = VIEW_CAP - currentViews;

      // Skip ads already at/over the cap
      if (remaining <= 0) {
        skipped++;
        continue;
      }

      // Engagement ratio: favorites per 100 views (clicks proxy).
      // Low-performing ads get smaller, less frequent boosts so simulated
      // traffic stays realistic — popular ads grow faster than unpopular ones.
      const engagementRatio = currentViews > 0 ? (currentFavs / currentViews) * 100 : 1;

      // Tier the ad by engagement
      // - poor (<0.3 favs/100 views & has >500 views): 60% chance to skip, tiny boost
      // - average: normal boost
      // - good (>1.5 favs/100 views): higher boost
      let minViews: number;
      let maxViews: number;
      let skipChance = 0;

      if (currentViews > 500 && engagementRatio < 0.3) {
        // poor performer
        skipChance = 0.6;
        minViews = 5;
        maxViews = 40;
      } else if (engagementRatio >= 1.5) {
        // strong performer
        minViews = 150;
        maxViews = 700;
      } else {
        // average / new ad
        minViews = 40;
        maxViews = 280;
      }

      if (Math.random() < skipChance) {
        suppressed++;
        continue;
      }

      // Random per-ad increment within tier range — never identical between ads
      const desired = Math.floor(Math.random() * (maxViews - minViews + 1)) + minViews;
      const viewIncrement = Math.min(desired, remaining);

      // Favorites scale loosely with the boost size (1–6, biased low for poor performers)
      const favMax = engagementRatio < 0.3 ? 2 : engagementRatio >= 1.5 ? 6 : 4;
      const randomFavorites = Math.floor(Math.random() * favMax) + 1;

      if (viewIncrement > 0) {
        await supabase.rpc("increment_view_count_by", {
          _ad_id: ad.id,
          _count: viewIncrement,
        });
      }

      await supabase.rpc("increment_favorite_count_by", {
        _ad_id: ad.id,
        _count: randomFavorites,
      });

      updated++;
    }

    return new Response(
      JSON.stringify({
        message: `Boosted ${updated} ads (cap ${VIEW_CAP}), suppressed ${suppressed} low-engagement, skipped ${skipped} at cap`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
