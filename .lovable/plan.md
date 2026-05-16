&nbsp;

&nbsp;

Plano — Programa Privado de Parceiro Filro

&nbsp;

Objetivo principal desta etapa:

Implementar um programa privado de parceiro B2B dentro da Filro, começando apenas com um parceiro inicial: meu tio.

&nbsp;

Não é programa público de afiliados.

Não criar página pública de afiliados.

Não criar cadastro aberto.

Não criar painel externo para afiliado.

Não usar Stripe Connect.

Não exigir que o parceiro tenha conta Stripe.

Não pagar automaticamente pela Stripe.

&nbsp;

O parceiro recebe manualmente por Pix, com base nas vendas indicadas e calculadas dentro do Console.

&nbsp;

---

&nbsp;

Onda 0 — Segurança ".env"

&nbsp;

Antes de qualquer implementação:

&nbsp;

1. Remover ".env", ".env.production", ".env.development" do versionamento.

2. Atualizar ".gitignore" para ignorar ".env*", exceto ".env.example".

3. Conferir se ".env.example" cobre todas as variáveis usadas.

4. Se qualquer segredo privado tiver sido commitado, rotacionar antes de seguir.

&nbsp;

Chaves que precisam ser tratadas como privadas:

&nbsp;

- SUPABASE_SERVICE_ROLE_KEY

- STRIPE_SECRET_KEY

- STRIPE_WEBHOOK_SECRET

- DATABASE_URL

- SMTP_PASSWORD

- RESEND_API_KEY

- OPENAI_API_KEY

- qualquer token privado

&nbsp;

Não assumir que tudo é baixo risco.

&nbsp;

---

&nbsp;

Onda 1 — Programa Privado de Parceiro

&nbsp;

Criar uma aba no Console chamada:

&nbsp;

Parceiro

&nbsp;

Essa aba deve mostrar quanto devo pagar ao parceiro, quais vendas vieram dele, quais comissões estão pendentes, aprovadas, pagas ou canceladas.

&nbsp;

---

&nbsp;

Regra financeira obrigatória

&nbsp;

O parceiro recebe:

&nbsp;

50% apenas da taxa de ativação.

&nbsp;

A mensalidade fica:

&nbsp;

100% com a operação Filro.

&nbsp;

Exemplo:

&nbsp;

Cliente compra plano com:

&nbsp;

- Ativação: R$497,00

- Mensalidade: R$97,00

- Total pago no primeiro pagamento: R$594,00

&nbsp;

Cálculo correto:

&nbsp;

- Base da comissão: R$497,00

- Comissão: 50%

- Valor do parceiro: R$248,50

&nbsp;

Cálculo proibido:

&nbsp;

- Não calcular 50% sobre R$594,00

- Não pagar comissão sobre mensalidade

- Não pagar comissão recorrente

- Não pagar comissão sobre renovações futuras

- Não pagar comissão sobre valor total do checkout

&nbsp;

Regra técnica:

&nbsp;

base_amount = activation_price

commission_amount = Math.round(base_amount * 0.50)

&nbsp;

---

&nbsp;

Fluxo esperado

&nbsp;

1. O parceiro compartilha um link privado:

&nbsp;

https://setup.filro.site/?ref=tio

&nbsp;

2. O site detecta o parâmetro:

&nbsp;

?ref=tio

&nbsp;

Também aceitar:

&nbsp;

?partner=tio

?parceiro=tio

?codigo=tio

&nbsp;

3. O código do parceiro é salvo no navegador do visitante por 30 dias usando:

&nbsp;

- localStorage

- cookie

&nbsp;

4. Quando o visitante escolher um plano e for para checkout, o sistema envia o código do parceiro para o backend.

&nbsp;

5. O backend valida se o parceiro existe e está ativo.

&nbsp;

6. A sessão Stripe é criada normalmente.

&nbsp;

7. A sessão Stripe recebe metadata com os dados do parceiro.

&nbsp;

8. Quando o webhook confirmar o pagamento, o sistema cria:

&nbsp;

- indicação

- comissão

- vínculo com cliente

- vínculo com plano

- vínculo com pagamento

- status inicial da comissão

&nbsp;

9. No Console > Parceiro, eu consigo ver quanto devo pagar.

