# Flaro Dev — Fase 1

Ambiente de desenvolvimento web com IA dentro do Filro Setup, acessível pelo footer via link "Desenvolvedor". Produto chamado **Flaro Dev**.

## Escopo da Fase 1

UI completa + banco + chat com IA (Lovable AI Gateway, `google/gemini-3-flash-preview`). Sem bundler real — preview é iframe `srcDoc` com HTML/CSS/JS gerado pela IA. Deploy mockado em `filro.site/id/[slug]`. Entri fica como estrutura pronta com fallback DNS manual (sem chamadas reais ainda).

Bundler multi-arquivo real, CDN, Entri real, inspector visual e métricas admin ficam para Fase 2/3.

## Rotas

- `/desenvolvedor` — hero + dashboard de projetos do usuário
- `/desenvolvedor/projeto/$projectId` — workspace 3 colunas (chat | preview | painéis)
- `/desenvolvedor/templates` — galeria de templates
- `/desenvolvedor/publicar/$projectId` — painel publicar + domínio
- `/id/$slug` — página pública renderizada do projeto publicado

Footer ganha link "Desenvolvedor" → `/desenvolvedor`.

## Banco de dados (1 migration)

Tabelas (todas com RLS escopo `auth.uid() = user_id`, admin via `has_role`):

- `flaro_projects` — id, user_id, name, description, slug, status (draft/published), template_id, current_version_id, published_at
- `flaro_versions` — id, project_id, version_number, html, css, js, prompt_summary, created_by
- `flaro_messages` — id, project_id, role (user/assistant), content, metadata (tokens, model), created_at
- `flaro_templates` — id, name, description, category, thumbnail_url, html, css, js, is_public
- `flaro_attachments` — id, project_id, message_id, file_name, file_url, mime_type
- `flaro_domains` — id, project_id, domain, status (pending/dns_manual/verified), entri_state
- `flaro_deployments` — id, project_id, version_id, slug, published_at, status
- `flaro_seo` — id, project_id, title, description, og_image_url, favicon_url

Slug único global em `flaro_deployments.slug`. `flaro_rate_limits` já existe — reaproveitar.

## Server functions (`src/lib/flaro/*.functions.ts`)

Todas com `requireSupabaseAuth`:

- `flaro-projects` — list/create/rename/delete/get
- `flaro-chat` — streaming generator que chama Lovable AI Gateway, salva mensagem user + assistant, extrai HTML/CSS/JS do retorno e cria nova `flaro_versions`
- `flaro-templates` — listar e clonar template em novo projeto
- `flaro-versions` — listar versões, restaurar versão anterior
- `flaro-publish` — gera slug único, cria `flaro_deployments`, marca projeto como published
- `flaro-domains` — registra domínio custom, retorna instruções DNS (fallback manual)
- `flaro-attachments` — upload via Supabase Storage bucket `flaro-assets` (criar no migration)
- `flaro-seo` — get/update SEO do projeto

Rota pública `/id/$slug` busca último deployment via server fn pública (sem auth, só leitura de projetos published).

## Componentes (`src/components/flaro/*`)

Workspace:
- `FlaroHero` — landing dentro de /desenvolvedor com CTA "Criar novo projeto"
- `FlaroProjectsDashboard` — grid de projetos + empty state
- `FlaroWorkspaceLayout` — 3 colunas desktop, tabs mobile
- `FlaroChat` + `FlaroPromptComposer` — chat com IA, render markdown, anexar arquivos
- `FlaroPreview` — iframe srcDoc com HTML/CSS/JS combinados, toggle desktop/mobile
- `FlaroVersionList` — histórico de versões com restaurar
- `FlaroTemplateCard` + `FlaroTemplatesGrid`
- `FlaroPublishPanel` — publicar, ver URL filro.site/id/slug
- `FlaroDomainPanel` — domínio custom + instruções DNS
- `FlaroSeoPanel` — title, description, og image
- `FlaroEmptyState` — componente reusável

Estados vazios (PT-BR conforme solicitado):
- Sem projetos: "Você ainda não criou nenhum projeto no Flaro Dev."
- Sem templates: "Nenhum template disponível."
- Sem deployments: "Nenhuma publicação realizada."

## Design

Sticky workspace header, hierarquia visual forte, animações sutis, grids responsivos, transições suaves, contraste acessível. Tokens semânticos de `src/styles.css` — sem cores hard-coded. Visual profissional (não infantil, não dashboard genérico). Identidade própria "Flaro Dev" — não copiar visual do Filro Setup principal, mas usar mesmos tokens.

## Fluxo de chat → preview

1. User envia prompt no `FlaroPromptComposer`
2. `flaro-chat` salva mensagem user, chama Gemini com system prompt "Você é Flaro Dev. Gere um app web completo em HTML/CSS/JS. Retorne JSON {html, css, js, summary}."
3. Stream da resposta para a UI
4. Ao finalizar, parse JSON, cria nova `flaro_versions`, atualiza `current_version_id`
5. `FlaroPreview` recarrega iframe srcDoc com nova versão

## Publicação

Gera slug a partir do nome + hash curto. Salva deployment. URL pública `filro.site/id/[slug]` resolve via rota `/id/$slug` que renderiza HTML/CSS/JS direto (server-side fetch + dangerouslySetInnerHTML em iframe srcDoc seguro).

## Estimativa

~25 arquivos novos, 1 migration grande, 1 link no footer existente. Volume alto numa iteração — vou implementar tudo na sequência: migration → server fns → componentes → rotas → link no footer.

## Fora do escopo (Fase 2+)

Bundler real multi-arquivo, hot reload de componentes React, Entri API real, inspector visual de elementos, otimização de imagens, métricas admin, logs detalhados, webhook integrations, custom code editor (Monaco).
