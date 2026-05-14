import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type Role = "admin" | "customer" | null;

interface AuthState {
  session: Session | null;
  user: User | null;
  role: Role;
  loading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  hasPaid: boolean;
  refreshRole: () => Promise<void>;
  refreshPaid: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [hasPaid, setHasPaid] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchRole = async (uid: string | undefined) => {
    if (!uid) return setRole(null);
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", uid);
    if (!data || data.length === 0) return setRole("customer");
    const isAdmin = data.some((r) => r.role === "admin");
    setRole(isAdmin ? "admin" : "customer");
  };

  const fetchPaid = async (uid: string | undefined) => {
    if (!uid) return setHasPaid(false);
    const { data } = await supabase
      .from("payments")
      .select("id")
      .eq("user_id", uid)
      .eq("status", "paid")
      .limit(1);
    setHasPaid(!!data && data.length > 0);
  };

  useEffect(() => {
    // Listener FIRST
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      // Defer fetches (avoid deadlock)
      if (s?.user) {
        setTimeout(() => { fetchRole(s.user.id); fetchPaid(s.user.id); }, 0);
      } else {
        setRole(null);
        setHasPaid(false);
      }
    });
    // Then check existing session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) { fetchRole(s.user.id); fetchPaid(s.user.id); }
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      session,
      user,
      role,
      loading,
      isAdmin: role === "admin",
      isAuthenticated: !!user,
      hasPaid,
      refreshRole: () => fetchRole(user?.id),
      refreshPaid: () => fetchPaid(user?.id),
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [session, user, role, loading, hasPaid],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