&nbsp;

10. Depois de pagar manualmente por Pix, clico em “Marcar como paga”.

&nbsp;

---

&nbsp;

Banco de dados

&nbsp;

Criar migrations seguras e compatíveis com Supabase.

&nbsp;

Tabela "partners"

&nbsp;

Campos:

&nbsp;

- id uuid primary key default gen_random_uuid()

- name text not null

- email text

- whatsapp text

- code text not null unique

- pix_key text

- commission_rate numeric(5,2) not null default 50.00

- commission_scope text not null default 'activation_only'

- status text not null default 'active'

- notes text

- created_at timestamptz not null default now()

- updated_at timestamptz not null default now()

&nbsp;

Status permitidos:

&nbsp;

- active

- paused

- blocked

&nbsp;

Escopo permitido:

&nbsp;

- activation_only

&nbsp;

Criar parceiro inicial:

&nbsp;

insert into public.partners 

(name, code, commission_rate, commission_scope, status)

values 

('Parceiro B2B Privado', 'tio', 50.00, 'activation_only', 'active')

on conflict (code) do nothing;

&nbsp;

---

&nbsp;

Tabela "partner_referrals"

&nbsp;

Campos:

&nbsp;

- id uuid primary key default gen_random_uuid()

- partner_id uuid not null references public.partners(id)

- user_id uuid null

- plan_id uuid null

- client_name text

- client_email text

- client_whatsapp text

- partner_code text

- stripe_checkout_session_id text unique

- stripe_customer_id text

- status text not null default 'started'

- source_url text

- landing_url text

- created_at timestamptz not null default now()

- converted_at timestamptz

- cancelled_at timestamptz

- cancellation_reason text

&nbsp;

Status permitidos:

&nbsp;

- started

- checkout_created

- paid

- cancelled

- refunded

&nbsp;

---

&nbsp;

Tabela "partner_commissions"

&nbsp;

Campos:

&nbsp;

- id uuid primary key default gen_random_uuid()

- partner_id uuid not null references public.partners(id)

- referral_id uuid references public.partner_referrals(id)

- user_id uuid null

- plan_id uuid null

- payment_id uuid null

- stripe_checkout_session_id text unique

- activation_amount integer not null default 0

- monthly_amount integer not null default 0

- base_amount integer not null default 0

- commission_rate numeric(5,2) not null default 50.00

- commission_amount integer not null default 0

- status text not null default 'pending'

- available_at timestamptz

- approved_at timestamptz

- paid_at timestamptz

- cancelled_at timestamptz

- payout_id uuid

- cancellation_reason text

- notes text

- created_at timestamptz not null default now()

- updated_at timestamptz not null default now()

&nbsp;

Status permitidos:

&nbsp;

- pending

- approved

- paid

- cancelled

&nbsp;

Regras obrigatórias:

&nbsp;

- activation_amount = taxa de ativação em centavos

- monthly_amount = mensalidade em centavos, apenas para exibição

- base_amount = activation_amount

- commission_amount = base_amount * commission_rate / 100

- monthly_amount nunca entra no cálculo

&nbsp;

---

&nbsp;

Tabela "partner_payouts"

&nbsp;

Campos:

&nbsp;

- id uuid primary key default gen_random_uuid()

- partner_id uuid not null references public.partners(id)

- amount integer not null

- method text not null default 'pix'

- pix_key text

- status text not null default 'paid'

- paid_at timestamptz default now()

- notes text

- created_at timestamptz not null default now()

&nbsp;

Métodos permitidos:

&nbsp;

- pix

- bank_transfer

- cash

- other

&nbsp;

Status permitidos:

&nbsp;

- pending

- paid

- failed

- cancelled

&nbsp;

---

&nbsp;

Segurança

&nbsp;

Ativar RLS nas tabelas novas.

&nbsp;

Nenhum usuário público ou anônimo pode ler, inserir, editar ou apagar dados dessas tabelas diretamente.

&nbsp;

As operações sensíveis devem ser feitas server-side.

&nbsp;

Se já existir sistema de admin/roles, integrar com ele.

&nbsp;

Se não houver sistema de admin confiável, manter as tabelas bloqueadas por RLS e operar via server functions com service role.

