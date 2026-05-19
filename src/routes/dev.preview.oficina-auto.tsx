import { createFileRoute } from "@tanstack/react-router";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export const Route = createFileRoute("/dev/preview/oficina-auto")({
  component: OficinaPreview,
  head: () => ({
    meta: [
      { title: "MotorPro · Oficina e Estética Automotiva" },
      { name: "description", content: "MotorPro — mecânica, funilaria e estética automotiva com orçamento por WhatsApp." },
    ],
  }),
});

// ---------------- Theme ----------------
const C = {
  page: "#EEF2F6", paper: "#FFFFFF", ink: "#0E1726", inkSoft: "#516274",
  muted: "#8A98A8", border: "#E2E8EF", pill: "#EAF0F6", divider: "#E0E6EE",
  brand: "#0B3B66", brandDark: "#062544", accent: "#F58220",
};

// ---------------- Data ----------------
type Service = {
  id: string; name: string; category: "mecanica" | "eletrica" | "estetica" | "funilaria" | "revisao" | "pneus";
  image: string; price: string; description: string; tag?: string; duration?: string;
};
const SERVICES: Service[] = [
  { id: "revisao-completa", name: "Revisão completa", category: "revisao", image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1200&q=80", price: "A partir de R$ 290", description: "Checklist com mais de 40 itens: motor, suspensão, freios, fluidos e sistema elétrico.", tag: "Mais pedido", duration: "2h" },
  { id: "troca-oleo", name: "Troca de óleo e filtros", category: "revisao", image: "https://images.unsplash.com/photo-1632823471565-1ecdf5c6da77?auto=format&fit=crop&w=1200&q=80", price: "A partir de R$ 180", description: "Óleo sintético ou semissintético, filtro de óleo, ar e combustível conforme a marca.", duration: "45min" },
  { id: "freios", name: "Sistema de freios", category: "mecanica", image: "https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&w=1200&q=80", price: "Sob orçamento", description: "Pastilhas, discos, fluido e regulagem completa do sistema de freios.", tag: "Segurança", duration: "1h30" },
  { id: "suspensao", name: "Suspensão e amortecedores", category: "mecanica", image: "https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&w=1200&q=80", price: "Sob orçamento", description: "Diagnóstico de ruídos, troca de amortecedores, batentes e buchas.", duration: "3h" },
  { id: "bateria", name: "Bateria e elétrica", category: "eletrica", image: "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=1200&q=80", price: "A partir de R$ 350", description: "Teste de carga, troca de bateria, alternador e diagnóstico de scanner automotivo.", duration: "1h" },
  { id: "ar-cond", name: "Ar-condicionado", category: "eletrica", image: "https://images.unsplash.com/photo-1591293836027-e05b48473b67?auto=format&fit=crop&w=1200&q=80", price: "A partir de R$ 220", description: "Higienização, recarga de gás e verificação de vazamentos.", duration: "1h30" },
  { id: "polimento", name: "Polimento técnico", category: "estetica", image: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=1200&q=80", price: "A partir de R$ 450", description: "Remoção de riscos superficiais, cristalização e proteção da pintura.", tag: "Top", duration: "4h" },
  { id: "vitrificacao", name: "Vitrificação de pintura", category: "estetica", image: "https://images.unsplash.com/photo-1605164599901-db7f68c4b3a8?auto=format&fit=crop&w=1200&q=80", price: "A partir de R$ 990", description: "Camada cerâmica de proteção com até 12 meses de durabilidade.", duration: "1 dia" },
  { id: "higienizacao", name: "Higienização interna", category: "estetica", image: "https://images.unsplash.com/photo-1605618826115-fb9e775cf795?auto=format&fit=crop&w=1200&q=80", price: "A partir de R$ 320", description: "Bancos, carpete, teto e ar-condicionado com produtos específicos.", duration: "3h" },
  { id: "funilaria", name: "Funilaria e pintura", category: "funilaria", image: "https://images.unsplash.com/photo-1518987048-93e29699e79a?auto=format&fit=crop&w=1200&q=80", price: "Sob orçamento", description: "Reparo de amassados, retoques e pintura completa com cabine fechada.", duration: "Conforme avaliação" },
  { id: "alinhamento", name: "Alinhamento e balanceamento", category: "pneus", image: "https://images.unsplash.com/photo-1597007030739-6d2e7172ee7c?auto=format&fit=crop&w=1200&q=80", price: "R$ 160", description: "Alinhamento computadorizado 3D e balanceamento das quatro rodas.", duration: "1h" },
  { id: "pneus", name: "Troca de pneus", category: "pneus", image: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1200&q=80", price: "Sob orçamento", description: "Pneus das principais marcas com montagem, válvulas e calibragem.", duration: "1h" },
];

const BEFORE_AFTER = [
  { id: "ba1", title: "Polimento técnico", before: "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=1200&q=80", after: "https://images.unsplash.com/photo-1605164599901-db7f68c4b3a8?auto=format&fit=crop&w=1200&q=80", description: "Carro de cliente após sessão de polimento técnico e cristalização." },
  { id: "ba2", title: "Reparo de funilaria", before: "https://images.unsplash.com/photo-1551522435-a13afa10f103?auto=format&fit=crop&w=1200&q=80", after: "https://images.unsplash.com/photo-1518987048-93e29699e79a?auto=format&fit=crop&w=1200&q=80", description: "Para-lama amassado recuperado e pintado em cabine fechada." },
  { id: "ba3", title: "Higienização interna", before: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80", after: "https://images.unsplash.com/photo-1605618826115-fb9e775cf795?auto=format&fit=crop&w=1200&q=80", description: "Bancos e carpete higienizados com produtos automotivos profissionais." },
];

const HERO_IMAGE = "https://images.unsplash.com/photo-1632823471565-1ecdf5c6da77?auto=format&fit=crop&w=1800&q=80";

const FILTERS = [
  { key: "revisao", label: "Revisão" },
  { key: "mecanica", label: "Mecânica" },
  { key: "eletrica", label: "Elétrica" },
  { key: "estetica", label: "Estética" },
  { key: "funilaria", label: "Funilaria" },
  { key: "pneus", label: "Pneus" },
] as const;
type FilterKey = (typeof FILTERS)[number]["key"];

const NAV_ITEMS = [
  { key: "inicio", label: "Início" },
  { key: "servicos", label: "Serviços" },
  { key: "antesdepois", label: "Antes e depois" },
  { key: "garantias", label: "Garantias" },
  { key: "frota", label: "Frota e empresas" },
  { key: "sobre", label: "Sobre" },
  { key: "blog", label: "Dicas" },
  { key: "orcamento", label: "Orçamento" },
  { key: "contato", label: "Contato" },
] as const;
type PageKey = (typeof NAV_ITEMS)[number]["key"];

const imgFallback = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const img = e.currentTarget;
  if (img.dataset.fb) return;
  img.dataset.fb = "1";
  img.src = `https://picsum.photos/seed/${encodeURIComponent(img.alt || "auto")}/1200/800`;
};

// ---------------- Detail context ----------------
type DetailItem = {
  id: string; kind: "servico" | "trabalho" | "post"; title: string; subtitle?: string;
  image: string; price?: string; description: string; highlights?: string[];
};
type DetailCtx = { open: (item: DetailItem) => void; quote: (s: { name: string; price?: string }) => void };
const DetailContext = createContext<DetailCtx | null>(null);
function useDetail() {
  const ctx = useContext(DetailContext);
  if (!ctx) throw new Error("Missing DetailContext");
  return ctx;
}
function serviceToDetail(s: Service): DetailItem {
  return {
    id: `srv-${s.id}`, kind: "servico", title: s.name, subtitle: s.duration ? `Duração estimada: ${s.duration}` : undefined,
    image: s.image, price: s.price, description: s.description,
    highlights: ["Diagnóstico gratuito", "Peças com garantia", "Orçamento sem compromisso", "Mecânicos certificados"],
  };
}

// ---------------- Root ----------------
export function OficinaPreview() {
  const [page, setPage] = useState<PageKey>("inicio");
  const [filter, setFilter] = useState<FilterKey>("revisao");
  const [quoteFor, setQuoteFor] = useState<{ name: string; price?: string } | null>(null);
  const [detail, setDetail] = useState<DetailItem | null>(null);

  const filtered = useMemo(() => SERVICES.filter((s) => s.category === filter), [filter]);

  useEffect(() => { setDetail(null); }, [page]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [detail, page]);

  const ctxValue: DetailCtx = { open: setDetail, quote: setQuoteFor };

  return (
    <DetailContext.Provider value={ctxValue}>
      <div style={{ background: C.page, color: C.ink, fontFamily: "Inter, Manrope, ui-sans-serif, system-ui" }} className="min-h-screen w-full">
        <ResponsiveStyles />
        <div className="moto-shell mx-auto" style={{
          background: C.paper, maxWidth: 1250, margin: "40px auto",
          borderRadius: 24, padding: "32px 56px 56px",
          boxShadow: "0 30px 80px rgba(11,30,50,0.10)",
        }}>
          <Header page={page} setPage={setPage} />

          <AnimatePresence mode="wait">
            {detail ? (
              <motion.div key={`detail-${detail.id}`}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}>
                <DetailView item={detail} onBack={() => setDetail(null)}
                  onQuote={() => setQuoteFor({ name: detail.title, price: detail.price })} />
              </motion.div>
            ) : (
              <motion.div key={page}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}>
                {page === "inicio" && <Home filter={filter} setFilter={setFilter} items={filtered} goTo={setPage} />}
                {page === "servicos" && <Servicos filter={filter} setFilter={setFilter} items={filtered} />}
                {page === "antesdepois" && <AntesDepois />}
                {page === "garantias" && <Garantias />}
                {page === "frota" && <Frota />}
                {page === "sobre" && <Sobre />}
                {page === "blog" && <Blog />}
                {page === "orcamento" && <Orcamento onConfirm={(n) => setQuoteFor({ name: n })} />}
                {page === "contato" && <Contato />}
              </motion.div>
            )}
          </AnimatePresence>

          <Footer goTo={setPage} />
        </div>

        <AnimatePresence>
          {quoteFor && <QuoteModal item={quoteFor} onClose={() => setQuoteFor(null)} />}
        </AnimatePresence>
      </div>
    </DetailContext.Provider>
  );
}

// ---------------- Responsive ----------------
function ResponsiveStyles() {
  return (
    <style>{`
      @media (max-width: 1024px) {
        .moto-shell { padding: 28px !important; margin: 16px !important; max-width: calc(100% - 32px) !important; border-radius: 20px !important; }
        .moto-bleed { margin-left: -28px !important; margin-right: -28px !important; }
      }
      @media (max-width: 900px) {
        .moto-nav { gap: 6px !important; flex-wrap: wrap !important; justify-content: center; flex: 1 1 100%; order: 3; margin-top: 10px; padding-top: 10px; border-top: 1px solid ${C.divider}; }
        .moto-nav button { font-size: 12px !important; padding: 6px 10px; border-radius: 999px; background: ${C.pill}; }
        .moto-nav button[data-active="true"] { background: ${C.brand} !important; color: #fff !important; }
        .moto-header { flex-wrap: wrap !important; height: auto !important; padding-bottom: 8px; }
      }
      @media (max-width: 720px) {
        .moto-shell { padding: 18px !important; margin: 0 !important; max-width: 100% !important; border-radius: 0 !important; }
        .moto-bleed { margin-left: -18px !important; margin-right: -18px !important; }
        .moto-header-cta { display: none !important; }
        .moto-hero { height: 380px !important; }
        .moto-hero-title { font-size: 36px !important; }
        .moto-2col { grid-template-columns: 1fr !important; }
        .moto-3col { grid-template-columns: 1fr !important; }
        .moto-4col { grid-template-columns: 1fr 1fr !important; }
        .moto-section-title { font-size: 28px !important; }
      }
      @media (max-width: 480px) { .moto-4col { grid-template-columns: 1fr !important; } }
    `}</style>
  );
}

// ---------------- Header ----------------
function Header({ page, setPage }: { page: PageKey; setPage: (k: PageKey) => void }) {
  return (
    <motion.header initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      style={{ height: 64 }} className="moto-header flex items-center justify-between">
      <button onClick={() => setPage("inicio")} className="flex items-center gap-2">
        <motion.span whileHover={{ rotate: -8, scale: 1.05 }}
          style={{ background: C.brand, color: "#fff", width: 32, height: 32, borderRadius: 10, fontWeight: 800, fontSize: 14 }}
          className="inline-flex items-center justify-center">M</motion.span>
        <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: -0.3 }}>MotorPro</span>
      </button>

      <nav className="moto-nav flex items-center gap-6">
        {NAV_ITEMS.map((n) => {
          const active = page === n.key;
          return (
            <button key={n.key} data-active={active} onClick={() => setPage(n.key)}
              style={{ fontSize: 13, fontWeight: active ? 600 : 500, color: active ? C.ink : C.inkSoft, position: "relative", transition: "color 0.2s" }}>
              {n.label}
              {active && <motion.span layoutId="motonavline" style={{ position: "absolute", left: 0, right: 0, bottom: -8, height: 2, background: C.accent, borderRadius: 2 }} />}
            </button>
          );
        })}
      </nav>

      <motion.button whileHover={{ scale: 1.04 }} onClick={() => setPage("orcamento")}
        className="moto-header-cta"
        style={{ background: C.accent, color: "#fff", padding: "10px 18px", borderRadius: 999, fontSize: 13, fontWeight: 600 }}>
        Pedir orçamento
      </motion.button>
    </motion.header>
  );
}

