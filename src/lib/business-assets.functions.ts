import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const BUCKET = "business-assets";

/**
 * Returns a short-lived signed URL for an object inside the private
 * `business-assets` bucket. Callers must own the object's folder
 * (path = `<user_id>/...`) or be an admin.
 *
 * Accepts both raw paths (`<user_id>/logo-xxx.jpg`) and legacy full public
 * URLs — the legacy URLs are stripped down to their path before signing.
 */
export const signBusinessAsset = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      path: z.string().trim().min(1).max(1024),
      expiresIn: z.number().int().min(60).max(60 * 60 * 24).default(3600),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;

    // Normalize legacy public URLs back to a bucket-relative path.
    let path = data.path;
    const legacy = path.match(/\/storage\/v1\/object\/(?:public|sign)\/business-assets\/([^?#]+)/);
    if (legacy) path = legacy[1];
    path = path.replace(/^\/+/, "");

    const folder = path.split("/")[0];

    // Ownership check (admins bypass)
    const { data: roleRow } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    const isAdmin = Boolean(roleRow);

    if (!isAdmin && folder !== userId) {
      throw new Error("Acesso negado a este arquivo.");
    }

    const { data: signed, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .createSignedUrl(path, data.expiresIn);
    if (error || !signed?.signedUrl) {
      throw new Error(error?.message ?? "Falha ao gerar URL assinada.");
    }
    return { url: signed.signedUrl, path };
  });
