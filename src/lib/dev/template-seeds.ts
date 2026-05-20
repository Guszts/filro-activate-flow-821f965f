// Rich JSON snapshots used to seed `generated_content` when a project is
// created from a template. Without these, the project would start with `{}`
// and the AI would have to invent everything from scratch on the first edit
// (which produced weak, generic copy and lost the template's character).
// Each seed mirrors the spirit and content of the bespoke template preview
// so that edits like "translate to Portuguese" or "swap products" preserve
// the template's structure instead of nuking it.

export type SeededContent = {
  hero: { eyebrow: string; title: string; subtitle: string; ctaPrimary: string; ctaSecondary?: string };
  about: { title: string; body: string };
  services: { title: string; items: Array<{ name: string; description: string }> };
  highlights: string[];
  testimonial: { quote: string; author: string };
  cta: { title: string; body: string; buttonLabel: string };
  contact: { whatsapp?: string; address?: string; hours?: string };
  colors: { primary: string; accent: string; background: string; ink: string };
};

function seed(name: string, partial: Partial<SeededContent> & { hero: SeededContent["hero"]; services: SeededContent["services"]; about: SeededContent["about"]; }): SeededContent {
  return {
    highlights: ["Atendimento profissional", "Resposta rápida no WhatsApp", "Qualidade comprovada", "Compromisso com o prazo"],
    testimonial: { quote: `Recomendo de olhos fechados. Atendimento impecável e resultado acima do esperado.`, author: `Cliente — ${name}` },
    cta: { title: "Vamos conversar?", body: "Fale agora pelo WhatsApp e receba um atendimento personalizado.", buttonLabel: "Falar no WhatsApp" },
    contact: { whatsapp: "", address: "", hours: "" },
    colors: { primary: "#0F172A", accent: "#F97316", background: "#FAFAF7", ink: "#0F172A" },
    ...partial,
  };
}