&nbsp;

---

&nbsp;

Captura do código de parceiro

&nbsp;

No frontend, ao carregar o site:

&nbsp;

1. Ler parâmetros da URL:

&nbsp;

ref

partner

parceiro

codigo

&nbsp;

2. Validar formato:

&nbsp;

- mínimo 3 caracteres

- máximo 40 caracteres

- apenas letras, números, hífen e underscore

- converter para minúsculo

&nbsp;

3. Salvar em:

&nbsp;

localStorage: filro:partnerCode

cookie: filro_partner_code

expiração: 30 dias

&nbsp;

4. Não mostrar banner público.

5. Não alterar a experiência visual do visitante.

&nbsp;

---

&nbsp;

Checkout

&nbsp;

Atualizar a função de criação de checkout para aceitar "partnerCode" opcional.

&nbsp;

O frontend deve enviar:

&nbsp;

{

  planSlug,

  returnOrigin,

  environment,

  partnerCode

}

&nbsp;

No backend:

&nbsp;

1. Receber "partnerCode".

2. Validar formato.

3. Consultar "public.partners".

4. Só aceitar se:

&nbsp;

code = partnerCode

status = active

&nbsp;

5. Se o parceiro não existir, estiver pausado ou bloqueado:

&nbsp;

- continuar checkout normalmente

- não bloquear compra

- não gerar comissão

- não mostrar erro para o cliente

&nbsp;

6. Se o parceiro existir, adicionar metadata na sessão Stripe:

&nbsp;

partnerId

partnerCode

commissionRate

commissionScope

&nbsp;

Também manter metadata atual:

&nbsp;

userId

planSlug

&nbsp;

Se o checkout usa assinatura, incluir também em "subscription_data.metadata".

&nbsp;

O código do parceiro não é cupom de desconto.

Não criar desconto automático.

Não alterar o valor cobrado do cliente.

&nbsp;

---

&nbsp;

Webhook Stripe

&nbsp;

Atualizar o webhook de pagamento confirmado.

&nbsp;

Evento principal:

&nbsp;

checkout.session.completed

&nbsp;

Regras obrigatórias:

&nbsp;

1. Ler metadata:

&nbsp;

userId

planSlug

partnerId

partnerCode

commissionRate

commissionScope

&nbsp;

2. Se não houver partnerId, não criar comissão.

&nbsp;

3. Validar novamente no banco se o parceiro existe e está ativo.

&nbsp;

4. Identificar o plano comprado usando a fonte real dos planos no banco.

&nbsp;

5. Obter:

&nbsp;

activation_amount = plan.activation_price

monthly_amount = plan.monthly_price

&nbsp;

6. Calcular:

&nbsp;

base_amount = activation_amount

commission_rate = partner.commission_rate

commission_amount = Math.round(base_amount * commission_rate / 100)

&nbsp;

7. Criar ou atualizar "partner_referrals".

&nbsp;

8. Criar "partner_commissions".

&nbsp;

9. Status inicial da comissão:

&nbsp;

pending

&nbsp;

10. "available_at" pode ser "now()" por enquanto.

&nbsp;

Deixar fácil alterar depois para 7 dias.

&nbsp;

---

&nbsp;

Idempotência obrigatória

&nbsp;

O webhook da Stripe pode ser reenviado.

&nbsp;

O sistema não pode criar comissão duplicada.

&nbsp;

Obrigatório:

&nbsp;

- "partner_commissions.stripe_checkout_session_id" deve ser unique.

- Antes de criar comissão, verificar se já existe comissão para aquela session.

- Se já existir, não criar outra.

&nbsp;

---

&nbsp;

Console — Aba Parceiro

&nbsp;

Criar nova aba dentro de "/console" chamada:

&nbsp;

Parceiro

&nbsp;

A aba deve ser privada/admin.

&nbsp;

Não colocar no menu público do site.

&nbsp;

---

&nbsp;

Seção 1 — Resumo financeiro

&nbsp;

Criar cards:

&nbsp;

1. Total gerado por parceiro

   Soma dos pagamentos associados ao parceiro.

&nbsp;

2. Comissão pendente

   Soma das comissões com status "pending".

&nbsp;

3. Comissão aprovada

   Soma das comissões com status "approved".

