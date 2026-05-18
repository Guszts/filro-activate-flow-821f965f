import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const getMyCredits = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("user_credits")
      .select("balance, lifetime_earned, lifetime_spent")
      .eq("user_id", userId)
      .maybeSingle();
    if (data) return { balance: data.balance, lifetimeEarned: data.lifetime_earned, lifetimeSpent: data.lifetime_spent };
    // Garante linha (caso usuário antigo)
    const { data: row } = await supabaseAdmin.rpc("grant_credits", {
      _user_id: userId,
      _delta: 10,
      _reason: "signup_bonus_lazy",
      _ref_id: null,
      _metadata: {},
    } as never);
    return { balance: typeof row === "number" ? row : 10, lifetimeEarned: 10, lifetimeSpent: 0 };
  });

export const listMyCreditTransactions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("credit_transactions")
      .select("id, delta, reason, ref_id, created_at, metadata")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) return { transactions: [], error: error.message };
    return { transactions: data ?? [], error: null };
  });