export const TEMPLATE_SEEDS: Record<string, (businessName: string, whatsapp?: string) => SeededContent> = {
  "clinica-local": (name, wa) => seed(name, {
    hero: {
      eyebrow: "Clínica • Saúde & bem-estar",
      title: `${name} — cuidado próximo de você`,
      subtitle: "Equipe especializada, ambiente acolhedor e atendimento humanizado. Agende sua consulta pelo WhatsApp.",
      ctaPrimary: "Agendar pelo WhatsApp",
      ctaSecondary: "Conhecer a clínica",
    },
    about: {
      title: `Sobre a ${name}`,
      body: `A ${name} reúne profissionais experientes para entregar um atendimento próximo, com escuta atenta, diagnóstico cuidadoso e protocolos atualizados. Nosso compromisso é com a sua saúde e bem-estar.`,
    },
    services: {
      title: "Especialidades & serviços",
      items: [
        { name: "Avaliação clínica", description: "Consulta completa com diagnóstico e plano de tratamento individualizado." },
        { name: "Procedimentos estéticos", description: "Protocolos modernos com equipamentos de última geração." },
        { name: "Acompanhamento contínuo", description: "Acompanhamento próximo do início ao fim do tratamento." },
        { name: "Pacotes personalizados", description: "Combinações sob medida para cada perfil e objetivo." },
      ],
    },
    highlights: ["Equipe especializada", "Equipamentos modernos", "Ambiente acolhedor", "Atendimento humanizado"],
    contact: { whatsapp: wa, address: "Endereço da clínica", hours: "Seg a Sex 8h–19h, Sáb 8h–13h" },
    colors: { primary: "#1F3A5F", accent: "#E0A458", background: "#F7F4EE", ink: "#1F2937" },
  }),

  "restaurante-cardapio": (name, wa) => seed(name, {
    hero: {
      eyebrow: "Restaurante • Cardápio",
      title: `${name} — sabor que aproxima`,
      subtitle: "Pratos preparados com ingredientes selecionados. Faça seu pedido pelo WhatsApp ou venha nos visitar.",
      ctaPrimary: "Pedir pelo WhatsApp",
      ctaSecondary: "Ver cardápio",
    },
    about: {
      title: "Nossa cozinha",
      body: `Na ${name}, cada prato é preparado com cuidado, ingredientes frescos e a paixão de quem cozinha para receber bem. Ambiente acolhedor para todas as ocasiões.`,
    },
    services: {
      title: "Destaques do cardápio",
      items: [
        { name: "Entradas", description: "Opções leves e saborosas para começar bem a refeição." },
        { name: "Pratos principais", description: "Receitas da casa preparadas na hora, com ingredientes selecionados." },
        { name: "Combos & promoções", description: "Combinações pensadas para você economizar sem abrir mão do sabor." },
        { name: "Sobremesas & bebidas", description: "Doces artesanais e carta de bebidas para fechar com chave de ouro." },
      ],
    },
    highlights: ["Ingredientes selecionados", "Pedido fácil pelo WhatsApp", "Ambiente acolhedor", "Entrega rápida"],
    contact: { whatsapp: wa, address: "Endereço do restaurante", hours: "Ter a Dom 11h30–23h" },
    colors: { primary: "#7A1F1F", accent: "#E8B14A", background: "#FBF6EE", ink: "#1A1A1A" },
  }),

  "oficina-auto": (name, wa) => seed(name, {
    hero: {
      eyebrow: "Oficina • Auto",
      title: `${name} — seu carro em boas mãos`,
      subtitle: "Diagnóstico honesto, peças de qualidade e prazo cumprido. Solicite um orçamento sem compromisso.",
      ctaPrimary: "Orçamento pelo WhatsApp",
      ctaSecondary: "Nossos serviços",
    },
    about: {
      title: `Sobre a ${name}`,
      body: `Equipe técnica com anos de estrada, equipamentos atualizados e atendimento direto. Trabalhamos para entregar seu carro funcionando e no prazo combinado.`,
    },
    services: {
      title: "Serviços oferecidos",
      items: [
        { name: "Mecânica geral", description: "Revisão, manutenção preventiva e reparos com peças de qualidade." },
        { name: "Diagnóstico eletrônico", description: "Identificação precisa de falhas com scanner automotivo." },
        { name: "Suspensão & freios", description: "Inspeção e troca com peças homologadas e garantia." },
        { name: "Estética automotiva", description: "Polimento, higienização interna e cristalização." },
      ],
    },
    highlights: ["Garantia nos serviços", "Peças de qualidade", "Orçamento sem compromisso", "Prazo cumprido"],
    contact: { whatsapp: wa, address: "Endereço da oficina", hours: "Seg a Sex 8h–18h, Sáb 8h–12h" },
    colors: { primary: "#111827", accent: "#F59E0B", background: "#F4F4F2", ink: "#0F172A" },
  }),

  "loja-local": (name, wa) => seed(name, {
    hero: {
      eyebrow: "Loja • Coleção atual",
      title: `${name} — peças selecionadas para você`,
      subtitle: "Produtos escolhidos a dedo, atendimento próximo e entrega rápida na cidade. Veja os destaques e fale com a gente.",
      ctaPrimary: "Comprar pelo WhatsApp",
      ctaSecondary: "Ver coleção",
    },
    about: {
      title: `Sobre a ${name}`,
      body: `Curadoria atenta, peças com história e atendimento que faz diferença. Na ${name} você encontra o que combina com o seu estilo, sem fricção.`,
    },
    services: {
      title: "Destaques da loja",
      items: [
        { name: "Novidades da semana", description: "Os lançamentos mais recentes, prontos para envio." },
        { name: "Mais vendidos", description: "Os queridinhos da casa que não saem da vitrine." },
        { name: "Promoções", description: "Ofertas selecionadas com preços imperdíveis." },
        { name: "Coleções especiais", description: "Cápsulas e edições limitadas pensadas para você." },
      ],
    },
    highlights: ["Entrega rápida", "Atendimento personalizado", "Pagamento facilitado", "Trocas sem dor de cabeça"],
    contact: { whatsapp: wa, address: "Endereço da loja", hours: "Seg a Sáb 9h–19h" },
    colors: { primary: "#1F2937", accent: "#D97706", background: "#F8F4EC", ink: "#111827" },
  }),

  "prestador-servico": (name, wa) => seed(name, {
    hero: {
      eyebrow: "Serviços • Atendimento local",
      title: `${name} — solução rápida e confiável`,
      subtitle: "Atendimento ágil, preço justo e trabalho garantido. Solicite um orçamento agora pelo WhatsApp.",
      ctaPrimary: "Pedir orçamento",
      ctaSecondary: "Serviços",
    },
    about: {
      title: `Quem é a ${name}`,
      body: `Profissional com experiência de campo, foco em resolver o problema do cliente de forma rápida, transparente e com garantia.`,
    },
    services: {
      title: "Serviços oferecidos",
      items: [
        { name: "Serviço principal", description: "Execução completa com material de qualidade e garantia." },
        { name: "Atendimento emergencial", description: "Resposta rápida para imprevistos no mesmo dia." },
        { name: "Manutenção preventiva", description: "Planos para evitar problemas e prolongar a vida útil." },
        { name: "Visita técnica", description: "Diagnóstico no local com orçamento detalhado." },
      ],
    },
    highlights: ["Orçamento sem compromisso", "Atendimento no mesmo dia", "Garantia no serviço", "Preço justo"],
    contact: { whatsapp: wa, address: "Área de atendimento", hours: "Seg a Sáb 8h–20h" },
    colors: { primary: "#0F172A", accent: "#10B981", background: "#F5F7F6", ink: "#0F172A" },
  }),

  "landing-vendas": (name, wa) => seed(name, {
    hero: {
      eyebrow: "Oferta por tempo limitado",
      title: `${name} — o resultado que você procura`,
      subtitle: "Um método direto ao ponto, com passo a passo claro, suporte e garantia. Comece hoje e veja a diferença.",
      ctaPrimary: "Quero garantir agora",
      ctaSecondary: "Como funciona",
    },
    about: {
      title: "Por que isso funciona",
      body: `${name} foi desenhado para entregar resultado em pouco tempo, mesmo para quem está começando. Conteúdo objetivo, sem enrolação, com suporte humano.`,
    },
    services: {
      title: "O que você recebe",
      items: [
        { name: "Acesso completo ao método", description: "Aulas práticas, materiais e templates prontos para usar." },
        { name: "Bônus exclusivos", description: "Conteúdos extras para acelerar seus primeiros resultados." },
        { name: "Suporte dedicado", description: "Tire dúvidas com um time pronto para te ajudar." },
        { name: "Atualizações vitalícias", description: "Receba novas versões sem pagar nada a mais." },
      ],
    },
    highlights: ["Garantia incondicional", "Suporte humano", "Acesso vitalício", "Resultado prático"],
    testimonial: { quote: "Em poucas semanas já senti diferença real. Vale cada minuto investido.", author: "Aluno satisfeito" },
    cta: { title: "Garanta sua vaga com condição especial", body: "Oferta válida por tempo limitado. Comece agora com garantia total.", buttonLabel: "Quero garantir" },
    contact: { whatsapp: wa, address: "", hours: "" },
    colors: { primary: "#111111", accent: "#F43F5E", background: "#FAFAFA", ink: "#0A0A0A" },
  }),

  "viagem-wishes": (name, wa) => seed(name, {
    hero: {
      eyebrow: "Agência • Pacotes selecionados",
      title: `${name} — sua próxima viagem começa aqui`,
      subtitle: "Destinos selecionados, roteiros sob medida e atendimento próximo. Reserve pelo WhatsApp e viaje com tranquilidade.",
      ctaPrimary: "Reservar pelo WhatsApp",
      ctaSecondary: "Ver pacotes",
    },
    about: {
      title: `Sobre a ${name}`,
      body: `Especialistas em criar experiências de viagem memoráveis. Trabalhamos com fornecedores parceiros e cuidamos de cada detalhe — do voo ao hotel — para você apenas curtir.`,
    },
    services: {
      title: "Pacotes em destaque",
      items: [
        { name: "Praias do Nordeste", description: "Pacotes completos com voo, hospedagem e passeios em destinos paradisíacos." },
        { name: "Europa clássica", description: "Roteiros prontos pelas principais capitais europeias com guia em português." },
        { name: "Ásia & Oriente Médio", description: "Experiências culturais únicas com hospedagens selecionadas." },
        { name: "Resorts all inclusive", description: "Tudo incluso para você descansar sem se preocupar com nada." },
      ],
    },
    highlights: ["Atendimento dedicado", "Pacotes com voo + hotel", "Parcelamento facilitado", "Suporte 24h durante a viagem"],
    contact: { whatsapp: wa, address: "Atendimento on-line e presencial", hours: "Seg a Sáb 9h–19h" },
    colors: { primary: "#0F2A4A", accent: "#E8A464", background: "#F6F1E7", ink: "#0F172A" },
  }),
};

export function getTemplateSeed(slug: string | null | undefined, businessName: string, whatsapp?: string): SeededContent | null {
  if (!slug) return null;
  const factory = TEMPLATE_SEEDS[slug];
  if (!factory) return null;
  return factory(businessName, whatsapp);
}
