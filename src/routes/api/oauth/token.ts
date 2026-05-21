import { createFileRoute } from "@tanstack/react-router";
import {
  consumeAuthorizationCode,
  getClient,
  issueAccessToken,
  issueRefreshToken,
  rotateRefreshToken,
  verifyPkceS256,
  MCP_RESOURCE,
} from "@/lib/mcp/oauth.server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function err(code: string, description: string, status = 400) {
  return new Response(JSON.stringify({ error: code, error_description: description }), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

async function parseBody(request: Request): Promise<Record<string, string>> {
  const ct = request.headers.get("content-type") ?? "";
  if (ct.includes("application/x-www-form-urlencoded")) {
    const text = await request.text();
    const out: Record<string, string> = {};
    for (const [k, v] of new URLSearchParams(text).entries()) out[k] = v;
    return out;
  }
  if (ct.includes("application/json")) {
    const j = (await request.json()) as Record<string, unknown>;
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(j)) if (typeof v === "string") out[k] = v;
    return out;
  }
  // Try form anyway
  try {
    const text = await request.text();
    const out: Record<string, string> = {};
    for (const [k, v] of new URLSearchParams(text).entries()) out[k] = v;
    return out;
  } catch {
    return {};
  }
}

export const Route = createFileRoute("/api/oauth/token")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: corsHeaders }),
      POST: async ({ request }) => {
        const body = await parseBody(request);
        const grantType = body.grant_type;
        const clientId = body.client_id;
        if (!clientId) return err("invalid_request", "client_id required");

        const client = await getClient(clientId);
        if (!client) return err("invalid_client", "Unknown client", 401);

        if (grantType === "authorization_code") {
          const code = body.code;
          const redirectUri = body.redirect_uri;
          const verifier = body.code_verifier;
          if (!code || !redirectUri || !verifier) {
            return err("invalid_request", "code, redirect_uri, code_verifier required");
          }
          if (!client.redirect_uris.includes(redirectUri)) {
            return err("invalid_grant", "redirect_uri mismatch");
          }

          const consumed = await consumeAuthorizationCode(code, clientId, redirectUri);
          if (!consumed) return err("invalid_grant", "code invalid, expired or already used");

          if (consumed.codeChallengeMethod !== "S256") {
            return err("invalid_grant", "unsupported challenge method");
          }
          if (!verifyPkceS256(verifier, consumed.codeChallenge)) {
            return err("invalid_grant", "PKCE verification failed");
          }

          const access = await issueAccessToken({
            clientId,
            userId: consumed.userId,
            scope: consumed.scope,
            resource: consumed.resource ?? MCP_RESOURCE,
          });
          const refresh = await issueRefreshToken({
            clientId,
            userId: consumed.userId,
            scope: consumed.scope,
            resource: consumed.resource ?? MCP_RESOURCE,
          });

          return new Response(
            JSON.stringify({
              access_token: access.token,
              token_type: "Bearer",
              expires_in: access.expiresIn,
              refresh_token: refresh,
              scope: consumed.scope,
            }),
            { status: 200, headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...corsHeaders } },
          );
        }

        if (grantType === "refresh_token") {
          const rt = body.refresh_token;
          if (!rt) return err("invalid_request", "refresh_token required");
          const rotated = await rotateRefreshToken(rt, clientId);
          if (!rotated) return err("invalid_grant", "refresh_token invalid");

          const access = await issueAccessToken({
            clientId,
            userId: rotated.userId,
            scope: rotated.scope,
            resource: rotated.resource,
          });
          const newRefresh = await issueRefreshToken({
            clientId,
            userId: rotated.userId,
            scope: rotated.scope,
            resource: rotated.resource,
            rotatedFromId: rotated.rotatedFromId,
          });

          return new Response(
            JSON.stringify({
              access_token: access.token,
              token_type: "Bearer",
              expires_in: access.expiresIn,
              refresh_token: newRefresh,
              scope: rotated.scope,
            }),
            { status: 200, headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...corsHeaders } },
          );
        }

        return err("unsupported_grant_type", `grant_type '${grantType}' not supported`);
      },
    },
  },
});
