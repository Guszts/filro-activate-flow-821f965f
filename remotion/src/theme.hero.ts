export const HERO_FPS = 30;
export const HERO_AUDIO_SECONDS = 83.52;
export const HERO_TOTAL_FRAMES = Math.round(84 * HERO_FPS); // 2520

export const HERO_THEME = {
  paper: "#F1ECE0",
  paperWarm: "#E8E0CE",
  ink: "#0B0B0B",
  inkSoft: "#2A2A2A",
  azure: "#2E5BFF",
  lime: "#D7FF3A",
  flame: "#FF5A1F",
  white: "#FFFFFF",
};

export type HeroCaption = { from: number; to: number; text: string };
export const HERO_CAPTIONS: HeroCaption[] = [
  { from: 0.3,  to: 6.2,  text: "Seu negócio ainda depende só do Instagram e WhatsApp pra parecer profissional?" },
  { from: 6.9,  to: 11.5, text: "A Filro cria páginas digitais para negócios locais" },
  { from: 11.5, to: 16.1, text: "que querem se apresentar melhor e transmitir mais confiança." },
  { from: 16.8, to: 22.0, text: "Em vez de improvisar, você recebe uma estrutura profissional" },
  { from: 22.0, to: 28.0, text: "adaptada ao seu negócio, com botão direto para atendimento." },
  { from: 28.9, to: 34.5, text: "Sua página apresenta serviços, produtos, localização e diferenciais" },
  { from: 34.5, to: 39.8, text: "— tudo o que o cliente precisa antes de chamar no WhatsApp." },
  { from: 40.5, to: 48.4, text: "O objetivo: parecer mais confiável, mais preparado, mais fácil de entender." },
  { from: 49.0, to: 54.5, text: "Funciona bem no celular, computador e diferentes tamanhos de tela." },
  { from: 54.5, to: 59.5, text: "Sem código, hospedagem, configuração ou parte técnica." },
  { from: 60.1, to: 66.0, text: "A Filro cuida da adaptação, da estrutura visual e da publicação." },
  { from: 66.0, to: 71.6, text: "Você escolhe o plano, envia as informações e recebe tudo pronto." },
  { from: 72.4, to: 77.7, text: "Uma página profissional. Um contato mais fácil. Uma imagem mais forte." },
  { from: 78.4, to: 83.5, text: "Conheça os planos da Filro e ative sua presença digital." },
];

export const HERO_SCENES = [
  { id: "questionHook", from: 0,    duration: 207 }, // 0.0 - 6.9
  { id: "promise",      from: 207,  duration: 297 }, // 6.9 - 16.8
  { id: "structure",    from: 504,  duration: 363 }, // 16.8 - 28.9
  { id: "content",      from: 867,  duration: 348 }, // 28.9 - 40.5
  { id: "trust",        from: 1215, duration: 255 }, // 40.5 - 49.0
  { id: "devices",      from: 1470, duration: 333 }, // 49.0 - 60.1
  { id: "noTech",       from: 1803, duration: 357 }, // 60.1 - 72.0
  { id: "triplet",      from: 2160, duration: 192 }, // 72.0 - 78.4
  { id: "cta",          from: 2352, duration: 168 }, // 78.4 - 84.0
] as const;
