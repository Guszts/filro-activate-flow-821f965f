import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { getMyCredits } from "@/lib/credits/credits.functions";

import { useAuth } from "@/lib/auth";

export function CreditsBadge() {
  const { user, loading } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const fetchCredits = useServerFn(getMyCredits);

  useEffect(() => {
    if (loading || !user) return;
    let alive = true;
    fetchCredits().then((res) => { if (alive) setBalance(res.balance); }).catch(() => {});
    return () => { alive = false; };
  }, [user, loading, fetchCredits]);

  if (!user || balance === null) return null;
  return (
    <Link
      to="/dev/precos"
      className="hidden md:inline-flex items-center gap-1.5 h-9 px-3 rounded-full border border-border bg-paper text-xs font-semibold text-ink hover:bg-muted transition-colors"
      title="Seus créditos Flaro Dev"
    >
      
      <span>{balance}</span>
      <span className="text-ink-soft font-normal">créditos</span>
    </Link>
  );
}
