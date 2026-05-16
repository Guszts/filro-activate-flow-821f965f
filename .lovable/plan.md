# Programa de Parceiro Comercial (B2B Privado)

Implementar atribuição de vendas por código de parceiro, cálculo de comissão sobre **ativação apenas** e gestão no Console. Sem painel público, sem Stripe Connect, repasse manual via Pix.

## 1. Banco de dados (migration única)

Criar 4 tabelas + seed do parceiro `tio`:

- **`partners`** — cadastro do parceiro (code único, pix_key, commission_rate default 50%, status: active/paused/blocked).
- **`partner_referrals`** — uma linha por checkout iniciado com `?ref=`. Único por `stripe_checkout_session_id`. Status: started/checkout_created/paid/cancelled/refunded.
- **`partner_commissions`** — comissão calculada na confirmação do pagamento. Único por `stripe_checkout_session_id` (garante idempotência). Status: pending/approved/paid/cancelled. Inclui `activation_amount`, `monthly_amount`, `base_amount`, `commission_rate`, `commission_amount` (todos em centavos).
- **`partner_payouts`** — registro do Pix manual. method: pix/bank_transfer/cash/other.

**Seed:** `INSERT ... ON CONFLICT (code) DO NOTHING` para criar `tio` com 50% activation_only.

**RLS:** ativado em todas. Apenas admins (`has_role(auth.uid(),'admin')`) leem/escrevem. Webhook usa `supabaseAdmin` (service role bypassa RLS). Sem políticas para anon.

Índices nas colunas de busca (code, status, partner_id, session_id, available_at).

## 2. Captura do código (frontend)

Novo módulo `src/lib/partner.ts`:

- Lê `?ref|partner|parceiro|codigo` da URL na montagem do app (em `__root.tsx`).
- Valida: 3–40 chars, `[a-z0-9_-]`, minúsculo.
- Persiste em `localStorage['filro:partnerCode']` + cookie `filro_partner_code` (30 dias).
- Helper `getStoredPartnerCode()` lê o valor (preferindo localStorage, fallback cookie).

Sem banner, sem UI visível pro visitante.

## 3. Checkout

Editar `src/lib/payments.functions.ts`:

- `createPlanCheckoutSession` aceita `partnerCode?: string` opcional no input.
- Valida formato. Faz lookup em `partners` (admin client) com `status='active'`.
- Se parceiro válido: adiciona `partnerId`, `partnerCode`, `commissionRate`, `commissionScope` ao `metadata` da sessão Stripe **e** ao `subscription_data.metadata`.
- Se inválido/inexistente/pausado: segue checkout normal sem comissão, sem erro.
- Loga evento `partner.checkout_created`.

Editar `src/routes/checkout.tsx`:

- Lê `getStoredPartnerCode()` antes de chamar `createPlanCheckoutSession` e envia no payload.

## 4. Webhook Stripe

Editar `src/routes/api/public/payments/webhook.ts` no case `checkout.session.completed`, **depois** do insert em `payments`:

1. Ler `partnerId/partnerCode/commissionRate` do `session.metadata`. Se ausente: pula.
2. Revalidar parceiro no banco (`status='active'`).
3. Calcular: `base_amount = plan.activation_price`, `commission_amount = round(base * rate / 100)`.
4. Upsert em `partner_referrals` por `stripe_checkout_session_id` → status `paid`, `converted_at = now()`.
5. Insert em `partner_commissions` com `ON CONFLICT (stripe_checkout_session_id) DO NOTHING` (idempotência forte). Status `pending`, `available_at = now()`.
6. Loga `partner.commission_created`.

`invoice.payment_succeeded` **não** cria comissão (já pulava o billing_reason inicial — só processa renovações, que não geram comissão por regra).

## 5. Console — aba "Parceiro"

Adicionar aba `partner` ao `src/routes/console.tsx` e criar `src/components/console/PartnerTab.tsx`:

**Seções:**

1. **Resumo financeiro** — 6 cards: total gerado, pendente, aprovada, paga, a pagar agora (pending+approved), receita recorrente preservada (soma de `monthly_amount` em comissões pagas+pendentes).
2. **Parceiro atual** — card com nome, código, link `https://setup.filro.site/?ref=<code>`, WhatsApp, Pix, comissão, status. Botão "Copiar link" e modal "Editar parceiro" (nome, email, whatsapp, pix_key, commission_rate, status, notes).
3. **Comissões** — tabela com colunas data/parceiro/cliente/plano/ativação/mensalidade/%/comissão/status/disponível em/pago em/ações. Ações: Aprovar, Marcar paga (abre modal com método+observação, cria payout, atualiza commission), Cancelar (modal com motivo: reembolso/cancelada/erro/fraude/outro).
4. **Indicações/Vendas** — tabela de `partner_referrals`.
5. **Repasses** — tabela de `partner_payouts`.

Mutações via server functions em `src/lib/partner.functions.ts` (admin-only, usa `requireSupabaseAuth` + checagem `has_role`):

- `updatePartner`, `approveCommission`, `cancelCommission`, `payCommission` (cria payout + atualiza commission atomicamente).

UI segue padrão existente (cards/tabelas/StatusBadge), responsivo mobile, sem emojis.

## 6. Detalhes técnicos

- Valores em centavos no banco, `formatBRL()` já existe em `src/lib/format.ts`.
- Tipos Supabase regenerados automaticamente após migration.
- Sem alteração em rotas públicas, planos, ou fluxo de pagamento existente além dos pontos listados.

## Arquivos novos
- `src/lib/partner.ts` (captura/persistência client-side)
- `src/lib/partner.functions.ts` (server fns admin)
- `src/components/console/PartnerTab.tsx`
- Migration SQL (4 tabelas + seed)

## Arquivos editados
- `src/routes/__root.tsx` — captura `?ref=` no mount
- `src/lib/payments.functions.ts` — aceita partnerCode + metadata
- `src/routes/checkout.tsx` — envia partnerCode
- `src/routes/api/public/payments/webhook.ts` — cria referral+commission
- `src/routes/console.tsx` — nova aba "Parceiro"
