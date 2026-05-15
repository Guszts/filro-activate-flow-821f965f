export const FPS = 30;
// Audio is 93.44s. Add small tail so the closing scene resolves visually.
export const AUDIO_SECONDS = 93.44;
export const TOTAL_FRAMES = Math.round(94 * FPS); // 2820

export const THEME = {
  paper: "#F1ECE0",
  paperWarm: "#E8E0CE",
  ink: "#0B0B0B",
  inkSoft: "#2A2A2A",
  azure: "#2E5BFF",
  lime: "#D7FF3A",
  flame: "#FF5A1F",
  white: "#FFFFFF",
  border: "#0B0B0B",
};

// Caption segments mapped to start/end seconds within the audio.
// Designed for legibility: short lines, never crowded.
export type Caption = { from: number; to: number; text: string };
export const CAPTIONS: Caption[] = [
  { from: 0.2,  to: 4.2,  text: "Este é o plano START da Filro." },
  { from: 4.4,  to: 11.0, text: "Para negócios que querem começar com presença digital simples, profissional e rápida." },
  { from: 11.2, to: 19.5, text: "Uma página objetiva para apresentar sua empresa e facilitar contato pelo WhatsApp." },
  { from: 19.7, to: 28.5, text: "Adaptada com nome, segmento, descrição, cores, imagens, localização e atendimento." },
  { from: 28.7, to: 36.0, text: "Funciona bem no celular: carregamento leve, visual limpo e navegação fácil." },
  { from: 36.2, to: 45.0, text: "O básico, bem feito: parecer profissional e criar presença online confiável." },
  { from: 45.2, to: 52.5, text: "Você escolhe o plano, paga a ativação e envia os dados do seu negócio." },
  { from: 52.7, to: 59.5, text: "A página é adaptada para representar sua empresa de forma clara e organizada." },
  { from: 59.7, to: 63.5, text: "A ativação é paga apenas uma vez." },
  { from: 63.7, to: 71.5, text: "Depois, a manutenção mensal cobre hospedagem, suporte e pequenas alterações." },
  { from: 71.7, to: 78.0, text: "Sem parte técnica: a Filro cuida da adaptação e da publicação." },
  { from: 78.2, to: 84.0, text: "Ideal para quem ainda não tem site ou cardápio digital." },
  { from: 84.2, to: 89.5, text: "Uma página simples, profissional e responsiva, pronta para receber contatos." },
  { from: 89.7, to: 93.4, text: "Avance para o checkout e preencha os dados do seu negócio." },
];

// Scene boundaries in frames. Each scene owns its own caption window.
// We avoid overlapping scenes; transitions live INSIDE scenes (in/out fades).
export const SCENES = [
  { id: "hook",       from: 0,    duration: 132 }, // 0.0 - 4.4s
  { id: "promise",    from: 132,  duration: 198 }, // 4.4 - 11.0
  { id: "page",       from: 330,  duration: 255 }, // 11.0 - 19.5
  { id: "fields",     from: 585,  duration: 270 }, // 19.5 - 28.5
  { id: "mobile",     from: 855,  duration: 225 }, // 28.5 - 36.0
  { id: "trust",      from: 1080, duration: 270 }, // 36.0 - 45.0
  { id: "flow",       from: 1350, duration: 225 }, // 45.0 - 52.5
  { id: "adapt",      from: 1575, duration: 210 }, // 52.5 - 59.5
  { id: "oneTime",    from: 1785, duration: 120 }, // 59.5 - 63.5
  { id: "monthly",    from: 1905, duration: 240 }, // 63.5 - 71.5
  { id: "noTech",     from: 2145, duration: 195 }, // 71.5 - 78.0
  { id: "forWho",     from: 2340, duration: 180 }, // 78.0 - 84.0
  { id: "summary",    from: 2520, duration: 165 }, // 84.0 - 89.5
  { id: "cta",        from: 2685, duration: 135 }, // 89.5 - 94.0
] as const;
