export type DevPlan = {
  slug: "free" | "starter" | "pro" | "scale";
  name: string;
  tagline: string;
  monthlyPrice: number; // BRL
  monthlyCredits: number;
  features: string[];
  bestFor: string;
  highlight?: boolean;
};

export const DEV_PLANS: DevPlan[] = [
  {
    slug: "free",
    name: "Grátis",
    tagline: "Comece agora, sem cartão.",
    monthlyPrice: 0,
    monthlyCredits: 10,
    features: [
      "10 créditos ao criar a conta",
      "1 site publicado em {seu-slug}.filro.site",
      "Editor manual ilimitado",
      "Editor com IA (1 crédito por edição)",
    ],
    bestFor: "Quem quer testar e publicar um site simples na hora.",
  },
  {
    slug: "starter",
    name: "Starter",
    tagline: "Para um site profissional pessoal ou de pequeno negócio.",
    monthlyPrice: 47,
    monthlyCredits: 50,
    features: [
      "50 créditos por mês",
      "Sites ilimitados (5 créditos cada)",
      "Editor IA + manual",
      "Suporte por e-mail",
    ],
    bestFor: "Negócios começando que iteram conteúdo com regularidade.",
  },
  {
    slug: "pro",
    name: "Pro",
    tagline: "Para quem mantém vários sites e campanhas ativas.",
    monthlyPrice: 97,
    monthlyCredits: 150,
    features: [
      "150 créditos por mês",
      "Sites ilimitados",
      "Editor IA + manual",
      "Domínio próprio (em breve)",
      "Suporte prioritário",
    ],
    bestFor: "Agências, freelancers e PMEs com várias páginas.",
    highlight: true,
  },
  {
    slug: "scale",
    name: "Scale",
    tagline: "Volume para times e operações maiores.",
    monthlyPrice: 197,
    monthlyCredits: 400,
    features: [
      "400 créditos por mês",
      "Sites ilimitados",
      "Editor IA + manual",
      "Domínio próprio (em breve)",
      "Suporte dedicado",
    ],
    bestFor: "Operações maiores e múltiplas campanhas.",
  },
];

export const CREDIT_COSTS = {
  generateSite: 5,
  aiEdit: 1,
} as const;

export function getDevPlan(slug: string): DevPlan | undefined {
  return DEV_PLANS.find((p) => p.slug === slug);
}

export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}
