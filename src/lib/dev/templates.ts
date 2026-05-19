import clinicaCover from "@/assets/dev-templates/clinica-local.jpg";
import restauranteCover from "@/assets/dev-templates/restaurante-cardapio.jpg";
import oficinaCover from "@/assets/dev-templates/oficina-auto.jpg";
import lojaCover from "@/assets/dev-templates/loja-local.jpg";
import prestadorCover from "@/assets/dev-templates/prestador-servico.jpg";
import landingCover from "@/assets/dev-templates/landing-vendas.jpg";
import viagemCover from "@/assets/dev-templates/viagem-wishes.jpg";

export type DevTemplate = {
  slug: string;
  name: string;
  segment: string;
  description: string;
  longDescription: string;
  sections: string[];
  bestFor: string[];
  customizable: string[];
  requiredInfo: string[];
  recommendedPlan: "dev_start" | "dev_plus" | "dev_pro" | "dev_scale";
  coverImage: string;
  /** Optional internal preview route (e.g. /dev/preview/viagem-wishes) — when present, the template detail page renders it in a live iframe. */
  previewRoute?: string;
};

export const DEV_TEMPLATES: DevTemplate[] = [
  {
    slug: "clinica-local",
    name: "Clínica Local",
    segment: "Clínicas, estética e saúde local",
    description:
      "Site institucional para clínicas, consultórios e atendimentos locais.",
    longDescription:
      "Estrutura voltada para gerar confiança e marcar consultas. Foco em apresentar serviços, profissionais e localização com chamadas claras para WhatsApp.",
    sections: ["Hero","Serviços","Sobre","Diferenciais","Depoimentos","Localização","FAQ","CTA WhatsApp"],
    bestFor: ["Clínicas de estética","Consultórios médicos e odontológicos","Fisioterapia e psicologia"],
    customizable: ["Cores e identidade visual","Lista de serviços","Texto sobre a clínica","Endereço e horários","WhatsApp"],
    requiredInfo: ["Nome da clínica e segmento","Lista de serviços","Endereço completo","WhatsApp e horário","Fotos do espaço (opcional)"],
    recommendedPlan: "dev_plus",
    coverImage: clinicaCover,
    previewRoute: "/dev/preview/clinica-local",
  },
  {
    slug: "restaurante-cardapio",
    name: "Restaurante e Cardápio",
    segment: "Restaurantes, lanchonetes, hamburguerias e pizzarias",
    description: "Site com cardápio, chamadas para pedido e WhatsApp.",
    longDescription:
      "Modelo pensado para mostrar o cardápio de forma organizada e direcionar o cliente para o pedido por WhatsApp ou aplicativo.",
    sections: ["Hero","Categorias","Produtos","Combos","Horário de funcionamento","Localização","Avaliações","CTA pedido"],
    bestFor: ["Restaurantes","Hamburguerias","Pizzarias","Cafés"],
    customizable: ["Categorias e itens do cardápio","Combos e promoções","Cores e fotos","Endereço e horários"],
    requiredInfo: ["Cardápio organizado por categoria","Preços (opcional)","Fotos dos pratos","Endereço, horário, WhatsApp"],
    recommendedPlan: "dev_pro",
    coverImage: restauranteCover,
    previewRoute: "/dev/preview/restaurante-cardapio",
  },
  {
    slug: "oficina-auto",
    name: "Oficina e Auto",
    segment: "Oficinas, mecânicas e estética automotiva",
    description: "Site comercial para gerar orçamento e confiança.",
    longDescription:
      "Apresenta os serviços, prova social e diferenciais para que o cliente solicite orçamento por WhatsApp.",
    sections: ["Hero","Serviços","Antes e depois","Prova social","Localização","Garantias","CTA orçamento"],
    bestFor: ["Oficinas mecânicas","Estética automotiva","Funilaria"],
    customizable: ["Serviços e categorias","Galeria de antes e depois","Depoimentos","Garantias oferecidas"],
    requiredInfo: ["Lista de serviços","Fotos antes/depois","Endereço e WhatsApp","Tempo de mercado"],
    recommendedPlan: "dev_plus",
    coverImage: oficinaCover,
    previewRoute: "/dev/preview/oficina-auto",
  },
  {
    slug: "loja-local",
    name: "Loja Local",
    segment: "Moda, acessórios, eletrônicos e variedades",
    description: "Página comercial para apresentar produtos e levar para WhatsApp.",
    longDescription:
      "Vitrine simples e visual para destacar coleções, promoções e direcionar o cliente para o atendimento.",
    sections: ["Hero","Vitrine","Benefícios","Coleções","Promoções","Localização","CTA WhatsApp"],
    bestFor: ["Lojas de moda","Acessórios","Eletrônicos","Variedades"],
    customizable: ["Produtos em destaque","Coleções e categorias","Promoções da semana","Cores da marca"],
    requiredInfo: ["Produtos com fotos","Categorias","WhatsApp e endereço"],
    recommendedPlan: "dev_plus",
    coverImage: lojaCover,
    previewRoute: "/dev/preview/loja-local",
  },
  {
    slug: "prestador-servico",
    name: "Prestador de Serviço",
    segment: "Encanador, eletricista, limpeza, assistência técnica",
    description: "Site direto para captação de orçamento.",
    longDescription:
      "Estrutura objetiva: serviços, área de atendimento e prova social para gerar contatos qualificados.",
    sections: ["Hero","Serviços","Área de atendimento","Benefícios","Depoimentos","FAQ","CTA orçamento"],
    bestFor: ["Encanadores","Eletricistas","Limpeza","Assistência técnica"],
    customizable: ["Serviços oferecidos","Bairros e cidades atendidas","Depoimentos","Perguntas frequentes"],
    requiredInfo: ["Serviços e descrição","Cidades/bairros atendidos","WhatsApp"],
    recommendedPlan: "dev_start",
    coverImage: prestadorCover,
  },
  {
    slug: "landing-vendas",
    name: "Landing Page de Venda",
    segment: "Infoprodutos, serviços, campanhas e ofertas",
    description: "Landing page focada em conversão.",
    longDescription:
      "Página única com copy de conversão: problema, solução, benefícios, oferta, garantia e CTA forte.",
    sections: ["Hero","Problema","Solução","Benefícios","Oferta","Garantia","FAQ","CTA compra"],
    bestFor: ["Infoprodutos","Lançamentos","Campanhas de oferta"],
    customizable: ["Copy de conversão","Oferta e bônus","Garantia","FAQ","Botão de compra"],
    requiredInfo: ["Produto/oferta","Preço e garantia","Bônus (opcional)","Link de checkout"],
    recommendedPlan: "dev_pro",
    coverImage: landingCover,
  },
  {
    slug: "viagem-wishes",
    name: "Viagem & Turismo (Wishes)",
    segment: "Agências, pacotes de viagem, turismo e experiências",
    description:
      "Landing premium estilo resort para agências de viagem, com busca de pacotes, destinos e reserva por WhatsApp.",
    longDescription:
      "Modelo editorial inspirado em plataformas de booking de luxo. Hero com imagem grande de praia, barra de busca flutuante (localização, data, hóspedes), sidebar com filtros de pacotes (Ofertas, Ásia, Europa, Oriente Médio, América) e grid de destinos com cards horizontais e verticais. Inclui páginas internas para Reservar, Pacotes e Lugares Populares, modal de reserva com nome e WhatsApp, animações suaves e responsividade total.",
    sections: ["Header com navegação","Hero com imagem de resort","Barra de busca flutuante","Sidebar de filtros de pacotes","Grid de destinos (cards mistos)","Página Reservar","Página Pacotes","Página Lugares Populares","Modal de reserva","Footer"],
    bestFor: ["Agências de viagem","Operadoras de turismo","Pacotes e experiências","Hospedagens e resorts","Guias e roteiros premium"],
    customizable: ["Nome da marca e logo","Destinos e pacotes","Categorias e filtros","Imagens dos destinos","Textos e CTAs em português","WhatsApp de reserva"],
    requiredInfo: ["Nome da agência","Lista de destinos com fotos","Categorias de pacotes","WhatsApp para reservas","Descrição da experiência"],
    recommendedPlan: "dev_pro",
    coverImage: viagemCover,
    previewRoute: "/dev/preview/viagem-wishes",
  },
];

export function getDevTemplate(slug: string): DevTemplate | undefined {
  return DEV_TEMPLATES.find((t) => t.slug === slug);
}
