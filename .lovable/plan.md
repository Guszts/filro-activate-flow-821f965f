## Objetivo
Voltar a aceitar pagamentos no Filro com o mínimo de mudança de código. O app já tem toda a infraestrutura de checkout, webhook e planos pronta — só precisa religar o provedor e recriar os produtos.

## Provedor recomendado
**Stripe integrado da Lovable** (sem conta Stripe própria), com **cálculo e cobrança de impostos** (+0,5%/transação). Você cuida do registro/recolhimento (Brasil não tem full compliance handling).

## Etapas

### 1. Habilitar Stripe
- Acionar `enable_stripe_payments` (você preenche e-mail/nome no formulário que aparece).
- Ambiente sandbox fica disponível imediatamente para testar com cartão `4242 4242 4242 4242`.

### 2. Recriar os 7 produtos no Stripe
Cada plano vira **2 prices** com lookup keys exatos que o código já usa:

```text
plan_promocional_activation    + plan_promocional_monthly
plan_essencial_activation      + plan_essencial_monthly
plan_profissional_activation   + plan_profissional_monthly
plan_premium_activation        + plan_premium_monthly
plan_ecommerce_activation      + plan_ecommerce_monthly
plan_landing_activation        + plan_landing_monthly
plan_personalizado_activation  + plan_personalizado_monthly
```

Tax code aplicado em todos: serviços digitais/IT (`txcd_10103001` ou equivalente para "website design/hosting services") — escolhido conforme a tabela do Stripe Tax.

Valores e nomes vêm de `src/lib/plans.functions.ts` (já configurados).

### 3. Sem mudanças de código necessárias
Os arquivos já existem e seguem funcionando:
- `src/lib/payments.functions.ts` — `createCheckoutSession`, `getPriceLookupKeys`
- `src/lib/stripe.server.ts` — cliente Stripe server-side
- `src/routes/checkout.tsx` — página de checkout
- `src/routes/payment-success.tsx` / `payment-failed.tsx`
- `src/routes/api/public/payments/webhook.ts` — webhook (já trata `checkout.session.completed`, `invoice.paid`, `customer.subscription.deleted` para atualizar status de projeto, criar charges, comissões de parceiro, etc.)

Vou apenas verificar (sem editar) se a `automatic_tax: { enabled: true }` está no `createCheckoutSession`; caso não esteja, adiciono uma linha.

### 4. Teste
1. Abrir `/planos` no preview, escolher um plano.
2. Pagar com `4242 4242 4242 4242`, qualquer CVC, data futura.
3. Conferir redirecionamento para `/payment-success` e o evento no webhook (status do projeto vai para `paid`).

### 5. Ir para live
Quando estiver tudo ok no sandbox, você troca para modo **live** no painel Pagamentos e publica o app — os produtos sincronizam automaticamente.

## Notas técnicas
- Nenhuma migração de banco; tabelas `events`, `projects`, `partner_commissions` já existem.
- Webhook está em `/api/public/payments/webhook` — URL estável; o Stripe integrado da Lovable já registra o endpoint automaticamente.
- Nenhuma secret nova precisa ser adicionada — a integração da Lovable injeta as chaves do Stripe.
