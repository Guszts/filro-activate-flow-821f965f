import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export interface CurrentPlanInfo {
  slug: string;
  display_order: number;
}

/**
 * Returns the slug + display_order of the user's currently active plan,
 * or null if none. Used to disable the current plan and any lower-tier
 * plans from being purchased again.
 */
export function useCurrentPlan(): { plan: CurrentPlanInfo | null; loading: boolean } {
  const { user, hasPaid } = useAuth();
  const [plan, setPlan] = useState<CurrentPlanInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!user || !hasPaid) {
        setPlan(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data: subs } = await supabase
        .from("subscriptions")
        .select("plan_id,status,current_period_end")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);
      const sub = subs?.[0];
      if (!sub?.plan_id) {
        if (!cancelled) { setPlan(null); setLoading(false); }
        return;
      }
      const { data: planRow } = await supabase
        .from("plans")
        .select("slug,display_order")
        .eq("id", sub.plan_id)
        .maybeSingle();
      if (!cancelled) {
        setPlan(planRow ? { slug: planRow.slug, display_order: planRow.display_order } : null);
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [user?.id, hasPaid]);

  return { plan, loading };
}
