import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { Menu, X, ChevronDown, MessageCircle, LayoutDashboard, LogOut, User } from "lucide-react";
import logoSrc from "@/assets/logo.png";
import { motion, AnimatePresence } from "framer-motion";

const sections = [
  { label: "Modelos", hash: "modelos" },
  { label: "Como funciona", hash: "como-funciona" },
  { label: "Ativação", hash: "ativacao" },
] as const;

export function SiteHeader() {
  const { isAuthenticated, isAdmin, signOut, user } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<null | "docs" | "user">(null);

  const sectionHref = (hash: string) => (path === "/" ? `#${hash}` : `/#${hash}`);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/75 border-b border-border/40">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-4 md:py-5 flex items-center justify-between gap-4">
        <Link to="/" className="inline-flex items-center gap-2.5 group" aria-label="Início">
          <img src={logoSrc} alt="Filro" className="h-9 md:h-11 w-auto object-contain transition-transform group-hover:scale-105" />
          <span className="font-display font-black text-xl md:text-2xl text-ink tracking-tight">Filro</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-ink-soft">
          {sections.map((l) => (
            <a key={l.hash} href={sectionHref(l.hash)} className="relative hover:text-ink transition-colors story-link">
              {l.label}
            </a>
          ))}

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <div className="hidden md:block relative" onMouseEnter={() => setMenu("user")} onMouseLeave={() => setMenu(null)}>
              <button className="inline-flex items-center gap-2 h-11 px-4 rounded-2xl border border-border bg-paper hover:bg-muted transition-colors text-sm font-medium text-ink">
                <div className="h-7 w-7 rounded-full bg-ink text-paper grid place-items-center text-xs font-bold">{user?.email?.[0]?.toUpperCase() ?? "U"}</div>
                <ChevronDown className="h-3.5 w-3.5 text-ink-soft" />
              </button>
              <AnimatePresence>
                {menu === "user" && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} transition={{ duration: 0.15 }}
                    className="absolute top-full right-0 pt-3 w-64 z-50">
                    <div className="card-elevated p-2 shadow-elegant">
                      <div className="px-3 py-2 border-b border-border mb-1">
                        <div className="text-xs text-ink-soft">Logado como</div>
                        <div className="text-sm font-medium text-ink truncate">{user?.email}</div>
                      </div>
                      <Link to="/painel" className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted text-sm text-ink"><LayoutDashboard className="h-4 w-4" /> Painel</Link>
                      <Link to="/business-info" className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted text-sm text-ink"><User className="h-4 w-4" /> Meu negócio</Link>
                      {isAdmin && <Link to="/console" className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted text-sm text-ink"><LayoutDashboard className="h-4 w-4" /> Console</Link>}
                      <button onClick={async () => { await signOut(); navigate({ to: "/" }); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted text-sm text-ink text-left">
                        <LogOut className="h-4 w-4" /> Sair
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/login" className="hidden md:inline-flex items-center h-11 px-4 text-sm font-medium text-ink-soft hover:text-ink transition-colors">Entrar</Link>
          )}

          <a href={sectionHref("ativacao")}
            className="hidden md:inline-flex items-center justify-center h-11 px-5 rounded-2xl bg-ink text-paper text-sm font-semibold tracking-wide hover:scale-[1.03] active:scale-[0.97] transition-transform shadow-elegant">
            Ativar agora
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
              {sections.map((l) => (
                <a key={l.hash} href={sectionHref(l.hash)} onClick={() => setOpen(false)} className="text-ink py-3 border-b border-border/50">
                  {l.label}
                </a>
              ))}
              {docsLinks.map((d) => (
                <Link key={d.to} to={d.to} onClick={() => setOpen(false)} className="text-ink py-3 border-b border-border/50 inline-flex items-center gap-2">
                  <d.icon className="h-4 w-4" /> {d.label}
                </Link>
              ))}
              {isAuthenticated ? (
                <>
                  <Link to="/painel" onClick={() => setOpen(false)} className="text-ink py-3 inline-flex items-center gap-2"><LayoutDashboard className="h-4 w-4" /> Painel</Link>
                  <Link to="/business-info" onClick={() => setOpen(false)} className="text-ink py-3 inline-flex items-center gap-2"><User className="h-4 w-4" /> Meu negócio</Link>
                  {isAdmin && <Link to="/console" onClick={() => setOpen(false)} className="text-ink py-3 inline-flex items-center gap-2"><LayoutDashboard className="h-4 w-4" /> Console</Link>}
                  <button onClick={async () => { await signOut(); setOpen(false); navigate({ to: "/" }); }} className="text-left text-ink py-3 inline-flex items-center gap-2"><LogOut className="h-4 w-4" /> Sair</button>
                </>
              ) : (
                <Link to="/login" onClick={() => setOpen(false)} className="text-ink py-3">Entrar</Link>
              )}
              <a href={sectionHref("ativacao")} onClick={() => setOpen(false)}
                className="mt-3 inline-flex items-center justify-center h-12 px-6 rounded-2xl bg-ink text-paper text-sm font-semibold tracking-wide w-full">
                Ativar agora
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
