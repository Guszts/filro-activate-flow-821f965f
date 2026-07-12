# Filro US Remodel — Phase 0 Audit

Read-only inventory before any code changes. Locks in current state so nothing is deleted by accident.

## 1. Current live plans (DB)

| slug | name | activation | monthly | active | hidden | order |
|---|---|---|---|---|---|---|
| start | Start | R$197 | R$97 | yes | no | 1 |
| essencial | Essencial | R$297 | R$49 | yes | no | 2 |
| plus | Plus | R$497 | R$97 | yes | no | 3 |
| profissional | Profissional | R$497 | R$79 | yes | no | 4 |
| priority | Priority | R$797 | R$97 | yes | no | 5 |
| premium | Premium | R$897 | R$129 | yes | no | 6 |
| promocional | Promocional | R$30.90 | R$9.90 | no | yes | 99 |

`plans` table has NO `currency`, `checkout_mode`, `badge`, `delivery_window`, `maintenance_features`, `exclusions`, `cta_label` columns yet. Values assumed BRL, stored in centavos. Phase 1 migration must add all seven columns and flip every row above to `active=false, hidden=true` (except promocional already hidden).

Legacy slugs mentioned in prior migrations (must also be neutralized if present): `dev_start`, `dev_plus`, `dev_pro`, `dev_scale` (dev_plans table — parallel test structure, leave alone).

## 2. Route files — PT/BR surface

**Public marketing**
- `index.tsx` — PT hero/sections + PT `head()`.
- `como-funciona.tsx`, `comparar.tsx`, `docs.tsx`, `garantia.tsx` — full PT body + head.
- `planos.index.tsx`, `planos.$slug.tsx` — PT chrome; `planos.$slug.tsx:79-97` hardcoded `EXTRAS_BY_SLUG` copy per PT slug; `head()` pulls PT `plan.description`.
- `modelos.tsx` + 7 model pages (`clinica-local`, `restaurante-cardapio`, `oficina-auto`, `loja-local`, `prestador-servico`, `landing-vendas`, `viagem-wishes`) — all PT slugs, PT copy, `modelos.viagem-wishes.tsx` has BRL price labels ("R$ 7.490") in many data arrays.

**Checkout / payment**
- `checkout.tsx` — PT toasts/H1.
- `payment-success.tsx`, `payment-failed.tsx` — PT.

**Auth**
- `login.tsx`, `register.tsx`, `verify-email.tsx` — PT titles, toasts, copy.

**Console / customer area**
- `console.tsx` (admin) — PT section labels, `formatBRL` metrics.
- `painel.tsx` (customer) — PT greeting/toasts/tables.
- `settings.tsx` — extensive PT toasts.
- `lead.$id.tsx`, `projeto.$id.tsx` — PT; `projeto.$id.tsx:44-53` `STATUS_META` map holds every project-status label/description in PT.
- `business-info.tsx` — PT intake form (needs full deep read in Phase 4; may contain BR-specific fields).
- `suporte.tsx` — PT support tab.

**Legal**
- `termos.tsx` — PT 10-section terms, "horário de Brasília", `wa.me/5592...`.
- `privacidade.tsx` — PT LGPD policy, WhatsApp contact.

**Global**
- `__root.tsx` — `<html lang="pt-BR">`, PT title/description/OG/Twitter/JSON-LD.
- `sitemap.xml.ts` — PT URL slugs.
- `oauth.authorize.tsx`, `unsubscribe.tsx`, `email/unsubscribe.ts` — needs deep read.

## 3. Reusable components with PT strings

- `SiteHeader.tsx`, `SiteFooter.tsx` — nav labels and legal links.
- `FAQ.tsx` — entire dataset PT with BRL prices, Pix, WhatsApp mentions.
- `PlanCard.tsx` — "ativação · depois … /mês de manutenção", "Selecionar plano".
- `PaymentTestModeBanner.tsx` — PT (already partly touched).
- `FlaroChat.tsx` — PT greeting, intent keywords, placeholder, aria-label.
- `VideoHero.tsx`, `TutorialVideo.tsx` — PT aria/labels.
- `ModelGrid.tsx` — PT card copy for all model previews.
- `SubscriptionCancellationModals.tsx` — PT modal chain.
- `console/*` — CouponsTab, DashboardTab, PartnerTab, SupportAndCharges all PT, using `formatBRL`.
- `settings/McpTokensSection.tsx` — PT.

