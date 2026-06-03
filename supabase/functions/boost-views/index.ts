const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  return new Response(
    JSON.stringify({
      disabled: true,
      message: "Engagement boosting is disabled while database IO is being recovered.",
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
