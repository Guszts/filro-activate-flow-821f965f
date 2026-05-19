import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Menu,
  Plus,
  Mic,
  ArrowUp,
  ChevronDown,
  LayoutGrid,
  CreditCard,
  HelpCircle,
  LifeBuoy,
  LogIn,
  LogOut,
  User as UserIcon,
  FolderOpen,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { DEV_TEMPLATES } from "@/lib/dev/templates";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/dev/")({
  component: DevDashboard,
  head: () => ({
    meta: [
      { title: "Flaro Dev · Crie um site profissional em segundos com IA" },
      {
        name: "description",
        content:
          "Descreva seu negócio, escolha um modelo e receba um site profissional publicado em segundos. Edite conversando com a IA.",
      },
      { property: "og:title", content: "Flaro Dev · Sites profissionais por IA" },
      { property: "og:url", content: "https://setup.filro.site/dev" },
    ],
    links: [{ rel: "canonical", href: "https://setup.filro.site/dev" }],
  }),
});

function DevDashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated, signOut } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const userName =
    (user?.user_metadata as { full_name?: string; name?: string } | undefined)?.full_name ??
    (user?.user_metadata as { name?: string } | undefined)?.name ??
    user?.email?.split("@")[0] ??
    null;

  function submitPrompt() {
    const value = prompt.trim();
    if (!value) {
      navigate({ to: "/dev/novo" });
      return;
    }
    navigate({ to: "/dev/novo", search: { prompt: value } });
  }

  return (
    <div className="min-h-screen flex flex-col bg-ink text-paper">
      {/* TOP BAR — Lovable style */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 h-14 bg-ink/85 backdrop-blur border-b border-paper/5">
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              aria-label="Abrir menu"
              className="h-10 w-10 inline-flex items-center justify-center rounded-full border border-paper/10 bg-paper/[0.04] hover:bg-paper/10 transition-colors"
            >
              <Menu className="h-4 w-4 text-paper" />
            </button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="bg-ink text-paper border-r border-paper/10 p-0 w-[300px] sm:max-w-[320px]"
          >
            <SheetHeader className="px-5 pt-6 pb-4 border-b border-paper/10">
              <SheetTitle className="text-paper text-lg font-semibold tracking-tight">
                Flaro Dev
              </SheetTitle>
              <p className="text-xs text-paper/50 text-left">
                {isAuthenticated ? userName ?? "Sua conta" : "Crie sua conta grátis"}
              </p>
            </SheetHeader>

            <nav className="px-3 py-3 flex flex-col gap-0.5">
              <DrawerLink to="/dev/modelos" icon={LayoutGrid} onSelect={() => setMenuOpen(false)}>
                Modelos
              </DrawerLink>
              <DrawerLink to="/dev/precos" icon={CreditCard} onSelect={() => setMenuOpen(false)}>
                Planos e créditos
              </DrawerLink>
              <DrawerLink to="/como-funciona" icon={HelpCircle} onSelect={() => setMenuOpen(false)}>
                Como funciona
              </DrawerLink>
              {isAuthenticated && (
                <DrawerLink to="/painel" icon={FolderOpen} onSelect={() => setMenuOpen(false)}>
                  Meus projetos
                </DrawerLink>
              )}
              <DrawerLink to="/suporte" icon={LifeBuoy} onSelect={() => setMenuOpen(false)}>
                Suporte
              </DrawerLink>

              <div className="h-px bg-paper/10 my-3" />

              {isAuthenticated ? (
                <>
                  <DrawerLink to="/settings" icon={UserIcon} onSelect={() => setMenuOpen(false)}>
                    Configurações
                  </DrawerLink>
                  <button
                    type="button"
                    onClick={async () => {
                      await signOut();
                      setMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-3 h-11 rounded-xl text-paper/80 hover:bg-paper/[0.06] transition-colors text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm">Sair</span>
                  </button>
                </>
              ) : (
                <DrawerLink to="/login" icon={LogIn} onSelect={() => setMenuOpen(false)}>
                  Entrar
                </DrawerLink>
              )}
            </nav>
          </SheetContent>
        </Sheet>

        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
          <span className="text-base font-semibold tracking-tight">Flaro Dev</span>
        </div>

        <Link
          to={isAuthenticated ? "/painel" : "/login"}
          className="h-10 px-3 inline-flex items-center justify-center rounded-full border border-paper/10 bg-paper/[0.04] hover:bg-paper/10 transition-colors text-xs font-medium"
        >
          {isAuthenticated ? "Painel" : "Entrar"}
        </Link>
      </header>

      {/* HERO with prompt — Lovable mobile clone */}
      <section className="relative flex-1 flex flex-col items-center justify-center px-5 pt-16 pb-24 overflow-hidden">
        {/* aurora background */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-[-10%] h-[70%] opacity-90"
          style={{
            background:
              "radial-gradient(60% 60% at 50% 70%, oklch(0.72 0.22 25 / 0.55), transparent 70%), radial-gradient(50% 50% at 30% 60%, oklch(0.55 0.25 320 / 0.45), transparent 70%), radial-gradient(50% 50% at 70% 60%, oklch(0.55 0.22 260 / 0.45), transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        <div className="relative w-full max-w-[640px] flex flex-col items-center">
          <Link
            to="/dev/modelos"
            className="inline-flex items-center gap-2 h-9 pl-1 pr-4 rounded-full bg-paper/[0.06] border border-paper/10 backdrop-blur hover:bg-paper/10 transition-colors mb-8"
          >
            <span className="inline-flex items-center h-7 px-3 rounded-full bg-flame text-paper text-[11px] font-semibold uppercase tracking-wide">
              Novo
            </span>
            <span className="text-sm text-paper/85">Modelos prontos para começar</span>
          </Link>

          <h1 className="editorial-headline text-3xl sm:text-4xl text-center text-paper text-balance">
            O que você quer criar
            {userName ? <>, <span className="lime-mark">{userName}</span></> : null}?
          </h1>

          {/* Prompt box */}
          <div className="mt-8 w-full rounded-3xl border border-paper/10 bg-paper/[0.05] backdrop-blur-md p-3 shadow-2xl">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submitPrompt();
                }
              }}
              rows={3}
              placeholder="Peça à IA pra criar um site sobre…"
              className="w-full resize-none bg-transparent text-paper placeholder:text-paper/40 text-base px-3 pt-2 pb-3 outline-none"
            />
            <div className="flex items-center gap-2 px-1">
              <button
                type="button"
                aria-label="Adicionar"
                className="h-9 w-9 inline-flex items-center justify-center rounded-full text-paper/70 hover:bg-paper/10 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>

              <button
                type="button"
                className="h-9 inline-flex items-center gap-1 px-3 rounded-full text-paper/85 hover:bg-paper/10 transition-colors text-sm font-medium"
              >
                Build <ChevronDown className="h-3.5 w-3.5 opacity-70" />
              </button>

              <div className="flex-1" />

              <button
                type="button"
                aria-label="Ditado"
                className="h-9 w-9 inline-flex items-center justify-center rounded-full text-paper/70 hover:bg-paper/10 transition-colors"
              >
                <Mic className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={submitPrompt}
                aria-label="Enviar"
                className="h-9 w-9 inline-flex items-center justify-center rounded-full bg-paper text-ink hover:scale-105 active:scale-95 transition-transform"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
          </div>

          <p className="mt-4 text-xs text-paper/50 text-center">
            10 créditos grátis ao se cadastrar · sem cartão
          </p>
        </div>

        {/* scroll hint */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-paper/40 text-[10px] uppercase tracking-widest font-semibold">
          <span>Modelos</span>
          <ChevronDown className="h-3.5 w-3.5 animate-bounce" />
        </div>
      </section>

      {/* TEMPLATES BELOW — scroll down */}
      <section className="bg-paper text-ink rounded-t-[2rem] -mt-6 relative z-10">
        <div className="mx-auto max-w-[1200px] px-5 md:px-10 py-12 md:py-16">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-ink-soft">
                Modelos editáveis
              </span>
              <h2 className="mt-2 editorial-headline text-2xl sm:text-3xl md:text-4xl text-ink">
                Comece por um modelo
              </h2>
            </div>
            <Link
              to="/dev/modelos"
              className="text-sm font-semibold text-ink ink-underline shrink-0"
            >
              Ver todos →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {DEV_TEMPLATES.map((t) => (
              <Link
                key={t.slug}
                to="/dev/modelos/$slug"
                params={{ slug: t.slug }}
                className="group rounded-2xl overflow-hidden border border-border bg-paper hover:border-ink/30 transition-colors"
              >
                <div className="aspect-[16/10] overflow-hidden bg-muted/40">
                  <img
                    src={t.coverImage}
                    alt={`Modelo ${t.name}`}
                    loading="lazy"
                    className="h-full w-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  />
                </div>
                <div className="p-4">
                  <div className="text-[10px] uppercase tracking-widest font-semibold text-flame">
                    {t.segment.split(",")[0]}
                  </div>
                  <div className="mt-1 text-base font-semibold text-ink">{t.name}</div>
                  <p className="mt-1 text-xs text-ink-soft line-clamp-2">{t.description}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/dev/novo"
              className="inline-flex items-center justify-center h-12 px-6 rounded-full bg-ink text-paper text-sm font-semibold w-full sm:w-auto"
            >
              Criar do zero com IA
            </Link>
            <Link
              to="/dev/precos"
              className="inline-flex items-center justify-center h-12 px-6 rounded-full border border-border text-ink text-sm font-semibold w-full sm:w-auto"
            >
              Ver planos e créditos
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function DrawerLink({
  to,
  icon: Icon,
  children,
  onSelect,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  onSelect?: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onSelect}
      className="flex items-center gap-3 px-3 h-11 rounded-xl text-paper/85 hover:bg-paper/[0.06] transition-colors"
    >
      <Icon className="h-4 w-4 opacity-80" />
      <span className="text-sm">{children}</span>
    </Link>
  );
}
