import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/privacidade")({
  component: PrivacyPage,
  head: () => ({ meta: [
    { title: "Política de Privacidade · Filro" },
    { name: "description", content: "Como a Filro coleta, usa e protege seus dados, em conformidade com a LGPD." },
  ]}),
});

function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="mx-auto max-w-3xl w-full px-5 md:px-10 py-12 md:py-20 flex-1">
        <span className="text-xs tracking-wide text-ink-soft">Atualizado em 13 de maio de 2026 · Conforme LGPD</span>
        <h1 className="mt-4 editorial-headline text-5xl md:text-6xl text-ink">Política de Privacidade</h1>
        <article className="mt-10 space-y-6 text-ink-soft leading-relaxed [&_h2]:text-ink [&_h2]:font-display [&_h2]:font-black [&_h2]:text-2xl [&_h2]:mt-10 [&_h2]:mb-3 [&_strong]:text-ink [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
          <h2>1. Dados que coletamos</h2>
          <ul>
            <li><strong>Cadastro:</strong> nome, email, WhatsApp, nome do negócio, segmento, senha (hash).</li>
            <li><strong>Informações do negócio:</strong> tudo que você envia no formulário (logo, fotos, descrições).</li>
            <li><strong>Pagamento:</strong> processado pelo Stripe; nós nunca armazenamos dados de cartão.</li>
            <li><strong>Uso:</strong> logs técnicos, IP e user-agent para segurança.</li>
          </ul>
          <h2>2. Para que usamos</h2>
          <ul>
            <li>Produzir e entregar sua presença digital.</li>
            <li>Comunicação por email e WhatsApp sobre seu projeto.</li>
            <li>Cumprimento de obrigações legais e fiscais.</li>
          </ul>
          <h2>3. Com quem compartilhamos</h2>
          <p>Nunca vendemos seus dados. Compartilhamos apenas com operadores essenciais:</p>
          <ul>
            <li>Stripe (pagamento)</li>
            <li>Cloudflare (hospedagem)</li>
            <li>Lovable Cloud / Supabase (banco de dados)</li>
          </ul>
          <h2>4. Seus direitos (LGPD)</h2>
          <p>Você pode, a qualquer tempo: acessar, corrigir, exportar, anonimizar ou excluir seus dados. Solicite via <a href="mailto:filro.site@gmail.com" className="text-ink underline">filro.site@gmail.com</a>; respondemos em até 15 dias.</p>
          <h2>5. Retenção</h2>
          <p>Mantemos dados enquanto sua conta está ativa e por 5 anos após o cancelamento (obrigação fiscal). Logs técnicos: 90 dias.</p>
          <h2>6. Segurança</h2>
          <p>Criptografia em trânsito (HTTPS) e em repouso (AES-256). Acesso interno restrito por função, com auditoria.</p>
          <h2>7. Cookies</h2>
          <p>Usamos cookies estritamente necessários (sessão, autenticação) e analíticos anonimizados. Não utilizamos cookies de publicidade de terceiros.</p>
          <h2>8. Alterações</h2>
          <p>Notificaremos alterações relevantes por email com 30 dias de antecedência.</p>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
