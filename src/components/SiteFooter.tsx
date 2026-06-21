import { Link } from "@tanstack/react-router";


export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-border/60 bg-paper">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-14 md:py-20 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-1">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <span className="font-display font-black text-2xl text-ink tracking-tight">Filro</span>
          </Link>
          <p className="mt-4 text-sm text-ink-soft max-w-xs">
            Estrutura simples para transformar Instagram, Google e WhatsApp em pedidos de orçamento para negócios locais.
          </p>
        </div>
        <div className="text-sm text-ink-soft">
          <div className="font-semibold text-ink mb-4">Produto</div>
          <ul className="space-y-2.5">
            <li><Link to="/modelos" className="hover:text-ink transition-colors">Modelos</Link></li>
            <li><Link to="/como-funciona" className="hover:text-ink transition-colors">Como funciona</Link></li>
            <li><Link to="/planos" className="hover:text-ink transition-colors">Planos</Link></li>
            <li><Link to="/comparar" className="hover:text-ink transition-colors">Comparar planos</Link></li>
            <li><Link to="/garantia" className="hover:text-ink transition-colors">Garantia e segurança</Link></li>
            <li>
              <Link
                to="/planos/$slug"
                params={{ slug: "promocional" }}
                className="hover:text-ink transition-colors"
              >
                Promocional
              </Link>
            </li>
          </ul>
        </div>
        <div className="text-sm text-ink-soft">
          <div className="font-semibold text-ink mb-4">Recursos</div>
          <ul className="space-y-2.5">
            <li><Link to="/docs" className="hover:text-ink transition-colors">Documentação</Link></li>
            <li><Link to="/termos" className="hover:text-ink transition-colors">Termos de Uso</Link></li>
            <li><Link to="/privacidade" className="hover:text-ink transition-colors">Privacidade</Link></li>
          </ul>
        </div>
        <div className="text-sm text-ink-soft">
          <div className="font-semibold text-ink mb-4">Contato</div>
          <ul className="space-y-2.5">
            <li>
              <Link to="/docs" className="hover:text-ink transition-colors">
                Central de ajuda
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-5 text-xs text-ink-soft flex flex-wrap justify-between gap-3">
          <span>© {new Date().getFullYear()} Filro. Todos os direitos reservados.</span>
        </div>
      </div>
    </footer>
  );
}
