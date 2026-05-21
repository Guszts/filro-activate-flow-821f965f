# MCP OAuth 2.1 para Claude Mobile / Web

Habilitar o servidor MCP do Filro a aparecer como **conector customizado** no Claude (mobile e web), implementando OAuth 2.1 com Dynamic Client Registration (DCR) e PKCE, conforme a spec MCP Authorization (2025-06-18).

Continua restrito a **admins**. Tokens MCP estáticos (Bearer no header) seguem funcionando em paralelo para Claude Desktop / Cursor.

---

## Fluxo do usuário

1. No app Claude (mobile/web), adicionar conector customizado com URL `https://filro.site/api/mcp`.
2. Claude descobre os endpoints OAuth automaticamente, registra-se via DCR.
3. Claude abre o navegador → cai em `/oauth/authorize` no Filro.
4. Se não estiver logado, redireciona para `/login` e volta.
5. Tela de consentimento mostra: "Claude está pedindo acesso admin ao Filro" → botão **Autorizar**.
6. Redirect de volta para o Claude com code → Claude troca por access + refresh token.
7. Claude faz POST `/api/mcp` com `Authorization: Bearer <access_token>` e ganha acesso às ferramentas admin.

---

## Componentes

### 1. Banco (1 migração)

Novas tabelas:
- `oauth_clients` — clientes registrados via DCR (client_id, client_name, redirect_uris[], created_at). Sem secret (clientes públicos com PKCE).
- `oauth_authorization_codes` — codes de uso único (code, client_id, user_id, redirect_uri, code_challenge, scope, expires_at). TTL 10 min.
- `oauth_access_tokens` — tokens emitidos (token_hash, client_id, user_id, scope, expires_at, revoked_at). TTL 1h.
- `oauth_refresh_tokens` — refresh tokens (token_hash, client_id, user_id, scope, expires_at, revoked_at). TTL 30 dias.

RLS: apenas service role acessa (todas operações via `supabaseAdmin` no servidor).

### 2. Rotas novas

| Rota | Tipo | Função |
|---|---|---|
| `/.well-known/oauth-authorization-server` | server route GET | Metadata OAuth (RFC 8414) |
| `/.well-known/oauth-protected-resource` | server route GET | Metadata do resource (RFC 9728) |
| `/api/oauth/register` | server route POST | DCR (RFC 7591) — cria client |
| `/oauth/authorize` | rota UI (GET/POST) | Login + consentimento + emissão de code |
| `/api/oauth/token` | server route POST | Troca code→tokens, refresh |

### 3. Endpoint MCP

`/api/mcp` passa a aceitar duas formas de Bearer:
- Token estático `flaro_mcp_*` (já existe) — admin check.
- Access token OAuth — lookup em `oauth_access_tokens`, valida expiração, exige admin role do `user_id`.

Em ambos os casos, todas as 16 ferramentas (client + admin) ficam disponíveis se `isAdmin = true`.

### 4. Tela de consentimento

Nova rota `/oauth/authorize` (UI):
- Verifica sessão Supabase. Se não logado → redirect pra `/login?next=...`.
- Verifica role admin. Se não admin → mostra erro.
- Mostra: nome do cliente (Claude), redirect URI, escopo (admin), botões **Autorizar** / **Cancelar**.
- Ao autorizar: gera authorization code (com PKCE challenge), persiste, redireciona para `redirect_uri?code=...&state=...`.

### 5. Segurança

- PKCE S256 obrigatório (sem `plain`).
- Authorization code: uso único, 10 min, valida code_verifier.
- Access token: 1h, hashed em DB (SHA-256).
- Refresh token: 30 dias, rotação em cada refresh.
- Apenas admins podem completar o consent.
- Validar `redirect_uri` contra `oauth_clients.redirect_uris`.
- `resource` parameter (RFC 8707) validado — tokens só valem para `/api/mcp`.

---

## Arquivos

**Criar:**
- `supabase/migrations/<ts>_mcp_oauth.sql`
- `src/lib/mcp/oauth.server.ts` — helpers (gen code, hash, validate PKCE, issue tokens)
- `src/routes/.well-known.oauth-authorization-server.ts`
- `src/routes/.well-known.oauth-protected-resource.ts`
- `src/routes/api/oauth/register.ts`
- `src/routes/api/oauth/token.ts`
- `src/routes/oauth.authorize.tsx` (UI + POST handler via server fn)
- `src/lib/oauth.functions.ts` — server fns para listar pending auth e autorizar

**Editar:**
- `src/lib/mcp/auth.server.ts` — `verifyMcpToken` aceita também access tokens OAuth
- `src/components/settings/McpTokensSection.tsx` — adicionar seção explicando "Conectar pelo Claude mobile/web" com URL `https://filro.site/api/mcp` para colar como conector customizado

---

## Escopo NÃO incluído

- Multi-tenant (sempre admin scope, sem granularidade por ferramenta)
- Client secrets / confidential clients (só public + PKCE)
- Token introspection endpoint (RFC 7662)
- Revocation endpoint público (admin pode revogar via DB / UI no futuro)
- Suporte a múltiplos resource servers (só `/api/mcp`)

---

## Tempo estimado

~6-8 chamadas de tool: 1 migração + 7-8 arquivos novos/editados. Após aprovação do plano, executo tudo de uma vez.
