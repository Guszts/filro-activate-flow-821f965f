import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// TTLs
export const AUTH_CODE_TTL_SEC = 600; // 10 min
export const ACCESS_TOKEN_TTL_SEC = 3600; // 1h
export const REFRESH_TOKEN_TTL_SEC = 60 * 60 * 24 * 30; // 30 dias

export const OAUTH_SCOPE = "mcp";
export const ISSUER = "https://filro.site";
export const MCP_RESOURCE = "https://filro.site/api/mcp";

export function sha256(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

export function generateClientId(): string {
  return `mcp_client_${randomBytes(12).toString("base64url")}`;
}

/** Verifica PKCE S256: SHA-256(verifier) base64url-encoded == challenge */
export function verifyPkceS256(verifier: string, challenge: string): boolean {
  const computed = createHash("sha256").update(verifier).digest("base64url");
  try {
    const a = Buffer.from(computed);
    const b = Buffer.from(challenge);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export interface OAuthTokenAuth {
  userId: string;
  clientId: string;
  scope: string;
  isAdmin: boolean;
}

/** Valida access token OAuth e retorna contexto (ou null). */
export async function verifyOAuthAccessToken(token: string): Promise<OAuthTokenAuth | null> {
  if (!token) return null;
  const hash = sha256(token);
  const { data, error } = await supabaseAdmin
    .from("oauth_access_tokens")
    .select("id,user_id,client_id,scope,expires_at,revoked_at")
    .eq("token_hash", hash)
    .maybeSingle();
  if (error || !data) return null;
  if (data.revoked_at) return null;
  if (new Date(data.expires_at).getTime() < Date.now()) return null;

  const { data: roleRow } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", data.user_id)
    .eq("role", "admin")
    .maybeSingle();

  return {
    userId: data.user_id,
    clientId: data.client_id,
    scope: data.scope,
    isAdmin: Boolean(roleRow),
  };
}

/** Cria authorization code, devolve o code em claro. */
export async function issueAuthorizationCode(input: {
  clientId: string;
  userId: string;
  redirectUri: string;
  codeChallenge: string;
  codeChallengeMethod: string;
  scope: string;
  resource: string | null;
}): Promise<string> {
  const code = randomToken(32);
  const expiresAt = new Date(Date.now() + AUTH_CODE_TTL_SEC * 1000).toISOString();
  const { error } = await supabaseAdmin.from("oauth_authorization_codes").insert({
    code_hash: sha256(code),
    client_id: input.clientId,
    user_id: input.userId,
    redirect_uri: input.redirectUri,
    code_challenge: input.codeChallenge,
    code_challenge_method: input.codeChallengeMethod,
    scope: input.scope,
    resource: input.resource,
    expires_at: expiresAt,
  });
  if (error) throw new Error(error.message);
  return code;
}

/** Consome authorization code (uso único) e retorna metadados. */
export async function consumeAuthorizationCode(
  code: string,
  expectedClientId: string,
  expectedRedirectUri: string,
): Promise<{
  userId: string;
  clientId: string;
  scope: string;
  codeChallenge: string;
  codeChallengeMethod: string;
  resource: string | null;
} | null> {
  const hash = sha256(code);
  const { data, error } = await supabaseAdmin
    .from("oauth_authorization_codes")
    .select(
      "id,user_id,client_id,redirect_uri,code_challenge,code_challenge_method,scope,resource,expires_at,consumed_at",
    )
    .eq("code_hash", hash)
    .maybeSingle();
  if (error || !data) return null;
  if (data.consumed_at) return null;
  if (new Date(data.expires_at).getTime() < Date.now()) return null;
  if (data.client_id !== expectedClientId) return null;
  if (data.redirect_uri !== expectedRedirectUri) return null;

  // Marca como consumido
  const { error: upErr } = await supabaseAdmin
    .from("oauth_authorization_codes")
    .update({ consumed_at: new Date().toISOString() })
    .eq("id", data.id)
    .is("consumed_at", null);
  if (upErr) return null;

  return {
    userId: data.user_id,
    clientId: data.client_id,
    scope: data.scope,
    codeChallenge: data.code_challenge,
    codeChallengeMethod: data.code_challenge_method,
    resource: data.resource,
  };
}

export async function issueAccessToken(input: {
  clientId: string;
  userId: string;
  scope: string;
  resource: string | null;
}): Promise<{ token: string; expiresIn: number }> {
  const token = randomToken(32);
  const expiresAt = new Date(Date.now() + ACCESS_TOKEN_TTL_SEC * 1000).toISOString();
  const { error } = await supabaseAdmin.from("oauth_access_tokens").insert({
    token_hash: sha256(token),
    client_id: input.clientId,
    user_id: input.userId,
    scope: input.scope,
    resource: input.resource,
    expires_at: expiresAt,
  });
  if (error) throw new Error(error.message);
  return { token, expiresIn: ACCESS_TOKEN_TTL_SEC };
}

export async function issueRefreshToken(input: {
  clientId: string;
  userId: string;
  scope: string;
  resource: string | null;
  rotatedFromId?: string | null;
}): Promise<string> {
  const token = randomToken(48);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_SEC * 1000).toISOString();
  const { error } = await supabaseAdmin.from("oauth_refresh_tokens").insert({
    token_hash: sha256(token),
    client_id: input.clientId,
    user_id: input.userId,
    scope: input.scope,
    resource: input.resource,
    rotated_from: input.rotatedFromId ?? null,
  expires_at: expiresAt,
  });
  if (error) throw new Error(error.message);
  return token;
}

export async function rotateRefreshToken(token: string, expectedClientId: string): Promise<{
  userId: string;
  clientId: string;
  scope: string;
  resource: string | null;
  rotatedFromId: string;
} | null> {
  const hash = sha256(token);
  const { data, error } = await supabaseAdmin
    .from("oauth_refresh_tokens")
    .select("id,user_id,client_id,scope,resource,expires_at,revoked_at")
    .eq("token_hash", hash)
    .maybeSingle();
  if (error || !data) return null;
  if (data.revoked_at) return null;
  if (new Date(data.expires_at).getTime() < Date.now()) return null;
  if (data.client_id !== expectedClientId) return null;

  const { error: revErr } = await supabaseAdmin
    .from("oauth_refresh_tokens")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", data.id)
    .is("revoked_at", null);
  if (revErr) return null;

  return {
    userId: data.user_id,
    clientId: data.client_id,
    scope: data.scope,
    resource: data.resource,
    rotatedFromId: data.id,
  };
}

export async function getClient(clientId: string): Promise<{
  client_id: string;
  client_name: string;
  redirect_uris: string[];
  scope: string;
} | null> {
  const { data } = await supabaseAdmin
    .from("oauth_clients")
    .select("client_id,client_name,redirect_uris,scope")
    .eq("client_id", clientId)
    .maybeSingle();
  return data ?? null;
}
