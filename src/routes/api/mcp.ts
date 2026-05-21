import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { createMcpServer, extractBearerToken } from "mcp-tanstack-start";
import { allTools } from "@/lib/mcp/tools.server";
import { verifyMcpToken } from "@/lib/mcp/auth.server";

const mcp = createMcpServer({
  name: "filro",
  version: "1.0.0",
  instructions:
    "Servidor MCP do Filro. Permite consultar e administrar dados de clientes, planos, projetos, pagamentos e suporte. Restrito a administradores.",
  tools: allTools,
  // CRÍTICO: sem isso, a Response SSE é retornada antes do tool executar
  // e o auth (em _currentOptions) é limpo pelo finally → ctx() lança "Não autenticado".
  transport: { enableJsonResponse: true },
});

const RESOURCE_METADATA_URL = "https://filro.site/.well-known/oauth-protected-resource";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, Origin, X-Requested-With, MCP-Protocol-Version",
  "Access-Control-Expose-Headers": "WWW-Authenticate, MCP-Session-Id",
  "Access-Control-Max-Age": "86400",
};

function withCors(response: Response): Response {
  const headers = new Headers(response.headers);
  Object.entries(corsHeaders).forEach(([key, value]) => headers.set(key, value));
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function unauthorized(description: string) {
  return new Response(
    JSON.stringify({
      jsonrpc: "2.0",
      error: { code: -32001, message: description },
      id: null,
    }),
    {
      status: 401,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
        // RFC 9728 — aponta para metadata do resource para OAuth discovery
        "WWW-Authenticate": `Bearer realm="filro", resource_metadata="${RESOURCE_METADATA_URL}"`,
      },
    },
  );
}

const handleMcpRequest = async (request: Request) => {
  const token = extractBearerToken(request);
  if (!token) return unauthorized("Missing bearer token");
  const ctx = await verifyMcpToken(token);
  if (!ctx) return unauthorized("Invalid or expired token");
  return withCors(await mcp.handleRequest(request, { auth: { token, claims: ctx } }));
};

const methodNotAllowed = () =>
  new Response(
    JSON.stringify({
      jsonrpc: "2.0",
      error: { code: -32000, message: "Method not allowed." },
      id: null,
    }),
    {
      status: 405,
      headers: { "Content-Type": "application/json", Allow: "POST, OPTIONS", ...corsHeaders },
    },
  );

export const Route = createFileRoute("/api/mcp")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: corsHeaders }),
      POST: async ({ request }) => handleMcpRequest(request),
      GET: async () => methodNotAllowed(),
      DELETE: async () => methodNotAllowed(),
    },
  },
});
