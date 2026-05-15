import { Link } from "@tanstack/react-router";

const WA_NUMBER = "5592993561754";
const WA_MSG = encodeURIComponent(
  "Olá! Vim do site da Filro e gostaria de tirar uma dúvida sobre os planos / ativação."
);
const EMAIL = "filro.site@gmail.com";
const EMAIL_SUBJECT = encodeURIComponent("Suporte Filro");
const EMAIL_BODY = encodeURIComponent(
  "Olá, equipe Filro!\n\nVim pelo site e gostaria de falar sobre:\n\n"
);

export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-border/60 bg-paper">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-14 md:py-20 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-1">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <span className="font-display font-black text-2xl text-ink tracking-tight">Filro</span>
          </Link>
          <p className="mt-4 text-sm text-ink-soft max-w-xs">
            Presença digital pronta para negócios locais. Modelos, ativação guiada e manutenção sem complicação.
          </p>
        </div>
        <div className="text-sm text-ink-soft">
          <div className="font-semibold text-ink mb-4">Produto</div>
          <ul className="space-y-2.5">
            <li><Link to="/modelos" className="hover:text-ink transition-colors">Modelos</Link></li>
            <li><Link to="/como-funciona" className="hover:text-ink transition-colors">Como funciona</Link></li>
            <li><Link to="/planos" className="hover:text-ink transition-colors">Planos</Link></li>
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
              <a
                href={`https://wa.me/${WA_NUMBER}?text=${WA_MSG}`}
                target="_blank"
                rel="noreferrer"
                className="hover:text-ink transition-colors underline-offset-4 hover:underline"
              >
                WhatsApp · +55 92 99356-1754
              </a>
            </li>
            <li>
              <a
                href={`mailto:${EMAIL}?subject=${EMAIL_SUBJECT}&body=${EMAIL_BODY}`}
                className="hover:text-ink transition-colors underline-offset-4 hover:underline break-all"
              >
                {EMAIL}
              </a>
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
