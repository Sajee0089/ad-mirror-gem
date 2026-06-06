import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Get up to 200 approved ads
    const { data: ads, error } = await supabase
      .from("ads")
      .select("id, approved_at, view_count, favorite_count")
      .eq("status", "approved")
      .order("approved_at", { ascending: false, nullsFirst: false })
      .limit(200);

    if (error) throw error;
    if (!ads || ads.length === 0) {
      return new Response(JSON.stringify({ boosted: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let boosted = 0;
    for (const ad of ads) {
      // Random small boost to simulate organic engagement
      const ageHours = ad.approved_at
        ? (Date.now() - new Date(ad.approved_at).getTime()) / 3_600_000
        : 24;
      // newer ads get bigger boosts
      const viewBoost = Math.max(1, Math.floor(Math.random() * (ageHours < 6 ? 25 : ageHours < 24 ? 12 : 5)));
      const favBoost = Math.random() < 0.25 ? 1 : 0;

      await supabase.rpc("increment_view_count_by", { _ad_id: ad.id, _count: viewBoost });
      if (favBoost > 0) {
        await supabase.rpc("increment_favorite_count_by", { _ad_id: ad.id, _count: favBoost });
      }
      boosted++;
    }

    return new Response(JSON.stringify({ boosted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
