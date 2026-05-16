# Plano — Transformar Filro em máquina operacional

Escopo aprovado: 4 blocos no nível **completo e polido**, em ondas separadas + correção do `.env`. Cada onda termina em estado utilizável antes de seguir para a próxima.

---

## Onda 0 — Segurança `.env` (imediata, ~5min)

- Remover `.env`, `.env.production`, `.env.development` do versionamento.
- Atualizar `.gitignore` para ignorar `.env*` exceto `.env.example`.
- `.env.example` já existe — só conferir que cobre todas as chaves usadas.
- Sem rotação de chaves (são publicáveis/anon, baixo risco real).

---

## Onda 1 — Páginas comerciais (sem backend, ~rápida)

Três páginas/seções novas que reforçam conversão sem mexer em dados:

1. **`/comparar` — tabela comparativa de planos**
   - Colunas: todos os planos ativos (lidos do banco, ordenados por `display_order`).
   - Linhas: páginas, catálogo, animações, SEO, domínio, suporte, prazo, revisões, integrações, analytics, prioridade.
   - Linha de preço (ativação + mensal) + CTA por coluna.
   - Linkado do header e da página de planos.

2. **`/como-funciona` — reforço operacional**
   - Já existe — reescrever conteúdo em 7 passos claros (Escolha → Pague → Envie infos → Filro monta → Você revisa → Publicação → Manutenção mensal).
   - Adicionar prazos estimados por etapa, ícones, prova social leve (sem inventar depoimentos).

3. **`/garantia` — segurança e confiança**
   - Pagamento seguro (Stripe), sem fidelidade, cancele quando quiser, dados protegidos (LGPD), processo documentado, suporte humano, revisão antes de publicar.
   - CTA para `/planos`.

- Adicionar links no `SiteHeader` e `SiteFooter`.
- Incluir as 3 novas rotas no `sitemap.xml.ts`.
- SEO completo: `head()` por rota com title/description/og únicos.

---

## Onda 2 — Fluxo de status + Kanban admin (backend pesado)

### Schema (migration)
- Expandir enum `project_status` para: `paid`, `briefing_pending`, `briefing_received`, `in_production`, `awaiting_client`, `revision_sent`, `published`, `maintenance`, `canceled`.
- Adicionar em `projects`:
  - `priority text` (low/normal/high)
  - `deadline_at timestamptz`
  - `published_url text`
  - `internal_notes text` (admin-only)
  - `preview_url text`
- Nova tabela `project_status_history` (project_id, from_status, to_status, changed_by, note, created_at) com RLS: admin lê tudo, cliente lê do próprio projeto.
- Trigger para registrar histórico em UPDATE de `project_status`.

### UI Console (`/console`)
- Nova aba "Kanban" com colunas por status.
- Card: business_name, plano, WhatsApp (botão direto `wa.me`), data compra, prazo (com cor se atrasado), status, link projeto, observações internas (popover).
- Drag-and-drop entre colunas → atualiza status + grava histórico.
- Filtros: plano, prioridade, atrasados, inadimplentes.
- Toggle "Lista" ↔ "Kanban".

### UI Painel cliente (`/painel`)
- Mostrar status atual com badge colorido + descrição amigável.
- Timeline visual do projeto (status atuais + próximos).

---

## Onda 3 — Página de entrega + ciclo de revisão (frontend + schema leve)

### Schema (migration)
- Nova tabela `project_revisions`:
  - project_id, requested_by, type (`approval`, `change_request`), message, attachments (jsonb), status (`pending`, `in_progress`, `done`, `rejected`), admin_response, created_at, resolved_at.
- RLS: cliente CRUD nos próprios; admin tudo.

### Rota `/projeto/$id`
- Cliente acessa via link do painel.
- Mostra: status, plano, datas, preview_url (iframe ou botão), published_url, infos enviadas (read-only), histórico de revisões.
- Botão **"Aprovar entrega"** → muda status para `published`.
- Botão **"Solicitar ajuste"** → modal com mensagem + anexo opcional → cria revision.
- Histórico cronológico (status + revisões mesclados).

### Console admin
- Aba "Revisões" — fila de revisions pending/in_progress.
- Botão "Marcar como feito" + resposta opcional → notifica cliente (email).

### Email (template novo)
- `revision-received` (para admin quando cliente solicita ajuste).
- `revision-resolved` (para cliente quando admin marca como feito).
- `preview-ready` (para cliente quando admin envia preview_url).

