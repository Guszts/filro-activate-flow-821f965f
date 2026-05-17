# Plano: Flaro Dev — rota `/dev`

Produto novo dentro do Filro: usuário escolhe um modelo de site, envia briefing, paga um plano Dev, recebe um projeto estruturado e pede alterações por um chatbot que **classifica** (não edita). Admin executa as mudanças no console.

Tabelas `dev_*` separadas, planos Dev convivem com os planos atuais, checkout reaproveita Stripe existente. Nada do que já existe é removido.

---

## Execução em 6 fases — você aprova entre cada uma

### Fase 1 — Landing pública `/dev` + catálogo + planos (sem backend novo)
- `src/routes/dev.tsx` (landing) + `src/routes/dev.modelos.tsx` + `src/routes/dev.modelos.$slug.tsx`
- Componentes: `DevHero`, `DevHowItWorks`, `DevTemplateCatalog`, `DevTemplateCard`, `DevTemplateDetails`, `DevPlanCard`, `DevFAQ`
- Seed dos 6 modelos e 4 planos como constantes em `src/lib/dev/templates.ts` e `src/lib/dev/plans.ts` (sem banco ainda — vira tabela na Fase 2)
- Link no `SiteFooter` ("Flaro Dev")
- SEO: head() por rota, canonical, og
- **Sem risco** para checkout / console / public site existentes

### Fase 2 — Banco, briefing, criação de projeto, checkout
- Migration: `dev_templates`, `dev_plans`, `dev_projects`, `dev_project_versions` (+ RLS)
- Seed das 6 templates e 4 planos para as tabelas
- `dev_plans` ganha `stripe_product_id` / `stripe_price_activation_id` / `stripe_price_monthly_id`; criação dos produtos no Stripe via `payments--batch_create_product`
- Rota `/dev/briefing` — wizard de 10 steps com autosave (server fn `saveDevBriefingDraft`)
- Rota `/dev/checkout` — reutiliza `src/lib/payments.functions.ts` (cria session com price activation + subscription monthly do plano Dev)
- Webhook `src/routes/api/public/payments/webhook.ts` aprende `dev_*` metadata e cria registro em `dev_projects` no sucesso
- `generateDevSiteStructure` (server fn): monta `generated_site` jsonb a partir do template + briefing (puro JS, sem IA — determinístico)
- Rota `/dev/meus-projetos` lista projetos do usuário

### Fase 3 — Workspace do projeto + preview
- Rota `/dev/projeto/$id` — header de status, créditos, briefing summary, timeline, CTAs
- Rota `/dev/projeto/$id/preview` — `DevGeneratedSitePreview` renderiza `generated_site` (desktop/mobile toggle, placeholders "Informação pendente")
- Integração com painel do cliente: bloco "Meus projetos Dev" em `/painel`
- RLS valida ownership em toda leitura

### Fase 4 — Chatbot editor (classificador via Lovable AI)
- Tabelas: `dev_chat_messages`, `dev_change_requests`
- Rota `/dev/projeto/$id/editor` — UI 3 colunas (resumo / chat / changelog), mobile com tabs
- Server fn `streamDevChat` usando AI SDK + Lovable Gateway (`google/gemini-3-flash-preview`)
- Tool `classifyChangeRequest` com `Output.object` (Zod): retorna `{classification, summary, credit_cost, needs_admin, user_visible_response}`
- Fluxo:
  1. Usuário escreve pedido
  2. IA classifica e responde com proposta + custo em créditos
  3. Botão "Confirmar pedido" → `createDevChangeTask` server fn deduz crédito e cria registro em `dev_change_requests` (status `pending`) + `admin_tasks`
  4. IA **nunca** muta `generated_site` direto; só admin marca como aplicado
- Validação Zod no servidor antes de gravar
- Quick prompts (chips) acima do input
- Status badges, histórico persistido, sem fingir que editou

### Fase 5 — Publish flow + cobranças extras + emails
- Tabelas: `dev_publish_requests`, `dev_extra_charges`
- Rota `/dev/projeto/$id/publicar` — form de publicação, status realista (sem prometer DNS automático)
- Major changes (classificação da IA) → cria `dev_extra_charges` (reutiliza fluxo de `extra_charges` existente, com `dev_project_id`)
- 7 templates de email em `src/lib/email-templates/dev-*.tsx`: briefing recebido, site estruturado, alteração recebida/aplicada, cobrança extra, publicação solicitada/publicado
- Notificação admin nos mesmos eventos

### Fase 6 — Console admin
- Nova aba "Flaro Dev" em `/console`: `DevAdminProjectTable` (filtros por status/plano/template), `DevAdminProjectDetails`, `DevAdminChangeRequestPanel`, `DevAdminTemplateManager`, `DevAdminPlanManager`
- Admin pode: ver briefing/site/chat, aprovar/aplicar mudanças, criar cobrança extra, atualizar status, definir `public_url`, gerenciar templates/planos
- Reaproveita componentes existentes do console (Kanban, tabs)

---

## Schema resumido (Fase 2-5)

```text
dev_templates       slug, name, segment, description, sections jsonb, recommended_plan, is_active
dev_plans           slug, name, activation_price, monthly_price, monthly_change_credits,
                    features jsonb, stripe_product_id, stripe_price_activation_id,
                    stripe_price_monthly_id, is_active
dev_projects        user_id, template_id, plan_id, business_name, project_name, status,
                    briefing_data jsonb, generated_site jsonb, current_version_id,
                    remaining_change_credits, payment_status, subscription_id,
                    public_url, requested_domain
dev_project_versions   project_id, version_number, generated_site jsonb, change_summary, created_by
dev_change_requests    project_id, user_id, message, classification, status,
                       credit_cost, admin_notes, before_data jsonb, proposed_changes jsonb, applied_at
dev_chat_messages      project_id, user_id, role, content, metadata jsonb
dev_publish_requests   project_id, user_id, domain_type, requested_domain, dns_access, status, admin_notes
dev_extra_charges      project_id, user_id, change_request_id, title, description, amount,
                       status, payment_link
```

RLS: usuário só vê linhas com `user_id = auth.uid()`; admin via `has_role(auth.uid(), 'admin')`. Templates/planos ativos públicos para leitura.

---

## Regras invioláveis (todas as fases)

1. Não tocar em `plans`, `payments`, `subscriptions`, `projects`, `console`, `/painel`, `/checkout` existentes
2. Reutilizar `payments.functions.ts`, `stripe.server.ts`, webhook, `email/send.server.ts`, `auth.tsx`, `requireSupabaseAuth`
3. IA só **classifica** — admin executa
4. Créditos só descontam após confirmação do usuário
5. Major change → cobrança extra (não consome crédito)
6. Sem promessas falsas ("site pronto em segundos", "DNS automático")
7. Português BR profissional, identidade visual atual da Filro

---

## O que vou fazer agora

Aguardar sua aprovação e começar pela **Fase 1** (landing + catálogo + planos, sem banco). Ao final da Fase 1 paro, mostro funcionando, e você decide se quer seguir para a Fase 2.
