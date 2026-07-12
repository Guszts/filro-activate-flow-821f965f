# Filro US Remodel — Full Phased Plan

Goal: Reposition Filro from a low-cost BR template service into a US digital implementation partner. English-only, USD pricing, new four-plan offer, new lead flow, translated app + emails + legal — preserving every existing system, database row, and functional integration.

Deliver in 7 phases. Each phase ends with a review point so we don't compound risk.

---

## Phase 0 — Preservation audit (no code changes)

Before touching anything I run a read-only audit and commit findings to `.lovable/remodel-audit.md`:

- Every route file under `src/routes/`, its purpose, and current PT copy.
- All PT strings in `src/components/`, `src/lib/`, hooks, server functions.
- Every email template + subject language.
- BRL/pt-BR/CPF/CNPJ/+55/WhatsApp assumptions.
- Sitemap, robots, llms.txt, JSON-LD, canonicals.
- DB tables that store user-visible copy (plans, statuses).

Purpose: safety net so nothing gets accidentally deleted in later phases.

---

## Phase 1 — Data & pricing foundation

Forward-only Supabase migration (no historical edits):

1. Add columns to `plans`: `currency text default 'usd'`, `checkout_mode text default 'direct'` with check constraint (`direct|custom|application`), `badge`, `delivery_window`, `maintenance_features jsonb default '[]'`, `exclusions jsonb default '[]'`, `cta_label`.
2. Set every legacy plan (`start`, `essencial`, `plus`, `profissional`, `priority`, `premium`, `promocional`, plus current live slugs) to `active=false, hidden=true`. Historical rows untouched.
3. Upsert new plans: `launch` ($2,500 + $297/mo), `growth` ($5,000 + $597/mo), `revenue_system` ($10,000 + $997/mo, primary), `scale` ($20,000 + $1,997/mo, `checkout_mode='custom'`). All values in USD cents.
4. Add `implementation_requests` table + RLS (public insert via server fn, admin-only read).
5. `terms_acceptances` table: user_id, plan_slug, terms_version, timestamp, checkout_session_id, ip nullable.
6. Regenerate `src/integrations/supabase/types.ts`.

## Phase 2 — Stripe & currency

1. `formatCurrency(amountInCents, currency)` helper. Replace `formatBRL` at customer-facing sites; historical admin views read the currency stored on the payment row.
2. Update `getPriceLookupKeys` / `createCheckoutSession` in `src/lib/payments.functions.ts`:
   - When resolving by lookup key, validate `currency`, `unit_amount`, `recurring.interval`, `product`, `active`. If mismatch: create new USD price, transfer the lookup key, deactivate old, never reuse a BRL price.
   - Emit new lookup keys: `plan_{launch|growth|revenue_system|scale}_{activation|monthly}`.
   - Scale = no direct checkout; CTA routes to `/get-started`.
3. Checkout page: implementation line item + first-month maintenance, required terms acceptance checkbox writing to `terms_acceptances` before session creation.
4. Preserve webhook, subscriptions, billing portal, partner metadata, cancellation.
5. Keep sandbox/live split (already fixed) and the test-mode banner.

## Phase 3 — Public website in English

Rebuild copy + structure while preserving current design tokens, typography, animations, portfolio imagery.

- **Navigation** (`SiteHeader`, `SiteFooter`): Work / Services / Process / Pricing / FAQ. Right side: Sign in / Get a written plan.
- **Home** (`src/routes/index.tsx`): hero, System summary, Problem, Services, Selected work, Process (7 steps), Pricing, Maintenance, FAQ, Final CTA — exact copy from spec §12.
- **New routes**:
  - `/get-started` — long structured form → `implementation_requests` (honeypot, rate-limit, admin+lead emails, success screen).
  - `/services` — 14 service sections (§14) with "what Filro implements / client provides / dependencies / exclusions / relevant plans".
  - `/process` — dedicated page (extracted from home).
  - `/pricing` — DB-driven, due-today math, all four plans; Scale CTA opens `/get-started`.
  - `/compare` — full matrix (§16 categories).
  - `/security-and-delivery` — replaces `/garantia`.
