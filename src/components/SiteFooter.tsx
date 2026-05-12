import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-border/60">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-12 md:py-16 grid gap-10 md:grid-cols-3">
        <div>
          <div className="h-3 w-3 rounded-sm bg-ink" />
          <p className="mt-4 text-sm text-ink-soft max-w-xs">
            Páginas profissionais, cardápios digitais, portfólios e sites para negócios locais.
          </p>
        </div>
        <div className="text-sm text-ink-soft">
          <div className="font-semibold text-ink mb-3">Navegação</div>
          <ul className="space-y-2">
            <li><a href="/#modelos">Modelos</a></li>
            <li><a href="/#como-funciona">Como funciona</a></li>
            <li><a href="/#ativacao">Ativação</a></li>
            <li><Link to="/login">Entrar</Link></li>
          </ul>
        </div>
        <div className="text-sm text-ink-soft">
          <div className="font-semibold text-ink mb-3">Contato</div>
          <p>Suporte por WhatsApp após a ativação.</p>
          <p className="mt-6 text-xs">© {new Date().getFullYear()} Filro. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
