export const PRIORITY_FPS = 30;
export const PRIORITY_AUDIO_SECONDS = 120.0;
export const PRIORITY_TOTAL_FRAMES = Math.round(120 * PRIORITY_FPS); // 3600

// Noir + champagne gold — editorial luxury palette, distinct from every other plan.
export const PRIORITY_THEME = {
  noir: "#0A0A0B",
  noirSoft: "#15151A",
  panel: "#1C1C22",
  panelHi: "#26262E",
  ink: "#F3ECD9",         // warm ivory text
  inkSoft: "#B7B0A2",
  gold: "#C9A24C",        // primary accent
  goldHi: "#E8C97A",
  goldLo: "#8C6E2F",
  rose: "#A6543B",        // ember accent for rare moments
  hairline: "#3A3A44",
};

export type PCaption = { from: number; to: number; text: string };

// 15 captions, synced to voice (120s audio).
export const PRIORITY_CAPTIONS: PCaption[] = [
  { from: 0.0,   to: 1.8,   text: "Este é o plano PRIORITY da Filro." },
  { from: 1.9,   to: 7.9,   text: "Presença digital mais completa, estratégica e com prioridade na execução." },
  { from: 8.0,   to: 18.1,  text: "Estrutura robusta, visual profissional e organização comercial que transmite confiança." },
  { from: 18.2,  to: 21.7,  text: "Não basta apenas estar online." },
  { from: 21.8,  to: 30.2,  text: "Apresentar melhor, destacar diferenciais e facilitar o contato pelo WhatsApp." },
  { from: 30.3,  to: 39.8,  text: "Apresentação, produtos, diferenciais, localização, FAQ, atendimento e seções comerciais." },
  { from: 39.9,  to: 46.6,  text: "O visitante entende rápido o que você oferece, por que confiar e como falar com você." },
  { from: 46.7,  to: 56.5,  text: "Responsiva: celular, computador e qualquer tamanho de tela com experiência profissional." },
  { from: 56.6,  to: 62.4,  text: "Você paga a ativação e envia as informações do seu negócio." },
  { from: 62.5,  to: 69.0,  text: "Adaptamos textos, cores, imagens, contatos, localização e serviços." },
  { from: 69.1,  to: 75.5,  text: "No PRIORITY: mais atenção à apresentação, clareza comercial e força visual." },
  { from: 75.6,  to: 84.6,  text: "Sem hospedagem, configuração ou parte técnica. A Filro cuida de tudo." },
  { from: 84.7,  to: 92.9,  text: "Ativação paga uma vez. Manutenção mensal cobre hospedagem, suporte e alterações." },
  { from: 93.0,  to: 110.5, text: "Para empresas que querem entrega mais completa, apresentação mais forte e mais percepção de valor." },
  { from: 110.6, to: 119.8, text: "Avance para o checkout e preencha os dados do seu negócio." },
];

// 16 scenes spanning 3600 frames. Each scene aligns to a beat in the voice-over.
export const PRIORITY_SCENES = [
  { id: "hook",          from: 0,    duration: 54   }, // 0.0 - 1.8
  { id: "promise",       from: 54,   duration: 183  }, // 1.8 - 7.9
  { id: "structure",     from: 237,  duration: 306  }, // 7.9 - 18.1
  { id: "beyond",        from: 543,  duration: 108  }, // 18.1 - 21.7
  { id: "differentials", from: 651,  duration: 255  }, // 21.7 - 30.2
  { id: "sections",      from: 906,  duration: 288  }, // 30.2 - 39.8
  { id: "clarity",       from: 1194, duration: 204  }, // 39.8 - 46.6
  { id: "responsive",    from: 1398, duration: 297  }, // 46.6 - 56.5
  { id: "payFlow",       from: 1695, duration: 177  }, // 56.5 - 62.4
  { id: "customize",     from: 1872, duration: 198  }, // 62.4 - 69.0
  { id: "focus",         from: 2070, duration: 195  }, // 69.0 - 75.5
  { id: "weHandle",      from: 2265, duration: 273  }, // 75.5 - 84.6
  { id: "payOnce",       from: 2538, duration: 249  }, // 84.6 - 92.9
  { id: "ideal",         from: 2787, duration: 528  }, // 92.9 - 110.5
  { id: "cta",           from: 3315, duration: 285  }, // 110.5 - 120.0
] as const;
