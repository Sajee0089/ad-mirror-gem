import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const VIEW_CAP = 20000;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Fetch all approved ads with current view counts
    const { data: ads, error: fetchError } = await supabase
      .from("ads")
      .select("id, view_count")
      .eq("status", "approved");

    if (fetchError) throw fetchError;
    if (!ads || ads.length === 0) {
      return new Response(JSON.stringify({ message: "No ads to boost" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let updated = 0;
    let skipped = 0;
    for (const ad of ads) {
      const currentViews = ad.view_count || 0;
      const remaining = VIEW_CAP - currentViews;

      // Skip ads already at/over the cap
      if (remaining <= 0) {
        skipped++;
        continue;
      }

      // Random views between 100 and 500, but never push past 20k
      const desired = Math.floor(Math.random() * 401) + 100;
      const viewIncrement = Math.min(desired, remaining);

      // Random favorites between 1 and 5
      const randomFavorites = Math.floor(Math.random() * 5) + 1;

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
        message: `Boosted ${updated} ads (cap ${VIEW_CAP}), skipped ${skipped} at cap`,
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
