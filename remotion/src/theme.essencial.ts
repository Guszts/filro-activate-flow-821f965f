import type { Caption } from "./theme";

export const ESSENCIAL_FPS = 30;
export const ESSENCIAL_AUDIO_SECONDS = 104.72;
export const ESSENCIAL_TOTAL_FRAMES = Math.round(105 * ESSENCIAL_FPS); // 3150

// Captions sync immediately with voice (no leading silence).
// Short lines, max 2 visual lines.
export const ESSENCIAL_CAPTIONS: Caption[] = [
  { from: 0.0,  to: 3.5,   text: "Este é o plano ESSENCIAL da Filro." },
  { from: 3.6,  to: 10.0,  text: "Para negócios que precisam de presença digital profissional, clara e funcional." },
  { from: 10.1, to: 17.0,  text: "Página estruturada para apresentar sua empresa e facilitar contato com clientes." },
  { from: 17.1, to: 26.0,  text: "Inclui informações, serviços, produtos, localização, WhatsApp, imagens e cores da marca." },
  { from: 26.1, to: 34.0,  text: "Objetivo: parecer mais confiável, organizada e pronta para receber clientes online." },
  { from: 34.1, to: 41.0,  text: "Responsiva: funciona no celular, no computador e em diferentes telas." },
  { from: 41.1, to: 48.5,  text: "A maioria dos clientes acessa pelo celular antes de comprar ou chamar." },
  { from: 48.6, to: 56.0,  text: "Você escolhe o plano, paga a ativação e envia os dados do seu negócio." },
  { from: 56.1, to: 63.5,  text: "A Filro adapta a página com textos, cores, imagens e informações comerciais." },
  { from: 63.6, to: 69.0,  text: "Sem hospedagem, código ou parte técnica para você configurar." },
  { from: 69.1, to: 73.0,  text: "A ativação é paga apenas uma vez." },
  { from: 73.1, to: 81.0,  text: "A manutenção mensal cobre hospedagem, suporte e pequenas alterações." },
  { from: 81.1, to: 88.5,  text: "Ideal para sair do improviso e ter uma página mais profissional." },
  { from: 88.6, to: 96.0,  text: "Em resumo: presença profissional, estrutura clara, contato e manutenção." },
  { from: 96.1, to: 104.6, text: "Avance para o checkout e preencha os dados do seu negócio." },
];

// 14 scenes spanning 3150 frames (≈105s)
export const ESSENCIAL_SCENES = [
  { id: "hook",    from: 0,    duration: 105 },  // 0.0 - 3.5
  { id: "promise", from: 105,  duration: 195 },  // 3.5 - 10.0
  { id: "page",    from: 300,  duration: 210 },  // 10.0 - 17.0
  { id: "fields",  from: 510,  duration: 270 },  // 17.0 - 26.0
  { id: "trust",   from: 780,  duration: 240 },  // 26.0 - 34.0
  { id: "mobile",  from: 1020, duration: 435 },  // 34.0 - 48.5 (covers reassurance + clarity)
  { id: "flow",    from: 1455, duration: 225 },  // 48.5 - 56.0
  { id: "adapt",   from: 1680, duration: 225 },  // 56.0 - 63.5
  { id: "noTech",  from: 1905, duration: 165 },  // 63.5 - 69.0
  { id: "oneTime", from: 2070, duration: 120 },  // 69.0 - 73.0
  { id: "monthly", from: 2190, duration: 240 },  // 73.0 - 81.0
  { id: "forWho",  from: 2430, duration: 225 },  // 81.0 - 88.5
  { id: "summary", from: 2655, duration: 225 },  // 88.5 - 96.0
  { id: "cta",     from: 2880, duration: 270 },  // 96.0 - 105.0
] as const;
