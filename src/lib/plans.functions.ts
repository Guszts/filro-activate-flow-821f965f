import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const listPublicPlans = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("plans")
    .select("*")
    .eq("active", true)
    .eq("hidden", false)
    .order("display_order");
  if (error) throw new Error(error.message);
  return data ?? [];
});
