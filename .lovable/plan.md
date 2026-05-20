# Verificar links "Ver exemplo"

## Objetivo
Garantir que o clique em "Ver exemplo" nos cards de modelos direcione corretamente para o site/demo de cada modelo.

## Estado atual
- Modelos Flaro (featured): links apontam para rotas internas (`/modelos/clinica-local`, `/modelos/restaurante-cardapio`, etc.).
- Modelos Filro antigos (extras): links apontam para sites externos publicados (`https://padaria.filro.site/`, etc.).
- Todos os links usam `target="_blank"` e abrem corretamente em nova aba.
- Todas as 7 rotas de modelo estão registradas no router e renderizam sites completos.

## Ajuste
- Limpar redundância no `ModelGrid.tsx` (os dois branches `isExternal` renderizam o mesmo elemento).

## Sem alterações estruturais
Nenhuma mudança em rotas, modelos ou comportamento de navegação — apenas refino de código.
