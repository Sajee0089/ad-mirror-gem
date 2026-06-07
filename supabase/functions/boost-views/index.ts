import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface Ad {
  id: string;
  view_count: number;
  favorite_count: number;
}

interface BoostResult {
  boosted: number;
  suppressed: number;
  skipped: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Fetch all approved ads
    const { data: ads, error: fetchError } = await supabase
      .from("ads")
      .select("id, view_count, favorite_count")
      .eq("status", "approved");

    if (fetchError) {
      throw new Error(`Failed to fetch ads: ${fetchError.message}`);
    }

    if (!ads || ads.length === 0) {
      return new Response(
        JSON.stringify({
          boosted: 0,
          suppressed: 0,
          skipped: 0,
          message: "No approved ads found",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const result: BoostResult = {
      boosted: 0,
      suppressed: 0,
      skipped: 0,
    };

    // Process each ad
    for (const ad of ads as Ad[]) {
      const engagementRatio =
        ad.view_count > 0 ? ad.favorite_count / ad.view_count : 0;

      let viewsToAdd = 0;
      let shouldSkip = false;

      // Determine views to add based on performance tier
      if (ad.view_count > 500 && engagementRatio < 0.3) {
        // Poor performers: 60% chance to skip
        if (Math.random() < 0.6) {
          shouldSkip = true;
          result.suppressed++;
        } else {
          viewsToAdd = Math.floor(Math.random() * 36) + 5; // 5-40
          result.boosted++;
        }
      } else if (engagementRatio >= 1.5) {
        // Strong performers
        viewsToAdd = Math.floor(Math.random() * 551) + 150; // 150-700
        result.boosted++;
      } else {
        // Average/new ads
        viewsToAdd = Math.floor(Math.random() * 241) + 40; // 40-280
        result.boosted++;
      }

      if (!shouldSkip && viewsToAdd > 0) {
        // Check if adding views would exceed cap
        if (ad.view_count + viewsToAdd > 100000) {
          viewsToAdd = Math.max(0, 100000 - ad.view_count);
        }

        // Add views using RPC function
        if (viewsToAdd > 0) {
          const { error: viewError } = await supabase.rpc(
            "increment_view_count_by",
            {
              _ad_id: ad.id,
              _count: viewsToAdd,
            }
          );

          if (viewError) {
            console.error(
              `Failed to increment views for ad ${ad.id}: ${viewError.message}`
            );
          }
        }
      }

      // Add random favorites based on performance tier
      let favoritesToAdd = 0;

      if (engagementRatio >= 1.5) {
        // Strong performers get more favorites
        favoritesToAdd = Math.floor(Math.random() * 6) + 1; // 1-6
      } else if (ad.view_count > 500 && engagementRatio < 0.3) {
        // Poor performers get fewer favorites
        favoritesToAdd = Math.floor(Math.random() * 3); // 0-2
      } else {
        // Average/new ads
        favoritesToAdd = Math.floor(Math.random() * 4) + 1; // 1-4
      }

      if (favoritesToAdd > 0) {
        const { error: favError } = await supabase.rpc(
          "increment_favorite_count_by",
          {
            _ad_id: ad.id,
            _count: favoritesToAdd,
          }
        );

        if (favError) {
          console.error(
            `Failed to increment favorites for ad ${ad.id}: ${favError.message}`
          );
        }
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in boost-views function:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
