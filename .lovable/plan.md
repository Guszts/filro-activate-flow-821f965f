# Plano: Pagamentos, Formulários por Plano, Cupons, Suporte e Dashboard Admin

Quebrei o pedido em 6 frentes. Cada uma pode ser feita de forma independente — se você quiser priorizar, me diga.

---

## 1. Email do admin com valor realmente pago

Hoje o template `sale-notification` mostra o valor "de tabela" do plano. Com cupons (inclusive o de 100%), o valor real pode ser diferente.

**Mudanças:**
- No webhook do Stripe (`src/routes/api/public/payments/webhook.ts`), ao gravar `payments.amount`, usar `amount_total` da Checkout Session (que já reflete o desconto do cupom), não o preço do plano.
- No envio de `sale-notification` para o admin, passar `amountPaid` (centavos reais), `discount` (centavos), `couponCode` (se houver) e renderizar no template.
- Atualizar `src/lib/email-templates/sale-notification.tsx` para mostrar:
  - Valor pago (em destaque)
  - Valor original (riscado, se houve desconto)
  - Cupom aplicado

---

## 2. Email separado com PDF do projeto entregue

Quando o admin marca o projeto como "delivered/published", o cliente recebe um email com:
- Link de preview / link publicado
- Botão "Baixar PDF do projeto"

**Decisão pendente — o que é o "PDF do projeto"?** Opções:
- **(a)** PDF gerado automaticamente com um resumo: dados do negócio enviados, plano, modelo escolhido, links — gerado server-side com `@react-pdf/renderer` ou similar.
- **(b)** PDF que o admin faz upload manualmente em cada projeto (campo `project_pdf_url` na tabela `projects`, upload para Supabase Storage).
- **(c)** As duas coisas: gerar resumo automático + permitir o admin substituir por um PDF customizado.

**Minha sugestão:** (c). Se você não responder, vou de (b) — é o mais previsível.

Cria-se novo template `project-delivered.tsx` e dispara no momento em que `project_status` muda para `delivered`/`published`.

---

## 3. Bloquear envio do business-info até todas as etapas concluídas

Hoje o usuário pode salvar parcial. Vou:
- Marcar todos os campos obrigatórios (por seção) no schema Zod do formulário.
- Botão "Enviar para produção" só fica habilitado quando todas as seções estão válidas + um indicador visual por seção (✅ / ⏳).
- Validação dupla: client + server function `submitBusinessInfo` rejeita se faltar campo.

---

## 4. Formulário de business-info diferente por plano

Cada plano (`essencial`, `profissional`, `premium`, `priority`, `hero`) terá seu próprio conjunto de seções e perguntas, refletindo o que ele entrega.

**Estrutura proposta:**
- Novo arquivo `src/lib/business-info-schemas.ts` exportando um mapa `{ [planSlug]: FormSchema }`.
- Cada schema tem seções (`identidade`, `seo`, `conteudo`, `integracoes`, etc.) com campos específicos.
- Ex.: planos com SEO ganham seção de palavras-chave, descrição meta, concorrentes, público-alvo. Planos sem SEO não veem essa seção.
- A página `business-info.tsx` renderiza dinamicamente com base no plano do pagamento mais recente.

**Decisão pendente:** você prefere que eu defina o conteúdo de cada formulário com base no que cada plano entrega hoje (vou inferir do `plans.features` no banco e dos vídeos Remotion), ou você quer me passar a lista exata de perguntas por plano?

---

## 5. Códigos promocionais + suporte Flaro atualizado

**Cupons:** hoje existe `PROMO10` (10%) e provavelmente `PROMO100` (100%) hardcoded em `src/lib/payments.functions.ts`. Vou:
- Criar tabela `promo_codes` (code, discount_percent, plan_slug nullable = todos, max_uses, used_count, expires_at, active).
- Migrar os cupons existentes para essa tabela.
- Aba "Cupons" no console admin para criar/listar/desativar.
- Vou popular com um conjunto inicial variado:
  - `BEMVINDO10`, `BEMVINDO20` — geral
  - `ESSENCIAL15`, `PROFISSIONAL15`, `PREMIUM15` — por plano
  - `BLACKFRIDAY30` — sazonal
  - `EQUIPE100` — interno 100%
  - (me diga se quer outros nomes/valores)

**Suporte Flaro:** o `flaro.functions.ts` injeta contexto no prompt. Vou:
- Adicionar query que busca planos ativos, cupons ativos e features do site em cada chamada.
- Atualizar o system prompt para incluir esses dados dinamicamente.
- Assim ele sempre responde com info atualizada (preços, cupons disponíveis, o que cada plano entrega).

---

## 6. Dashboard de vendas (admin)

Nova rota `/dashboard` (separada do `/console`), acessível só para admin, com link no header/sidebar quando logado como admin.

**Conteúdo:**
- **KPIs no topo:** Receita total, MRR, ARR, ticket médio, nº de clientes ativos, nº de cancelamentos, churn rate.
- **Filtro de período:** Hoje, Ontem, Últimos 7 dias, Últimos 30 dias, Este mês, Mês passado, Personalizado (date range picker).
- **Gráfico de receita** ao longo do período (linha/área, Recharts).
- **Gráfico de pedidos por plano** (donut/bar).
- **Tabelas:**
  - Pedidos recentes
  - Maiores pedidos
  - Menores pedidos
  - Pedidos mais antigos (ainda em produção)
  - Clientes mais fiéis (mais pagamentos / maior LTV)
- **Cancelamentos:** lista com motivo + data.

**Cálculos:**
- MRR = soma de `subscriptions.monthly_price` ativas no env atual.
- ARR = MRR × 12.
- Receita = soma `payments.amount` onde `status='paid'` no período.
- Churn = canceladas no período / ativas no início do período.

Reutiliza `payments`, `subscriptions`, `profiles`. Sem novas tabelas.

---

## Ordem de execução sugerida

1. (Rápido) Email admin com valor real pago
2. (Rápido) Bloquear submit business-info até completo
3. Cupons em banco + suporte Flaro atualizado
4. Formulário por plano
5. Email de projeto entregue + PDF
6. Dashboard admin

---

## Preciso de você antes de começar

1. **PDF do projeto** — opção (a), (b) ou (c)?
2. **Perguntas por plano** — eu infiro do `plans.features`, ou você me passa a lista?
3. **Cupons iniciais** — pode ser a lista que sugeri acima, ou você quer customizar?
4. **Posso começar tudo** ou prefere uma frente por vez?