&nbsp;

4. Comissão paga

   Soma das comissões com status "paid".

&nbsp;

5. A pagar agora

   Soma de "pending + approved".

&nbsp;

6. Receita recorrente preservada

   Soma das mensalidades dos clientes vindos do parceiro.

&nbsp;

Adicionar aviso fixo:

&nbsp;

As comissões são calculadas apenas sobre a taxa de ativação. Mensalidades pertencem 100% à operação Filro.

&nbsp;

---

&nbsp;

Seção 2 — Parceiro atual

&nbsp;

Mostrar:

&nbsp;

- Nome

- Código

- Link privado

- WhatsApp

- Chave Pix

- Comissão

- Status

&nbsp;

Exemplo:

&nbsp;

https://setup.filro.site/?ref=tio

&nbsp;

Botões:

&nbsp;

- Copiar link

- Editar parceiro

&nbsp;

Campos editáveis:

&nbsp;

- nome

- e-mail

- WhatsApp

- chave Pix

- comissão

- status

- observações

&nbsp;

---

&nbsp;

Seção 3 — Comissões

&nbsp;

Tabela com colunas:

&nbsp;

- Data

- Parceiro

- Cliente

- Plano

- Ativação

- Mensalidade

- Comissão %

- Comissão

- Status

- Disponível em

- Pago em

- Ações

&nbsp;

Ações por linha:

&nbsp;

- Aprovar

- Marcar como paga

- Cancelar

- Ver detalhes

&nbsp;

Status exibidos:

&nbsp;

- pending = Pendente

- approved = Aprovada

- paid = Paga

- cancelled = Cancelada

&nbsp;

---

&nbsp;

Modal — Marcar como paga

&nbsp;

Ao clicar em “Marcar como paga”, abrir modal.

&nbsp;

Título:

&nbsp;

Marcar comissão como paga

&nbsp;

Mostrar:

&nbsp;

- parceiro

- valor da comissão

- chave Pix

- plano

- cliente

- data da venda

&nbsp;

Campos:

&nbsp;

- método de pagamento, com Pix como padrão

- observação opcional

&nbsp;

Ao confirmar:

&nbsp;

1. Criar registro em "partner_payouts".

2. Atualizar comissão para "paid".

3. Preencher "paid_at = now()".

4. Associar "payout_id" na comissão.

5. Atualizar cards do Console.

&nbsp;

Texto de confirmação:

&nbsp;

Confirme apenas depois de realizar o Pix para o parceiro.

&nbsp;

---

&nbsp;

Modal — Cancelar comissão

&nbsp;

Ao clicar em “Cancelar”, abrir modal pedindo motivo.

&nbsp;

Motivos:

&nbsp;

- reembolso

- venda cancelada

- erro de atribuição

- fraude

- outro

&nbsp;

Ao confirmar:

&nbsp;

- status = cancelled

- cancelled_at = now()

- cancellation_reason = motivo

&nbsp;

---

&nbsp;

Seção 4 — Indicações/Vendas

&nbsp;

Tabela com:

&nbsp;

- Data

- Código

- Cliente

- Plano

- Status

- Checkout Session

- Data de conversão

&nbsp;

---

&nbsp;

Seção 5 — Histórico de repasses

&nbsp;

Tabela com:

&nbsp;

- Data

- Parceiro

- Valor

- Método

- Chave Pix

- Status

- Observação

&nbsp;

---

&nbsp;

UX/UI

&nbsp;

Manter o estilo atual do Console.

&nbsp;

Usar:

&nbsp;

- cards limpos

- tabelas organizadas

- status badges

- modais claros

- visual responsivo

&nbsp;

Não usar emojis.

Não usar ícones genéricos desnecessários.

Não inventar clientes.

Não inventar vendas.

Não inventar depoimentos.

Não chamar de “afiliado” na interface.

Usar os termos:

&nbsp;

- Parceiro

- Indicação

- Comissão

- Repasse

&nbsp;

---

&nbsp;

Responsividade

&nbsp;

A aba Parceiro precisa funcionar bem no celular.

&nbsp;

Em telas pequenas:

&nbsp;

- cards em coluna

- tabelas com scroll horizontal

- ações compactas

