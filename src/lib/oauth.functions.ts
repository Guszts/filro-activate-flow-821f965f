import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getClient, issueAuthorizationCode, MCP_RESOURCE } from "@/lib/mcp/oauth.server";

const consentSchema = z.object({
  client_id: z.string().min(1).max(200),
  redirect_uri: z.string().url(),
  code_challenge: z.string().min(20).max(200),
  code_challenge_method: z.literal("S256"),
  state: z.string().max(500).optional(),
  scope: z.string().max(200).optional(),
  resource: z.string().url().optional(),
});

/** Verifica se o usuário logado é admin. */
export const getOAuthConsentContext = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ client_id: z.string().min(1).max(200) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { data: roleRow } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    const isAdmin = Boolean(roleRow);

    const client = await getClient(data.client_id);
    return {
      isAdmin,
      userId,
      clientName: client?.client_name ?? null,
      clientId: client?.client_id ?? null,
      registeredRedirectUris: client?.redirect_uris ?? [],
    };
  });

/** Aprova consentimento, emite code e devolve a URL de redirect com code+state. */
export const approveOAuthConsent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => consentSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;

    // Admin gate
    const { data: roleRow } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) throw new Error("Apenas administradores podem autorizar.");

    const client = await getClient(data.client_id);
    if (!client) throw new Error("Cliente OAuth desconhecido.");
    if (!client.redirect_uris.includes(data.redirect_uri)) {
      throw new Error("redirect_uri não corresponde ao cliente registrado.");
    }

    const code = await issueAuthorizationCode({
      clientId: data.client_id,
      userId,
      redirectUri: data.redirect_uri,
      codeChallenge: data.code_challenge,
      codeChallengeMethod: data.code_challenge_method,
      scope: data.scope ?? "mcp",
      resource: data.resource ?? MCP_RESOURCE,
    });

    const url = new URL(data.redirect_uri);
    url.searchParams.set("code", code);
    if (data.state) url.searchParams.set("state", data.state);

    return { redirectUrl: url.toString() };
  });
