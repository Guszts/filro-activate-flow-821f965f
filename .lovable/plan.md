# Flaro Dev → SaaS automático por créditos

## Visão geral

Transformar o Flaro Dev de um serviço assistido por equipe humana em um **gerador automático** onde o usuário:

1. Escolhe um modelo e descreve o negócio
2. IA (Lovable AI / Gemini) preenche os textos do template
3. Sistema publica imediatamente em `https://{slug}.filro.site`
4. Cada geração/edição consome **créditos** (modelo Lovable)

Mais dois pedidos rápidos:
- Remover todos os ícones `Sparkles` do site
- Aplicar identidade Flaro (paleta, tipografia, espaçamento) na `/dev`

---

## Fase 1 — Limpeza visual (rápido)

- Remover `Sparkles` (lucide-react) em todas as ocorrências; trocar por ícone neutro (`Zap`, `Wand2`, `Star`) ou simplesmente remover quando for decorativo
- Auditar com `rg "Sparkles" src/`

## Fase 2 — Redesign /dev com identidade Flaro

A `/dev` atual é genérica. Aplicar:
- Hero com tipografia Flaro (já no `styles.css`), gradientes/sombras existentes
- Cards de modelos com mesmo visual do `/modelos` principal
- CTA dupla: "Gerar grátis (10 créditos)" e "Ver planos"
- Reaproveitar componentes do site principal (botões, badges, PlanCard adaptado)

## Fase 3 — Sistema de créditos

### Banco
- **`user_credits`**: `user_id` (unique), `balance` (int), `lifetime_earned`, `lifetime_spent`, timestamps
- **`credit_transactions`**: `user_id`, `delta` (int, +/−), `reason` (text: 'signup_bonus', 'plan_grant', 'site_generation', 'site_edit', 'manual'), `ref_id` (uuid opcional → projeto/pagamento), `created_at`
- Trigger no `auth.users` para conceder **10 créditos grátis** no signup
- Cron mensal/Stripe webhook concede créditos do plano

### Reformular `dev_plans`
Substituir colunas `activation_price`/`monthly_price`/`max_revisions_month` por:
- `monthly_price` (mantém)
- `monthly_credits` (int)
- `extra_credit_price_cents` (int, custo de comprar pacote avulso)

Novos planos:
| Slug | Nome | Mensal | Créditos/mês |
|---|---|---|---|
| free | Grátis | 0 | 10 (one-time no signup) |
| starter | Starter | R$ 47 | 50 |
| pro | Pro | R$ 97 | 150 |
| scale | Scale | R$ 197 | 400 |

### Custos em créditos
- Gerar site novo: **5 créditos**
- Editar texto via IA: **1 crédito**
- Trocar imagem/cor: 0 (gratuito, sem IA)
- Publicar/republicar: 0

## Fase 4 — Geração automática (híbrido template + IA)

### Server function `generateDevSite`
1. Valida créditos (≥ 5)
2. Chama Lovable AI Gateway (`google/gemini-2.5-flash`) com prompt estruturado:
   - Input: nome do negócio, segmento, descrição livre, tom de voz
   - Output: JSON com `hero`, `about`, `services[]`, `cta`, `faq[]`, cores sugeridas
3. Persiste em `dev_projects.briefing` + cria `dev_project_versions` v1
4. Gera `slug` único (kebab-case do business_name + sufixo se colisão)
5. Marca `status='published'`, `published_url = https://{slug}.filro.site`
6. Debita 5 créditos, registra transação
7. Dispara email `dev-site-generated` (novo template)

### Server function `editDevSiteWithAI`
1. Valida 1 crédito
2. Recebe `projectId` + `instruction` (ex: "trocar o título do hero para X")
3. Carrega versão atual, manda IA reescrever o campo solicitado
4. Cria nova versão, debita crédito

### Editor manual (sem IA, grátis)
- Form simples na `/dev/projeto/{id}` para editar campos diretamente

## Fase 5 — Hospedagem em subdomínio

### Rota wildcard
- Nova rota `src/routes/_site/$.tsx` que:
  - Lê `Host` header em loader server-side
  - Extrai slug do subdomínio (`{slug}.filro.site`)
  - Busca `dev_projects` por slug (público, via `supabaseAdmin` server-fn)
  - Renderiza o template correspondente com os dados gerados
