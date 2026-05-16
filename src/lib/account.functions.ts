import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const deleteOwnAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    if (!userId) return { ok: false, error: "Não autenticado" };
    try {
      await supabaseAdmin.from("events").insert({
        event_type: "user.account_deleted",
        user_id: userId,
        event_data: { at: new Date().toISOString() },
      });
      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "Erro ao excluir conta" };
    }
  });
