# Plano de melhorias do site Filro

Esse é um conjunto grande de alterações. Vou agrupar por área para você revisar antes de eu começar.

## 1. Cards de planos (home)
- Manter o **Plus** EXATAMENTE como está (já é o card destaque).
- Refinar os outros 5 cards (Start, Essencial, Profissional, Priority, Premium): hierarquia visual mais limpa, melhor uso de espaçamento, micro-animação no hover, ícone discreto por plano, badge "popular" só no Plus.
- O Plus continua com cor/destaque maior para puxar o lead.

## 2. Rodapé do site (`SiteFooter`)
- Remover badge **"Garantia de entrega 24h"** e o texto "Entrega em 24 horas" do parágrafo.
- WhatsApp deixa de ser botão verde — vira link de texto com mensagem pré-pronta: `https://wa.me/5592993561754?text=...`.
- E-mail também vira link `mailto:filro.site@gmail.com?subject=Suporte%20Filro&body=...` em vez de texto puro.
- Remover link **"Entrar"** do rodapé (já existe no header, e some quando logado).
- Esconder rodapé inteiro em **`/planos/:slug`** e **`/settings`**.

## 3. Logo Filro
- Remover `<img>` da logo em `SiteHeader` e `SiteFooter`.
- Manter apenas o nome "Filro" em tipografia arredondada (vou trocar a font-family pra algo mais arredondado, ex. `Quicksand`/`Nunito`, ou aplicar `rounded-display` se já existir no design system).

## 4. Página de plano (`/planos/:slug`)
- Sem rodapé.
- Adicionar mais seções: comparativo rápido com outros planos, depoimentos/prova social estática, "perguntas comuns sobre esse plano", CTA sticky no mobile, badges de garantia/pagamento seguro.
- Melhorar hierarquia (mais respiração entre blocos, melhores headings).

## 5. Navegação lateral (mobile menu) — páginas únicas
- Criar rotas novas:
  - `/modelos` → mesma `ModelGrid` em página própria
  - `/como-funciona` → seção de processo extraída
  - `/planos` → grid de todos os planos (já existe `/planos/:slug` individual)
- Trocar os links âncora `#modelos`, `#como-funciona`, `#ativacao` por `<Link to="/modelos">`, etc. no menu lateral.
- Adicionar item **"Início"** no menu lateral apontando para `/`.

## 6. Chat Flaro — informações atualizadas
- Atualizar `SYSTEM_PROMPT` em `src/lib/flaro.functions.ts` com a tabela real de preços:
  - Start R$ 197 ativação + R$ 97/mês
  - Essencial R$ 297 + R$ 49/mês
  - Plus R$ 497 + R$ 97/mês (destaque)
  - Profissional R$ 497 + R$ 79/mês
  - Priority R$ 797 + R$ 97/mês
  - Premium R$ 897 + R$ 129/mês
- Adicionar resumo do que cada plano inclui, prazo (24h), domínio, formas de pagamento (Stripe), política de cancelamento (sem fidelidade).

## 7. Formulário de informações de negócio por plano
- `/business-info` hoje é único. Vou tornar dinâmico por plano: mostrar campos diferentes baseados no `plan_id` do projeto pago do usuário.
- Definir conjuntos de campos por slug (start = mínimo, premium = completo com mais blocos de conteúdo, fotos extras, links de redes, depoimentos, etc.).
- Salvar tudo em `projects.business_info` (jsonb que já existe).

## 8. Documentação, Termos e Privacidade
- Reescrever `/docs`, `/termos`, `/privacidade` com conteúdo mais robusto, estrutura de seções tipo SaaS profissional (índice lateral, datas de atualização, definições, direitos LGPD, etc.).

## 9. FAQ
- Ampliar `FAQ.tsx` com mais perguntas reais (prazo, cancelamento, domínio, edições, suporte, pagamento, refund, hospedagem, SEO, mobile, integrações, WhatsApp).

---

## Ordem de execução proposta
1. Header/Footer (logo, links, esconder em rotas)
2. Páginas novas (`/modelos`, `/como-funciona`, `/planos`) + menu lateral com "Início"
3. Cards de planos refinados
4. Página `/planos/:slug` mais completa
5. Flaro prompt atualizado
6. Formulário business-info dinâmico por plano
7. Docs / Termos / Privacidade / FAQ

Posso seguir tudo de uma vez ou prefere que eu pause após cada bloco?
