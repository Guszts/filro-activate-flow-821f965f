import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const messageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1).max(4000),
});

const inputSchema = z.object({
  messages: z.array(messageSchema).min(1).max(40),
});

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;

async function checkRateLimit(identity: string): Promise<boolean> {
  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
  const { count } = await supabaseAdmin
    .from("flaro_rate_limits")
    .select("id", { count: "exact", head: true })
    .eq("identity", identity)
    .gte("created_at", since);
  if ((count ?? 0) >= RATE_LIMIT_MAX) return false;
  await supabaseAdmin.from("flaro_rate_limits").insert({ identity });
  return true;
}

function getIdentity(): string {
  try {
    const req = getRequest();
    const ip = req.headers.get("cf-connecting-ip")
      || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("x-real-ip")
      || "unknown";
    return `ip:${ip}`;
  } catch {
    return "ip:unknown";
  }
}

const BASE_PROMPT = `Você é o Flaro, o atendente inteligente da Filro.

Sobre a Filro:
- A Filro cria e ativa páginas profissionais para pequenos negócios em estimativa de até 24 horas após o envio das informações.
- Foco em padarias, clínicas, salões, lojas, restaurantes, prestadores de serviço e profissionais autônomos.
- O cliente escolhe um modelo, paga, envia informações do negócio (nome, cores, fotos, serviços, WhatsApp) e a equipe entrega a página no ar.
- Sem fidelidade: cancele a manutenção quando quiser direto pelo painel.
- Pagamento seguro pela Stripe: cartão de crédito, débito e Pix.
- Hospedagem, suporte por WhatsApp e pequenas alterações estão inclusos na manutenção mensal.
- Tudo é gerenciado pelo painel: edição de conteúdo, integração com WhatsApp, captação de leads.

Como responder:
- Sempre em português do Brasil, tom acolhedor, direto e confiante.
- Respostas curtas (máx. 3-4 parágrafos curtos ou listas com poucos itens).
- Se o usuário pedir para ativar a página, oriente clicar em "Ativar agora" no topo do site ou ir em /planos.
- NUNCA invente preços. Use SEMPRE a tabela atualizada injetada abaixo.
- NUNCA invente cupons. Use SEMPRE a lista atualizada injetada abaixo. Se a pessoa perguntar um cupom que não está listado, diga que não está disponível.
- NUNCA invente recursos. Se não souber algo específico (integração específica, prazo fora do padrão), assuma honestidade e sugira falar com o time pelo WhatsApp.
- Você se chama Flaro. Nunca diga que é um modelo de IA da OpenAI/Groq/Meta — apenas "sou o Flaro, atendente inteligente da Filro".

Formatação:
- Use **texto em negrito** (markdown com dois asteriscos) para destacar palavras-chave importantes.
- Quando indicar contato por WhatsApp, use o número +55 92 99356-1754 — a interface do chat converte automaticamente em um botão "Falar no WhatsApp", então pode mencionar naturalmente.
- Quando indicar contato por e-mail, escreva filro.site@gmail.com — a interface vira um botão "Enviar e-mail".
- Quando recomendar ativação ou planos, mencione "ver planos" ou "iniciar ativação" — a interface adiciona um botão "Ver planos".`;

function formatPriceBRL(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }).format(cents / 100);
}

async function buildDynamicContext(): Promise<string> {
  try {
    const [{ data: plans }, { data: codes }] = await Promise.all([
      supabaseAdmin
        .from("plans")
        .select("name, slug, activation_price, monthly_price, description, display_order")
        .eq("active", true)
        .eq("hidden", false)
        .order("display_order"),
      supabaseAdmin
        .from("promo_codes")
        .select("code, discount_percent, plan_slug, description, expires_at, max_uses, used_count")
        .eq("active", true),
    ]);

    const now = Date.now();
    const planLines = (plans ?? []).map((p) => {
      const monthly = p.monthly_price > 0 ? ` + ${formatPriceBRL(p.monthly_price)}/mês` : "";
      return `- **${p.name}** (slug \`${p.slug}\`): ${formatPriceBRL(p.activation_price)} de ativação${monthly}. ${p.description ?? ""}`.trim();
    }).join("\n");

    const validCodes = (codes ?? []).filter((c) => {
      if (c.expires_at && new Date(c.expires_at).getTime() < now) return false;
      if (c.max_uses != null && (c.used_count ?? 0) >= c.max_uses) return false;
      return true;
    });
    const codeLines = validCodes.length
      ? validCodes.map((c) => {
          const scope = c.plan_slug ? `só no plano \`${c.plan_slug}\`` : "em qualquer plano";
          return `- \`${c.code}\` — ${c.discount_percent}% off, ${scope}${c.description ? ` (${c.description})` : ""}`;
        }).join("\n")
      : "- (nenhum cupom público ativo no momento)";

    return `

PREÇOS ATUAIS (tabela oficial — use SEMPRE estes valores):
${planLines || "- (planos não disponíveis no momento)"}

CUPONS DISPONÍVEIS (use SEMPRE esta lista — não invente cupons):
${codeLines}

Quando perguntarem "qual o melhor / mais escolhido / recomendado", recomende o **Plus** se existir, ou o plano de melhor custo-benefício da lista acima.`;
  } catch (err) {
    console.warn("[Flaro] failed to build dynamic context", err);
    return "";
  }
}

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";
const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const LOVABLE_AI_MODEL = "google/gemini-3-flash-preview";

type ChatMessage = Array<{ role: string; content: string }>;

function getKeys(): string[] {
  return [
    process.env.GROQ_API_KEY_1,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY_3,
    process.env.GROQ_API_KEY_4,
  ].filter((k): k is string => !!k && k.length > 10);
}

async function callGroq(apiKey: string, messages: ChatMessage, systemPrompt: string) {
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      temperature: 0.6,
      max_tokens: 700,
    }),
  });
  return res;
}

async function callLovableAi(apiKey: string, messages: ChatMessage, systemPrompt: string) {
  const res = await fetch(LOVABLE_AI_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: LOVABLE_AI_MODEL,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      temperature: 0.55,
      max_tokens: 700,
    }),
  });
  return res;
}

export const flaroChat = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => inputSchema.parse(input))
  .handler(async ({ data }) => {
    const identity = getIdentity();
    const allowed = await checkRateLimit(identity).catch(() => true);
    if (!allowed) {
      return {
        reply: "Você está enviando mensagens rápido demais. Aguarde um instante e tente de novo.",
        error: "rate_limited" as const,
      };
    }

    const lovableApiKey = process.env.LOVABLE_API_KEY;
    if (lovableApiKey) {
      try {
        const res = await callLovableAi(lovableApiKey, data.messages);
        if (res.ok) {
          const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
          const reply = json.choices?.[0]?.message?.content?.trim() || "";
          if (reply) return { reply, error: null };
        } else {
          const body = await res.text().catch(() => "");
          console.warn("[Flaro] Lovable AI failed, tentando Groq como backup...", { status: res.status, body });
        }
      } catch (err) {
        console.warn("[Flaro] Lovable AI threw, tentando Groq como backup...", err);
      }
    }

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