## 4. Email templates

All 15 templates under `src/lib/email-templates/` are PT with `lang="pt-BR"`. Subjects PT, including dynamic subjects in `extra-charge-issued`, `order-confirmation`, `site-published`, `subscription-canceled`, `support-reply`, `welcome-purchase`. `_brand.ts` `siteName: "Filro"` — safe. `_head.tsx` no PT strings.

Auth-side templates (`signup`, `magic-link`, `recovery`, `invite`, `email-change`, `reauthentication`) also PT.

## 5. Server functions — PT error strings

- `account.functions.ts`, `oauth.functions.ts`, `partner.functions.ts`, `payments.functions.ts` (many), `projects.functions.ts`, `projects-client.functions.ts`, `promo-codes.functions.ts`, `support.functions.ts`, `flaro.functions.ts` (chat prompt explicitly instructs "sempre em português do Brasil").

Clean (no PT hits): `business-assets.functions.ts`, `mcp-tokens.functions.ts`, `plans.functions.ts`.

## 6. Currency / locale / phone

- `src/lib/format.ts` — `formatBRL` + two `Intl.DateTimeFormat("pt-BR")` formatters, imported across console, support, lead, project, payment-success.
- `src/lib/support.functions.ts:11-12`, `src/lib/flaro.functions.ts:67-68` — local `formatBRL` duplicates.
- Hardcoded WhatsApp number `+55 92 99356-1754` / `wa.me/5592993561754` in `docs.tsx:252`, `privacidade.tsx:145`, `termos.tsx:95,105`.
- `termos.tsx:95` references "horário de Brasília" (America/Sao_Paulo).
- `PhoneInput.tsx` — no BR default in the file itself; check call sites in Phase 4.
- No CPF/CNPJ literals found; `business-info.tsx` needs deep read.

## 7. Public assets & SEO

- `public/robots.txt` — mostly EN with one PT comment line.
- `public/llms.txt` — full PT body incl. "## Páginas" and PT page descriptions.
- No hardcoded `PUBLIC_SITE_URL` constant — domain repeated across routes.

## 8. Systems that MUST remain untouched

- Supabase Auth flows, RLS, `has_role`, all migrations older than the new one.
- Stripe connector-gateway client (`src/lib/stripe.server.ts`) — do not swap for direct SDK.
- Webhook at `/api/public/payments/webhook` — behavior preserved, only currency formatting/labels change.
- Business-asset signed-URL flow (`business-assets.functions.ts`).
- MCP + OAuth (`src/routes/api/mcp.ts`, `oauth/*`, `.well-known/*`).
- Email pipeline (`enqueue_email`, queue processor route, `email_send_log`).
- Existing customer records: `profiles`, `projects`, `payments`, `subscriptions`, `partner_*`, `support_*`, `extra_charges`, `promo_codes*`, `events`.

## 9. Open items surfaced for later phases

- Legal placeholders: `LEGAL_BUSINESS_NAME`, `LEGAL_CONTACT_EMAIL`, `LEGAL_ADDRESS`, `LEGAL_COUNTRY`, `GOVERNING_LAW`, `TERMS_VERSION`, `PRIVACY_VERSION` — user input needed before Phase 5.
- Portfolio: whether current model pages have any real client authorization. Default = label everything as "Concept project" per spec §13.
- Domain `filro.site` continues; sitemap URL migration handled in Phase 6.
- WhatsApp: keep as optional secondary contact only; drop as primary. Confirm in Phase 5.

## 10. Ready-for-Phase-1 checklist

- [ ] User approves audit.
- [ ] Phase 1 migration drafted: add plan columns, flip legacy plans, insert `launch/growth/revenue_system/scale`, create `implementation_requests` + `terms_acceptances` tables with RLS + GRANTs.
- [ ] Regenerate `src/integrations/supabase/types.ts` after migration.
