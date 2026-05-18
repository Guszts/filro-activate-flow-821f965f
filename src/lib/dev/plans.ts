export type DevPlanSlug = "dev_start" | "dev_pro" | "dev_scale";

export type DevPlan = {
  slug: DevPlanSlug;
  name: string;
  tagline: string;
  monthlyPrice: number; // BRL (cents → divide by 100 for display)
  monthlyCredits: number;
  features: string[];
  bestFor: string;
  highlight?: boolean;
};

export const DEV_PLANS: DevPlan[] = [
  {
    slug: "dev_start",
    name: "Starter",
    tagline: "Para um site profissional pessoal ou de pequeno negócio.",
    monthlyPrice: 4700,
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
    slug: "dev_pro",
    name: "Pro",
    tagline: "Para quem mantém vários sites e campanhas ativas.",
    monthlyPrice: 9700,
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
    slug: "dev_scale",
    name: "Scale",
    tagline: "Volume para times e operações maiores.",
    monthlyPrice: 19700,
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

export const FREE_SIGNUP_CREDITS = 10;

export function getDevPlan(slug: string): DevPlan | undefined {
  return DEV_PLANS.find((p) => p.slug === slug);
}

export function formatBRL(valueInCents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(valueInCents / 100);
}
