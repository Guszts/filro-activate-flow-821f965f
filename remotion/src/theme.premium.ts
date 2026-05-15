import type { Caption } from "./theme";

export const PREMIUM_FPS = 30;
export const PREMIUM_AUDIO_SECONDS = 140.0;
export const PREMIUM_TOTAL_FRAMES = Math.round(140 * PREMIUM_FPS); // 4200

export const PREMIUM_CAPTIONS: Caption[] = [
  { from: 0.0,   to: 4.0,   text: "Este é o plano PREMIUM da Filro." },
  { from: 4.1,   to: 12.0,  text: "Presença digital mais completa, refinada e preparada para gerar confiança." },
  { from: 12.1,  to: 21.0,  text: "Estrutura digital avançada, visual elaborado e organização comercial forte." },
  { from: 21.1,  to: 27.0,  text: "Indicado para empresas que querem ir além do básico." },
  { from: 27.1,  to: 36.0,  text: "Apresentação mais profissional, convincente e alinhada à percepção de valor." },
  { from: 36.1,  to: 49.0,  text: "Empresa, produtos, diferenciais, localização, imagens, FAQ, WhatsApp e seções comerciais." },
  { from: 49.1,  to: 58.0,  text: "O visitante entende rápido, percebe confiança e encontra o caminho para o contato." },
  { from: 58.1,  to: 67.0,  text: "Página responsiva no celular, no computador e em diferentes tamanhos de tela." },
  { from: 67.1,  to: 75.0,  text: "Experiência profissional no celular, onde a maioria dos clientes acessa." },
  { from: 75.1,  to: 83.0,  text: "Você paga a ativação e envia as informações principais do negócio." },
  { from: 83.1,  to: 92.0,  text: "Adaptamos textos, cores, imagens, contatos, localização e serviços." },
  { from: 92.1,  to: 100.0, text: "PREMIUM: mais presença, melhor apresentação e mais profissionalismo." },
  { from: 100.1, to: 108.0, text: "Sem hospedagem, configuração ou parte técnica. A Filro cuida de tudo." },
  { from: 108.1, to: 117.0, text: "Ativação paga uma vez. Manutenção cobre hospedagem, suporte e ajustes." },
  { from: 117.1, to: 128.0, text: "Ideal para causar impressão superior e transmitir mais confiança." },
  { from: 128.1, to: 134.0, text: "Em resumo: estrutura avançada, visual refinado e mais valor." },
  { from: 134.1, to: 139.8, text: "Avance para o checkout e preencha os dados do negócio." },
];

// 17 scenes spanning 4200 frames (140s)
export const PREMIUM_SCENES = [
  { id: "hookP",        from: 0,    duration: 120 },  // 0.0 - 4.0
  { id: "completeP",    from: 120,  duration: 240 },  // 4.0 - 12.0
  { id: "advancedP",    from: 360,  duration: 270 },  // 12.0 - 21.0
  { id: "beyondP",      from: 630,  duration: 180 },  // 21.0 - 27.0
  { id: "valueP",       from: 810,  duration: 270 },  // 27.0 - 36.0
  { id: "sectionsP",    from: 1080, duration: 390 },  // 36.0 - 49.0
  { id: "journeyP",     from: 1470, duration: 270 },  // 49.0 - 58.0
  { id: "devicesP",     from: 1740, duration: 270 },  // 58.0 - 67.0
  { id: "mobilePrioP",  from: 2010, duration: 240 },  // 67.0 - 75.0
  { id: "payInfoP",     from: 2250, duration: 240 },  // 75.0 - 83.0
  { id: "adaptP",       from: 2490, duration: 270 },  // 83.0 - 92.0
  { id: "premiumStampP",from: 2760, duration: 240 },  // 92.0 - 100.0
  { id: "weHandleP",    from: 3000, duration: 240 },  // 100.0 - 108.0
  { id: "pricingP",     from: 3240, duration: 270 },  // 108.0 - 117.0
  { id: "impressionP",  from: 3510, duration: 330 },  // 117.0 - 128.0
  { id: "summaryP",     from: 3840, duration: 180 },  // 128.0 - 134.0
  { id: "ctaP",         from: 4020, duration: 180 },  // 134.0 - 140.0
] as const;
