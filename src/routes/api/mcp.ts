import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { createMcpServer, withMcpAuth, extractBearerToken } from "mcp-tanstack-start";
import { allTools } from "@/lib/mcp/tools.server";
import { verifyMcpToken } from "@/lib/mcp/auth.server";

const mcp = createMcpServer({
  name: "filro",
  version: "1.0.0",
  instructions:
    "Servidor MCP do Filro. Permite ao cliente consultar dados da sua conta (perfil, plano, projetos, pagamentos), abrir e responder chamados de suporte, e listar os planos disponíveis. Todas as operações são restritas ao usuário dono do token.",
  tools: allTools,
});

const authenticated = withMcpAuth(
  async (request, auth) => mcp.handleRequest(request, { auth }),
  async (request) => {
    const token = extractBearerToken(request);
    if (!token) return null;
    const ctx = await verifyMcpToken(token);
    if (!ctx) return null;
    return { token, claims: ctx };
  },
);

const methodNotAllowed = () =>
  new Response(
    JSON.stringify({
      jsonrpc: "2.0",
      error: { code: -32000, message: "Method not allowed." },
      id: null,
    }),
    {
      status: 405,
      headers: { "Content-Type": "application/json", Allow: "POST" },
    },
  );

export const Route = createFileRoute("/api/mcp")({
  server: {
    handlers: {
      POST: async ({ request }) => authenticated(request),
      GET: async () => methodNotAllowed(),
      DELETE: async () => methodNotAllowed(),
    },
  },
});