---

## Onda 4 — Suporte + alterações + upsell + inadimplência

### Schema (migration)
- Tabela `support_tickets`: project_id, user_id, type (`change`, `bug`, `question`, `cancel`, `domain`, `payment`), priority, subject, message, status (`open`, `in_progress`, `resolved`, `closed`), created_at, resolved_at.
- Tabela `ticket_messages` (thread): ticket_id, author_id, is_admin, message, attachments, created_at.
- Tabela `change_requests` (subtipo especial): ticket_id, scope (`small`, `medium`, `large`), old_content, new_content, image_url, page_url, status, extra_charge_id (FK opcional).
- Tabela `extra_charges`: project_id, user_id, name, description, amount_cents, status (`draft`, `sent`, `paid`, `canceled`), stripe_checkout_url, stripe_payment_intent_id, created_at, paid_at.
- Ampliar `subscriptions` (status já existe) + computar `payment_status` derivado no painel: `in_good_standing`, `past_due`, `suspended`.

### UI Painel cliente
- Aba **"Suporte"** — lista tickets, abrir novo (form com tipo/prioridade/mensagem/anexo), thread de mensagens.
- Aba **"Solicitar alteração"** — form guiado (o que mudar, antigo, novo, imagem, urgência) → cria ticket tipo `change`.
- Banner se `payment_status != in_good_standing`: alerta + botão "Regularizar" (abre portal Stripe).
- Aba **"Cobranças extras"** — lista charges com botão "Pagar" (abre checkout Stripe).

### Console admin
- Aba **"Suporte"** — fila de tickets com filtros (tipo, prioridade, status).
- Detalhe do ticket: thread, marcar status, atribuir escopo (small/medium/large), botão "Gerar cobrança extra" → cria `extra_charges` + Stripe Checkout one-time + envia email com link.
- Aba **"Cobranças"** — lista de extra_charges + status de pagamento.
- Aba **"Inadimplência"** — projetos com `past_due` (lê de `subscriptions`), botões "Notificar", "Suspender", "Reativar".

### Stripe / server functions
- `createExtraChargeCheckout` (one-time payment, mode: `payment`, metadata projectId+chargeId).
- Webhook já existente trata `checkout.session.completed` — adicionar branch para marcar `extra_charges.status = paid`.
- `createPortalSession` já existe via padrão Stripe — só expor botão.

### Email (novos templates)
- `ticket-opened` (admin).
- `ticket-replied` (cliente quando admin responde).
- `extra-charge-sent` (cliente, com link de pagamento).
- `payment-past-due` (cliente, dunning leve).
- `project-suspended` (cliente).

### Regra de escopo visível
- No form de solicitação de alteração: aviso fixo "Manutenção inclui pequenas alterações. Mudanças grandes, novas páginas, redesigns, automações e integrações são cobrados separadamente."

---

## O que fica para depois (não nesta rodada)

- **Analytics do cliente** (visitas, cliques WhatsApp) + GA/Meta Pixel — requer tracking script + tabela `analytics_events` + jobs de agregação. Onda 5.
- **Sistema de leads recebidos** — depende do analytics. Onda 5.
- **admin_tasks** virar produto real (checklists automáticos por status) — Onda 6, depois que kanban estabilizar.

---

## Sequência de entrega proposta

1. Onda 0 (.env) + Onda 1 (páginas comerciais) — entrego juntas, baixo risco.
2. Confirma → Onda 2 (kanban + status).
3. Confirma → Onda 3 (entrega + revisão).
4. Confirma → Onda 4 (suporte + upsell + inadimplência).

A cada onda você revisa, eu não emendo a próxima sem ok.

---

## Detalhes técnicos

- Toda nova tabela: RLS ativo, policies via `has_role(auth.uid(), 'admin')` para admin + `auth.uid() = user_id` para cliente.
- Mutations sensíveis em `createServerFn` com `requireSupabaseAuth`; admin checks server-side com `has_role`.
- Histórico de status via trigger no Postgres (não em código).
- Emails via `sendTransactionalEmailServer` (já existe).
- Drag-and-drop kanban: `@dnd-kit/core` (já comum no stack).
- Stripe extras: `mode: 'payment'` (one-time), `managed_payments: { enabled: true }` para herdar tax compliance.
- Realtime no kanban e em `/projeto/$id` via Supabase channel.
- Sitemap atualizado a cada onda que adiciona rota pública.