- Fallback: se host = `filro.site` ou `setup.filro.site` ou `lovable.app`, segue rota normal (root layout decide)

### DNS
- Documentar para o usuário adicionar registro **wildcard `*.filro.site → 185.158.133.1`** no provedor DNS
- Hosting Lovable já cobre via custom domain; nota: SSL wildcard depende do provedor — se não der, fallback automático para `/s/{slug}` em rota `src/routes/s.$slug.tsx` espelhada

### Componente de renderização
- `src/components/dev-site/RenderedSite.tsx` → recebe `template_slug` + dados gerados, monta hero/sobre/serviços/CTA com o design do template escolhido
- Inicialmente um único template "essencial" funcional; outros marcados "em breve"

## Fase 6 — UX do fluxo novo

- `/dev` (landing) → CTA "Criar grátis"
- `/dev/novo` → wizard de 2 passos:
  1. Escolher modelo
  2. Briefing (nome, segmento, descrição curta, telefone/WhatsApp, cor preferida)
- Botão "Gerar meu site (5 créditos)" → chama `generateDevSite` → redireciona para `/dev/projeto/{id}` com URL publicada visível
- `/dev/projeto/{id}` → mostra preview embed (iframe da URL), botão "Editar com IA (1 crédito)" + form manual, lista de versões, contador de créditos
- Header global: badge com saldo de créditos ao lado do avatar quando logado
- `/dev/precos` → reformular para mostrar créditos em vez de "ativação + mensal"

## Fase 7 — Limpeza do antigo modelo assistido

- Remover/ocultar:
  - `DevAdminTab` (fluxo manual de produção/publicação) → manter só visualização, sem botão publicar manual
  - `DevChangeChat` (chat de revisões com equipe) → substituir pelo editor IA
  - Email `dev-project-paid` e `dev-change-answered` → manter como deprecated, parar de enviar
- Stripe: arquivar produtos `dev_*_activation`, criar novos `dev_credits_starter/pro/scale` (assinatura mensal)
- Webhook atualizado para conceder créditos via `credit_transactions` ao confirmar assinatura

---

## Detalhes técnicos

### Migrations
1. Criar `user_credits` + `credit_transactions` + trigger signup bonus
2. Adicionar `slug` (text, unique) e `generated_content` (jsonb) em `dev_projects`
3. Adicionar `monthly_credits` em `dev_plans`; popular novos planos

### Server functions novas
- `src/lib/credits/credits.functions.ts`: `getMyCredits`, `consumeCredits` (internal helper, não exposta)
- `src/lib/dev/dev.functions.ts`: `generateDevSite`, `editDevSiteWithAI`, `updateDevSiteManual`, `checkSlugAvailability`

### Lovable AI Gateway
- Modelo: `google/gemini-2.5-flash` (rápido/barato)
- Prompt em PT-BR retornando JSON estrito (com `response_format: { type: 'json_object' }`)

### Componentes
- `src/components/dev/CreditsBadge.tsx`
- `src/components/dev/GeneratorWizard.tsx`
- `src/components/dev/AIEditor.tsx`
- `src/components/dev-site/templates/EssencialTemplate.tsx`

### Rotas novas/alteradas
- `src/routes/dev.index.tsx` (redesign)
- `src/routes/dev.novo.tsx` (wizard simplificado)
- `src/routes/dev.projeto.$projectId.tsx` (novo editor)
- `src/routes/dev.precos.tsx` (créditos)
- `src/routes/_site.$.tsx` (wildcard subdomínio)
- `src/routes/s.$slug.tsx` (fallback)

---

## Escopo desta entrega

Por tamanho, sugiro entregar em **2 marcos**:

**Marco A (esta resposta):**
- Fase 1 (Sparkles)
- Fase 2 (redesign /dev)
- Fases 3+4+6: créditos, geração IA, editor, wizard novo, /dev/precos com créditos
- Renderização do site em rota `/s/{slug}` (sem subdomínio ainda — funciona já)
- Esconde o fluxo antigo (DevAdminTab/DevChangeChat) sem deletar

**Marco B (próxima resposta, se aprovado):**
- Wildcard subdomínio `*.filro.site` com DNS + roteamento por Host
- Migração Stripe (arquivar produtos antigos, criar pacotes de créditos)
- Limpeza definitiva dos componentes antigos

Confirma o Marco A?
