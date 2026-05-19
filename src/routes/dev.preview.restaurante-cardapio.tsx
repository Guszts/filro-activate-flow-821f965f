import { createFileRoute } from "@tanstack/react-router";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export const Route = createFileRoute("/dev/preview/restaurante-cardapio")({
  component: RestaurantePreview,
  head: () => ({
    meta: [
      { title: "Forno & Brasa · Restaurante e Cardápio" },
      { name: "description", content: "Forno & Brasa — cardápio autoral, combos e pedidos por WhatsApp." },
    ],
  }),
});

// ---------------- Theme ----------------
const C = {
  page: "#F6EFE6", paper: "#FFFBF5", ink: "#1E1410", inkSoft: "#6E5A4D",
  muted: "#A8978A", border: "#E8DCCB", pill: "#F1E6D5", divider: "#E4D6C2",
  brand: "#B23A1B", brandDark: "#7A2410", accent: "#D9A441",
};

// ---------------- Data ----------------
type Dish = {
  id: string; name: string; category: "entradas" | "principais" | "pizzas" | "burgers" | "sobremesas" | "bebidas";
  image: string; price: string; description: string; tag?: string; rating?: number;
};
const DISHES: Dish[] = [
  { id: "bruschetta", name: "Bruschetta da casa", category: "entradas", image: "https://images.unsplash.com/photo-1572441713132-c542fc4fe282?auto=format&fit=crop&w=1200&q=80", price: "R$ 29", description: "Pão rústico tostado, tomate confit, manjericão fresco e azeite extra virgem.", tag: "Vegetariano", rating: 4.8 },
  { id: "carpaccio", name: "Carpaccio de filé", category: "entradas", image: "https://images.unsplash.com/photo-1625938145744-533e82f1d34a?auto=format&fit=crop&w=1200&q=80", price: "R$ 49", description: "Lâminas finas de filé mignon, alcaparras, parmesão e molho mostarda dijon.", rating: 4.9 },
  { id: "risoto", name: "Risoto de funghi", category: "principais", image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=1200&q=80", price: "R$ 72", description: "Arroz arbóreo, mix de cogumelos frescos, parmesão e tomilho.", tag: "Mais pedido", rating: 4.9 },
  { id: "salmao", name: "Salmão grelhado", category: "principais", image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1200&q=80", price: "R$ 89", description: "Salmão grelhado com legumes salteados e purê de batata-doce.", rating: 4.8 },
  { id: "margherita", name: "Pizza Margherita", category: "pizzas", image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?auto=format&fit=crop&w=1200&q=80", price: "R$ 58", description: "Massa fermentada 48h, molho de tomate San Marzano, mussarela de búfala e manjericão.", tag: "Clássico", rating: 4.9 },
  { id: "pepperoni", name: "Pizza Pepperoni Premium", category: "pizzas", image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=1200&q=80", price: "R$ 68", description: "Pepperoni italiano, mussarela, azeite picante e orégano fresco.", rating: 4.7 },
  { id: "smash", name: "Smash Burger Duplo", category: "burgers", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80", price: "R$ 42", description: "Dois discos de blend bovino, queijo cheddar, picles, cebola caramelizada e molho da casa.", tag: "Top", rating: 4.9 },
  { id: "veggie", name: "Burger Vegetariano", category: "burgers", image: "https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?auto=format&fit=crop&w=1200&q=80", price: "R$ 38", description: "Burger de grão-de-bico, queijo coalho, rúcula e maionese de ervas.", tag: "Veggie", rating: 4.6 },
  { id: "petit", name: "Petit Gâteau", category: "sobremesas", image: "https://images.unsplash.com/photo-1612203985729-70726954388c?auto=format&fit=crop&w=1200&q=80", price: "R$ 32", description: "Bolinho de chocolate meio amargo com sorvete de creme.", rating: 5 },
  { id: "cheesecake", name: "Cheesecake de Frutas Vermelhas", category: "sobremesas", image: "https://images.unsplash.com/photo-1567171466295-4afa63d45416?auto=format&fit=crop&w=1200&q=80", price: "R$ 28", description: "Base crocante, creme suave e calda de frutas vermelhas.", rating: 4.7 },
  { id: "limonada", name: "Limonada Suíça", category: "bebidas", image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=1200&q=80", price: "R$ 14", description: "Limão batido com leite condensado, servida bem gelada.", rating: 4.8 },
  { id: "vinho", name: "Taça de Vinho Tinto", category: "bebidas", image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80", price: "R$ 32", description: "Seleção semanal do sommelier — peça ao garçom.", rating: 4.9 },
];

const COMBOS = [
  { id: "casal", name: "Combo Casal", price: "R$ 119", description: "2 pratos principais + 2 bebidas + 1 sobremesa para compartilhar.", image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80" },
  { id: "familia", name: "Combo Família", price: "R$ 189", description: "2 pizzas grandes + 4 bebidas + sobremesa da casa.", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=80" },
  { id: "executivo", name: "Combo Executivo", price: "R$ 49", description: "Prato do dia + suco natural + sobremesa pequena. Seg a sex, 12h às 15h.", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80" },
];

const HERO_IMAGE = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1800&q=80";

const FILTERS = [
  { key: "entradas", label: "Entradas" },
  { key: "principais", label: "Principais" },
  { key: "pizzas", label: "Pizzas" },
  { key: "burgers", label: "Burgers" },
  { key: "sobremesas", label: "Sobremesas" },
  { key: "bebidas", label: "Bebidas" },
] as const;
type FilterKey = (typeof FILTERS)[number]["key"];

const NAV_ITEMS = [
  { key: "inicio", label: "Início" },
  { key: "cardapio", label: "Cardápio" },
  { key: "combos", label: "Combos" },
  { key: "delivery", label: "Delivery" },
  { key: "reservas", label: "Reservas" },
  { key: "eventos", label: "Eventos" },
  { key: "sobre", label: "Sobre" },
  { key: "blog", label: "Blog" },
  { key: "contato", label: "Contato" },
] as const;
type PageKey = (typeof NAV_ITEMS)[number]["key"];

const imgFallback = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const img = e.currentTarget;
  if (img.dataset.fb) return;
  img.dataset.fb = "1";
  img.src = `https://picsum.photos/seed/${encodeURIComponent(img.alt || "dish")}/1200/800`;
};

// ---------------- Detail context ----------------
type DetailItem = {
  id: string; kind: "prato" | "combo" | "post"; title: string; subtitle?: string;
  image: string; price?: string; description: string; highlights?: string[];
};
type DetailCtx = { open: (item: DetailItem) => void; order: (d: Dish | { name: string; price: string }) => void };
const DetailContext = createContext<DetailCtx | null>(null);
function useDetail() {
  const ctx = useContext(DetailContext);
  if (!ctx) throw new Error("Missing DetailContext");
  return ctx;
}
function dishToDetail(d: Dish): DetailItem {
  return {
    id: `dish-${d.id}`, kind: "prato", title: d.name, subtitle: d.tag, image: d.image,
    price: d.price, description: d.description,
    highlights: ["Ingredientes frescos do dia", "Preparado na hora", "Opção para retirada e delivery", "Pode acompanhar molho extra"],
  };
}

// ---------------- Root ----------------
export function RestaurantePreview() {
  const [page, setPage] = useState<PageKey>("inicio");
  const [filter, setFilter] = useState<FilterKey>("principais");
  const [orderFor, setOrderFor] = useState<{ name: string; price: string } | null>(null);
  const [detail, setDetail] = useState<DetailItem | null>(null);

  const filtered = useMemo(() => DISHES.filter(d => d.category === filter), [filter]);

  useEffect(() => { setDetail(null); }, [page]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [detail, page]);

  const ctxValue: DetailCtx = { open: setDetail, order: setOrderFor };

  return (
    <DetailContext.Provider value={ctxValue}>
      <div style={{ background: C.page, color: C.ink, fontFamily: "Inter, Manrope, ui-sans-serif, system-ui" }} className="min-h-screen w-full">
        <ResponsiveStyles />
        <div className="rest-shell mx-auto" style={{
          background: C.paper, maxWidth: 1250, margin: "40px auto",
          borderRadius: 24, padding: "32px 56px 56px",
          boxShadow: "0 30px 80px rgba(30,20,16,0.10)",
        }}>
          <Header page={page} setPage={setPage} />

          <AnimatePresence mode="wait">
            {detail ? (
              <motion.div key={`detail-${detail.id}`}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}>
                <DetailView item={detail} onBack={() => setDetail(null)}
                  onOrder={() => setOrderFor({ name: detail.title, price: detail.price || "Sob consulta" })} />
              </motion.div>
            ) : (
              <motion.div key={page}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}>
                {page === "inicio" && <Home filter={filter} setFilter={setFilter} items={filtered} goTo={setPage} />}
                {page === "cardapio" && <Cardapio filter={filter} setFilter={setFilter} items={filtered} />}
                {page === "combos" && <Combos />}
                {page === "delivery" && <Delivery />}
                {page === "reservas" && <Reservas onConfirm={(n) => setOrderFor({ name: n, price: "Reserva" })} />}
                {page === "eventos" && <Eventos />}
                {page === "sobre" && <Sobre />}
                {page === "blog" && <Blog />}
                {page === "contato" && <Contato />}
              </motion.div>
            )}
          </AnimatePresence>

          <Footer goTo={setPage} />
        </div>

        <AnimatePresence>
          {orderFor && <OrderModal item={orderFor} onClose={() => setOrderFor(null)} />}
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
        .rest-shell { padding: 28px !important; margin: 16px !important; max-width: calc(100% - 32px) !important; border-radius: 20px !important; }
        .rest-content { grid-template-columns: 1fr !important; }
        .rest-bleed { margin-left: -28px !important; margin-right: -28px !important; }
      }
      @media (max-width: 900px) {
        .rest-nav { gap: 6px !important; flex-wrap: wrap !important; justify-content: center; flex: 1 1 100%; order: 3; margin-top: 10px; padding-top: 10px; border-top: 1px solid ${C.divider}; }
        .rest-nav button { font-size: 12px !important; padding: 6px 10px; border-radius: 999px; background: ${C.pill}; }
        .rest-nav button[data-active="true"] { background: ${C.brand} !important; color: #fff !important; }
        .rest-header { flex-wrap: wrap !important; height: auto !important; padding-bottom: 8px; }
      }
      @media (max-width: 720px) {
        .rest-shell { padding: 18px !important; margin: 0 !important; max-width: 100% !important; border-radius: 0 !important; }
        .rest-bleed { margin-left: -18px !important; margin-right: -18px !important; }
        .rest-header-cta { display: none !important; }
        .rest-hero { height: 380px !important; }
        .rest-hero-title { font-size: 36px !important; }
        .rest-2col { grid-template-columns: 1fr !important; }
        .rest-3col { grid-template-columns: 1fr !important; }
        .rest-4col { grid-template-columns: 1fr 1fr !important; }
        .rest-section-title { font-size: 28px !important; }
        .rest-card-h { grid-template-columns: 1fr !important; }
        .rest-card-h img { height: 200px !important; width: 100% !important; }
      }
      @media (max-width: 480px) { .rest-4col { grid-template-columns: 1fr !important; } }
    `}</style>
  );
}

// ---------------- Header ----------------
function Header({ page, setPage }: { page: PageKey; setPage: (k: PageKey) => void }) {
  return (
    <motion.header initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      style={{ height: 64 }} className="rest-header flex items-center justify-between">
      <button onClick={() => setPage("inicio")} className="flex items-center gap-2">
        <motion.span whileHover={{ rotate: -8, scale: 1.05 }}
          style={{ background: C.brand, color: "#fff", width: 32, height: 32, borderRadius: 10, fontWeight: 800, fontSize: 14 }}
          className="inline-flex items-center justify-center">F</motion.span>
        <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: -0.3 }}>Forno &amp; Brasa</span>
      </button>

      <nav className="rest-nav flex items-center gap-6">
        {NAV_ITEMS.map((n) => {
          const active = page === n.key;
          return (
            <button key={n.key} data-active={active} onClick={() => setPage(n.key)}
              style={{ fontSize: 13, fontWeight: active ? 600 : 500, color: active ? C.ink : C.inkSoft, position: "relative", transition: "color 0.2s" }}>
              {n.label}
              {active && <motion.span layoutId="restnavline" style={{ position: "absolute", left: 0, right: 0, bottom: -8, height: 2, background: C.brand, borderRadius: 2 }} />}
            </button>
          );
        })}
      </nav>

      <motion.button whileHover={{ scale: 1.04 }} onClick={() => setPage("reservas")}
        className="rest-header-cta"
        style={{ background: C.brand, color: "#fff", padding: "10px 18px", borderRadius: 999, fontSize: 13, fontWeight: 600 }}>
        Reservar mesa
      </motion.button>
    </motion.header>
  );
}

// ---------------- Home ----------------
function Home({ filter, setFilter, items, goTo }: { filter: FilterKey; setFilter: (f: FilterKey) => void; items: Dish[]; goTo: (p: PageKey) => void }) {
  return (
    <div style={{ marginTop: 24 }}>
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
        className="rest-hero" style={{ position: "relative", height: 500, borderRadius: 28, overflow: "hidden" }}>
        <motion.img src={HERO_IMAGE} alt="Salão do restaurante" onError={imgFallback}
          initial={{ scale: 1.12 }} animate={{ scale: 1 }} transition={{ duration: 1.6, ease: "easeOut" }}
          style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(30,20,16,0.15), rgba(30,20,16,0.65))" }} />
        <div style={{ position: "absolute", left: 32, right: 32, bottom: 40, color: "#fff" }}>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ display: "inline-block", padding: "5px 14px", borderRadius: 999, background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", fontSize: 11, fontWeight: 600, letterSpacing: 1.4, textTransform: "uppercase" }}>
            Cozinha autoral · Forno a lenha
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="rest-hero-title" style={{ marginTop: 16, fontSize: 56, fontWeight: 700, letterSpacing: -0.04, lineHeight: 1.05, maxWidth: 720 }}>
            Sabores que aquecem o coração
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            style={{ marginTop: 14, fontSize: 16, maxWidth: 520, opacity: 0.9 }}>
            Pratos preparados na hora com ingredientes frescos. Reserve sua mesa ou peça delivery.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            style={{ marginTop: 22, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button onClick={() => goTo("reservas")} style={{ background: "#fff", color: C.ink, padding: "12px 22px", borderRadius: 999, fontWeight: 600, fontSize: 14 }}>Reservar mesa</button>
            <button onClick={() => goTo("cardapio")} style={{ background: "transparent", color: "#fff", padding: "12px 22px", borderRadius: 999, fontWeight: 600, fontSize: 14, border: "1px solid rgba(255,255,255,0.5)" }}>Ver cardápio</button>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats edge-to-edge */}
      <section className="rest-bleed" style={{ marginTop: 48, padding: "44px 56px", background: C.brand, color: "#fff", borderRadius: 0 }}>
        <div className="rest-4col" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24 }}>
          {[
            { n: "15+", l: "Anos de história" },
            { n: "120", l: "Pratos no cardápio" },
            { n: "98%", l: "Avaliações positivas" },
            { n: "30min", l: "Tempo médio de entrega" },
          ].map((s, i) => (
            <motion.div key={s.l} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}>
              <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: -0.03 }}>{s.n}</div>
              <div style={{ marginTop: 6, fontSize: 13, opacity: 0.85 }}>{s.l}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Cardápio destaque */}
      <section style={{ marginTop: 56 }}>
        <div className="flex items-end justify-between" style={{ flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: C.brand, textTransform: "uppercase", letterSpacing: 1.4, fontWeight: 700 }}>Cardápio</div>
            <h2 className="rest-section-title" style={{ marginTop: 6, fontSize: 40, fontWeight: 700, letterSpacing: -0.03 }}>Pratos em destaque</h2>
          </div>
          <button onClick={() => goTo("cardapio")} style={{ fontSize: 13, color: C.brand, fontWeight: 600 }}>Ver tudo →</button>
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

        <DishGrid items={items.slice(0, 6)} />
      </section>

      <Testimonials />
      <NewsletterStrip />
    </div>
  );
}

// ---------------- Dish grid ----------------
function DishGrid({ items }: { items: Dish[] }) {
  const { open, order } = useDetail();
  return (
    <div className="rest-3col" style={{ marginTop: 28, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
      {items.map((d, i) => (
        <motion.div key={d.id}
          initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.35, delay: i * 0.06 }}
          whileHover={{ y: -4 }}
          onClick={() => open(dishToDetail(d))}
          style={{ background: C.paper, border: `1px solid ${C.border}`, borderRadius: 20, overflow: "hidden", cursor: "pointer" }}>
          <div style={{ position: "relative", height: 200, overflow: "hidden" }}>
            <motion.img src={d.image} alt={d.name} onError={imgFallback}
              whileHover={{ scale: 1.08 }} transition={{ duration: 0.6 }}
              style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            {d.tag && <span style={{ position: "absolute", top: 12, left: 12, background: C.accent, color: C.ink, padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700 }}>{d.tag}</span>}
          </div>
          <div style={{ padding: 18 }}>
            <div className="flex items-center justify-between" style={{ gap: 8 }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{d.name}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.brand }}>{d.price}</div>
            </div>
            <p style={{ marginTop: 8, fontSize: 13, color: C.inkSoft, lineHeight: 1.5 }}>{d.description}</p>
            <button onClick={(e) => { e.stopPropagation(); order({ name: d.name, price: d.price }); }}
              style={{ marginTop: 14, width: "100%", padding: "10px 14px", borderRadius: 12, background: C.ink, color: "#fff", fontSize: 13, fontWeight: 600 }}>
              Pedir agora
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ---------------- Pages ----------------
function Cardapio({ filter, setFilter, items }: { filter: FilterKey; setFilter: (f: FilterKey) => void; items: Dish[] }) {
  return (
    <section style={{ marginTop: 24 }}>
      <h1 className="rest-section-title" style={{ fontSize: 44, fontWeight: 700, letterSpacing: -0.03 }}>Cardápio completo</h1>
      <p style={{ marginTop: 8, fontSize: 14, color: C.inkSoft, maxWidth: 600 }}>Navegue pelas categorias e clique em um prato para ver os detalhes.</p>
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
      <DishGrid items={items} />
    </section>
  );
}

function Combos() {
  const { open, order } = useDetail();
  return (
    <section style={{ marginTop: 24 }}>
      <h1 className="rest-section-title" style={{ fontSize: 44, fontWeight: 700, letterSpacing: -0.03 }}>Combos &amp; promoções</h1>
      <p style={{ marginTop: 8, fontSize: 14, color: C.inkSoft, maxWidth: 600 }}>Economize pedindo combos para casal, família ou seu almoço executivo.</p>
      <div className="rest-3col" style={{ marginTop: 32, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
        {COMBOS.map((c, i) => (
          <motion.div key={c.id}
            initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.35, delay: i * 0.08 }} whileHover={{ y: -4 }}
            onClick={() => open({ id: `combo-${c.id}`, kind: "combo", title: c.name, image: c.image, price: c.price, description: c.description, highlights: ["Pedido por WhatsApp", "Retirada ou delivery", "Atendimento prioritário", "Brinde do chef"] })}
            style={{ background: C.paper, border: `1px solid ${C.border}`, borderRadius: 20, overflow: "hidden", cursor: "pointer" }}>
            <img src={c.image} alt={c.name} onError={imgFallback} style={{ width: "100%", height: 200, objectFit: "cover" }} />
            <div style={{ padding: 20 }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{c.name}</div>
              <div style={{ marginTop: 4, fontSize: 22, fontWeight: 800, color: C.brand }}>{c.price}</div>
              <p style={{ marginTop: 8, fontSize: 13, color: C.inkSoft, lineHeight: 1.5 }}>{c.description}</p>
              <button onClick={(e) => { e.stopPropagation(); order({ name: c.name, price: c.price }); }}
                style={{ marginTop: 14, width: "100%", padding: "10px 14px", borderRadius: 12, background: C.brand, color: "#fff", fontSize: 13, fontWeight: 600 }}>
                Pedir combo
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Delivery() {
  return (
    <section style={{ marginTop: 24 }}>
      <h1 className="rest-section-title" style={{ fontSize: 44, fontWeight: 700, letterSpacing: -0.03 }}>Delivery próprio</h1>
      <p style={{ marginTop: 8, fontSize: 14, color: C.inkSoft, maxWidth: 600 }}>Entregamos em todo o bairro com taxa fixa. Tempo médio de 30 a 45 minutos.</p>
      <div className="rest-2col" style={{ marginTop: 32, display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 28 }}>
        <div className="rest-4col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {[
            { t: "Taxa fixa", v: "R$ 8,00" },
            { t: "Tempo médio", v: "30–45 min" },
            { t: "Pedido mínimo", v: "R$ 40,00" },
            { t: "Pagamento", v: "PIX, cartão, dinheiro" },
          ].map((it) => (
            <motion.div key={it.t} whileHover={{ y: -3 }}
              style={{ padding: 22, borderRadius: 18, background: C.pill }}>
              <div style={{ fontSize: 11, color: C.inkSoft, textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 600 }}>{it.t}</div>
              <div style={{ marginTop: 6, fontSize: 18, fontWeight: 700, color: C.ink }}>{it.v}</div>
            </motion.div>
          ))}
        </div>
        <div style={{ padding: 24, borderRadius: 20, background: C.brand, color: "#fff" }}>
          <div style={{ fontSize: 12, opacity: 0.85, textTransform: "uppercase", letterSpacing: 1.4, fontWeight: 700 }}>Áreas atendidas</div>
          <h3 style={{ marginTop: 8, fontSize: 24, fontWeight: 700 }}>Raio de 5 km do restaurante</h3>
          <ul style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 6, fontSize: 14, opacity: 0.95 }}>
            <li>[bairro 1]</li>
            <li>[bairro 2]</li>
            <li>[bairro 3]</li>
            <li>[bairro 4]</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function Reservas({ onConfirm }: { onConfirm: (n: string) => void }) {
  return (
    <section style={{ marginTop: 24 }}>
      <h1 className="rest-section-title" style={{ fontSize: 44, fontWeight: 700, letterSpacing: -0.03 }}>Reserve sua mesa</h1>
      <p style={{ marginTop: 8, fontSize: 14, color: C.inkSoft, maxWidth: 600 }}>Garanta seu lugar com antecedência. Confirmamos a reserva por WhatsApp.</p>
      <form onSubmit={(e) => { e.preventDefault(); onConfirm("Reserva de mesa"); }}
        style={{ marginTop: 28, padding: 28, borderRadius: 20, background: C.pill, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="rest-2col">
        <Field label="Nome"><input placeholder="[seu nome aqui]" style={inputStyle} /></Field>
        <Field label="WhatsApp"><input placeholder="[seu WhatsApp aqui]" style={inputStyle} /></Field>
        <Field label="Data"><input type="date" style={inputStyle} /></Field>
        <Field label="Pessoas"><input type="number" min={1} placeholder="2" style={inputStyle} /></Field>
        <div style={{ gridColumn: "1 / -1" }}>
          <button type="submit" style={{ marginTop: 8, width: "100%", padding: "14px", borderRadius: 14, background: C.brand, color: "#fff", fontSize: 14, fontWeight: 700 }}>Confirmar reserva</button>
        </div>
      </form>
    </section>
  );
}

function Eventos() {
  const events = [
    { t: "Jantar Harmonizado", d: "Cinco etapas com vinhos selecionados pelo sommelier.", img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80" },
    { t: "Noite Italiana", d: "Menu degustação inspirado na culinária do sul da Itália.", img: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1200&q=80" },
    { t: "Aniversários", d: "Reservamos o espaço para celebrar com a sua família e amigos.", img: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80" },
  ];
  return (
    <section style={{ marginTop: 24 }}>
      <h1 className="rest-section-title" style={{ fontSize: 44, fontWeight: 700, letterSpacing: -0.03 }}>Eventos &amp; experiências</h1>
      <div className="rest-3col" style={{ marginTop: 28, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
        {events.map((ev, i) => (
          <motion.div key={ev.t} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: i * 0.08 }}
            style={{ borderRadius: 20, overflow: "hidden", border: `1px solid ${C.border}`, background: C.paper }}>
            <img src={ev.img} alt={ev.t} onError={imgFallback} style={{ width: "100%", height: 200, objectFit: "cover" }} />
            <div style={{ padding: 20 }}>
              <div style={{ fontSize: 17, fontWeight: 700 }}>{ev.t}</div>
              <p style={{ marginTop: 8, fontSize: 13, color: C.inkSoft, lineHeight: 1.5 }}>{ev.d}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Sobre() {
  return (
    <section style={{ marginTop: 24 }}>
      <h1 className="rest-section-title" style={{ fontSize: 44, fontWeight: 700, letterSpacing: -0.03 }}>Nossa história</h1>
      <div className="rest-2col" style={{ marginTop: 28, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        <p style={{ fontSize: 15, color: C.inkSoft, lineHeight: 1.7 }}>
          Há mais de 15 anos servimos receitas que unem tradição e criatividade. Nossa cozinha é comandada por um time apaixonado por ingredientes locais e técnicas que respeitam o tempo de cada preparo.
          <br /><br />
          Trabalhamos com fornecedores próximos, fermentações longas e um forno a lenha que dá identidade aos nossos pratos. Venha conhecer um espaço acolhedor para todos os momentos.
        </p>
        <img src="https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80" alt="Equipe na cozinha" onError={imgFallback} style={{ width: "100%", height: 360, objectFit: "cover", borderRadius: 20 }} />
      </div>
    </section>
  );
}

function Blog() {
  const { open } = useDetail();
  const posts = [
    { id: "harmoniz", t: "Como harmonizar vinhos com massas", img: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1200&q=80", d: "Dicas práticas do nosso sommelier para escolher o vinho ideal." },
    { id: "fermentacao", t: "Por que fermentamos a massa por 48h", img: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=1200&q=80", d: "Entenda o impacto da fermentação na leveza e no sabor." },
    { id: "carne", t: "O ponto certo da carne na brasa", img: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80", d: "Guia simples para acertar o ponto na sua próxima visita." },
  ];
  return (
    <section style={{ marginTop: 24 }}>
      <h1 className="rest-section-title" style={{ fontSize: 44, fontWeight: 700, letterSpacing: -0.03 }}>Do blog</h1>
      <div className="rest-3col" style={{ marginTop: 28, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
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
      <h1 className="rest-section-title" style={{ fontSize: 44, fontWeight: 700, letterSpacing: -0.03 }}>Fale com a gente</h1>
      <p style={{ marginTop: 8, fontSize: 14, color: C.inkSoft, maxWidth: 600 }}>Estamos prontos para receber você. Use o canal de sua preferência.</p>
      <div className="rest-2col" style={{ marginTop: 28, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div className="rest-4col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
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
    { q: "Comida incrível e ambiente acolhedor. Voltarei muitas vezes!", a: "Mariana S." },
    { q: "O combo família salva nossos domingos. Atendimento impecável.", a: "Rodrigo P." },
    { q: "A pizza margherita aqui é a melhor da cidade, sem exagero.", a: "Camila T." },
  ];
  return (
    <section className="rest-bleed" style={{ marginTop: 56, padding: "56px 56px", background: C.pill }}>
      <div style={{ fontSize: 11, color: C.brand, textTransform: "uppercase", letterSpacing: 1.4, fontWeight: 700 }}>Depoimentos</div>
      <h2 className="rest-section-title" style={{ marginTop: 6, fontSize: 36, fontWeight: 700, letterSpacing: -0.03 }}>Quem prova, volta</h2>
      <div className="rest-3col" style={{ marginTop: 28, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
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
        <h3 style={{ marginTop: 4, fontSize: 24, fontWeight: 700 }}>Receba o cardápio da semana</h3>
      </div>
      <form onSubmit={(e) => e.preventDefault()} style={{ display: "flex", gap: 8, flex: "1 1 320px", minWidth: 280 }}>
        <input placeholder="[seu e-mail aqui]" style={{ ...inputStyle, background: "rgba(255,255,255,0.12)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)", flex: 1 }} />
        <button type="submit" style={{ padding: "12px 20px", borderRadius: 12, background: C.accent, color: C.ink, fontWeight: 700, fontSize: 14 }}>Assinar</button>
      </form>
    </section>
  );
}

// ---------------- Detail view ----------------
function DetailView({ item, onBack, onOrder }: { item: DetailItem; onBack: () => void; onOrder: () => void }) {
  return (
    <div style={{ marginTop: 20 }}>
      <button onClick={onBack} style={{ fontSize: 13, color: C.inkSoft, fontWeight: 600 }}>← Voltar</button>
      <div className="rest-2col" style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 28 }}>
        <div>
          <motion.img src={item.image} alt={item.title} onError={imgFallback}
            initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}
            style={{ width: "100%", height: 420, objectFit: "cover", borderRadius: 22 }} />
          <h1 style={{ marginTop: 22, fontSize: 36, fontWeight: 700, letterSpacing: -0.02 }}>{item.title}</h1>
          {item.subtitle && <div style={{ marginTop: 6, fontSize: 13, color: C.inkSoft }}>{item.subtitle}</div>}
          <p style={{ marginTop: 16, fontSize: 15, color: C.inkSoft, lineHeight: 1.7 }}>{item.description}</p>
          {item.highlights && (
            <div style={{ marginTop: 22 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>Destaques</div>
              <ul style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {item.highlights.map((h) => (
                  <li key={h} style={{ padding: "10px 14px", borderRadius: 12, background: C.pill, fontSize: 13, color: C.ink }}>• {h}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <aside style={{ position: "sticky", top: 24, alignSelf: "start", padding: 22, borderRadius: 20, background: C.paper, border: `1px solid ${C.border}` }}>
          {item.price && <div style={{ fontSize: 11, color: C.inkSoft, textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 600 }}>Preço</div>}
          {item.price && <div style={{ marginTop: 4, fontSize: 28, fontWeight: 800, color: C.brand }}>{item.price}</div>}
          <button onClick={onOrder} style={{ marginTop: 18, width: "100%", padding: "14px", borderRadius: 14, background: C.brand, color: "#fff", fontWeight: 700, fontSize: 14 }}>Pedir agora</button>
          <button style={{ marginTop: 10, width: "100%", padding: "12px", borderRadius: 14, background: C.pill, color: C.ink, fontWeight: 600, fontSize: 13 }}>Adicionar ao pedido</button>
          <div style={{ marginTop: 18, fontSize: 12, color: C.inkSoft, lineHeight: 1.6 }}>
            Atendimento por WhatsApp em [seu WhatsApp aqui].<br />
            Retirada e delivery disponíveis.
          </div>
        </aside>
      </div>
    </div>
  );
}

// ---------------- Modal ----------------
function OrderModal({ item, onClose }: { item: { name: string; price: string }; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(20,12,8,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}>
      <motion.div onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: "100%", maxWidth: 460, background: C.paper, borderRadius: 22, padding: 28 }}>
        <div style={{ fontSize: 11, color: C.brand, textTransform: "uppercase", letterSpacing: 1.4, fontWeight: 700 }}>Novo pedido</div>
        <h3 style={{ marginTop: 6, fontSize: 24, fontWeight: 700 }}>{item.name}</h3>
        <p style={{ marginTop: 6, fontSize: 14, color: C.inkSoft }}>{item.price} · confirmamos pelo WhatsApp.</p>
        <form onSubmit={(e) => { e.preventDefault(); onClose(); }} style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
          <Field label="Nome"><input required placeholder="[seu nome aqui]" style={inputStyle} /></Field>
          <Field label="WhatsApp"><input required placeholder="[seu WhatsApp aqui]" style={inputStyle} /></Field>
          <Field label="Endereço (delivery)"><input placeholder="[seu endereço aqui]" style={inputStyle} /></Field>
          <button type="submit" style={{ marginTop: 6, padding: "14px", borderRadius: 14, background: C.brand, color: "#fff", fontWeight: 700, fontSize: 14 }}>Enviar pedido</button>
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
      <div className="rest-4col" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 28 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>Forno &amp; Brasa</div>
          <p style={{ marginTop: 8, fontSize: 13, color: C.inkSoft, lineHeight: 1.6 }}>Restaurante autoral com forno a lenha. Sabor e acolhimento desde 2010.</p>
        </div>
        {[
          { t: "Cardápio", l: ["cardapio", "combos", "delivery"] as PageKey[] },
          { t: "Casa", l: ["sobre", "eventos", "blog"] as PageKey[] },
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
      <div style={{ marginTop: 32, paddingTop: 18, borderTop: `1px solid ${C.divider}`, display: "flex", justifyContent: "space-between", fontSize: 12, color: C.muted }}>
        <span>© {new Date().getFullYear()} Forno &amp; Brasa. Todos os direitos reservados.</span>
        <span>Receitas com carinho.</span>
      </div>
    </footer>
  );
}

// ---------------- Helpers ----------------
const inputStyle: React.CSSProperties = {
  padding: "12px 14px", borderRadius: 12, background: C.pill, fontSize: 13, outline: "none", border: `1px solid ${C.border}`,
};
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 11, color: C.inkSoft, textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 600 }}>{label}</span>
      {children}
    </label>
  );
}
