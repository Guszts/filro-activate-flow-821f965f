import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { generateMcpToken } from "@/lib/mcp/auth.server";

export const listMcpTokens = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await supabaseAdmin
      .from("mcp_tokens")
      .select("id,name,token_prefix,last_used_at,revoked_at,created_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { tokens: data ?? [] };
  });

export const createMcpToken = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ name: z.string().min(1).max(80).default("Token MCP") }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { token, hash, prefix } = generateMcpToken();
    const { data: row, error } = await supabaseAdmin
      .from("mcp_tokens")
      .insert({
        user_id: context.userId,
        name: data.name,
        token_hash: hash,
        token_prefix: prefix,
      })
      .select("id,name,token_prefix,created_at")
      .single();
    if (error) throw new Error(error.message);
    return { token, record: row };
  });

export const revokeMcpToken = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await supabaseAdmin
      .from("mcp_tokens")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
