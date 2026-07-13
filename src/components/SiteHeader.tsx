import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const NAV = [
  { to: "/work", label: "Work" },
  { to: "/services", label: "Services" },
  { to: "/process", label: "Process" },
  { to: "/pricing", label: "Pricing" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-paper/85 backdrop-blur">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10 h-16 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2">
          <span className="font-display font-black text-xl tracking-tight text-ink">Filro</span>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-ink-soft">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="hover:text-ink transition-colors"
              activeProps={{ className: "text-ink" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm font-medium text-ink-soft hover:text-ink transition-colors"
          >
            Sign in
          </Link>
          <Link
            to="/get-started"
            className="inline-flex h-10 items-center rounded-full bg-ink px-5 text-sm font-semibold text-paper hover:opacity-90 transition"
          >
            Get a written plan
          </Link>
        </div>
        <button
          type="button"
          className="md:hidden p-2 -mr-2 text-ink"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-border/60 bg-paper">
          <div className="px-5 py-4 flex flex-col gap-3 text-sm">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="py-2 text-ink"
              >
                {n.label}
              </Link>
            ))}
            <div className="border-t border-border/60 pt-3 flex flex-col gap-2">
              <Link to="/login" onClick={() => setOpen(false)} className="py-2 text-ink-soft">
                Sign in
              </Link>
              <Link
                to="/get-started"
                onClick={() => setOpen(false)}
                className="inline-flex h-11 items-center justify-center rounded-full bg-ink px-5 text-sm font-semibold text-paper"
              >
                Get a written plan
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
