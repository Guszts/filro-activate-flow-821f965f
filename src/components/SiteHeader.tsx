import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { Menu, X, ChevronDown, MessageCircle, LayoutDashboard, Briefcase, Shield, Layers, PlayCircle, Rocket, Settings as SettingsIcon } from "lucide-react";
import logoSrc from "@/assets/logo.png";
import { motion, AnimatePresence } from "framer-motion";

const sections = [
  { label: "Modelos", hash: "modelos", icon: Layers },
  { label: "Como funciona", hash: "como-funciona", icon: PlayCircle },
  { label: "Ativação", hash: "ativacao", icon: Rocket },
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
    : ([{ to: "/settings" as const, label: "Settings", icon: SettingsIcon }] as const);
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<null | "user">(null);

  const sectionHref = (hash: string) => (path === "/" ? `#${hash}` : `/#${hash}`);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/75 border-b border-border/40">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-4 md:py-5 flex items-center justify-between gap-4">
        <Link to="/" className="inline-flex items-center gap-2.5 group" aria-label="Home">
          <img src={logoSrc} alt="Filro" className="h-9 md:h-11 w-auto object-contain transition-transform group-hover:scale-105" />
          <span className="font-display font-black text-xl md:text-2xl text-ink tracking-tight">Filro</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-ink-soft">
          {sections.map((l) => (
            <a key={l.hash} href={sectionHref(l.hash)} className="relative hover:text-ink transition-colors story-link">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <div className="hidden md:block relative" onMouseEnter={() => setMenu("user")} onMouseLeave={() => setMenu(null)}>
              <button onClick={() => navigate({ to: "/settings" })} className="inline-flex items-center gap-2 h-11 px-4 rounded-2xl border border-border bg-paper hover:bg-muted transition-colors text-sm font-medium text-ink">
                <div className="h-7 w-7 rounded-full bg-ink text-paper grid place-items-center text-xs font-bold">{user?.email?.[0]?.toUpperCase() ?? "U"}</div>
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
            <Link to="/login" className="hidden md:inline-flex items-center h-11 px-4 text-sm font-medium text-ink-soft hover:text-ink transition-colors">Sign in</Link>
          )}

          <a href={sectionHref("ativacao")}
            className="hidden md:inline-flex items-center justify-center h-11 px-5 rounded-2xl bg-ink text-paper text-sm font-semibold tracking-wide hover:scale-[1.03] active:scale-[0.97] transition-transform shadow-elegant">
            Activate now
          </a>

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
              {sections.map((l) => {
                const Icon = l.icon;
                return (
                  <a key={l.hash} href={sectionHref(l.hash)} onClick={() => setOpen(false)} className="text-ink py-3 border-b border-border/50 inline-flex items-center gap-2">
                    <Icon className="h-4 w-4 text-ink-soft" /> {l.label}
                  </a>
                );
              })}
              {isAuthenticated ? (
                <>
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
                <Link to="/login" onClick={() => setOpen(false)} className="text-ink py-3">Sign in</Link>
              )}
              <a href={sectionHref("ativacao")} onClick={() => setOpen(false)}
                className="mt-3 inline-flex items-center justify-center h-12 px-6 rounded-2xl bg-ink text-paper text-sm font-semibold tracking-wide w-full">
                Activate now
              </a>
              <a href="https://wa.me/5592993561754" target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center justify-center gap-2 h-12 px-6 rounded-2xl bg-lime text-ink text-sm font-semibold tracking-wide w-full">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
