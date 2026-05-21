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
});

const RESOURCE_METADATA_URL = "https://filro.site/.well-known/oauth-protected-resource";

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
  return mcp.handleRequest(request, { auth: { token, claims: ctx } });
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
      headers: { "Content-Type": "application/json", Allow: "POST" },
    },
  );

export const Route = createFileRoute("/api/mcp")({
  server: {
    handlers: {
      POST: async ({ request }) => handleMcpRequest(request),
      GET: async () => methodNotAllowed(),
      DELETE: async () => methodNotAllowed(),
    },
  },
});
