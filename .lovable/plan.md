# Plano — Flaro Dev (Desenvolvedor) — Fase 1

## Escopo da Fase 1 (esta entrega)

UI completa do workspace + banco de dados + chat funcional com Flaro Dev (via Lovable AI) + sistema de templates + versionamento + estrutura de publicação/domínios (sem deploy real ainda). Preview do projeto gerado roda em iframe `srcDoc` com HTML/CSS/JS único — não há bundler multi-arquivo nesta fase.

## Fora do escopo da Fase 1 (vai pra Fase 2+)

- Bundler multi-arquivo real no servidor (compila pages/components/routes do projeto gerado)
- Deploy real em CDN com URL `filro.site/id/[slug]` funcionando publicamente
- Integração Entri real (deixo estrutura + fallback "não configurado")
- Inspector "selecionar seção e editar com prompt"
- Compressão de imagens server-side, screenshot do preview
- Métricas de admin, logs de webhook reais

## Arquitetura

### Banco (1 migração)

8 tabelas com RLS (user vê só os próprios, admin vê tudo):
`flaro_projects`, `flaro_project_messages`, `flaro_project_files`, `flaro_project_versions`, `flaro_templates` (pública para leitura), `flaro_deployments`, `flaro_domains`, `flaro_attachments`.

Bucket de storage `flaro-assets` (privado, scoped por user_id).

Função `generate_unique_flaro_slug(base text)` para slug único server-side.

### Backend (server functions em `src/lib/flaro/`)

- `flaro-projects.functions.ts` — CRUD projetos, duplicar, arquivar
- `flaro-chat.functions.ts` — envia mensagem, chama Lovable AI Gateway (`google/gemini-3-flash-preview`), salva mensagens + cria versão + atualiza arquivo principal
- `flaro-templates.functions.ts` — listar/usar templates
- `flaro-versions.functions.ts` — listar, restaurar, comparar
- `flaro-publish.functions.ts` — validar projeto, gerar slug, criar deployment (status mockado: `published` com URL `filro.site/id/[slug]`)
- `flaro-domains.functions.ts` — adicionar domínio, checar status (mockado: detecta se `ENTRI_API_KEY` existe)
- `flaro-attachments.functions.ts` — upload signed URL, listar, remover

Rota pública `src/routes/api/public/flaro-entri-webhook.ts` (placeholder, valida assinatura quando configurado).

### Frontend (rotas)

- `src/routes/desenvolvedor.tsx` — hero + dashboard de projetos salvos + CTA "Criar novo projeto"
- `src/routes/desenvolvedor.templates.tsx` — galeria de templates com filtros
- `src/routes/desenvolvedor.projeto.$projectId.tsx` — workspace 3 colunas (desktop) / tabs (mobile)
- `src/routes/desenvolvedor.publicar.$projectId.tsx` — fluxo de publicação + conectar domínio
- `src/routes/id.$slug.tsx` — serve o HTML publicado de um projeto (renderiza `flaro_deployments.snapshot_html` num iframe ou direto)

### Componentes (`src/components/flaro/`)

`FlaroHero`, `FlaroProjectCard`, `FlaroProjectGrid`, `FlaroWorkspaceLayout`, `FlaroSidebar`, `FlaroChat`, `FlaroPromptComposer` (com mode selector Construir/Plano, intensidade, tipo, objetivo), `FlaroAttachments`, `FlaroPreview` (iframe srcDoc + toolbar device switcher), `FlaroFileTree`, `FlaroVersionList`, `FlaroTemplateCard`, `FlaroPublishPanel`, `FlaroDomainPanel`, `FlaroSeoPanel`, `FlaroConversionPanel`, `FlaroLogsPanel`, `FlaroEmptyState`.

Tudo usando tokens do `src/styles.css` existente (paper/ink/flame/lime/azure, Archivo display, card-elevated, card-personality) — mesma linguagem do site Filro atual.

### Footer

Adicionar link "Desenvolvedor" em `src/components/SiteFooter.tsx` na coluna institucional, estilo discreto (mesmo tratamento dos outros links).

### Auth

Usa `requireSupabaseAuth` em todas as server functions. Rotas `/desenvolvedor/*` ficam sob layout que redireciona pra `/login` se não autenticado (exceto `/desenvolvedor` hero, que mostra CTA de login).

Admin (role `admin` já existente em `user_roles`) vê todos os projetos no dashboard.

## Layout do workspace (desktop, 3 colunas)

```text
┌────────────┬─────────────────────┬──────────────┐
│ Sidebar    │ Chat Flaro Dev      │ Preview      │
│ - Projetos │ - mensagens         │ [Desk|Tab|M] │
│ - Templates│ - prompt composer   │              │
│ - Assets   │   (modo, intensid.) │  iframe      │
│ - Versões  │   anexos            │              │
│ - Deploy   │                     │ Publicar→    │
│ - Domínios │                     │              │
│ - Settings │                     │ Files / SEO  │
└────────────┴─────────────────────┴──────────────┘
```

Mobile: tabs no topo (Prompt | Preview | Arquivos | Templates | Publicar).

## Comportamento do chat

Server function recebe `{ projectId, prompt, mode, intensity, type, goal, attachments }`. Monta system prompt com regras Filro (sem Lovable, sem emoji, sem fake testimonials, PT-BR). Chama Lovable AI Gateway via `@ai-sdk/openai-compatible`. Em modo `Construir`, instrui modelo a devolver JSON `{ summary, html, files_changed[] }` via `Output.object` — salva `html` em `flaro_project_files` (path `index.html`), cria nova versão, retorna pro client que dá reload no iframe. Em modo `Plano`, devolve só markdown.

## Validação de slug

`generate_unique_flaro_slug(base)`:
1. Normaliza (lower, remove acentos, espaços→`-`, remove chars inválidos)
2. Checa `flaro_projects.slug` e `flaro_deployments.slug`
3. Se existe, anexa sufixo hex 4 chars
4. Retorna slug único

Chamada no momento de publicar, não na criação.

## Entradas técnicas

- Secrets opcionais: `ENTRI_API_KEY`, `ENTRI_CLIENT_ID`, `ENTRI_WEBHOOK_SECRET`, `ENTRI_ENVIRONMENT`, `PUBLIC_FILRO_BASE_URL` — UI detecta ausência e mostra "Integração Entri não configurada" com fallback DNS manual (A record + CNAME).
- `LOVABLE_API_KEY` já existe.

## Ordem de execução

1. Migração SQL (8 tabelas + RLS + função slug + bucket)
2. Server functions (7 arquivos `flaro-*.functions.ts`)
3. Componentes base (`FlaroHero`, cards, layout)
4. Rota `/desenvolvedor` + link no footer
5. Rota workspace `/desenvolvedor/projeto/$projectId` + chat + preview
6. Rota templates + publicar + página pública `/id/$slug`
7. Smoke test: criar projeto → mandar prompt → ver preview → publicar → abrir link

## Estimativa

~25–30 arquivos novos, 1 migração grande, ~1500–2000 linhas de código. Vai consumir crédito proporcional. Se algo quebrar, faço fixes pontuais sem reescrever tudo.
