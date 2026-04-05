import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Fetch all approved ads
    const { data: ads, error: fetchError } = await supabase
      .from("ads")
      .select("id")
      .eq("status", "approved");

    if (fetchError) throw fetchError;
    if (!ads || ads.length === 0) {
      return new Response(JSON.stringify({ message: "No ads to boost" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let updated = 0;
    for (const ad of ads) {
      // Random views between 100 and 500 for each ad
      const randomViews = Math.floor(Math.random() * 401) + 100;

      const { error: updateError } = await supabase.rpc("increment_view_count_by", {
        _ad_id: ad.id,
        _count: randomViews,
      });

      if (!updateError) updated++;
    }

    return new Response(
      JSON.stringify({ message: `Boosted ${updated} ads with random views` }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
