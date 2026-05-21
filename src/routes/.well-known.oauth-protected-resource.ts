import { createFileRoute } from "@tanstack/react-router";
import { ISSUER, MCP_RESOURCE } from "@/lib/mcp/oauth.server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export const Route = createFileRoute("/.well-known/oauth-protected-resource")({
  server: {
    handlers: {
      GET: async () => {
        const body = {
          resource: MCP_RESOURCE,
          authorization_servers: [ISSUER],
          scopes_supported: ["mcp"],
          bearer_methods_supported: ["header"],
          resource_documentation: `${ISSUER}/settings`,
        };
        return new Response(JSON.stringify(body), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      },
      OPTIONS: async () =>
        new Response(null, { status: 204, headers: corsHeaders }),
    },
  },
});
