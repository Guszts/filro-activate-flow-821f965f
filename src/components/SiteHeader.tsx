import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { label: "Modelos", to: "/modelos" },
  { label: "Como funciona", to: "/como-funciona" },
  { label: "Ativação", to: "/ativacao" },
];

export function SiteHeader() {
  const { isAuthenticated, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/70 border-b border-border/50">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-4 md:py-6 flex items-center justify-between">
        <Link to="/" className="font-display font-black text-2xl tracking-tight text-ink">
          FILRO
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-ink-soft">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="hover:text-ink transition-colors"
              activeProps={{ className: "text-ink" }}
            >
              {l.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <Link to="/console" className="hover:text-ink transition-colors">Console</Link>
              )}
              <button
                onClick={async () => { await signOut(); navigate({ to: "/" }); }}
                className="hover:text-ink transition-colors"
              >
                Sair
              </button>
            </>
          ) : (
            <Link to="/login" className="hover:text-ink transition-colors">Entrar</Link>
          )}
        </nav>

        <Link
          to="/ativacao"
          className="hidden md:inline-flex items-center justify-center h-12 px-6 rounded-full bg-ink text-paper text-sm font-semibold tracking-wide hover:scale-[1.02] active:scale-[0.98] transition-transform"
        >
          ATIVAR
        </Link>

        <button
          className="md:hidden h-10 w-10 grid place-items-center rounded-full bg-paper border border-border"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-paper">
          <div className="px-5 py-6 flex flex-col gap-4 text-base font-medium">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="text-ink">
                {l.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                {isAdmin && <Link to="/console" onClick={() => setOpen(false)}>Console</Link>}
                <button onClick={async () => { await signOut(); setOpen(false); navigate({ to: "/" }); }} className="text-left">Sair</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)}>Entrar</Link>
            )}
            <Link
              to="/ativacao"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center h-12 px-6 rounded-full bg-ink text-paper text-sm font-semibold tracking-wide w-fit"
            >
              ATIVAR
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
