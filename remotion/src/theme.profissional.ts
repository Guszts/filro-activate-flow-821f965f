import type { Caption } from "./theme";

export const PROFISSIONAL_FPS = 30;
export const PROFISSIONAL_AUDIO_SECONDS = 118.0;
export const PROFISSIONAL_TOTAL_FRAMES = Math.round(118 * PROFISSIONAL_FPS); // 3540

// Captions sync immediately with voice (no leading silence).
export const PROFISSIONAL_CAPTIONS: Caption[] = [
  { from: 0.0,   to: 3.8,   text: "Este é o plano PROFISSIONAL da Filro." },
  { from: 3.9,   to: 13.5,  text: "Para negócios que querem presença digital mais forte e preparada para converter visitantes." },
  { from: 13.6,  to: 26.5,  text: "Página com estrutura avançada e visual elaborado para apresentar produtos, serviços e diferenciais." },
  { from: 26.6,  to: 31.0,  text: "Esse plano vai além de só colocar sua empresa na internet." },
  { from: 31.1,  to: 41.5,  text: "Ajuda o cliente a entender, perceber valor e encontrar o caminho para o contato." },
  { from: 41.6,  to: 55.5,  text: "Seções comerciais, apresentação, produtos, diferenciais, WhatsApp, FAQ e visual completo." },
  { from: 55.6,  to: 62.5,  text: "Adaptada para celular, computador e diferentes tamanhos de tela." },
  { from: 62.6,  to: 68.5,  text: "Apresentação profissional em qualquer dispositivo." },
  { from: 68.6,  to: 76.5,  text: "Você paga a ativação e envia as informações do seu negócio." },
  { from: 76.6,  to: 85.0,  text: "Usadas para adaptar textos, cores, imagens, contatos e serviços da sua página." },
  { from: 85.1,  to: 91.0,  text: "Sem hospedagem, configuração ou parte técnica para você lidar." },
  { from: 91.1,  to: 98.5,  text: "A Filro cuida da estrutura, adaptação e publicação." },
  { from: 98.6,  to: 105.0, text: "A ativação é paga apenas uma vez. Depois, a manutenção mensal mantém tudo online." },
  { from: 105.1, to: 112.0, text: "Para empresas que querem causar impressão melhor e transmitir mais confiança." },
  { from: 112.1, to: 117.9, text: "Avance para o checkout e preencha os dados do seu negócio." },
];

// 14 scenes spanning 3540 frames (118s)
export const PROFISSIONAL_SCENES = [
  { id: "hook",    from: 0,    duration: 117 },  // 0.0 - 3.9
  { id: "promise", from: 117,  duration: 291 },  // 3.9 - 13.6
  { id: "page",    from: 408,  duration: 387 },  // 13.6 - 26.5
  { id: "fields",  from: 795,  duration: 135 },  // 26.5 - 31.0  (clarity beat)
  { id: "trust",   from: 930,  duration: 318 },  // 31.0 - 41.6
  { id: "adapt",   from: 1248, duration: 420 },  // 41.6 - 55.6  (structure overview)
  { id: "mobile",  from: 1668, duration: 210 },  // 55.6 - 62.6
  { id: "forWho",  from: 1878, duration: 180 },  // 62.6 - 68.6  (any device)
  { id: "flow",    from: 2058, duration: 240 },  // 68.6 - 76.6
  { id: "fields",  from: 2298, duration: 255 },  // 76.6 - 85.1
  { id: "noTech",  from: 2553, duration: 180 },  // 85.1 - 91.1
  { id: "oneTime", from: 2733, duration: 225 },  // 91.1 - 98.6
  { id: "monthly", from: 2958, duration: 195 },  // 98.6 - 105.1
  { id: "summary", from: 3153, duration: 207 },  // 105.1 - 112.0
  { id: "cta",     from: 3360, duration: 180 },  // 112.0 - 118.0
] as const;
