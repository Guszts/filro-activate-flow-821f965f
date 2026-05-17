export type DevPlan = {
  slug: "dev_start" | "dev_plus" | "dev_pro" | "dev_scale";
  name: string;
  tagline: string;
  activationPrice: number; // BRL
  monthlyPrice: number; // BRL
  monthlyChangeCredits: number;
  maxSections: number;
  features: string[];
  bestFor: string;
  highlight?: boolean;
};

export const DEV_PLANS: DevPlan[] = [
  {
    slug: "dev_start",
    name: "Dev Start",
    tagline: "Para começar com um site simples e direto.",
    activationPrice: 197,
    monthlyPrice: 97,
    monthlyChangeCredits: 3,
    maxSections: 5,
    features: [
      "1 site a partir de modelo",
      "Até 5 seções",
      "Personalização visual básica",
      "Botão de WhatsApp",
      "SEO básico",
      "3 alterações por mês via chat",
      "Subdomínio Filro",
      "Suporte básico",
    ],
    bestFor: "Pequenos negócios locais que precisam de presença online.",
  },
  {
    slug: "dev_plus",
    name: "Dev Plus",
    tagline: "Para negócios que querem uma página comercial mais forte.",
    activationPrice: 297,
    monthlyPrice: 147,
    monthlyChangeCredits: 8,
    maxSections: 8,
    features: [
      "1 site a partir de modelo",
      "Até 8 seções",
      "Personalização visual avançada",
      "Vitrine de produtos/serviços",
      "WhatsApp + Google Maps",
      "Estrutura analítica básica",
      "8 alterações por mês via chat",
      "Suporte a domínio próprio",
      "Suporte prioritário",
    ],
    bestFor: "Comércios e prestadores que querem mais conversão.",
    highlight: true,
  },
  {
    slug: "dev_pro",
    name: "Dev Pro",
    tagline: "Para uma presença digital mais completa.",
    activationPrice: 497,
    monthlyPrice: 197,
    monthlyChangeCredits: 15,
    maxSections: 12,
    features: [
      "1 site completo",
      "Até 12 seções",
      "Customização avançada de layout",
      "Catálogo de produtos/serviços",
      "Captura de leads",
      "Estrutura SEO",
      "Revisão de copy",
      "15 alterações por mês via chat",
      "Suporte a domínio próprio",
      "Layout focado em conversão",
      "Fila de produção prioritária",
    ],
    bestFor: "Negócios que querem um site comercial robusto.",
  },
  {
    slug: "dev_scale",
    name: "Dev Scale",
    tagline: "Para múltiplas páginas, campanhas e operações maiores.",
    activationPrice: 997,
    monthlyPrice: 397,
    monthlyChangeCredits: 30,
    maxSections: 12,
    features: [
      "Até 3 sites ou landing pages",
      "Personalização avançada",
      "Múltiplos modelos",
      "Páginas de campanha",
      "Captura de leads",
      "Estrutura de conversão",
      "30 alterações por mês via chat",
      "Suporte a domínio/subdomínio",
      "Suporte prioritário",
      "Ciclo mensal de melhorias",
    ],
    bestFor: "Agências, campanhas recorrentes e operações com múltiplas ofertas.",
  },
];

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