// ---------------- Home ----------------
function Home({ filter, setFilter, items, goTo }: { filter: FilterKey; setFilter: (f: FilterKey) => void; items: Service[]; goTo: (p: PageKey) => void }) {
  return (
    <div style={{ marginTop: 24 }}>
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
        className="moto-hero" style={{ position: "relative", height: 500, borderRadius: 28, overflow: "hidden" }}>
        <motion.img src={HERO_IMAGE} alt="Oficina mecânica" onError={imgFallback}
          initial={{ scale: 1.12 }} animate={{ scale: 1 }} transition={{ duration: 1.6, ease: "easeOut" }}
          style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(11,30,50,0.25), rgba(11,30,50,0.75))" }} />
        <div style={{ position: "absolute", left: 32, right: 32, bottom: 40, color: "#fff" }}>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ display: "inline-block", padding: "5px 14px", borderRadius: 999, background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", fontSize: 11, fontWeight: 600, letterSpacing: 1.4, textTransform: "uppercase" }}>
            Mecânica · Estética · Funilaria
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="moto-hero-title" style={{ marginTop: 16, fontSize: 56, fontWeight: 700, letterSpacing: -0.04, lineHeight: 1.05, maxWidth: 720 }}>
            Seu carro nas mãos certas
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            style={{ marginTop: 14, fontSize: 16, maxWidth: 520, opacity: 0.92 }}>
            Diagnóstico transparente, peças com garantia e atendimento direto com o mecânico responsável.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            style={{ marginTop: 22, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button onClick={() => goTo("orcamento")} style={{ background: C.accent, color: "#fff", padding: "12px 22px", borderRadius: 999, fontWeight: 600, fontSize: 14 }}>Pedir orçamento</button>
            <button onClick={() => goTo("servicos")} style={{ background: "transparent", color: "#fff", padding: "12px 22px", borderRadius: 999, fontWeight: 600, fontSize: 14, border: "1px solid rgba(255,255,255,0.5)" }}>Ver serviços</button>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats edge-to-edge */}
      <section className="moto-bleed" style={{ marginTop: 48, padding: "44px 56px", background: C.brand, color: "#fff" }}>
        <div className="moto-4col" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24 }}>
          {[
            { n: "20+", l: "Anos atendendo" },
            { n: "12k", l: "Veículos no histórico" },
            { n: "97%", l: "Clientes recomendam" },
            { n: "12m", l: "Garantia em serviços" },
          ].map((s, i) => (
            <motion.div key={s.l} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}>
              <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: -0.03 }}>{s.n}</div>
              <div style={{ marginTop: 6, fontSize: 13, opacity: 0.85 }}>{s.l}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Serviços destaque */}
      <section style={{ marginTop: 56 }}>
        <div className="flex items-end justify-between" style={{ flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: C.accent, textTransform: "uppercase", letterSpacing: 1.4, fontWeight: 700 }}>Serviços</div>
            <h2 className="moto-section-title" style={{ marginTop: 6, fontSize: 40, fontWeight: 700, letterSpacing: -0.03 }}>O que fazemos</h2>
          </div>
          <button onClick={() => goTo("servicos")} style={{ fontSize: 13, color: C.brand, fontWeight: 600 }}>Ver todos →</button>
        </div>

        <div style={{ marginTop: 20, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <motion.button key={f.key} whileTap={{ scale: 0.96 }} onClick={() => setFilter(f.key)}
                style={{ padding: "8px 16px", borderRadius: 999, fontSize: 13, fontWeight: 600, background: active ? C.brand : C.pill, color: active ? "#fff" : C.ink, border: "none", transition: "all 0.2s" }}>
                {f.label}
              </motion.button>
            );
          })}
        </div>

        <ServiceGrid items={items.slice(0, 6)} />
      </section>

      <Testimonials />
      <NewsletterStrip goTo={goTo} />
    </div>
  );
}

