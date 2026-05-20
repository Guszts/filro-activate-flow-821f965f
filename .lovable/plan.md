# Integrar templates Flaro como modelos Filro

## Objetivo

Recuperar os 7 templates da antiga Flaro Dev e exibi-los junto dos modelos da Filro — não mais como "templates de IA", mas como modelos prontos da Filro. A home mostra no máximo 7; o restante vai para a página `/modelos`.

## Modelos principais (home, máx. 7)

1. Clínica Local (Flaro)
2. Restaurante / Cardápio — SUSHI X TI (Flaro)
3. Oficina e Auto — MotorPro (Flaro)
4. Loja Local — Vivara (Flaro)
5. Prestador de Serviço — Atelier (Flaro)
6. Landing de Venda — Forno (Flaro)
7. Viagem & Turismo — Wishes (Flaro)

O modelo "Clínica" já existente da Filro (clinica.filro.site) será mantido como exemplo alternativo na página `/modelos`, junto com Padaria, Auto, Moda, Restaurante e Hambúrguer (os atuais).

## Página `/modelos`

Página dedicada listando **todos** os modelos (Flaro recuperados + os antigos da Filro). Acessível por CTA na home: "Ver todos os modelos".

## Estrutura técnica

- Recuperar do git (commit `bb4f5ac^`) as 7 rotas demo standalone e suas dependências:
  - `src/routes/sushixti.tsx`, `wishes.tsx`, `atelier.tsx`, `motorpro.tsx`, `forno.tsx`, `vivara.tsx`
  - Assets já existem em `src/assets/dev-templates/`.
- Criar rotas públicas novas (sem prefixo `/dev`):
  - `/modelos/clinica-local`, `/modelos/restaurante`, `/modelos/oficina`, `/modelos/loja`, `/modelos/prestador`, `/modelos/landing`, `/modelos/viagem`
  - Cada uma renderiza o componente demo correspondente.
- Atualizar `src/components/ModelGrid.tsx`:
  - Aceitar prop `limit` opcional.
  - Lista unificada com os 7 Flaro + 6 atuais Filro = 13.
  - Cards usam capa de `src/assets/dev-templates/*.jpg`.
  - "Ver exemplo" abre a rota interna `/modelos/<slug>` em nova aba (não mais subdomínio externo).
- `src/routes/index.tsx`: limitar grid a 7 + CTA "Ver todos os modelos" → `/modelos`.
- `src/routes/modelos.tsx`: grid completo, sem limite.

## Fora de escopo

- Não recuperar nada do sistema Flaro Dev em si (geração por IA, créditos, painel `/dev`, banco). Apenas as páginas-modelo visuais.
- Não tocar em pagamentos, auth, fluxo de ativação.
