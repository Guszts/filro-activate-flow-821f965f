import { createHash, randomBytes } from "crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { verifyOAuthAccessToken } from "./oauth.server";

export const MCP_TOKEN_PREFIX = "flaro_mcp_";

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function generateMcpToken(): { token: string; hash: string; prefix: string } {
  const raw = randomBytes(32).toString("base64url");
  const token = `${MCP_TOKEN_PREFIX}${raw}`;
  return {
    token,
    hash: hashToken(token),
    prefix: token.slice(0, MCP_TOKEN_PREFIX.length + 6),
  };
}

export interface McpAuthContext extends Record<string, unknown> {
  userId: string;
  tokenId: string | null;
  isAdmin: boolean;
  source: "static" | "oauth";
}

export async function verifyMcpToken(token: string): Promise<McpAuthContext | null> {
  if (!token) return null;

  // 1) Token estático flaro_mcp_*
  if (token.startsWith(MCP_TOKEN_PREFIX)) {
    const hash = hashToken(token);
    const { data, error } = await supabaseAdmin
      .from("mcp_tokens")
      .select("id,user_id,revoked_at")
      .eq("token_hash", hash)
      .maybeSingle();
    if (error || !data || data.revoked_at) return null;
    const { data: roleRow } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user_id)
      .eq("role", "admin")
      .maybeSingle();
    void supabaseAdmin
      .from("mcp_tokens")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", data.id);
    return {
      userId: data.user_id,
      tokenId: data.id,
      isAdmin: Boolean(roleRow),
      source: "static",
    };
  }

  // 2) Access token OAuth (formato opaco, sem prefixo)
  const oauth = await verifyOAuthAccessToken(token);
  if (!oauth) return null;
  return {
    userId: oauth.userId,
    tokenId: null,
    isAdmin: oauth.isAdmin,
    source: "oauth",
  };
}
