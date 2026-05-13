import { Link } from "@tanstack/react-router";
import logoSrc from "@/assets/logo.png";
import { MessageCircle, Clock } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-border/60 bg-paper">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-14 md:py-20 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-1">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <img src={logoSrc} alt="Filro" className="h-10 w-auto object-contain" />
            <span className="font-display font-black text-2xl text-ink">Filro</span>
          </Link>
          <p className="mt-4 text-sm text-ink-soft max-w-xs">
            Presença digital pronta para negócios locais. Entrega em <strong className="text-ink">24 horas</strong>.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-flame/10 text-flame text-xs font-semibold">
            <Clock className="h-3.5 w-3.5" /> Garantia de entrega 24h
          </div>
        </div>
        <div className="text-sm text-ink-soft">
          <div className="font-semibold text-ink mb-4">Produto</div>
          <ul className="space-y-2.5">
            <li><a href="/#modelos" className="hover:text-ink transition-colors">Modelos</a></li>
            <li><a href="/#como-funciona" className="hover:text-ink transition-colors">Como funciona</a></li>
            <li><a href="/#ativacao" className="hover:text-ink transition-colors">Planos</a></li>
            <li><Link to="/login" className="hover:text-ink transition-colors">Entrar</Link></li>
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
          <a href="https://wa.me/5511999999999" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 h-11 px-4 rounded-2xl bg-lime text-ink font-semibold text-sm hover:scale-105 transition">
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </a>
          <p className="mt-4 text-xs">contato@filro.app</p>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-5 text-xs text-ink-soft flex flex-wrap justify-between gap-3">
          <span>© {new Date().getFullYear()} Filro. Todos os direitos reservados.</span>
          <span>Feito com cuidado · entrega em 24h ou mês grátis</span>
        </div>
      </div>
    </footer>
  );
}
