import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { generateClientId } from "@/lib/mcp/oauth.server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function isHttpsUrl(s: unknown): s is string {
  if (typeof s !== "string") return false;
  try {
    const u = new URL(s);
    // Permite http://localhost para dev de clientes desktop
    if (u.protocol === "https:") return true;
    if (u.protocol === "http:" && (u.hostname === "localhost" || u.hostname === "127.0.0.1")) return true;
    return false;
  } catch {
    return false;
  }
}

export const Route = createFileRoute("/api/oauth/register")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: corsHeaders }),
      POST: async ({ request }) => {
        let body: Record<string, unknown>;
        try {
          body = await request.json();
        } catch {
          return new Response(
            JSON.stringify({ error: "invalid_client_metadata" }),
            { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
          );
        }

        const redirectUris = Array.isArray(body.redirect_uris) ? body.redirect_uris : [];
        const valid = redirectUris.filter(isHttpsUrl);
        if (valid.length === 0) {
          return new Response(
            JSON.stringify({ error: "invalid_redirect_uri" }),
            { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
          );
        }
        if (valid.length > 5) valid.length = 5;

        const clientName =
          typeof body.client_name === "string" && body.client_name.trim().length > 0
            ? String(body.client_name).slice(0, 200)
            : "MCP Client";

        const clientId = generateClientId();

        const { error } = await supabaseAdmin.from("oauth_clients").insert({
          client_id: clientId,
          client_name: clientName,
          redirect_uris: valid,
          scope: "mcp",
        });
        if (error) {
          return new Response(
            JSON.stringify({ error: "server_error", error_description: error.message }),
            { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
          );
        }

        return new Response(
          JSON.stringify({
            client_id: clientId,
            client_id_issued_at: Math.floor(Date.now() / 1000),
            client_name: clientName,
            redirect_uris: valid,
            grant_types: ["authorization_code", "refresh_token"],
            response_types: ["code"],
            token_endpoint_auth_method: "none",
            scope: "mcp",
          }),
          { status: 201, headers: { "Content-Type": "application/json", ...corsHeaders } },
        );
      },
    },
  },
});