- **Work** (portfolio): `/work` + `/work/[slug]`. Keep every existing model page; translate to English; relabel as "concept project / demo implementation" (no fake client results). Add project explanation section per §13.
- **Redirects** (in each old route's `beforeLoad`): `/modelos` → `/work`, `/como-funciona` → `/process`, `/planos` → `/pricing`, `/comparar` → `/compare`, `/garantia` → `/security-and-delivery`, `/termos` → `/terms`, `/privacidade` → `/privacy`, `/painel` → `/dashboard`, `/projeto/$id` → `/projects/$id`, `/suporte` → `/support`. Old modules kept until redirects verified.
- **FAQ**: full English rewrite per §17.

## Phase 4 — Application (authenticated) surface

- `/dashboard` (rename `painel.tsx` module or add alias): reposition as implementation portal with the sections in §19 and English project statuses (New → Awaiting payment → … → Maintenance → Canceled).
- Business info route → **Implementation Brief**, 7 steps per §18. Preserve uploads, signed URLs, autosave.
- `/projects/$id`, `/support`, `/settings` — translate. Support request types + response-target language.
- Admin console (`src/components/console/*`, `/painel` admin views): translate + add Implementation Requests tab (Kanban with statuses New → Won/Lost/Archived, notes, "send checkout link" action). Format historical payments in their stored currency.
- Cancellation, extra-charge, coupons, partner tabs — translate copy only.

## Phase 5 — Emails, chat, legal

- Every template in `src/lib/email-templates/*.tsx`: `lang="en"`, English copy, USD, remove Pix / 24h / activation / WhatsApp-only. Update `registry.ts` subjects. Auth email templates (signup, magic link, recovery, invite, verify, reauth) too.
- FlaroChat → **Filro Assistant**: English intents, updated knowledge (new plans, USD, async process, no guaranteed results). Actions: Get a written plan / View pricing / View work / Sign in / Contact support. Drop WhatsApp-only routing.
- Legal (`termos.tsx`/`terms.tsx`, `privacidade.tsx`/`privacy.tsx`): rewrite in English per §24 with configurable constants (`LEGAL_BUSINESS_NAME`, `LEGAL_CONTACT_EMAIL`, `LEGAL_ADDRESS`, `LEGAL_COUNTRY`, `GOVERNING_LAW`, `TERMS_VERSION`, `PRIVACY_VERSION`) in `src/lib/legal.ts`. No fabricated jurisdiction/entity.
- Cookie/analytics consent banner if GA/pixel active.

## Phase 6 — SEO, metadata, i18n audit

- `__root.tsx` head → `lang="en"`, `PUBLIC_SITE_URL` constant, new title/desc from §28.
- Per-route `head()` — English title/desc/OG/Twitter; `noindex,nofollow` on checkout/dashboard/settings/support/admin/OAuth/lead pages.
- JSON-LD: Organization, ProfessionalService, OfferCatalog, FAQPage, BreadcrumbList. No aggregate reviews.
- `sitemap.xml.ts`, `robots.txt`, `llms.txt` regenerated in English with new routes.
- PhoneInput default country US; date/number formatting `en-US`.
- Sweep any remaining PT strings (validation messages, toasts, empty states, error pages, alt text, aria-labels).

## Phase 7 — QA & delivery report

- `bun run build`, typecheck, lint — fix everything I broke.
- Manual smoke test with Playwright: home / pricing / get-started / login / register / checkout sandbox with 4242 / payment success / dashboard / business brief / support / project detail / admin. Mobile + desktop.
- Verify old PT URLs redirect to English canonical.
- Deliver structured report per §32 including anything I couldn't complete and any config values you still need to fill in (`LEGAL_*`, US business address, etc.).

---

## Technical details

- **No history mutations.** All plan and Stripe changes are additive; old rows/payments/subscriptions keep their BRL currency and legacy slugs so existing customers see their real plan.
- **RLS everywhere.** New tables (`implementation_requests`, `terms_acceptances`) enable RLS with grants and `has_role`-based admin policies; public insert only via server functions with input validation.
- **Server functions only** for privileged writes; `/api/public/*` reserved for webhooks / cron.
- **Route tree** regenerated by TanStack plugin; I don't hand-edit `routeTree.gen.ts`.
- **No secret exposure** — all Stripe/Supabase secrets stay in server modules per the existing pattern (`stripe.server.ts`, `client.server.ts`).
- **Design system** — reuse existing tokens in `src/styles.css`; no new global palette introduced. Framer Motion, shadcn, existing typography kept intact.

---

## Open items I need your confirmation on before Phase 5

Not blocking Phases 1–4, but I'll need answers before finalizing legal + email templates:

- Legal entity name, contact email, mailing address, country, governing law — or "leave placeholder and I'll fill later".
- Confirm the current WhatsApp number (if any) stays as an optional secondary contact or is removed entirely.
- Any real client logos/testimonials you're authorized to use, or keep everything as "concept project".

I'll surface these at the start of Phase 5 rather than block now.

---

## Delivery cadence

I'll run **Phase 0** on approval and pause for your review, then execute Phases 1–4 in a single continuous stretch (data + payments + public site + app), then pause again before Phases 5–7. That keeps each review chunk under ~30 files.
