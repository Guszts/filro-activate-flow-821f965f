import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Menu, X, ChevronDown, LayoutDashboard, Briefcase, Shield, Layers, PlayCircle, Rocket, Settings as SettingsIcon, Home } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";


const navLinks = [
  { to: "/" as const, label: "Início", icon: Home },
  { to: "/modelos" as const, label: "Modelos", icon: Layers },
  { to: "/como-funciona" as const, label: "Como funciona", icon: PlayCircle },
  { to: "/planos" as const, label: "Planos", icon: Rocket },
  { to: "/comparar" as const, label: "Comparar", icon: Layers },
] as const;

const authLinks = [
  { to: "/painel" as const, label: "Painel", icon: LayoutDashboard },
  { to: "/business-info" as const, label: "Meu negócio", icon: Briefcase },
  { to: "/settings" as const, label: "Configurações", icon: SettingsIcon },
] as const;

export function SiteHeader() {
  const { isAuthenticated, isAdmin, hasPaid, user } = useAuth();
  const showPaidLinks = hasPaid || isAdmin;
  const visibleAuthLinks = showPaidLinks
    ? authLinks
    : ([{ to: "/settings" as const, label: "Configurações", icon: SettingsIcon }] as const);
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<null | "user">(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { setAvatarUrl(null); return; }
    let active = true;
    supabase.from("profiles").select("avatar_url").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => { if (active) setAvatarUrl(data?.avatar_url ?? null); });
    return () => { active = false; };
  }, [user]);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/75 border-b border-border/40">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-4 md:py-5 flex items-center justify-between gap-4">
        <Link to="/" className="inline-flex items-center gap-2.5 group" aria-label="Home">
          <span className="font-display font-black text-2xl md:text-3xl text-ink tracking-tight transition-transform group-hover:scale-[1.03]">Filro</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-ink-soft">
          {navLinks.slice(1).map((l) => (
            <Link key={l.to} to={l.to} className="relative hover:text-ink transition-colors" activeProps={{ className: "text-ink" }}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {null}
          {isAuthenticated ? (
            <div className="hidden md:block relative" onMouseEnter={() => setMenu("user")} onMouseLeave={() => setMenu(null)}>
              <button onClick={() => navigate({ to: "/settings" })} className="inline-flex items-center gap-2 h-11 px-4 rounded-2xl border border-border bg-paper hover:bg-muted transition-colors text-sm font-medium text-ink">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="h-7 w-7 rounded-full object-cover" />
                ) : (
                  <div className="h-7 w-7 rounded-full bg-ink text-paper grid place-items-center text-xs font-bold">{user?.email?.[0]?.toUpperCase() ?? "U"}</div>
                )}
                <ChevronDown className="h-3.5 w-3.5 text-ink-soft" />
              </button>
              <AnimatePresence>
                {menu === "user" && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} transition={{ duration: 0.15 }}
                    className="absolute top-full right-0 pt-3 w-64 z-50">
                    <div className="card-elevated p-2 shadow-elegant">
                      {visibleAuthLinks.map(({ to, label, icon: Icon }) => {
                        const active = path === to;
                        return (
                          <Link key={to} to={to} className={`flex items-center gap-3 p-3 rounded-xl text-sm transition-colors ${active ? "bg-muted text-ink font-semibold" : "text-ink hover:bg-muted"}`}>
                            <Icon className="h-4 w-4" /> {label}
                          </Link>
                        );
                      })}
                      {isAdmin && (
                        <Link to="/console" className={`flex items-center gap-3 p-3 rounded-xl text-sm transition-colors ${path === "/console" ? "bg-muted text-ink font-semibold" : "text-ink hover:bg-muted"}`}>
                          <Shield className="h-4 w-4" /> Console
                        </Link>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/login" className="hidden md:inline-flex items-center h-11 px-4 text-sm font-medium text-ink-soft hover:text-ink transition-colors">Entrar</Link>
          )}

          <Link to="/planos"
            className="hidden md:inline-flex items-center justify-center h-11 px-5 rounded-2xl bg-ink text-paper text-sm font-semibold tracking-wide hover:scale-[1.03] active:scale-[0.97] transition-transform shadow-elegant">
            Ativar agora
          </Link>

          <button
            className="md:hidden h-11 w-11 grid place-items-center rounded-2xl bg-paper border border-border"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-border bg-paper overflow-hidden">
            <div className="px-5 py-6 flex flex-col gap-1 text-base font-medium">
              {navLinks.map((l) => {
                const Icon = l.icon;
                const active = path === l.to;
                return (
                  <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className={`py-3 px-2 rounded-lg inline-flex items-center gap-2 ${active ? "bg-muted text-ink font-semibold" : "text-ink"}`}>
                    <Icon className="h-4 w-4 text-ink-soft" /> {l.label}
                  </Link>
                );
              })}

              {isAuthenticated ? (
                <>
                  <div className="mt-3 mb-1 px-2 text-[10px] uppercase tracking-widest text-ink-soft">Sua conta</div>
                  {visibleAuthLinks.map(({ to, label, icon: Icon }) => {
                    const active = path === to;
                    return (
                      <Link key={to} to={to} onClick={() => setOpen(false)} className={`py-3 px-2 rounded-lg inline-flex items-center gap-2 ${active ? "bg-muted text-ink font-semibold" : "text-ink"}`}>
                        <Icon className="h-4 w-4" /> {label}
                      </Link>
                    );
                  })}
                  {isAdmin && (
                    <Link to="/console" onClick={() => setOpen(false)} className={`py-3 px-2 rounded-lg inline-flex items-center gap-2 ${path === "/console" ? "bg-muted text-ink font-semibold" : "text-ink"}`}>
                      <Shield className="h-4 w-4" /> Console
                    </Link>
                  )}
                </>
              ) : (
                <Link to="/login" onClick={() => setOpen(false)} className="text-ink py-3 px-2">Entrar</Link>
              )}

              <Link to="/planos" onClick={() => setOpen(false)}
                className="mt-3 inline-flex items-center justify-center h-12 px-6 rounded-2xl bg-ink text-paper text-sm font-semibold tracking-wide w-full">
                Ativar agora
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
