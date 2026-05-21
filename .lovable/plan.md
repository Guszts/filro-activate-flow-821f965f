# MCP Server do Filro

Sim, dá pra criar. Vamos expor um endpoint MCP (Model Context Protocol) em `/api/mcp` usando `mcp-tanstack-start`, autenticado por token, para que ferramentas como **Claude Desktop**, **Cursor**, **ChatGPT (conectores)** e outros clientes MCP possam ler e agir sobre os dados do cliente Filro.

## O que o MCP vai permitir

O usuário (cliente Filro) gera um token pessoal no painel e cola no Claude. A partir daí, pode pedir coisas como:

- "Mostre o status do meu projeto Filro"
- "Liste minhas cobranças extras em aberto"
- "Abra um chamado de suporte dizendo que quero trocar o telefone do site"
- "Quais planos existem e qual é o meu hoje?"
- "Quantos leads chegaram este mês?" (se aplicável)

## Escopo de ferramentas (v1)

Foco no cliente final (não admin), respeitando RLS via token do próprio usuário.

Leitura:
- `get_my_profile` — dados do perfil e plano atual
- `list_my_projects` — projetos com status, prazo, URL publicada
- `get_project` — detalhe + histórico de status + revisões
- `list_my_payments` — pagamentos e cobranças extras
- `list_my_support_tickets` — chamados abertos/fechados
- `list_plans` — catálogo público de planos

Escrita (com `needsApproval`):
- `create_support_ticket` — abre chamado
- `reply_support_ticket` — responde em chamado existente
- `request_project_revision` — cria revisão no projeto

## Autenticação

Cada cliente gera um **MCP token** no painel (`/settings`):
- Tabela nova `mcp_tokens` (id, user_id, token_hash, name, last_used_at, created_at, revoked_at).
- Token mostrado uma vez na criação, armazenado como hash (sha256).
- Cliente cola no Claude como `Authorization: Bearer flaro_mcp_xxx`.
- No handler MCP, validamos o token, recuperamos o `user_id` e injetamos no contexto das tools.
- Todas as queries usam `supabaseAdmin` filtradas explicitamente por `user_id` (RLS bypass controlado).

## Como o usuário conecta no Claude

Instruções na página `/settings` → seção "Integração MCP":
1. Clicar "Gerar token MCP", copiar.
2. No Claude Desktop, editar `claude_desktop_config.json` adicionando o servidor remoto:
   ```json
   {
     "mcpServers": {
       "filro": {
         "url": "https://filro.site/api/mcp",
         "headers": { "Authorization": "Bearer flaro_mcp_xxx" }
       }
     }
   }
   ```
3. Reiniciar o Claude.

## Detalhes técnicos

Stack:
- `mcp-tanstack-start` + `@modelcontextprotocol/sdk` + `zod`.
- Rota: `src/routes/api/mcp.ts` — só `POST` ativo, `GET`/`DELETE` retornam 405.
- Tools em `src/lib/mcp/tools/*.ts`.
- Helper `withMcpAuth` valida o Bearer token contra `mcp_tokens`.

Arquivos a criar/editar:
- `src/lib/mcp/tools/profile.ts`, `projects.ts`, `payments.ts`, `support.ts`, `plans.ts`
- `src/lib/mcp/auth.ts` (extrai e valida token)
- `src/routes/api/mcp.ts`
- `src/components/settings/McpTokensSection.tsx` + integração em `/settings`
- `src/lib/mcp-tokens.functions.ts` (createServerFn: criar/listar/revogar)
- Migration: tabela `mcp_tokens` + RLS (`user_id = auth.uid()`)

Dependências:
```
bun add mcp-tanstack-start @modelcontextprotocol/sdk
```

## Fora do escopo da v1

- Acesso de admin via MCP (pode entrar numa v2 com role check).
- Webhooks/eventos push para o cliente MCP.
- OAuth dinâmico — usaremos token estático, que é o caminho mais simples e suportado pelo Claude Desktop.