- modais adaptados para mobile

&nbsp;

---

&nbsp;

Formatação monetária

&nbsp;

Armazenar valores em centavos.

&nbsp;

Exibir em Real brasileiro.

&nbsp;

Criar ou reutilizar função:

&nbsp;

formatCurrencyBRL(valueInCents)

&nbsp;

Exemplo:

&nbsp;

formatCurrencyBRL(24850) // R$ 248,50

&nbsp;

---

&nbsp;

Testes obrigatórios

&nbsp;

Teste 1

&nbsp;

Entrar no site com:

&nbsp;

?ref=tio

&nbsp;

Escolher plano com ativação R$197.

&nbsp;

Resultado esperado:

&nbsp;

Comissão criada de R$98,50.

&nbsp;

---

&nbsp;

Teste 2

&nbsp;

Entrar no site sem ref.

&nbsp;

Resultado esperado:

&nbsp;

Nenhuma comissão criada.

&nbsp;

---

&nbsp;

Teste 3

&nbsp;

Entrar com:

&nbsp;

?ref=inexistente

&nbsp;

Resultado esperado:

&nbsp;

Checkout funciona normalmente.

Nenhuma comissão criada.

&nbsp;

---

&nbsp;

Teste 4

&nbsp;

Stripe reenviar o mesmo webhook.

&nbsp;

Resultado esperado:

&nbsp;

Não duplicar comissão.

&nbsp;

---

&nbsp;

Teste 5

&nbsp;

Comissão pendente marcada como paga.

&nbsp;

Resultado esperado:

&nbsp;

Criar payout.

Atualizar comissão para paid.

Atualizar resumo financeiro.

&nbsp;

---

&nbsp;

Teste 6

&nbsp;

Comissão cancelada.

&nbsp;

Resultado esperado:

&nbsp;

Status vira cancelled.

Valor sai do total a pagar.

&nbsp;

---

&nbsp;

Teste 7

&nbsp;

Plano com:

&nbsp;

activation_price = 49700

monthly_price = 9700

&nbsp;

Resultado esperado:

&nbsp;

base_amount = 49700

commission_rate = 50

commission_amount = 24850

&nbsp;

Exibir:

&nbsp;

Ativação: R$497,00

Mensalidade: R$97,00

Comissão do parceiro: R$248,50

&nbsp;

Não exibir comissão de R$297,00.

Não calcular sobre R$594,00.

&nbsp;

---

&nbsp;

Teste 8

&nbsp;

Parceiro com status "paused".

&nbsp;

Resultado esperado:

&nbsp;

Link continua abrindo o site.

Checkout funciona.

Comissão não é criada.

&nbsp;

---

&nbsp;

Requisitos técnicos

&nbsp;

- TypeScript sem erros.

- Build funcionando.

- Não quebrar checkout atual.

- Não alterar valores dos planos.

- Não criar desconto automático.

- Não usar Stripe Connect.

- Não pagar parceiro pela Stripe.

- Não duplicar comissão.

- Não confiar apenas no frontend.

- Validar parceiro no backend.

- Usar metadata Stripe corretamente.

- Criar migrations seguras.

- Ativar RLS.

- Manter server-side para operações sensíveis.

- Não criar página pública de afiliados.

- Não criar funcionalidades fora do escopo desta onda.

&nbsp;

---

&nbsp;

O que não fazer nesta etapa

&nbsp;

Não implementar agora:

&nbsp;

- páginas comerciais novas

- Kanban

- revisão de projeto

- suporte

- tickets

- cobrança extra

- inadimplência

- analytics

- leads recebidos

- ranking de afiliados

- painel público de afiliado

- cadastro aberto de parceiro

&nbsp;

Esses blocos ficam para depois.

&nbsp;

---

&nbsp;

Sequência correta depois desta onda

&nbsp;

Após o Programa Privado de Parceiro estar funcionando, seguir nesta ordem:

&nbsp;

1. Páginas comerciais

2. Kanban/status

3. Entrega/revisão

4. Suporte/cobranças extras/inadimplência

5. Analytics/leads

&nbsp;

Prioridade máxima agora:

&nbsp;

Parceiro privado → cálculo correto da comissão → Console claro → pagamento manual por Pix