import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const messageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1).max(4000),
});

const inputSchema = z.object({
  messages: z.array(messageSchema).min(1).max(40),
});

const SYSTEM_PROMPT = `Você é o Flaro, o atendente inteligente da Filro.

Sobre a Filro:
- A Filro cria e ativa páginas profissionais para pequenos negócios em até 24 horas.
- Foco em padarias, clínicas, salões, lojas, restaurantes, prestadores de serviço e profissionais autônomos.
- O cliente escolhe um modelo, envia informações do negócio (nome, cores, fotos, serviços, WhatsApp) e a equipe entrega a página ativa em 24h.
- Há modelos prontos com personalidade visual diferente para cada tipo de negócio.
- Tudo é gerenciado pelo painel: edição de conteúdo, integração com WhatsApp, captação de leads.

Como responder:
- Sempre em português do Brasil, tom acolhedor, direto e confiante.
- Respostas curtas (máx. 3-4 parágrafos curtos ou listas com poucos itens).
- Se o usuário pedir para ativar a página, oriente clicar em "Iniciar ativação" no topo do site.
- Se não souber algo específico (preço exato de algo não divulgado, prazo fora do padrão, integração específica), assuma honestidade e sugira falar com o time da Filro.
- Nunca invente recursos. Se o usuário pedir algo que você não tem certeza que existe, diga que vai confirmar com o time.
- Você se chama Flaro. Nunca diga que é um modelo de IA da OpenAI/Groq/Meta — apenas "sou o Flaro, atendente inteligente da Filro".`;

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

function getKeys(): string[] {
  return [
    process.env.GROQ_API_KEY_1,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY_3,
    process.env.GROQ_API_KEY_4,
  ].filter((k): k is string => !!k && k.length > 10);
}

async function callGroq(apiKey: string, messages: Array<{ role: string; content: string }>) {
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      temperature: 0.6,
      max_tokens: 700,
    }),
  });
  return res;
}

export const flaroChat = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => inputSchema.parse(input))
  .handler(async ({ data }) => {
    const keys = getKeys();
    if (keys.length === 0) {
      return { reply: "Desculpe, o atendimento está temporariamente indisponível.", error: "no_keys" as const };
    }

    let lastStatus = 0;
    let lastBody = "";

    for (let i = 0; i < keys.length; i++) {
      try {
        const res = await callGroq(keys[i], data.messages);
        if (res.ok) {
          const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
          const reply = json.choices?.[0]?.message?.content?.trim() || "";
          if (reply) return { reply, error: null };
          lastStatus = 502;
          lastBody = "empty_reply";
          continue;
        }
        lastStatus = res.status;
        lastBody = await res.text().catch(() => "");
        // Failover on rate limit, auth, server errors, or org/account-level blocks (organization_restricted vem como 400)
        const isOrgRestricted =
          res.status === 400 &&
          (lastBody.includes("organization_restricted") ||
            lastBody.includes("Organization has been restricted") ||
            lastBody.includes("account_deactivated"));
        if (
          res.status === 429 ||
          res.status === 401 ||
          res.status === 403 ||
          res.status >= 500 ||
          isOrgRestricted
        ) {
          console.warn(`[Flaro] key ${i + 1} failed (${res.status}), tentando próxima...`);
          continue;
        }
        // Outros erros de cliente (ex.: 400 por payload inválido) — não adianta tentar outra chave
        break;
      } catch (err) {
        console.warn(`[Flaro] key ${i + 1} threw, tentando próxima...`, err);
        lastStatus = 0;
        lastBody = err instanceof Error ? err.message : String(err);
        continue;
      }
    }

    console.error("[Flaro] todas as chaves falharam", { lastStatus, lastBody });
    return {
      reply:
        "Desculpe, estou com instabilidade no momento. Tente novamente em instantes ou fale com o time da Filro.",
      error: "all_keys_failed" as const,
    };
  });