// ---------------- Service grid ----------------
function ServiceGrid({ items }: { items: Service[] }) {
  const { open, quote } = useDetail();
  return (
    <div className="moto-3col" style={{ marginTop: 28, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
      {items.map((s, i) => (
        <motion.div key={s.id}
          initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.35, delay: i * 0.06 }}
          whileHover={{ y: -4 }}
          onClick={() => open(serviceToDetail(s))}
          style={{ background: C.paper, border: `1px solid ${C.border}`, borderRadius: 20, overflow: "hidden", cursor: "pointer" }}>
          <div style={{ position: "relative", height: 200, overflow: "hidden" }}>
            <motion.img src={s.image} alt={s.name} onError={imgFallback}
              whileHover={{ scale: 1.08 }} transition={{ duration: 0.6 }}
              style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            {s.tag && <span style={{ position: "absolute", top: 12, left: 12, background: C.accent, color: "#fff", padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700 }}>{s.tag}</span>}
          </div>
          <div style={{ padding: 18 }}>
            <div className="flex items-center justify-between" style={{ gap: 8 }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{s.name}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.brand }}>{s.duration}</div>
            </div>
            <p style={{ marginTop: 8, fontSize: 13, color: C.inkSoft, lineHeight: 1.5 }}>{s.description}</p>
            <div className="flex items-center justify-between" style={{ marginTop: 14, gap: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: C.ink }}>{s.price}</div>
              <button onClick={(e) => { e.stopPropagation(); quote({ name: s.name, price: s.price }); }}
                style={{ padding: "8px 14px", borderRadius: 10, background: C.brand, color: "#fff", fontSize: 12, fontWeight: 600 }}>
                Orçamento
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ---------------- Pages ----------------
function Servicos({ filter, setFilter, items }: { filter: FilterKey; setFilter: (f: FilterKey) => void; items: Service[] }) {
  return (
    <section style={{ marginTop: 24 }}>
      <h1 className="moto-section-title" style={{ fontSize: 44, fontWeight: 700, letterSpacing: -0.03 }}>Todos os serviços</h1>
      <p style={{ marginTop: 8, fontSize: 14, color: C.inkSoft, maxWidth: 600 }}>Filtre por categoria e abra um serviço para entender o que está incluso.</p>
      <div style={{ marginTop: 24, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <button key={f.key} onClick={() => setFilter(f.key)}
              style={{ padding: "8px 16px", borderRadius: 999, fontSize: 13, fontWeight: 600, background: active ? C.brand : C.pill, color: active ? "#fff" : C.ink, border: "none" }}>
              {f.label}
            </button>
          );
        })}
      </div>
      <ServiceGrid items={items} />
    </section>
  );
}

function AntesDepois() {
  const { open } = useDetail();
  return (
    <section style={{ marginTop: 24 }}>
      <h1 className="moto-section-title" style={{ fontSize: 44, fontWeight: 700, letterSpacing: -0.03 }}>Antes e depois</h1>
      <p style={{ marginTop: 8, fontSize: 14, color: C.inkSoft, maxWidth: 600 }}>Resultados reais de clientes que confiaram no nosso time.</p>
      <div className="moto-3col" style={{ marginTop: 28, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
        {BEFORE_AFTER.map((b, i) => (
          <motion.div key={b.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: i * 0.08 }} whileHover={{ y: -4 }}
            onClick={() => open({ id: `ba-${b.id}`, kind: "trabalho", title: b.title, image: b.after, description: b.description, highlights: ["Avaliação técnica antes do serviço", "Fotos do progresso", "Garantia documentada", "Entrega final lavada"] })}
            style={{ borderRadius: 20, overflow: "hidden", border: `1px solid ${C.border}`, background: C.paper, cursor: "pointer" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
              <div style={{ position: "relative", height: 180 }}>
                <img src={b.before} alt={`Antes - ${b.title}`} onError={imgFallback} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.85)" }} />
                <span style={{ position: "absolute", top: 8, left: 8, background: "rgba(11,30,50,0.85)", color: "#fff", padding: "3px 8px", borderRadius: 8, fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>ANTES</span>
              </div>
              <div style={{ position: "relative", height: 180 }}>
                <img src={b.after} alt={`Depois - ${b.title}`} onError={imgFallback} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <span style={{ position: "absolute", top: 8, left: 8, background: C.accent, color: "#fff", padding: "3px 8px", borderRadius: 8, fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>DEPOIS</span>
              </div>
            </div>
            <div style={{ padding: 18 }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{b.title}</div>
              <p style={{ marginTop: 6, fontSize: 13, color: C.inkSoft, lineHeight: 1.5 }}>{b.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Garantias() {
  const items = [
    { t: "Peças com garantia de fábrica", d: "Trabalhamos apenas com peças originais ou homologadas pelas montadoras." },
    { t: "Serviço com garantia escrita", d: "Toda nota inclui o prazo de garantia dos serviços executados." },
    { t: "Diagnóstico transparente", d: "Apresentamos as evidências antes de aprovar qualquer troca de peça." },
    { t: "Acompanhamento pós-serviço", d: "Retorno em até 7 dias para checar o resultado e ajustar o que for preciso." },
  ];
  return (
    <section style={{ marginTop: 24 }}>
      <h1 className="moto-section-title" style={{ fontSize: 44, fontWeight: 700, letterSpacing: -0.03 }}>Garantias &amp; compromissos</h1>
      <p style={{ marginTop: 8, fontSize: 14, color: C.inkSoft, maxWidth: 600 }}>Nosso padrão de atendimento é o que mais valorizamos. Veja o que está incluso.</p>
      <div className="moto-2col" style={{ marginTop: 28, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {items.map((it, i) => (
          <motion.div key={it.t} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: i * 0.06 }}
            style={{ padding: 24, borderRadius: 20, background: C.pill }}>
            <div style={{ fontSize: 11, color: C.brand, textTransform: "uppercase", letterSpacing: 1.4, fontWeight: 700 }}>Garantia</div>
            <div style={{ marginTop: 6, fontSize: 18, fontWeight: 700, color: C.ink }}>{it.t}</div>
            <p style={{ marginTop: 8, fontSize: 13, color: C.inkSoft, lineHeight: 1.5 }}>{it.d}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Frota() {
  return (
    <section style={{ marginTop: 24 }}>
      <h1 className="moto-section-title" style={{ fontSize: 44, fontWeight: 700, letterSpacing: -0.03 }}>Frota e empresas</h1>
      <p style={{ marginTop: 8, fontSize: 14, color: C.inkSoft, maxWidth: 640 }}>Planos de manutenção preventiva para empresas, frotas e locadoras com relatórios mensais.</p>
      <div className="moto-2col" style={{ marginTop: 32, display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 28 }}>
        <div className="moto-4col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {[
            { t: "Atendimento prioritário", v: "Janela própria de agendamento" },
            { t: "Relatórios mensais", v: "Histórico por placa" },
            { t: "Faturamento", v: "Boleto, cartão ou PIX" },
            { t: "Coleta e entrega", v: "Disponível na região" },
          ].map((it) => (
            <motion.div key={it.t} whileHover={{ y: -3 }} style={{ padding: 22, borderRadius: 18, background: C.pill }}>
              <div style={{ fontSize: 11, color: C.inkSoft, textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 600 }}>{it.t}</div>
              <div style={{ marginTop: 6, fontSize: 16, fontWeight: 700, color: C.ink }}>{it.v}</div>
            </motion.div>
          ))}
        </div>
        <div style={{ padding: 26, borderRadius: 20, background: C.brand, color: "#fff" }}>
          <div style={{ fontSize: 12, opacity: 0.85, textTransform: "uppercase", letterSpacing: 1.4, fontWeight: 700 }}>Planos corporativos</div>
          <h3 style={{ marginTop: 8, fontSize: 24, fontWeight: 700 }}>Manutenção preventiva mensal</h3>
          <p style={{ marginTop: 10, fontSize: 14, opacity: 0.92, lineHeight: 1.6 }}>
            Mantenha sua frota rodando sem surpresas. Solicite uma proposta personalizada para seu volume de veículos.
          </p>
          <a href="#" style={{ marginTop: 18, display: "inline-block", padding: "12px 18px", background: C.accent, color: "#fff", borderRadius: 999, fontSize: 13, fontWeight: 700 }}>Falar com consultor</a>
        </div>
      </div>
    </section>
  );
}

function Orcamento({ onConfirm }: { onConfirm: (n: string) => void }) {
  return (
    <section style={{ marginTop: 24 }}>
      <h1 className="moto-section-title" style={{ fontSize: 44, fontWeight: 700, letterSpacing: -0.03 }}>Peça seu orçamento</h1>
      <p style={{ marginTop: 8, fontSize: 14, color: C.inkSoft, maxWidth: 600 }}>Conte um pouco sobre o veículo e o serviço. Respondemos por WhatsApp em poucas horas.</p>
      <form onSubmit={(e) => { e.preventDefault(); onConfirm("Orçamento solicitado"); }}
        style={{ marginTop: 28, padding: 28, borderRadius: 20, background: C.pill, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="moto-2col">
        <Field label="Nome"><input placeholder="[seu nome aqui]" style={inputStyle} /></Field>
        <Field label="WhatsApp"><input placeholder="[seu WhatsApp aqui]" style={inputStyle} /></Field>
        <Field label="Veículo"><input placeholder="[marca, modelo e ano]" style={inputStyle} /></Field>
        <Field label="Placa (opcional)"><input placeholder="[placa do veículo]" style={inputStyle} /></Field>
        <div style={{ gridColumn: "1 / -1" }}>
          <Field label="Serviço desejado"><textarea rows={4} placeholder="[descreva o que precisa]" style={{ ...inputStyle, resize: "vertical" }} /></Field>
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <button type="submit" style={{ marginTop: 8, width: "100%", padding: "14px", borderRadius: 14, background: C.accent, color: "#fff", fontSize: 14, fontWeight: 700 }}>Solicitar orçamento</button>
        </div>
      </form>
    </section>
  );
}

function Sobre() {
  return (
    <section style={{ marginTop: 24 }}>
      <h1 className="moto-section-title" style={{ fontSize: 44, fontWeight: 700, letterSpacing: -0.03 }}>Sobre a MotorPro</h1>
      <div className="moto-2col" style={{ marginTop: 28, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        <p style={{ fontSize: 15, color: C.inkSoft, lineHeight: 1.7 }}>
          Somos uma oficina de bairro que cresceu sem perder o atendimento próximo. Atendemos veículos nacionais, importados e híbridos com diagnóstico computadorizado e equipe própria.
          <br /><br />
          Nosso compromisso é com transparência: você acompanha o serviço, recebe fotos do que foi feito e leva um relatório completo a cada visita.
        </p>
        <img src="https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=1200&q=80" alt="Equipe da oficina" onError={imgFallback} style={{ width: "100%", height: 360, objectFit: "cover", borderRadius: 20 }} />
      </div>
    </section>
  );
}

function Blog() {
  const { open } = useDetail();
  const posts = [
    { id: "revisao", t: "Quando fazer a próxima revisão", img: "https://images.unsplash.com/photo-1493031566959-f6fd0aedfdde?auto=format&fit=crop&w=1200&q=80", d: "Critérios práticos por quilometragem, tempo e uso do veículo." },
    { id: "freios", t: "5 sinais de que o freio precisa de atenção", img: "https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&w=1200&q=80", d: "Pequenos ruídos e vibrações que indicam manutenção." },
    { id: "estetica", t: "Polimento ou vitrificação: qual escolher?", img: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=1200&q=80", d: "Comparativo de durabilidade, custo e indicação." },
  ];
  return (
    <section style={{ marginTop: 24 }}>
      <h1 className="moto-section-title" style={{ fontSize: 44, fontWeight: 700, letterSpacing: -0.03 }}>Dicas e novidades</h1>
      <div className="moto-3col" style={{ marginTop: 28, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
        {posts.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: i * 0.08 }} whileHover={{ y: -4 }}
            onClick={() => open({ id: `post-${p.id}`, kind: "post", title: p.t, image: p.img, description: p.d + " Texto completo do artigo com mais informações sobre o tema.", highlights: ["Leitura de 4 min", "Por nossa equipe", "Atualizado este mês"] })}
            style={{ borderRadius: 20, overflow: "hidden", border: `1px solid ${C.border}`, background: C.paper, cursor: "pointer" }}>
            <img src={p.img} alt={p.t} onError={imgFallback} style={{ width: "100%", height: 200, objectFit: "cover" }} />
            <div style={{ padding: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{p.t}</div>
              <p style={{ marginTop: 8, fontSize: 13, color: C.inkSoft, lineHeight: 1.5 }}>{p.d}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Contato() {
  return (
    <section style={{ marginTop: 24 }}>
      <h1 className="moto-section-title" style={{ fontSize: 44, fontWeight: 700, letterSpacing: -0.03 }}>Fale com a oficina</h1>
      <p style={{ marginTop: 8, fontSize: 14, color: C.inkSoft, maxWidth: 600 }}>Estamos prontos para atender. Escolha o canal que preferir.</p>
      <div className="moto-2col" style={{ marginTop: 28, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div className="moto-4col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {[
            { t: "Telefone", v: "[seu telefone aqui]" },
            { t: "WhatsApp", v: "[seu WhatsApp aqui]" },
            { t: "Endereço", v: "[seu endereço aqui]" },
            { t: "Horário", v: "[seu horário aqui]" },
          ].map((it) => (
            <motion.div key={it.t} whileHover={{ y: -3 }} style={{ padding: 22, borderRadius: 18, background: C.pill }}>
              <div style={{ fontSize: 11, color: C.inkSoft, textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 600 }}>{it.t}</div>
              <div style={{ marginTop: 6, fontSize: 15, fontWeight: 600, color: C.ink }}>{it.v}</div>
            </motion.div>
          ))}
        </div>
        <form onSubmit={(e) => e.preventDefault()} style={{ padding: 24, borderRadius: 20, background: C.paper, border: `1px solid ${C.border}`, display: "flex", flexDirection: "column", gap: 12 }}>
          <input placeholder="[seu nome aqui]" style={inputStyle} />
          <input placeholder="[seu e-mail aqui]" style={inputStyle} />
          <textarea placeholder="[sua mensagem aqui]" rows={5} style={{ ...inputStyle, resize: "vertical" }} />
          <button type="submit" style={{ padding: "12px 16px", borderRadius: 12, background: C.brand, color: "#fff", fontSize: 14, fontWeight: 700 }}>Enviar mensagem</button>
        </form>
      </div>
    </section>
  );
}

// ---------------- Testimonials & Newsletter ----------------
function Testimonials() {
  const items = [
    { q: "Atendimento sério e orçamento claro. Não vou em outra oficina.", a: "André M." },
    { q: "Resolveram um problema elétrico que duas oficinas não conseguiram.", a: "Patrícia L." },
    { q: "O polimento ficou impecável. Carro parece zero quilômetro.", a: "Felipe R." },
  ];
  return (
    <section className="moto-bleed" style={{ marginTop: 56, padding: "56px 56px", background: C.pill }}>
      <div style={{ fontSize: 11, color: C.accent, textTransform: "uppercase", letterSpacing: 1.4, fontWeight: 700 }}>Depoimentos</div>
      <h2 className="moto-section-title" style={{ marginTop: 6, fontSize: 36, fontWeight: 700, letterSpacing: -0.03 }}>Quem confia, recomenda</h2>
      <div className="moto-3col" style={{ marginTop: 28, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
        {items.map((t, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}
            style={{ padding: 24, borderRadius: 20, background: C.paper, border: `1px solid ${C.border}` }}>
            <p style={{ fontSize: 15, color: C.ink, lineHeight: 1.55 }}>"{t.q}"</p>
            <div style={{ marginTop: 14, fontSize: 12, color: C.inkSoft, fontWeight: 600 }}>— {t.a}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function NewsletterStrip({ goTo }: { goTo: (p: PageKey) => void }) {
  return (
    <section style={{ marginTop: 56, padding: "36px 32px", borderRadius: 24, background: C.brandDark, color: "#fff", display: "flex", gap: 18, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
      <div>
        <div style={{ fontSize: 11, opacity: 0.8, textTransform: "uppercase", letterSpacing: 1.4, fontWeight: 700 }}>Atendimento rápido</div>
        <h3 style={{ marginTop: 4, fontSize: 24, fontWeight: 700 }}>Peça seu orçamento agora</h3>
      </div>
      <button onClick={() => goTo("orcamento")} style={{ padding: "12px 22px", borderRadius: 999, background: C.accent, color: "#fff", fontWeight: 700, fontSize: 14 }}>
        Solicitar orçamento
      </button>
    </section>
  );
}

// ---------------- Detail view ----------------
function DetailView({ item, onBack, onQuote }: { item: DetailItem; onBack: () => void; onQuote: () => void }) {
  return (
    <div style={{ marginTop: 20 }}>
      <button onClick={onBack} style={{ fontSize: 13, color: C.inkSoft, fontWeight: 600 }}>← Voltar</button>
      <div className="moto-2col" style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 28 }}>
        <div>
          <motion.img src={item.image} alt={item.title} onError={imgFallback}
            initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}
            style={{ width: "100%", height: 420, objectFit: "cover", borderRadius: 22 }} />
          <h1 style={{ marginTop: 22, fontSize: 36, fontWeight: 700, letterSpacing: -0.02 }}>{item.title}</h1>
          {item.subtitle && <div style={{ marginTop: 6, fontSize: 13, color: C.inkSoft }}>{item.subtitle}</div>}
          <p style={{ marginTop: 16, fontSize: 15, color: C.inkSoft, lineHeight: 1.7 }}>{item.description}</p>
          {item.highlights && (
            <div style={{ marginTop: 22 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>O que está incluso</div>
              <ul style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {item.highlights.map((h) => (
                  <li key={h} style={{ padding: "10px 14px", borderRadius: 12, background: C.pill, fontSize: 13, color: C.ink }}>• {h}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <aside style={{ position: "sticky", top: 24, alignSelf: "start", padding: 22, borderRadius: 20, background: C.paper, border: `1px solid ${C.border}` }}>
          {item.price && <div style={{ fontSize: 11, color: C.inkSoft, textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 600 }}>Valor de referência</div>}
          {item.price && <div style={{ marginTop: 4, fontSize: 22, fontWeight: 800, color: C.brand }}>{item.price}</div>}
          <button onClick={onQuote} style={{ marginTop: 18, width: "100%", padding: "14px", borderRadius: 14, background: C.accent, color: "#fff", fontWeight: 700, fontSize: 14 }}>Pedir orçamento</button>
          <button style={{ marginTop: 10, width: "100%", padding: "12px", borderRadius: 14, background: C.pill, color: C.ink, fontWeight: 600, fontSize: 13 }}>Agendar serviço</button>
          <div style={{ marginTop: 18, fontSize: 12, color: C.inkSoft, lineHeight: 1.6 }}>
            Atendimento por WhatsApp em [seu WhatsApp aqui].<br />
            Diagnóstico sem compromisso.
          </div>
        </aside>
      </div>
    </div>
  );
}

// ---------------- Modal ----------------
function QuoteModal({ item, onClose }: { item: { name: string; price?: string }; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(11,30,50,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}>
      <motion.div onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: "100%", maxWidth: 460, background: C.paper, borderRadius: 22, padding: 28 }}>
        <div style={{ fontSize: 11, color: C.accent, textTransform: "uppercase", letterSpacing: 1.4, fontWeight: 700 }}>Novo orçamento</div>
        <h3 style={{ marginTop: 6, fontSize: 24, fontWeight: 700 }}>{item.name}</h3>
        {item.price && <p style={{ marginTop: 6, fontSize: 14, color: C.inkSoft }}>{item.price} · confirmamos pelo WhatsApp.</p>}
        <form onSubmit={(e) => { e.preventDefault(); onClose(); }} style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
          <Field label="Nome"><input required placeholder="[seu nome aqui]" style={inputStyle} /></Field>
          <Field label="WhatsApp"><input required placeholder="[seu WhatsApp aqui]" style={inputStyle} /></Field>
          <Field label="Veículo"><input placeholder="[marca, modelo e ano]" style={inputStyle} /></Field>
          <button type="submit" style={{ marginTop: 6, padding: "14px", borderRadius: 14, background: C.accent, color: "#fff", fontWeight: 700, fontSize: 14 }}>Enviar pedido</button>
          <button type="button" onClick={onClose} style={{ padding: "10px", borderRadius: 12, background: C.pill, color: C.ink, fontWeight: 600, fontSize: 13 }}>Cancelar</button>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ---------------- Footer ----------------
function Footer({ goTo }: { goTo: (p: PageKey) => void }) {
  return (
    <footer style={{ marginTop: 80, paddingTop: 32, borderTop: `1px solid ${C.divider}` }}>
      <div className="moto-4col" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 28 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>MotorPro</div>
          <p style={{ marginTop: 8, fontSize: 13, color: C.inkSoft, lineHeight: 1.6 }}>Mecânica, elétrica e estética automotiva com atendimento próximo e garantia em todo serviço.</p>
        </div>
        {[
          { t: "Serviços", l: ["servicos", "antesdepois", "garantias"] as PageKey[] },
          { t: "Empresa", l: ["sobre", "frota", "blog"] as PageKey[] },
        ].map((s) => (
          <div key={s.t}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.ink, textTransform: "uppercase", letterSpacing: 1.2 }}>{s.t}</div>
            <ul style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
              {s.l.map((k) => {
                const item = NAV_ITEMS.find((n) => n.key === k);
                return <li key={k}><button onClick={() => goTo(k)} style={{ fontSize: 13, color: C.inkSoft }}>{item?.label}</button></li>;
              })}
            </ul>
          </div>
        ))}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.ink, textTransform: "uppercase", letterSpacing: 1.2 }}>Contato</div>
          <ul style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: C.inkSoft }}>
            <li>[seu telefone aqui]</li>
            <li>[seu endereço aqui]</li>
            <li>[sua cidade aqui]</li>
          </ul>
        </div>
      </div>
      <div style={{ marginTop: 32, paddingTop: 18, borderTop: `1px solid ${C.divider}`, fontSize: 12, color: C.muted }}>
        © {new Date().getFullYear()} MotorPro. Todos os direitos reservados.
      </div>
    </footer>
  );
}

// ---------------- Field + input ----------------
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: C.inkSoft }}>{label}</span>
      {children}
    </label>
  );
}
const inputStyle: React.CSSProperties = {
  padding: "12px 14px", borderRadius: 12, border: `1px solid ${C.border}`,
  background: "#fff", fontSize: 14, color: C.ink, outline: "none", width: "100%",
};

export default OficinaPreview;
