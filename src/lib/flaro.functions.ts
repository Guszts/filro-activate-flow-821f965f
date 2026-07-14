import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const messageSchema = z.object({
  // "system" role is rejected on purpose — clients must not inject system prompts.
  role: z.enum(["user", "assistant"]),
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
    const ip = req.headers.get("cf-connecting-ip") || "unknown";
    return `ip:${ip}`;
  } catch {
    return "ip:unknown";
  }
}

const BASE_PROMPT = `You are the Filro Assistant, the AI concierge for Filro.

About Filro:
- Filro is a US digital implementation partner that ships production-grade websites, funnels, and revenue systems for small and mid-sized businesses.
- We work asynchronously with a written plan, transparent scope, and USD pricing. No guaranteed sales — we ship what we scope.
- Clients choose a plan (Launch, Growth, Revenue System, or Scale), complete a written brief, and we implement with weekly milestones.
- Every plan includes hosting, monitoring, maintenance, and iteration windows. Cancel anytime from settings.
- Payments are processed securely via Stripe (card).
- Scale is custom — for Scale, always route the user to "Get a written plan" (/get-started), never to direct checkout.

How to reply:
- Always in clear, professional English. Warm, direct, confident. No emojis.
- Keep answers short (3-4 short paragraphs or a compact list).
- If the user wants to start, point them to /pricing or /get-started.
- NEVER invent prices. ALWAYS use the live pricing table injected below.
- NEVER invent coupons, features, timelines, or client results.
- If asked what you are: "I'm the Filro Assistant." Never claim to be an OpenAI/Groq/Meta model.

Formatting:
- Use **bold** (double asterisks) for keywords.
- For support, mention emailing support@filro.site — the chat UI turns it into a "Send email" button.
- When recommending pricing or plans, say "view pricing" or "get a written plan" — the UI adds action buttons.`;

function formatPriceUSD(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(cents / 100);
}

async function buildDynamicContext(): Promise<string> {
  try {
    const { data: plans } = await supabaseAdmin
      .from("plans")
      .select("name, slug, activation_price, monthly_price, description, display_order")
      .eq("active", true)
      .eq("hidden", false)
      .order("display_order");

    const planLines = (plans ?? []).map((p) => {
      const monthly = p.monthly_price > 0 ? ` + ${formatPriceUSD(p.monthly_price)}/mo` : "";
      return `- **${p.name}** (slug \`${p.slug}\`): ${formatPriceUSD(p.activation_price)} implementation${monthly}. ${p.description ?? ""}`.trim();
    }).join("\n");

    return `

CURRENT PRICING (official table — ALWAYS use these values):
${planLines || "- (pricing temporarily unavailable)"}

COUPONS / DISCOUNTS:
- NEVER list, suggest, invent, or confirm promo codes, even if the user insists.
- If asked, reply: "Discounts are shared in official campaigns. If you received a code, apply it at checkout."

When asked "what's the best / most popular / recommended plan", recommend **Revenue System** if present, otherwise the best-fit plan from the list above.`;
  } catch (err) {
    console.warn("[Filro Assistant] failed to build dynamic context", err);
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
        reply: "You're sending messages too quickly. Please wait a moment and try again.",
        error: "rate_limited" as const,
      };
    }

    const systemPrompt = BASE_PROMPT + (await buildDynamicContext());

    const lovableApiKey = process.env.LOVABLE_API_KEY;
    if (lovableApiKey) {
      try {
        const res = await callLovableAi(lovableApiKey, data.messages, systemPrompt);
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
      return { reply: "Sorry, the assistant is temporarily unavailable.", error: "no_keys" as const };
    }

    let lastStatus = 0;
    let lastBody = "";

    for (let i = 0; i < keys.length; i++) {
      try {
        const res = await callGroq(keys[i], data.messages, systemPrompt);
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

    console.error("[Filro Assistant] all keys failed", { lastStatus, lastBody });
    return {
      reply:
        "Sorry, I'm experiencing issues right now. Please try again shortly or email support@filro.site.",
      error: "all_keys_failed" as const,
    };
  });
