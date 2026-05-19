import { createFileRoute } from "@tanstack/react-router";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export const Route = createFileRoute("/dev/preview/loja-local")({
  component: LojaPreview,
  head: () => ({
    meta: [
      { title: "Atelier Norte · Loja Local" },
      { name: "description", content: "Atelier Norte — moda, acessórios e curadoria local com atendimento por WhatsApp." },
    ],
  }),
});

// ---------------- Theme ----------------
const C = {
  page: "#F4F1EC", paper: "#FFFFFF", ink: "#1B1A18", inkSoft: "#5E5852",
  muted: "#9A938B", border: "#E7E1D7", pill: "#EFEAE0", divider: "#E3DCCF",
  brand: "#2F4A3A", brandDark: "#1B2F23", accent: "#C68A52",
};

// ---------------- Data ----------------
type Product = {
  id: string; name: string; category: "novidades" | "moda" | "acessorios" | "calcados" | "casa" | "presentes";
  image: string; price: string; description: string; tag?: string;
};
const PRODUCTS: Product[] = [
  { id: "vestido-linho", name: "Vestido midi de linho", category: "moda", image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=80", price: "R$ 389", description: "Linho leve com modelagem solta. Disponível em areia, verde-musgo e off-white.", tag: "Novo" },
  { id: "camisa-poplin", name: "Camisa poplin oversized", category: "moda", image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=80", price: "R$ 259", description: "Algodão poplin macio, modelagem ampla e punho ajustável." },
  { id: "alfaiataria", name: "Calça alfaiataria fluida", category: "moda", image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1200&q=80", price: "R$ 349", description: "Cintura alta, caimento impecável, prega frontal e tecido com leve elasticidade.", tag: "Top" },
  { id: "tricot", name: "Tricot canelado bege", category: "moda", image: "https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?auto=format&fit=crop&w=1200&q=80", price: "R$ 299", description: "Tricot ponto canelado, gola V, perfeito para sobreposição." },
  { id: "bolsa-couro", name: "Bolsa estruturada de couro", category: "acessorios", image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80", price: "R$ 549", description: "Couro legítimo curtido, alça regulável e bolso interno organizador.", tag: "Best-seller" },
  { id: "oculos", name: "Óculos acetato vintage", category: "acessorios", image: "https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=1200&q=80", price: "R$ 219", description: "Armação em acetato italiano com proteção UV400." },
  { id: "cinto", name: "Cinto trançado caramelo", category: "acessorios", image: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=1200&q=80", price: "R$ 149", description: "Couro trançado à mão, fivela em latão envelhecido." },
  { id: "tenis", name: "Tênis minimalista branco", category: "calcados", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80", price: "R$ 429", description: "Cabedal em couro, palmilha anatômica e solado emborrachado.", tag: "Top" },
  { id: "mule", name: "Mule de couro caramelo", category: "calcados", image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1200&q=80", price: "R$ 359", description: "Salto baixo, design clean e forro acolchoado." },
  { id: "cesto", name: "Cesto trançado de palha", category: "casa", image: "https://images.unsplash.com/photo-1583845112203-29329902332e?auto=format&fit=crop&w=1200&q=80", price: "R$ 189", description: "Trabalho artesanal de cooperativas locais. Várias utilidades.", tag: "Artesanal" },
  { id: "manta", name: "Manta de algodão cru", category: "casa", image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=1200&q=80", price: "R$ 239", description: "Tecido natural, franjas e ponto crochê nas bordas." },
  { id: "kit-presente", name: "Kit presente edição limitada", category: "presentes", image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=1200&q=80", price: "R$ 269", description: "Combinação de acessórios selecionada pela curadora da loja.", tag: "Edição limitada" },
];

const COLLECTIONS = [
  { id: "outono", name: "Coleção Outono", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80", description: "Tons quentes, alfaiataria fluida e tricôs canelados." },
  { id: "essenciais", name: "Essenciais atemporais", image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80", description: "Peças que ficam no guarda-roupa por anos. Linho, algodão e couro." },
  { id: "artesanal", name: "Cápsula artesanal", image: "https://images.unsplash.com/photo-1528826007177-f38517ce9a14?auto=format&fit=crop&w=1200&q=80", description: "Curadoria de artesãs locais: cestos, mantas e cerâmicas." },
];

const HERO_IMAGE = "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1800&q=80";

const FILTERS = [
  { key: "novidades", label: "Novidades" },
  { key: "moda", label: "Moda" },
  { key: "acessorios", label: "Acessórios" },
  { key: "calcados", label: "Calçados" },
  { key: "casa", label: "Casa" },
  { key: "presentes", label: "Presentes" },
] as const;
type FilterKey = (typeof FILTERS)[number]["key"];

const NAV_ITEMS = [
  { key: "inicio", label: "Início" },
  { key: "vitrine", label: "Vitrine" },
  { key: "colecoes", label: "Coleções" },
  { key: "promocoes", label: "Promoções" },
  { key: "lookbook", label: "Lookbook" },
  { key: "sobre", label: "Sobre" },
  { key: "blog", label: "Diário" },
  { key: "loja", label: "Visite" },
  { key: "contato", label: "Contato" },
] as const;
type PageKey = (typeof NAV_ITEMS)[number]["key"];

const imgFallback = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const img = e.currentTarget;
  if (img.dataset.fb) return;
  img.dataset.fb = "1";
  img.src = `https://picsum.photos/seed/${encodeURIComponent(img.alt || "loja")}/1200/800`;
};

// ---------------- Detail context ----------------
type DetailItem = {
  id: string; kind: "produto" | "colecao" | "post"; title: string; subtitle?: string;
  image: string; price?: string; description: string; highlights?: string[];
};
type DetailCtx = { open: (item: DetailItem) => void; ask: (s: { name: string; price?: string }) => void };
const DetailContext = createContext<DetailCtx | null>(null);
function useDetail() {
  const ctx = useContext(DetailContext);
  if (!ctx) throw new Error("Missing DetailContext");
  return ctx;
}
function productToDetail(p: Product): DetailItem {
  return {
    id: `prod-${p.id}`, kind: "produto", title: p.name, subtitle: p.tag,
    image: p.image, price: p.price, description: p.description,
    highlights: ["Curadoria autoral", "Tecidos naturais", "Atendimento personalizado", "Retirada na loja ou entrega"],
  };
}

// ---------------- Root ----------------
export function LojaPreview() {
  const [page, setPage] = useState<PageKey>("inicio");
  const [filter, setFilter] = useState<FilterKey>("novidades");
  const [askFor, setAskFor] = useState<{ name: string; price?: string } | null>(null);
  const [detail, setDetail] = useState<DetailItem | null>(null);

  const filtered = useMemo(() => {
    if (filter === "novidades") return PRODUCTS.slice(0, 8);
    return PRODUCTS.filter((p) => p.category === filter);
  }, [filter]);

  useEffect(() => { setDetail(null); }, [page]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [detail, page]);

  const ctxValue: DetailCtx = { open: setDetail, ask: setAskFor };

  return (
    <DetailContext.Provider value={ctxValue}>
      <div style={{ background: C.page, color: C.ink, fontFamily: "Inter, Manrope, ui-sans-serif, system-ui" }} className="min-h-screen w-full">
        <ResponsiveStyles />
        <div className="loja-shell mx-auto" style={{
          background: C.paper, maxWidth: 1250, margin: "40px auto",
          borderRadius: 24, padding: "32px 56px 56px",
          boxShadow: "0 30px 80px rgba(27,26,24,0.10)",
        }}>
          <Header page={page} setPage={setPage} />

          <AnimatePresence mode="wait">
            {detail ? (
              <motion.div key={`detail-${detail.id}`}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}>
                <DetailView item={detail} onBack={() => setDetail(null)}
                  onAsk={() => setAskFor({ name: detail.title, price: detail.price })} />
              </motion.div>
            ) : (
              <motion.div key={page}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}>
                {page === "inicio" && <Home filter={filter} setFilter={setFilter} items={filtered} goTo={setPage} />}
                {page === "vitrine" && <Vitrine filter={filter} setFilter={setFilter} items={filtered} />}
                {page === "colecoes" && <Colecoes />}
                {page === "promocoes" && <Promocoes />}
                {page === "lookbook" && <Lookbook />}
                {page === "sobre" && <Sobre />}
                {page === "blog" && <Blog />}
                {page === "loja" && <Visite />}
                {page === "contato" && <Contato />}
              </motion.div>
            )}
          </AnimatePresence>

          <Footer goTo={setPage} />
        </div>

        <AnimatePresence>
          {askFor && <AskModal item={askFor} onClose={() => setAskFor(null)} />}
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
        .loja-shell { padding: 28px !important; margin: 16px !important; max-width: calc(100% - 32px) !important; border-radius: 20px !important; }
        .loja-bleed { margin-left: -28px !important; margin-right: -28px !important; }
      }
      @media (max-width: 900px) {
        .loja-nav { gap: 6px !important; flex-wrap: wrap !important; justify-content: center; flex: 1 1 100%; order: 3; margin-top: 10px; padding-top: 10px; border-top: 1px solid ${C.divider}; }
        .loja-nav button { font-size: 12px !important; padding: 6px 10px; border-radius: 999px; background: ${C.pill}; }
        .loja-nav button[data-active="true"] { background: ${C.brand} !important; color: #fff !important; }
        .loja-header { flex-wrap: wrap !important; height: auto !important; padding-bottom: 8px; }
      }
      @media (max-width: 720px) {
        .loja-shell { padding: 18px !important; margin: 0 !important; max-width: 100% !important; border-radius: 0 !important; }
        .loja-bleed { margin-left: -18px !important; margin-right: -18px !important; }
        .loja-header-cta { display: none !important; }
        .loja-hero { height: 380px !important; }
        .loja-hero-title { font-size: 36px !important; }
        .loja-2col { grid-template-columns: 1fr !important; }
        .loja-3col { grid-template-columns: 1fr 1fr !important; }
        .loja-4col { grid-template-columns: 1fr 1fr !important; }
        .loja-section-title { font-size: 28px !important; }
      }
      @media (max-width: 480px) { .loja-3col, .loja-4col { grid-template-columns: 1fr !important; } }
    `}</style>
  );
}

// ---------------- Header ----------------
function Header({ page, setPage }: { page: PageKey; setPage: (k: PageKey) => void }) {
  return (
    <motion.header initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      style={{ height: 64 }} className="loja-header flex items-center justify-between">
      <button onClick={() => setPage("inicio")} className="flex items-center gap-2">
        <motion.span whileHover={{ rotate: -8, scale: 1.05 }}
          style={{ background: C.brand, color: "#fff", width: 32, height: 32, borderRadius: 10, fontWeight: 800, fontSize: 14 }}
          className="inline-flex items-center justify-center">A</motion.span>
        <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: -0.3 }}>Atelier Norte</span>
      </button>

      <nav className="loja-nav flex items-center gap-6">
        {NAV_ITEMS.map((n) => {
          const active = page === n.key;
          return (
            <button key={n.key} data-active={active} onClick={() => setPage(n.key)}
              style={{ fontSize: 13, fontWeight: active ? 600 : 500, color: active ? C.ink : C.inkSoft, position: "relative", transition: "color 0.2s" }}>
              {n.label}
              {active && <motion.span layoutId="lojanavline" style={{ position: "absolute", left: 0, right: 0, bottom: -8, height: 2, background: C.accent, borderRadius: 2 }} />}
            </button>
          );
        })}
      </nav>

      <motion.button whileHover={{ scale: 1.04 }} onClick={() => setPage("contato")}
        className="loja-header-cta"
        style={{ background: C.brand, color: "#fff", padding: "10px 18px", borderRadius: 999, fontSize: 13, fontWeight: 600 }}>
        Falar por WhatsApp
      </motion.button>
    </motion.header>
  );
}

// ---------------- Home ----------------
function Home({ filter, setFilter, items, goTo }: { filter: FilterKey; setFilter: (f: FilterKey) => void; items: Product[]; goTo: (p: PageKey) => void }) {
  return (
    <div style={{ marginTop: 24 }}>
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
        className="loja-hero" style={{ position: "relative", height: 500, borderRadius: 28, overflow: "hidden" }}>
        <motion.img src={HERO_IMAGE} alt="Loja vitrine" onError={imgFallback}
          initial={{ scale: 1.12 }} animate={{ scale: 1 }} transition={{ duration: 1.6, ease: "easeOut" }}
          style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(27,26,24,0.10), rgba(27,26,24,0.65))" }} />
        <div style={{ position: "absolute", left: 32, right: 32, bottom: 40, color: "#fff" }}>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ display: "inline-block", padding: "5px 14px", borderRadius: 999, background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", fontSize: 11, fontWeight: 600, letterSpacing: 1.4, textTransform: "uppercase" }}>
            Curadoria autoral · Loja local
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="loja-hero-title" style={{ marginTop: 16, fontSize: 56, fontWeight: 700, letterSpacing: -0.04, lineHeight: 1.05, maxWidth: 720 }}>
            Peças que contam histórias
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            style={{ marginTop: 14, fontSize: 16, maxWidth: 520, opacity: 0.92 }}>
            Moda, acessórios e curadoria local. Atendimento humano por WhatsApp e retirada na loja.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            style={{ marginTop: 22, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button onClick={() => goTo("vitrine")} style={{ background: "#fff", color: C.ink, padding: "12px 22px", borderRadius: 999, fontWeight: 600, fontSize: 14 }}>Ver vitrine</button>
            <button onClick={() => goTo("colecoes")} style={{ background: "transparent", color: "#fff", padding: "12px 22px", borderRadius: 999, fontWeight: 600, fontSize: 14, border: "1px solid rgba(255,255,255,0.5)" }}>Coleções</button>
          </motion.div>
        </div>
      </motion.div>

      {/* Benefits edge-to-edge */}
      <section className="loja-bleed" style={{ marginTop: 48, padding: "44px 56px", background: C.brand, color: "#fff" }}>
        <div className="loja-4col" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24 }}>
          {[
            { n: "Entrega", l: "Para todo o Brasil" },
            { n: "Retirada", l: "Na loja sem custo" },
            { n: "Troca", l: "Em até 30 dias" },
            { n: "Pix", l: "10% off à vista" },
          ].map((s, i) => (
            <motion.div key={s.l} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.02 }}>{s.n}</div>
              <div style={{ marginTop: 4, fontSize: 13, opacity: 0.85 }}>{s.l}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Vitrine destaque */}
      <section style={{ marginTop: 56 }}>
        <div className="flex items-end justify-between" style={{ flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: C.accent, textTransform: "uppercase", letterSpacing: 1.4, fontWeight: 700 }}>Vitrine</div>
            <h2 className="loja-section-title" style={{ marginTop: 6, fontSize: 40, fontWeight: 700, letterSpacing: -0.03 }}>Peças em destaque</h2>
          </div>
          <button onClick={() => goTo("vitrine")} style={{ fontSize: 13, color: C.brand, fontWeight: 600 }}>Ver tudo →</button>
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

        <ProductGrid items={items.slice(0, 8)} />
      </section>

      <FeaturedCollections goTo={goTo} />
      <Testimonials />
      <NewsletterStrip />
    </div>
  );
}

// ---------------- Product grid ----------------
function ProductGrid({ items }: { items: Product[] }) {
  const { open, ask } = useDetail();
  return (
    <div className="loja-4col" style={{ marginTop: 28, display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
      {items.map((p, i) => (
        <motion.div key={p.id}
          initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.35, delay: i * 0.05 }}
          whileHover={{ y: -4 }}
          onClick={() => open(productToDetail(p))}
          style={{ background: C.paper, border: `1px solid ${C.border}`, borderRadius: 18, overflow: "hidden", cursor: "pointer" }}>
          <div style={{ position: "relative", height: 240, overflow: "hidden", background: C.pill }}>
            <motion.img src={p.image} alt={p.name} onError={imgFallback}
              whileHover={{ scale: 1.06 }} transition={{ duration: 0.6 }}
              style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            {p.tag && <span style={{ position: "absolute", top: 12, left: 12, background: C.accent, color: "#fff", padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700 }}>{p.tag}</span>}
          </div>
          <div style={{ padding: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.35 }}>{p.name}</div>
            <div style={{ marginTop: 6, fontSize: 15, fontWeight: 800, color: C.brand }}>{p.price}</div>
            <button onClick={(e) => { e.stopPropagation(); ask({ name: p.name, price: p.price }); }}
              style={{ marginTop: 12, width: "100%", padding: "10px 12px", borderRadius: 10, background: C.ink, color: "#fff", fontSize: 12, fontWeight: 600 }}>
              Comprar no WhatsApp
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ---------------- Pages ----------------
function Vitrine({ filter, setFilter, items }: { filter: FilterKey; setFilter: (f: FilterKey) => void; items: Product[] }) {
  return (
    <section style={{ marginTop: 24 }}>
      <h1 className="loja-section-title" style={{ fontSize: 44, fontWeight: 700, letterSpacing: -0.03 }}>Vitrine completa</h1>
      <p style={{ marginTop: 8, fontSize: 14, color: C.inkSoft, maxWidth: 600 }}>Filtre por categoria e abra um produto para ver detalhes e comprar pelo WhatsApp.</p>
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
      <ProductGrid items={items} />
    </section>
  );
}

function FeaturedCollections({ goTo }: { goTo: (p: PageKey) => void }) {
  const { open } = useDetail();
  return (
    <section style={{ marginTop: 64 }}>
      <div className="flex items-end justify-between" style={{ flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 11, color: C.accent, textTransform: "uppercase", letterSpacing: 1.4, fontWeight: 700 }}>Coleções</div>
          <h2 className="loja-section-title" style={{ marginTop: 6, fontSize: 40, fontWeight: 700, letterSpacing: -0.03 }}>Curadoria da temporada</h2>
        </div>
        <button onClick={() => goTo("colecoes")} style={{ fontSize: 13, color: C.brand, fontWeight: 600 }}>Ver coleções →</button>
      </div>
      <div className="loja-3col" style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
        {COLLECTIONS.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: i * 0.08 }} whileHover={{ y: -4 }}
            onClick={() => open({ id: `col-${c.id}`, kind: "colecao", title: c.name, image: c.image, description: c.description, highlights: ["Curadoria autoral", "Peças selecionadas", "Edição limitada", "Disponível na loja"] })}
            style={{ position: "relative", height: 360, borderRadius: 20, overflow: "hidden", cursor: "pointer" }}>
            <motion.img src={c.image} alt={c.name} onError={imgFallback}
              whileHover={{ scale: 1.05 }} transition={{ duration: 0.6 }}
              style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(27,26,24,0.0), rgba(27,26,24,0.65))" }} />
            <div style={{ position: "absolute", left: 22, right: 22, bottom: 20, color: "#fff" }}>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{c.name}</div>
              <div style={{ marginTop: 6, fontSize: 13, opacity: 0.9 }}>{c.description}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Colecoes() {
  return <div style={{ marginTop: 24 }}><h1 className="loja-section-title" style={{ fontSize: 44, fontWeight: 700, letterSpacing: -0.03 }}>Coleções</h1><p style={{ marginTop: 8, fontSize: 14, color: C.inkSoft, maxWidth: 600 }}>Explore nossa curadoria por temporada.</p><FeaturedCollections goTo={() => {}} /></div>;
}

function Promocoes() {
  const promos = PRODUCTS.slice(0, 4).map((p) => ({ ...p, oldPrice: p.price, price: "R$ " + Math.round(parseInt(p.price.replace(/\D/g, "")) * 0.7) }));
  const { open, ask } = useDetail();
  return (
    <section style={{ marginTop: 24 }}>
      <h1 className="loja-section-title" style={{ fontSize: 44, fontWeight: 700, letterSpacing: -0.03 }}>Promoções da semana</h1>
      <p style={{ marginTop: 8, fontSize: 14, color: C.inkSoft, maxWidth: 600 }}>Peças selecionadas com até 30% off. Estoque limitado.</p>
      <div className="loja-4col" style={{ marginTop: 28, display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
        {promos.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: i * 0.06 }} whileHover={{ y: -4 }}
            onClick={() => open(productToDetail(p as Product))}
            style={{ background: C.paper, border: `1px solid ${C.border}`, borderRadius: 18, overflow: "hidden", cursor: "pointer" }}>
            <div style={{ position: "relative", height: 240, overflow: "hidden", background: C.pill }}>
              <img src={p.image} alt={p.name} onError={imgFallback} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <span style={{ position: "absolute", top: 12, left: 12, background: C.accent, color: "#fff", padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700 }}>-30%</span>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.35 }}>{p.name}</div>
              <div style={{ marginTop: 6, display: "flex", gap: 8, alignItems: "baseline" }}>
                <span style={{ fontSize: 12, color: C.muted, textDecoration: "line-through" }}>{p.oldPrice}</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: C.brand }}>{p.price}</span>
              </div>
              <button onClick={(e) => { e.stopPropagation(); ask({ name: p.name, price: p.price }); }}
                style={{ marginTop: 12, width: "100%", padding: "10px 12px", borderRadius: 10, background: C.accent, color: "#fff", fontSize: 12, fontWeight: 600 }}>
                Quero esta peça
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Lookbook() {
  const looks = [
    { id: "l1", img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80", t: "Look 01 · Linho ao vento" },
    { id: "l2", img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80", t: "Look 02 · Camadas neutras" },
    { id: "l3", img: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1200&q=80", t: "Look 03 · Couro e alfaiataria" },
    { id: "l4", img: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80", t: "Look 04 · Tons terrosos" },
  ];
  return (
    <section style={{ marginTop: 24 }}>
      <h1 className="loja-section-title" style={{ fontSize: 44, fontWeight: 700, letterSpacing: -0.03 }}>Lookbook</h1>
      <div className="loja-2col" style={{ marginTop: 28, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        {looks.map((l, i) => (
          <motion.div key={l.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}
            style={{ position: "relative", height: 460, borderRadius: 22, overflow: "hidden" }}>
            <img src={l.img} alt={l.t} onError={imgFallback} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(27,26,24,0), rgba(27,26,24,0.55))" }} />
            <div style={{ position: "absolute", left: 22, bottom: 20, color: "#fff", fontSize: 18, fontWeight: 700 }}>{l.t}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Sobre() {
  return (
    <section style={{ marginTop: 24 }}>
      <h1 className="loja-section-title" style={{ fontSize: 44, fontWeight: 700, letterSpacing: -0.03 }}>Sobre a Atelier Norte</h1>
      <div className="loja-2col" style={{ marginTop: 28, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        <p style={{ fontSize: 15, color: C.inkSoft, lineHeight: 1.7 }}>
          Somos uma loja de bairro com curadoria autoral em moda, acessórios e objetos para casa. Trabalhamos com marcas independentes e cooperativas locais, priorizando tecidos naturais e produção responsável.
          <br /><br />
          Acreditamos que peças bem feitas duram mais e contam histórias. Cada coleção é selecionada à mão, pensando em quem busca atemporalidade e identidade.
        </p>
        <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80" alt="Interior da loja" onError={imgFallback} style={{ width: "100%", height: 360, objectFit: "cover", borderRadius: 20 }} />
      </div>
    </section>
  );
}

function Blog() {
  const { open } = useDetail();
  const posts = [
    { id: "linho", t: "Por que linho é o tecido perfeito para o verão", img: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=80", d: "Conforto, respirabilidade e estilo atemporal." },
    { id: "guarda-roupa", t: "Como montar um guarda-roupa cápsula", img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80", d: "10 peças que combinam entre si o ano inteiro." },
    { id: "couro", t: "Cuidados com peças de couro legítimo", img: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80", d: "Limpeza, hidratação e armazenamento corretos." },
  ];
  return (
    <section style={{ marginTop: 24 }}>
      <h1 className="loja-section-title" style={{ fontSize: 44, fontWeight: 700, letterSpacing: -0.03 }}>Diário</h1>
      <div className="loja-3col" style={{ marginTop: 28, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
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

function Visite() {
  return (
    <section style={{ marginTop: 24 }}>
      <h1 className="loja-section-title" style={{ fontSize: 44, fontWeight: 700, letterSpacing: -0.03 }}>Visite a loja</h1>
      <div className="loja-2col" style={{ marginTop: 28, display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 28 }}>
        <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80" alt="Loja física" onError={imgFallback} style={{ width: "100%", height: 420, objectFit: "cover", borderRadius: 22 }} />
        <div className="loja-4col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, alignContent: "start" }}>
          {[
            { t: "Endereço", v: "[seu endereço aqui]" },
            { t: "Bairro", v: "[seu bairro aqui]" },
            { t: "Horário", v: "[seu horário aqui]" },
            { t: "WhatsApp", v: "[seu WhatsApp aqui]" },
          ].map((it) => (
            <motion.div key={it.t} whileHover={{ y: -3 }} style={{ padding: 22, borderRadius: 18, background: C.pill }}>
              <div style={{ fontSize: 11, color: C.inkSoft, textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 600 }}>{it.t}</div>
              <div style={{ marginTop: 6, fontSize: 15, fontWeight: 600, color: C.ink }}>{it.v}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contato() {
  return (
    <section style={{ marginTop: 24 }}>
      <h1 className="loja-section-title" style={{ fontSize: 44, fontWeight: 700, letterSpacing: -0.03 }}>Fale com a loja</h1>
      <p style={{ marginTop: 8, fontSize: 14, color: C.inkSoft, maxWidth: 600 }}>Atendimento próximo e humano. Use o canal que preferir.</p>
      <div className="loja-2col" style={{ marginTop: 28, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div className="loja-4col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
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
    { q: "Curadoria incrível e atendimento super atencioso. Já é minha loja favorita.", a: "Bianca R." },
    { q: "Comprei pelo WhatsApp e recebi em casa rapidíssimo. Recomendo demais.", a: "Helena T." },
    { q: "As peças têm acabamento impecável. Vale cada centavo.", a: "Júlia A." },
  ];
  return (
    <section className="loja-bleed" style={{ marginTop: 56, padding: "56px 56px", background: C.pill }}>
      <div style={{ fontSize: 11, color: C.accent, textTransform: "uppercase", letterSpacing: 1.4, fontWeight: 700 }}>Depoimentos</div>
      <h2 className="loja-section-title" style={{ marginTop: 6, fontSize: 36, fontWeight: 700, letterSpacing: -0.03 }}>Quem leva, volta</h2>
      <div className="loja-3col" style={{ marginTop: 28, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
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

function NewsletterStrip() {
  return (
    <section style={{ marginTop: 56, padding: "36px 32px", borderRadius: 24, background: C.brandDark, color: "#fff", display: "flex", gap: 18, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
      <div>
        <div style={{ fontSize: 11, opacity: 0.8, textTransform: "uppercase", letterSpacing: 1.4, fontWeight: 700 }}>Newsletter</div>
        <h3 style={{ marginTop: 4, fontSize: 24, fontWeight: 700 }}>Receba as novidades em primeira mão</h3>
      </div>
      <form onSubmit={(e) => e.preventDefault()} style={{ display: "flex", gap: 8, flex: "1 1 320px", minWidth: 280 }}>
        <input placeholder="[seu e-mail aqui]" style={{ ...inputStyle, background: "rgba(255,255,255,0.12)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)", flex: 1 }} />
        <button type="submit" style={{ padding: "12px 20px", borderRadius: 12, background: C.accent, color: "#fff", fontWeight: 700, fontSize: 14 }}>Assinar</button>
      </form>
    </section>
  );
}

// ---------------- Detail view ----------------
function DetailView({ item, onBack, onAsk }: { item: DetailItem; onBack: () => void; onAsk: () => void }) {
  return (
    <div style={{ marginTop: 20 }}>
      <button onClick={onBack} style={{ fontSize: 13, color: C.inkSoft, fontWeight: 600 }}>← Voltar</button>
      <div className="loja-2col" style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 28 }}>
        <div>
          <motion.img src={item.image} alt={item.title} onError={imgFallback}
            initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}
            style={{ width: "100%", height: 480, objectFit: "cover", borderRadius: 22 }} />
          <h1 style={{ marginTop: 22, fontSize: 36, fontWeight: 700, letterSpacing: -0.02 }}>{item.title}</h1>
          {item.subtitle && <div style={{ marginTop: 6, fontSize: 13, color: C.inkSoft }}>{item.subtitle}</div>}
          <p style={{ marginTop: 16, fontSize: 15, color: C.inkSoft, lineHeight: 1.7 }}>{item.description}</p>
          {item.highlights && (
            <div style={{ marginTop: 22 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>Detalhes</div>
              <ul style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {item.highlights.map((h) => (
                  <li key={h} style={{ padding: "10px 14px", borderRadius: 12, background: C.pill, fontSize: 13, color: C.ink }}>• {h}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <aside style={{ position: "sticky", top: 24, alignSelf: "start", padding: 22, borderRadius: 20, background: C.paper, border: `1px solid ${C.border}` }}>
          {item.price && <div style={{ fontSize: 11, color: C.inkSoft, textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 600 }}>Valor</div>}
          {item.price && <div style={{ marginTop: 4, fontSize: 28, fontWeight: 800, color: C.brand }}>{item.price}</div>}
          <button onClick={onAsk} style={{ marginTop: 18, width: "100%", padding: "14px", borderRadius: 14, background: C.brand, color: "#fff", fontWeight: 700, fontSize: 14 }}>Comprar no WhatsApp</button>
          <button style={{ marginTop: 10, width: "100%", padding: "12px", borderRadius: 14, background: C.pill, color: C.ink, fontWeight: 600, fontSize: 13 }}>Reservar na loja</button>
          <div style={{ marginTop: 18, fontSize: 12, color: C.inkSoft, lineHeight: 1.6 }}>
            Atendimento por WhatsApp em [seu WhatsApp aqui].<br />
            Entrega para todo o Brasil e retirada na loja.
          </div>
        </aside>
      </div>
    </div>
  );
}

// ---------------- Modal ----------------
function AskModal({ item, onClose }: { item: { name: string; price?: string }; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(27,26,24,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}>
      <motion.div onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: "100%", maxWidth: 460, background: C.paper, borderRadius: 22, padding: 28 }}>
        <div style={{ fontSize: 11, color: C.accent, textTransform: "uppercase", letterSpacing: 1.4, fontWeight: 700 }}>Atendimento</div>
        <h3 style={{ marginTop: 6, fontSize: 24, fontWeight: 700 }}>{item.name}</h3>
        {item.price && <p style={{ marginTop: 6, fontSize: 14, color: C.inkSoft }}>{item.price} · finalizamos pelo WhatsApp.</p>}
        <form onSubmit={(e) => { e.preventDefault(); onClose(); }} style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
          <Field label="Nome"><input required placeholder="[seu nome aqui]" style={inputStyle} /></Field>
          <Field label="WhatsApp"><input required placeholder="[seu WhatsApp aqui]" style={inputStyle} /></Field>
          <Field label="Tamanho / observações"><input placeholder="[tamanho, cor, dúvidas]" style={inputStyle} /></Field>
          <button type="submit" style={{ marginTop: 6, padding: "14px", borderRadius: 14, background: C.brand, color: "#fff", fontWeight: 700, fontSize: 14 }}>Falar com a loja</button>
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
      <div className="loja-4col" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 28 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>Atelier Norte</div>
          <p style={{ marginTop: 8, fontSize: 13, color: C.inkSoft, lineHeight: 1.6 }}>Curadoria autoral em moda, acessórios e objetos para casa.</p>
        </div>
        {[
          { t: "Loja", l: ["vitrine", "colecoes", "promocoes"] as PageKey[] },
          { t: "Marca", l: ["sobre", "lookbook", "blog"] as PageKey[] },
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
        © {new Date().getFullYear()} Atelier Norte. Todos os direitos reservados.
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

export default LojaPreview;
