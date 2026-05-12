import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve((req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const publishable = Deno.env.get("STRIPE_PUBLISHABLE_KEY") || "";
  return new Response(JSON.stringify({ publishableKey: publishable }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
