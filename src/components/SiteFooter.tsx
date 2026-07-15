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
            Simple structure to turn Instagram, Google and WhatsApp into inbound leads for growing businesses.
          </p>
        </div>
        <div className="text-sm text-ink-soft">
          <div className="font-semibold text-ink mb-4">Produto</div>
          <ul className="space-y-2.5">
            <li><Link to="/modelos" className="hover:text-ink transition-colors">Work</Link></li>
            <li><Link to="/como-funciona" className="hover:text-ink transition-colors">How it works</Link></li>
            <li><Link to="/planos" className="hover:text-ink transition-colors">Plans</Link></li>
            <li><Link to="/comparar" className="hover:text-ink transition-colors">Compare planos</Link></li>
            <li><Link to="/garantia" className="hover:text-ink transition-colors">Guarantee e segurança</Link></li>
          </ul>
        </div>
        <div className="text-sm text-ink-soft">
          <div className="font-semibold text-ink mb-4">Resources</div>
          <ul className="space-y-2.5">
            <li><Link to="/docs" className="hover:text-ink transition-colors">Documentation</Link></li>
            <li><Link to="/termos" className="hover:text-ink transition-colors">Terms of Use</Link></li>
            <li><Link to="/privacidade" className="hover:text-ink transition-colors">Privacy</Link></li>
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
