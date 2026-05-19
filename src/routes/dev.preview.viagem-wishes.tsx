import { createFileRoute } from "@tanstack/react-router";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search, ChevronDown, MapPin, Play, Star, Menu, X, Plane, ArrowRight, Check,
  Sparkles as SparklesIcon, Mail, Phone,
  Shield, Globe, Heart, Wifi, Coffee, Tv, Bath, ArrowLeftRight, CreditCard,
  Quote, ChevronRight, Send, MapPinned, Clock, Briefcase,
} from "lucide-react";

export const Route = createFileRoute("/dev/preview/viagem-wishes")({
  component: WishesPreview,
  head: () => ({
    meta: [
      { title: "Wishes · Experiência de Viagem" },
      { name: "description", content: "Reserve sua próxima viagem com a Wishes — pacotes, destinos, passagens e experiências." },
    ],
  }),
});

// ---------------- Data ----------------
type Destination = {
  id: string;
  title: string;
  country: string;
  locationLabel: string;
  category: "ofertas" | "asia" | "europa" | "oriente-medio" | "america";
  image: string;
  rating: number;
  type: "horizontal" | "vertical";
  priceLabel: string;
  description: string;
};

const DESTINATIONS: Destination[] = [
  { id: "nova-york", title: "Nova York", country: "EUA", locationLabel: "Cidade dos EUA", category: "america", image: "https://images.unsplash.com/photo-1492217140050-8c43e0a3923f?auto=format&fit=crop&w=1200&q=80", rating: 4.8, type: "horizontal", priceLabel: "A partir de R$ 7.490", description: "Roteiro urbano com hospedagem em Manhattan e passeios guiados." },
  { id: "bangladesh", title: "Bangladesh", country: "Bangladesh", locationLabel: "Cox Bazar", category: "asia", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80", rating: 4.6, type: "horizontal", priceLabel: "A partir de R$ 5.290", description: "Praias de águas turquesa e cultura local imersiva." },
  { id: "nepal", title: "Nepal", country: "Nepal", locationLabel: "Himalaia", category: "asia", image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=900&q=80", rating: 5, type: "vertical", priceLabel: "A partir de R$ 8.990", description: "Trekking nas montanhas com guias locais e lodges premium." },
  { id: "dubai", title: "Dubai", country: "EAU", locationLabel: "Emirados Árabes Unidos", category: "oriente-medio", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80", rating: 5, type: "vertical", priceLabel: "A partir de R$ 9.790", description: "Hotéis 5 estrelas, deserto e arquitetura moderna." },
  { id: "lisboa", title: "Lisboa", country: "Portugal", locationLabel: "Europa", category: "europa", image: "https://images.unsplash.com/photo-1513735718075-2e2d37cb1bfd?auto=format&fit=crop&w=1200&q=80", rating: 4.7, type: "horizontal", priceLabel: "A partir de R$ 6.490", description: "Bondinhos amarelos, miradouros e gastronomia portuguesa." },
  { id: "santorini", title: "Santorini", country: "Grécia", locationLabel: "Mar Egeu", category: "europa", image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=900&q=80", rating: 5, type: "vertical", priceLabel: "A partir de R$ 10.290", description: "Casas brancas, pôr do sol em Oia e cruzeiros na caldera." },
];

const HERO_IMAGE = "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1800&q=80";

const FILTERS = [
  { key: "ofertas", label: "Ofertas" },
  { key: "asia", label: "Ásia" },
  { key: "europa", label: "Europa" },
  { key: "oriente-medio", label: "Oriente Médio" },
  { key: "america", label: "América" },
] as const;
type FilterKey = (typeof FILTERS)[number]["key"];

const NAV_ITEMS = [
  { key: "inicio", label: "Início" },
  { key: "passagens", label: "Passagens" },
  { key: "hoteis", label: "Hotéis" },
  { key: "pacotes", label: "Pacotes" },
  { key: "experiencias", label: "Experiências" },
  { key: "lugares", label: "Lugares" },
  { key: "reservar", label: "Reservar" },
  { key: "blog", label: "Blog" },
  { key: "contato", label: "Contato" },
] as const;
type PageKey = (typeof NAV_ITEMS)[number]["key"];

const C = {
  page: "#EAF1EF", paper: "#FFFFFF", ink: "#161B1C", inkSoft: "#7B8588",
  muted: "#A3ACAE", border: "#E8EEEE", blue: "#DDF4FA", btn: "#202523",
  pill: "#EEF4F4", divider: "#E3E9E9",
};

// Robust image fallback (some Unsplash IDs occasionally 404)
const imgFallback = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const img = e.currentTarget;
  if (img.dataset.fb) return;
  img.dataset.fb = "1";
  const seed = encodeURIComponent(img.alt || "viagem");
  img.src = `https://picsum.photos/seed/${seed}/1200/800`;
};

// Generic detail item used by the detail page
type DetailItem = {
  id: string;
  kind: "destino" | "hotel" | "experiencia" | "post";
  title: string;
  subtitle?: string;
  image: string;
  priceLabel?: string;
  rating?: number;
  description: string;
  highlights?: string[];
};

// ---------------- Detail Context ----------------
type DetailCtx = {
  open: (item: DetailItem) => void;
  reserve: (d: Destination) => void;
};
const DetailContext = createContext<DetailCtx | null>(null);
function useDetail() {
  const ctx = useContext(DetailContext);
  if (!ctx) throw new Error("DetailContext missing");
  return ctx;
}

// Convert any source object into a DetailItem
function destinationToDetail(d: Destination): DetailItem {
  return {
    id: `dest-${d.id}`, kind: "destino", title: d.title, subtitle: d.locationLabel,
    image: d.image, priceLabel: d.priceLabel, rating: d.rating, description: d.description,
    highlights: ["Hospedagem selecionada", "Traslado incluído", "Guia em português", "Seguro viagem"],
  };
}

// ---------------- Root ----------------
export function WishesPreview() {
  const [page, setPage] = useState<PageKey>("inicio");
  const [menuOpen, setMenuOpen] = useState(false);
  const [filter, setFilter] = useState<FilterKey>("ofertas");
  const [openDropdown, setOpenDropdown] = useState<null | "loc" | "date" | "guests">(null);
  const [loc, setLoc] = useState("Para onde você vai?");
  const [date, setDate] = useState("Escolha a data");
  const [guests, setGuests] = useState("Adicionar");
  const [bookingFor, setBookingFor] = useState<Destination | null>(null);
  const [detail, setDetail] = useState<DetailItem | null>(null);

  const searchRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setOpenDropdown(null);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const filtered = useMemo(() => filter === "ofertas" ? DESTINATIONS : DESTINATIONS.filter(d => d.category === filter), [filter]);

  // close mobile menu and detail on page change
  useEffect(() => { setMenuOpen(false); setDetail(null); }, [page]);
  // scroll to top when detail opens/closes
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [detail]);

  const ctxValue: DetailCtx = {
    open: (item) => setDetail(item),
    reserve: (d) => setBookingFor(d),
  };

  return (
    <DetailContext.Provider value={ctxValue}>
    <div style={{ background: C.page, color: C.ink, fontFamily: "Inter, Manrope, ui-sans-serif, system-ui" }} className="min-h-screen w-full">
      <ResponsiveStyles />
      <div
        className="wishes-shell mx-auto"
        style={{
          background: C.paper, maxWidth: 1250, margin: "40px auto",
          borderRadius: 24, padding: "32px 56px 56px",
          boxShadow: "0 30px 80px rgba(22,27,28,0.08)",
        }}
      >
        <Header page={page} setPage={setPage} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

        <AnimatePresence mode="wait">
          {detail ? (
            <motion.div
              key={`detail-${detail.id}`}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              <DetailView item={detail} onBack={() => setDetail(null)} onReserve={() => {
                const d = DESTINATIONS.find(x => `dest-${x.id}` === detail.id) ?? DESTINATIONS[0];
                setBookingFor(d);
              }} />
            </motion.div>
          ) : (
          <motion.div
            key={page}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            {page === "inicio" && (
              <Home
                searchRef={searchRef} openDropdown={openDropdown} setOpenDropdown={setOpenDropdown}
                loc={loc} setLoc={setLoc} date={date} setDate={setDate} guests={guests} setGuests={setGuests}
                filter={filter} setFilter={setFilter} items={filtered}
                onReserve={(d) => setBookingFor(d)} goTo={setPage}
              />
            )}
            {page === "passagens" && <Passagens />}
            {page === "hoteis" && <Hoteis onReserve={(d) => setBookingFor(d)} />}
            {page === "pacotes" && <Pacotes filter={filter} setFilter={setFilter} items={filtered} onReserve={(d) => setBookingFor(d)} />}
            {page === "experiencias" && <Experiencias />}
            {page === "lugares" && <Lugares onReserve={(d) => setBookingFor(d)} />}
            {page === "reservar" && <Reservar onConfirm={(d) => setBookingFor(d)} />}
            {page === "blog" && <Blog />}
            {page === "contato" && <Contato />}
          </motion.div>
          )}
        </AnimatePresence>

        <Footer goTo={setPage} />
      </div>

      <AnimatePresence>
        {bookingFor && <BookingModal destination={bookingFor} onClose={() => setBookingFor(null)} />}
      </AnimatePresence>
    </div>
    </DetailContext.Provider>
  );
}

// ---------------- Detail View ----------------
function DetailView({ item, onBack, onReserve }: { item: DetailItem; onBack: () => void; onReserve: () => void }) {
  const kindLabel = { destino: "Destino", hotel: "Hotel", experiencia: "Experiência", post: "Artigo" }[item.kind];
  return (
    <article style={{ marginTop: 24 }}>
      <motion.button
        whileHover={{ x: -4 }} onClick={onBack}
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 18, padding: "8px 14px", borderRadius: 999, background: C.pill }}
      >
        ← Voltar
      </motion.button>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
        style={{ position: "relative", height: 420, borderRadius: 28, overflow: "hidden" }}
        className="wishes-hero"
      >
        <motion.img
          src={item.image} alt={item.title} onError={imgFallback}
          initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 1.4, ease: "easeOut" }}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.15), rgba(0,0,0,0.55))" }} />
        <div style={{ position: "absolute", left: 28, right: 28, bottom: 28, color: "#fff" }}>
          <div style={{ display: "inline-block", padding: "4px 12px", borderRadius: 999, background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", fontSize: 11, fontWeight: 600, letterSpacing: 1.2, textTransform: "uppercase" }}>{kindLabel}</div>
          <h1 className="wishes-hero-title" style={{ marginTop: 10, fontSize: 48, fontWeight: 700, letterSpacing: -0.02, lineHeight: 1.05 }}>{item.title}</h1>
          {item.subtitle && <div style={{ marginTop: 6, fontSize: 16, opacity: 0.9, display: "inline-flex", alignItems: "center", gap: 6 }}><MapPin size={14} /> {item.subtitle}</div>}
        </div>
      </motion.div>

      <div className="wishes-content" style={{ marginTop: 32, display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 28 }}>
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: C.ink }}>Sobre essa experiência</h2>
          <p style={{ marginTop: 10, fontSize: 15, lineHeight: 1.7, color: C.inkSoft }}>{item.description} Roteiro pensado para quem busca conforto e autenticidade, com hospedagem cuidadosamente avaliada e atividades guiadas em português.</p>

          {item.highlights && (
            <div style={{ marginTop: 24 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: C.ink, marginBottom: 12 }}>O que está incluso</h3>
              <div className="wishes-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {item.highlights.map((h, i) => (
                  <motion.div
                    key={h}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.06 }}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 14, background: C.pill }}
                  >
                    <span style={{ width: 26, height: 26, borderRadius: 999, background: C.blue, display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Check size={13} /></span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{h}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: 28 }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: C.ink, marginBottom: 12 }}>Roteiro sugerido</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {["Chegada e check-in com recepção dedicada", "City tour guiado pelos principais pontos", "Experiência gastronômica local", "Tempo livre e retorno"].map((s, i) => (
                <motion.div
                  key={s}
                  initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  style={{ display: "flex", gap: 14, alignItems: "start", padding: 16, borderRadius: 16, border: `1px solid ${C.border}` }}
                >
                  <div style={{ width: 30, height: 30, borderRadius: 999, background: C.ink, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ fontSize: 14, color: C.ink, lineHeight: 1.55 }}>{s}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.aside
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ background: C.paper, border: `1px solid ${C.border}`, borderRadius: 24, padding: 24, alignSelf: "start", position: "sticky", top: 20 }}
        >
          {item.priceLabel && (
            <>
              <div style={{ fontSize: 12, color: C.inkSoft, textTransform: "uppercase", letterSpacing: 1.2 }}>A partir de</div>
              <div style={{ marginTop: 4, fontSize: 28, fontWeight: 700, color: C.ink, letterSpacing: -0.02 }}>{item.priceLabel.replace("A partir de ", "")}</div>
            </>
          )}
          {item.rating && (
            <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: C.inkSoft }}>
              <Star size={13} fill="#FFB400" stroke="#FFB400" /> {item.rating} · {Math.round(item.rating * 28)} avaliações
            </div>
          )}
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            <motion.button whileHover={{ scale: 1.02 }} onClick={onReserve} style={{ height: 50, borderRadius: 14, background: C.btn, color: "#fff", fontWeight: 600, fontSize: 14 }}>Reservar agora</motion.button>
            <button style={{ height: 46, borderRadius: 14, background: C.pill, color: C.ink, fontWeight: 600, fontSize: 13 }}>Adicionar à lista de desejos</button>
          </div>
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${C.divider}`, display: "flex", flexDirection: "column", gap: 10 }}>
            {[{ i: Shield, l: "Reserva 100% protegida" }, { i: Heart, l: "Cancelamento flexível" }, { i: Phone, l: "Suporte 24/7" }].map((b) => (
              <div key={b.l} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: C.inkSoft }}>
                <b.i size={14} /> {b.l}
              </div>
            ))}
          </div>
        </motion.aside>
      </div>
    </article>
  );
}


// ---------------- Responsive ----------------
function ResponsiveStyles() {
  return (
    <style>{`
      @media (max-width: 1024px) {
        .wishes-shell { padding: 28px !important; margin: 16px !important; max-width: calc(100% - 32px) !important; border-radius: 20px !important; }
        .wishes-content { grid-template-columns: 1fr !important; }
      }
      @media (max-width: 720px) {
        .wishes-shell { padding: 18px !important; margin: 0 !important; max-width: 100% !important; border-radius: 0 !important; }
        .wishes-nav { gap: 16px !important; overflow-x: auto; flex: 1; min-width: 0; padding: 4px 6px; scrollbar-width: none; -ms-overflow-style: none; max-width: 100%; }
        .wishes-nav::-webkit-scrollbar { display: none; }
        .wishes-nav button { flex: 0 0 auto; }
        .wishes-menu-btn { display: none !important; }
        .wishes-header-cta { display: none !important; }
        .wishes-hero { height: 360px !important; }
        .wishes-hero-title { font-size: 36px !important; }
        .wishes-hero-sub { font-size: 18px !important; }
        .wishes-search { width: 100% !important; margin-top: 18px !important; height: auto !important; grid-template-columns: 1fr !important; padding: 14px !important; gap: 10px !important; }
        .wishes-search-btn { width: 100% !important; height: 52px !important; }
        .wishes-search-divider { display: none !important; }
        .wishes-content { grid-template-columns: 1fr !important; gap: 24px !important; margin-top: 28px !important; }
        .wishes-right-grid { grid-template-columns: 1fr !important; }
        .wishes-card-horizontal { grid-template-columns: 1fr !important; }
        .wishes-card-horizontal img { height: 180px !important; width: 100% !important; }
        .wishes-card-vertical { height: 360px !important; }
        .wishes-2col { grid-template-columns: 1fr !important; }
        .wishes-3col { grid-template-columns: 1fr !important; }
        .wishes-4col { grid-template-columns: 1fr 1fr !important; }
        .wishes-section-title { font-size: 28px !important; }
        .wishes-flight-row { grid-template-columns: 1fr !important; gap: 12px !important; }
        .wishes-seat-grid { grid-template-columns: repeat(6, 1fr) !important; }
      }
      @media (max-width: 480px) {
        .wishes-4col { grid-template-columns: 1fr !important; }
      }
    `}</style>
  );
}

// ---------------- Header ----------------
function Header({ page, setPage, menuOpen, setMenuOpen }: { page: PageKey; setPage: (k: PageKey) => void; menuOpen: boolean; setMenuOpen: (b: boolean) => void }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ height: 64, position: "relative" }}
      className="flex items-center justify-between"
    >
      <button onClick={() => setPage("inicio")} className="flex items-center gap-2">
        <motion.span
          whileHover={{ rotate: 18, scale: 1.05 }}
          style={{ background: C.ink, color: "#fff", width: 30, height: 30, borderRadius: 10 }}
          className="inline-flex items-center justify-center"
        >
          <Plane size={14} />
        </motion.span>
        <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: -0.2 }}>Wishes</span>
      </button>

      <nav className="wishes-nav flex items-center gap-6">
        {NAV_ITEMS.map((n) => {
          const active = page === n.key;
          return (
            <button
              key={n.key}
              onClick={() => setPage(n.key)}
              style={{
                fontSize: 13, fontWeight: active ? 600 : 500,
                color: active ? C.ink : "#5F696C", position: "relative",
                transition: "color 0.2s",
              }}
              className="hover:text-black"
            >
              {n.label}
              {active && (
                <motion.span
                  layoutId="nav-underline"
                  style={{ position: "absolute", left: 0, right: 0, bottom: -8, height: 2, background: C.ink, borderRadius: 2 }}
                />
              )}
            </button>
          );
        })}
      </nav>

      <div className="flex items-center gap-2">
        <button
          className="wishes-menu-btn"
          style={{ display: "none", width: 38, height: 38, borderRadius: 999, background: C.pill, color: C.ink, alignItems: "center", justifyContent: "center" }}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Abrir menu"
        >
          {menuOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          style={{ background: C.pill, color: C.ink, height: 38, padding: "0 16px", borderRadius: 999, fontSize: 13, fontWeight: 600 }}
        >
          Entrar
        </motion.button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            style={{ position: "absolute", top: 64, right: 0, background: C.paper, border: `1px solid ${C.border}`, borderRadius: 16, padding: 10, zIndex: 30, boxShadow: "0 20px 60px rgba(22,27,28,0.12)", minWidth: 200 }}
          >
            {NAV_ITEMS.map((n) => (
              <button
                key={n.key}
                onClick={() => { setPage(n.key); setMenuOpen(false); }}
                style={{ display: "block", padding: "10px 14px", fontSize: 14, fontWeight: page === n.key ? 600 : 500, color: page === n.key ? C.ink : "#5F696C", width: "100%", textAlign: "left", borderRadius: 10 }}
                className="hover:bg-black/5"
              >
                {n.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

// ---------------- Home ----------------
function Home(props: {
  searchRef: React.RefObject<HTMLDivElement | null>;
  openDropdown: null | "loc" | "date" | "guests";
  setOpenDropdown: (v: null | "loc" | "date" | "guests") => void;
  loc: string; setLoc: (s: string) => void;
  date: string; setDate: (s: string) => void;
  guests: string; setGuests: (s: string) => void;
  filter: FilterKey; setFilter: (f: FilterKey) => void;
  items: Destination[]; onReserve: (d: Destination) => void; goTo: (p: PageKey) => void;
}) {
  const { searchRef, openDropdown, setOpenDropdown, loc, setLoc, date, setDate, guests, setGuests, filter, setFilter, items, onReserve, goTo } = props;
  return (
    <>
      <motion.section
        initial={{ opacity: 0, scale: 0.985 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
        className="wishes-hero"
        style={{ marginTop: 24, height: 460, borderRadius: 28, overflow: "hidden", position: "relative" }}
      >
        <motion.img
          src={HERO_IMAGE} alt="Resort à beira-mar" onError={imgFallback}
          initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.18), rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.35))" }} />
        <div style={{ position: "absolute", top: 70, left: 0, right: 0, textAlign: "center", color: "#fff", padding: "0 16px" }}>
          <motion.h1
            initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7, delay: 0.2 }}
            className="wishes-hero-title"
            style={{ fontSize: 56, fontWeight: 700, letterSpacing: -0.02, lineHeight: 1.05 }}
          >Praia Verde</motion.h1>
          <motion.p
            initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.4 }}
            className="wishes-hero-sub"
            style={{ marginTop: 10, fontSize: 26, fontWeight: 400, opacity: 0.95 }}
          >Experiência de Viagem</motion.p>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
          aria-label="Reproduzir vídeo"
          style={{ position: "absolute", left: "50%", top: "60%", transform: "translateX(-50%)", width: 74, height: 74, borderRadius: 999, background: "rgba(255,255,255,0.55)", backdropFilter: "blur(8px)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
        >
          <Play size={26} fill="#fff" />
        </motion.button>
      </motion.section>

      <motion.div
        ref={searchRef}
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
        className="wishes-search"
        style={{ position: "relative", width: "82%", margin: "-48px auto 0", height: 96, background: C.paper, borderRadius: 24, boxShadow: "0 20px 60px rgba(22,27,28,0.12)", display: "grid", gridTemplateColumns: "1fr auto 1fr auto 1fr auto", alignItems: "center", padding: "0 14px", gap: 8, zIndex: 5 }}
      >
        <SearchField label="Localização" value={loc} open={openDropdown === "loc"} onToggle={() => setOpenDropdown(openDropdown === "loc" ? null : "loc")}
          options={["Lisboa", "Dubai", "Nepal", "Nova York", "Bangladesh"]} onPick={(v) => { setLoc(v); setOpenDropdown(null); }} />
        <Divider />
        <SearchField label="Data" value={date} open={openDropdown === "date"} onToggle={() => setOpenDropdown(openDropdown === "date" ? null : "date")}
          options={["Hoje", "Amanhã", "Próxima Semana", "Próximo Mês"]} onPick={(v) => { setDate(v); setOpenDropdown(null); }} />
        <Divider />
        <SearchField label="Hóspedes" value={guests} open={openDropdown === "guests"} onToggle={() => setOpenDropdown(openDropdown === "guests" ? null : "guests")}
          options={["1", "2", "3", "4+"]} onPick={(v) => { setGuests(v); setOpenDropdown(null); }} />
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          className="wishes-search-btn"
          onClick={() => setOpenDropdown(null)}
          style={{ background: C.btn, color: "#fff", width: 180, height: 70, borderRadius: 14, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, fontWeight: 600 }}
        >
          <Search size={16} /> Buscar
        </motion.button>
      </motion.div>

      <div className="wishes-content" style={{ marginTop: 56, display: "grid", gridTemplateColumns: "300px 1fr", gap: 36 }}>
        <Sidebar filter={filter} setFilter={setFilter} />
        <RightGrid items={items} onReserve={onReserve} />
      </div>

      {/* New sections */}
      <Features />
      <Stats />
      <Testimonials />
      <NewsletterCTA goTo={goTo} />
      <FAQ />
    </>
  );
}

function Divider() {
  return <span className="wishes-search-divider" style={{ width: 1, height: 36, background: C.divider, display: "inline-block" }} />;
}

function SearchField({ label, value, options, open, onToggle, onPick }: { label: string; value: string; options: string[]; open: boolean; onToggle: () => void; onPick: (v: string) => void }) {
  return (
    <div style={{ position: "relative" }}>
      <button onClick={onToggle} style={{ width: "100%", textAlign: "left", padding: "0 14px" }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.ink, marginBottom: 2 }}>{label}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13, color: C.inkSoft }}>
          <span>{value}</span>
          <ChevronDown size={14} style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none" }} />
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -6 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: -6 }} transition={{ duration: 0.18 }}
            style={{ position: "absolute", top: 64, left: 8, right: 8, background: C.paper, border: `1px solid ${C.border}`, borderRadius: 16, padding: 8, boxShadow: "0 20px 60px rgba(22,27,28,0.12)", zIndex: 20 }}
          >
            {options.map((o) => (
              <button key={o} onClick={() => onPick(o)} style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 12px", fontSize: 13, color: C.ink, borderRadius: 10 }} className="hover:bg-black/5">{o}</button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------- Sidebar / RightGrid / Cards ----------------
function Sidebar({ filter, setFilter }: { filter: FilterKey; setFilter: (f: FilterKey) => void }) {
  return (
    <aside style={{ padding: 26, borderRadius: 28, background: C.paper, border: `1px solid #EEF2F2`, boxShadow: "0 4px 18px rgba(22,27,28,0.04)", alignSelf: "start" }}>
      <div style={{ fontSize: 20, fontWeight: 700, color: C.ink }}>Ofertas de Pacotes</div>
      <ul style={{ marginTop: 16 }}>
        {FILTERS.map((f, i) => {
          const active = filter === f.key;
          return (
            <li key={f.key} style={{ borderBottom: i < FILTERS.length - 1 ? `1px solid ${C.divider}` : "none" }}>
              <motion.button
                whileHover={{ x: 4 }} onClick={() => setFilter(f.key)}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 14px", borderRadius: 14, margin: "6px 0", background: active ? C.blue : "transparent", color: active ? C.ink : C.inkSoft, fontWeight: active ? 600 : 500, fontSize: 14 }}
              >
                <span>{f.label}</span>
                {active && <span style={{ width: 26, height: 26, borderRadius: 8, background: C.paper, display: "inline-flex", alignItems: "center", justifyContent: "center" }}><ArrowRight size={13} /></span>}
              </motion.button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

function RightGrid({ items, onReserve }: { items: Destination[]; onReserve: (d: Destination) => void }) {
  const horizontals = items.filter(i => i.type === "horizontal").slice(0, 2);
  const verticals = items.filter(i => i.type === "vertical").slice(0, 2);
  const fillH = horizontals.length ? horizontals : items.slice(0, 2);
  const fillV = verticals.length ? verticals : items.slice(items.length - 2);
  return (
    <div className="wishes-right-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <AnimatePresence mode="popLayout">
          {fillH.map((d, idx) => (
            <motion.div key={d.id} layout initial={{ opacity: 0, y: 18, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.32, delay: idx * 0.05 }}>
              <HorizontalCard d={d} onReserve={() => onReserve(d)} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <AnimatePresence mode="popLayout">
          {fillV.map((d, idx) => (
            <motion.div key={d.id} layout initial={{ opacity: 0, y: 18, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.32, delay: idx * 0.05 }}>
              <VerticalCard d={d} onReserve={() => onReserve(d)} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function HorizontalCard({ d, onReserve }: { d: Destination; onReserve: () => void }) {
  return (
    <motion.div whileHover={{ y: -4, boxShadow: "0 18px 40px rgba(22,27,28,0.12)" }} transition={{ duration: 0.25 }} className="wishes-card-horizontal group" style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 14, padding: 14, borderRadius: 18, border: `1px solid ${C.border}`, background: C.paper }}>
      <div style={{ overflow: "hidden", borderRadius: 14, height: 120 }}>
        <img onError={imgFallback} src={d.image} alt={d.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s" }} className="group-hover:scale-105" />
      </div>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "4px 4px 4px 0" }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700, color: C.ink }}>{d.title}</div>
          <div style={{ fontSize: 13, color: C.inkSoft, marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
            <MapPin size={12} /> {d.locationLabel}
          </div>
        </div>
        <button onClick={onReserve} style={{ alignSelf: "flex-start", fontSize: 13, fontWeight: 600, color: C.ink, padding: "8px 12px", borderRadius: 10, background: C.pill }} className="hover:bg-[#DDF4FA] transition-colors">Reservar</button>
      </div>
    </motion.div>
  );
}

function VerticalCard({ d, onReserve }: { d: Destination; onReserve: () => void }) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.25 }} className="wishes-card-vertical group" style={{ position: "relative", height: 320, borderRadius: 28, overflow: "hidden", border: `1px solid ${C.border}` }}>
      <img onError={imgFallback} src={d.image} alt={d.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.6s" }} className="group-hover:scale-110" />
      <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(6px)", padding: "6px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, color: C.ink, display: "inline-flex", alignItems: "center", gap: 4 }}>
        <MapPin size={11} /> {d.country}
      </div>
      <div style={{ position: "absolute", left: 10, right: 10, bottom: 10, background: "rgba(255,255,255,0.78)", backdropFilter: "blur(10px)", borderRadius: 18, padding: 12 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.ink }}>{d.title}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
          <div style={{ display: "flex", gap: 1 }}>{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={11} fill="#FFB400" stroke="#FFB400" />)}</div>
          <button onClick={onReserve} style={{ fontSize: 12, fontWeight: 600, color: "#fff", padding: "6px 12px", borderRadius: 999, background: C.btn }}>Reservar</button>
        </div>
      </div>
    </motion.div>
  );
}

// ---------------- NEW SECTIONS ----------------
function SectionTitle({ kicker, title, sub }: { kicker?: string; title: string; sub?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5 }}
      style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 28px" }}
    >
      {kicker && <div style={{ fontSize: 12, fontWeight: 600, color: C.inkSoft, textTransform: "uppercase", letterSpacing: 1.4, marginBottom: 8 }}>{kicker}</div>}
      <h2 className="wishes-section-title" style={{ fontSize: 38, fontWeight: 700, color: C.ink, letterSpacing: -0.02, lineHeight: 1.1 }}>{title}</h2>
      {sub && <p style={{ marginTop: 10, color: C.inkSoft, fontSize: 15 }}>{sub}</p>}
    </motion.div>
  );
}

function Features() {
  const items = [
    { icon: Shield, title: "Reserva segura", text: "Pagamento protegido e confirmação imediata." },
    { icon: Globe, title: "Destinos globais", text: "Mais de 120 destinos em 5 continentes." },
    { icon: Heart, title: "Atendimento humano", text: "Equipe dedicada antes, durante e depois da viagem." },
    { icon: Briefcase, title: "Pacotes flexíveis", text: "Roteiros adaptados ao seu ritmo e orçamento." },
  ];
  return (
    <section style={{ marginTop: 80 }}>
      <SectionTitle kicker="Por que Wishes" title="Tudo que você precisa para viajar tranquilo" />
      <div className="wishes-4col" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18 }}>
        {items.map((it, i) => (
          <motion.div
            key={it.title}
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}
            whileHover={{ y: -6 }}
            style={{ padding: 24, borderRadius: 20, background: C.paper, border: `1px solid ${C.border}` }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 12, background: C.blue, display: "inline-flex", alignItems: "center", justifyContent: "center", color: C.ink }}>
              <it.icon size={20} />
            </div>
            <div style={{ marginTop: 14, fontSize: 16, fontWeight: 700, color: C.ink }}>{it.title}</div>
            <div style={{ marginTop: 6, fontSize: 13, color: C.inkSoft, lineHeight: 1.5 }}>{it.text}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Stats() {
  const items = [
    { value: "120+", label: "Destinos" },
    { value: "48k", label: "Viajantes" },
    { value: "4.9★", label: "Avaliação" },
    { value: "24/7", label: "Atendimento" },
  ];
  return (
    <section style={{ marginTop: 72 }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
        className="wishes-4col"
        style={{ background: C.ink, color: "#fff", borderRadius: 28, padding: "40px 32px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}
      >
        {items.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}
            style={{ textAlign: "center" }}
          >
            <div style={{ fontSize: 42, fontWeight: 700, letterSpacing: -0.02 }}>{s.value}</div>
            <div style={{ marginTop: 4, fontSize: 13, opacity: 0.7 }}>{s.label}</div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

function Testimonials() {
  const items = [
    { name: "Marina S.", text: "Roteiro perfeito em Lisboa, cada detalhe foi pensado.", role: "Viagem de casal" },
    { name: "Rafael L.", text: "Atendimento impecável e ótimo custo-benefício no Dubai.", role: "Viagem família" },
    { name: "Camila P.", text: "Voltei encantada do Nepal. Recomendo demais.", role: "Aventura solo" },
  ];
  return (
    <section style={{ marginTop: 72 }}>
      <SectionTitle kicker="Depoimentos" title="O que dizem nossos viajantes" />
      <div className="wishes-3col" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
        {items.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }}
            whileHover={{ y: -4 }}
            style={{ padding: 24, borderRadius: 20, background: C.paper, border: `1px solid ${C.border}` }}
          >
            <Quote size={22} color={C.inkSoft} />
            <p style={{ marginTop: 12, fontSize: 14, color: C.ink, lineHeight: 1.6 }}>"{t.text}"</p>
            <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 999, background: C.blue, display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: C.ink, fontSize: 13 }}>{t.name[0]}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{t.name}</div>
                <div style={{ fontSize: 11, color: C.inkSoft }}>{t.role}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function NewsletterCTA({ goTo }: { goTo: (p: PageKey) => void }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <section style={{ marginTop: 72 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
        style={{ borderRadius: 32, overflow: "hidden", position: "relative", padding: "56px 32px", background: `linear-gradient(135deg, ${C.blue}, #fff)`, border: `1px solid ${C.border}` }}
      >
        <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
          <SparklesIcon size={28} color={C.ink} style={{ margin: "0 auto" }} />
          <h2 className="wishes-section-title" style={{ marginTop: 12, fontSize: 36, fontWeight: 700, letterSpacing: -0.02, color: C.ink }}>Ofertas exclusivas no seu e-mail</h2>
          <p style={{ marginTop: 8, color: C.inkSoft }}>Receba destinos selecionados e promoções antes de todos.</p>
          <form
            onSubmit={(e) => { e.preventDefault(); setSent(true); setTimeout(() => setSent(false), 2500); }}
            style={{ marginTop: 22, display: "flex", gap: 8, background: C.paper, padding: 6, borderRadius: 999, border: `1px solid ${C.border}`, maxWidth: 480, marginInline: "auto" }}
          >
            <input
              type="email" required placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)}
              style={{ flex: 1, padding: "0 18px", height: 46, borderRadius: 999, fontSize: 14, color: C.ink, background: "transparent", outline: "none" }}
            />
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} type="submit" style={{ background: C.btn, color: "#fff", height: 46, padding: "0 22px", borderRadius: 999, fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}>
              {sent ? <><Check size={14} /> Inscrito</> : <><Send size={14} /> Inscrever</>}
            </motion.button>
          </form>
          <button onClick={() => goTo("pacotes")} style={{ marginTop: 18, fontSize: 13, fontWeight: 600, color: C.ink, display: "inline-flex", alignItems: "center", gap: 4 }}>
            Ver todos os pacotes <ChevronRight size={14} />
          </button>
        </div>
      </motion.div>
    </section>
  );
}

function FAQ() {
  const items = [
    { q: "Como funciona o pagamento?", a: "Aceitamos cartão, Pix e parcelamento em até 12x. Confirmação imediata após aprovação." },
    { q: "Posso cancelar minha reserva?", a: "Sim, até 7 dias antes da viagem você recebe 100% de reembolso." },
    { q: "Os pacotes incluem passagem aérea?", a: "Depende do pacote. Pacotes 'Completo' e 'Premium' incluem voos." },
    { q: "Vocês oferecem seguro viagem?", a: "Sim, todos os pacotes incluem seguro básico. Upgrades disponíveis." },
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section style={{ marginTop: 72 }}>
      <SectionTitle kicker="Dúvidas" title="Perguntas frequentes" />
      <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((it, i) => {
          const isOpen = open === i;
          return (
            <motion.div
              key={it.q}
              initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: i * 0.05 }}
              style={{ borderRadius: 18, border: `1px solid ${C.border}`, background: C.paper, overflow: "hidden" }}
            >
              <button onClick={() => setOpen(isOpen ? null : i)} style={{ width: "100%", padding: "18px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", textAlign: "left", fontSize: 15, fontWeight: 600, color: C.ink }}>
                {it.q}
                <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}><ChevronDown size={16} /></motion.span>
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div style={{ padding: "0 22px 18px", fontSize: 14, color: C.inkSoft, lineHeight: 1.6 }}>{it.a}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

// ---------------- PASSAGENS (Sistema de compra placeholder) ----------------
function Passagens() {
  const [origem, setOrigem] = useState("São Paulo (GRU)");
  const [destino, setDestino] = useState("Lisboa (LIS)");
  const [ida, setIda] = useState("");
  const [volta, setVolta] = useState("");
  const [passageiros, setPassageiros] = useState("1");
  const [classe, setClasse] = useState("Econômica");
  const [step, setStep] = useState<"busca" | "voos" | "assentos" | "pagamento" | "sucesso">("busca");
  const [voo, setVoo] = useState<number | null>(null);
  const [assento, setAssento] = useState<string | null>(null);

  const voos = [
    { id: 0, cia: "LATAM", de: "GRU 08:20", para: "LIS 23:40", duracao: "11h 20m", preco: "R$ 3.890", paradas: "Direto" },
    { id: 1, cia: "TAP", de: "GRU 11:15", para: "LIS 02:30+1", duracao: "11h 15m", preco: "R$ 3.690", paradas: "Direto" },
    { id: 2, cia: "Air France", de: "GRU 19:45", para: "LIS 14:20+1", duracao: "13h 35m", preco: "R$ 4.190", paradas: "1 parada (CDG)" },
  ];

  return (
    <section style={{ marginTop: 32 }}>
      <SectionTitle kicker="Passagens" title="Encontre seu voo ideal" sub="Compare companhias, escolha assento e finalize a compra em poucos passos." />

      {/* Stepper */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
        {["Busca", "Voos", "Assentos", "Pagamento"].map((s, i) => {
          const order = ["busca", "voos", "assentos", "pagamento"];
          const idx = order.indexOf(step);
          const active = i <= idx;
          return (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 999, background: active ? C.ink : C.pill, color: active ? "#fff" : C.inkSoft, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, transition: "all 0.3s" }}>{i + 1}</div>
              <span style={{ fontSize: 12, fontWeight: active ? 600 : 500, color: active ? C.ink : C.inkSoft }}>{s}</span>
              {i < 3 && <span style={{ width: 28, height: 1, background: C.divider }} />}
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {step === "busca" && (
          <motion.form
            key="busca"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}
            onSubmit={(e) => { e.preventDefault(); setStep("voos"); }}
            style={{ background: C.paper, border: `1px solid ${C.border}`, borderRadius: 24, padding: 28 }}
          >
            <div className="wishes-flight-row" style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 14, alignItems: "end" }}>
              <Field label="Origem"><input value={origem} onChange={(e) => setOrigem(e.target.value)} style={inputStyle} /></Field>
              <button type="button" onClick={() => { const o = origem; setOrigem(destino); setDestino(o); }} style={{ width: 44, height: 44, borderRadius: 999, background: C.pill, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                <ArrowLeftRight size={16} />
              </button>
              <Field label="Destino"><input value={destino} onChange={(e) => setDestino(e.target.value)} style={inputStyle} /></Field>
            </div>
            <div className="wishes-flight-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
              <Field label="Ida"><input type="date" value={ida} onChange={(e) => setIda(e.target.value)} style={inputStyle} required /></Field>
              <Field label="Volta"><input type="date" value={volta} onChange={(e) => setVolta(e.target.value)} style={inputStyle} /></Field>
              <Field label="Passageiros"><select value={passageiros} onChange={(e) => setPassageiros(e.target.value)} style={inputStyle}>{["1","2","3","4+"].map(x => <option key={x}>{x}</option>)}</select></Field>
              <Field label="Classe"><select value={classe} onChange={(e) => setClasse(e.target.value)} style={inputStyle}>{["Econômica","Premium","Executiva","Primeira"].map(x => <option key={x}>{x}</option>)}</select></Field>
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" style={{ marginTop: 8, width: "100%", height: 52, borderRadius: 14, background: C.btn, color: "#fff", fontWeight: 600, fontSize: 15, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Search size={16} /> Buscar Passagens
            </motion.button>
          </motion.form>
        )}

        {step === "voos" && (
          <motion.div key="voos" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 13, color: C.inkSoft }}>{voos.length} voos encontrados · {origem} → {destino}</div>
            {voos.map((v, i) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                whileHover={{ y: -3, boxShadow: "0 12px 32px rgba(22,27,28,0.1)" }}
                style={{ background: C.paper, border: `1px solid ${C.border}`, borderRadius: 18, padding: 20, display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 20, alignItems: "center" }}
                className="wishes-flight-row"
              >
                <div style={{ width: 44, height: 44, borderRadius: 12, background: C.pill, display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Plane size={20} /></div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.inkSoft, letterSpacing: 1 }}>{v.cia}</div>
                  <div style={{ marginTop: 4, fontSize: 16, fontWeight: 700, color: C.ink }}>{v.de} → {v.para}</div>
                  <div style={{ marginTop: 2, fontSize: 12, color: C.inkSoft }}>{v.duracao} · {v.paradas}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.ink }}>{v.preco}</div>
                  <motion.button whileHover={{ scale: 1.05 }} onClick={() => { setVoo(v.id); setStep("assentos"); }} style={{ marginTop: 8, padding: "8px 16px", borderRadius: 999, background: C.btn, color: "#fff", fontSize: 13, fontWeight: 600 }}>Selecionar</motion.button>
                </div>
              </motion.div>
            ))}
            <button onClick={() => setStep("busca")} style={{ marginTop: 8, alignSelf: "flex-start", fontSize: 13, color: C.inkSoft }}>← Nova busca</button>
          </motion.div>
        )}

        {step === "assentos" && (
          <motion.div key="assentos" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }} style={{ background: C.paper, border: `1px solid ${C.border}`, borderRadius: 24, padding: 28 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.ink, marginBottom: 6 }}>Escolha seu assento</div>
            <div style={{ fontSize: 13, color: C.inkSoft, marginBottom: 22 }}>Voo {voos[voo ?? 0].cia} · {voos[voo ?? 0].de}</div>
            <div className="wishes-seat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 8, maxWidth: 460, margin: "0 auto" }}>
              {Array.from({ length: 40 }).map((_, i) => {
                const row = Math.floor(i / 8) + 1;
                const col = ["A","B","C","D","E","F","G","H"][i % 8];
                const id = `${row}${col}`;
                const taken = [3, 7, 12, 21, 28].includes(i);
                const selected = assento === id;
                return (
                  <motion.button
                    key={id}
                    whileHover={!taken ? { scale: 1.1 } : undefined}
                    disabled={taken}
                    onClick={() => setAssento(id)}
                    style={{ aspectRatio: "1", borderRadius: 8, fontSize: 10, fontWeight: 600, background: taken ? C.divider : selected ? C.ink : C.blue, color: taken ? C.muted : selected ? "#fff" : C.ink, transition: "all 0.2s", cursor: taken ? "not-allowed" : "pointer" }}
                  >{id}</motion.button>
                );
              })}
            </div>
            <div style={{ marginTop: 22, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <button onClick={() => setStep("voos")} style={{ fontSize: 13, color: C.inkSoft }}>← Voltar</button>
              <motion.button whileHover={{ scale: 1.04 }} disabled={!assento} onClick={() => setStep("pagamento")} style={{ padding: "12px 24px", borderRadius: 14, background: assento ? C.btn : C.divider, color: assento ? "#fff" : C.muted, fontWeight: 600, fontSize: 14 }}>
                Continuar {assento && `· ${assento}`}
              </motion.button>
            </div>
          </motion.div>
        )}

        {step === "pagamento" && (
          <motion.form
            key="pagamento"
            onSubmit={(e) => { e.preventDefault(); setStep("sucesso"); }}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}
            style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 20 }}
            className="wishes-content"
          >
            <div style={{ background: C.paper, border: `1px solid ${C.border}`, borderRadius: 24, padding: 24 }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: C.ink, marginBottom: 16 }}><CreditCard size={16} style={{ display: "inline", marginRight: 6 }} /> Pagamento</div>
              <Field label="Nome no cartão"><input required style={inputStyle} placeholder="Como aparece no cartão" /></Field>
              <Field label="Número do cartão"><input required style={inputStyle} placeholder="0000 0000 0000 0000" /></Field>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Validade"><input required style={inputStyle} placeholder="MM/AA" /></Field>
                <Field label="CVV"><input required style={inputStyle} placeholder="123" /></Field>
              </div>
              <Field label="Parcelas">
                <select style={inputStyle}>{["1x sem juros","2x sem juros","3x sem juros","6x sem juros","12x"].map(x => <option key={x}>{x}</option>)}</select>
              </Field>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" style={{ marginTop: 8, width: "100%", height: 52, borderRadius: 14, background: C.btn, color: "#fff", fontWeight: 600, fontSize: 15 }}>
                Finalizar compra
              </motion.button>
            </div>
            <aside style={{ background: C.paper, border: `1px solid ${C.border}`, borderRadius: 24, padding: 24, height: "fit-content" }}>
              <div style={{ fontSize: 13, color: C.inkSoft }}>Resumo do voo</div>
              <div style={{ marginTop: 8, fontSize: 16, fontWeight: 700, color: C.ink }}>{voos[voo ?? 0].cia}</div>
              <div style={{ marginTop: 4, fontSize: 14, color: C.ink }}>{voos[voo ?? 0].de} → {voos[voo ?? 0].para}</div>
              <div style={{ marginTop: 2, fontSize: 12, color: C.inkSoft }}>{voos[voo ?? 0].duracao} · {voos[voo ?? 0].paradas}</div>
              <div style={{ marginTop: 12, fontSize: 12, color: C.inkSoft }}>Assento</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{assento}</div>
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.divider}`, display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 14, color: C.inkSoft }}>Total</span>
                <span style={{ fontSize: 20, fontWeight: 700, color: C.ink }}>{voos[voo ?? 0].preco}</span>
              </div>
            </aside>
          </motion.form>
        )}

        {step === "sucesso" && (
          <motion.div key="sucesso" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} style={{ background: C.paper, border: `1px solid ${C.border}`, borderRadius: 24, padding: 48, textAlign: "center" }}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }} style={{ width: 72, height: 72, margin: "0 auto", borderRadius: 999, background: C.blue, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <Check size={36} color={C.ink} />
            </motion.div>
            <h3 style={{ marginTop: 18, fontSize: 24, fontWeight: 700, color: C.ink }}>Compra confirmada!</h3>
            <p style={{ marginTop: 8, color: C.inkSoft, maxWidth: 400, margin: "8px auto 0" }}>Seu bilhete eletrônico foi enviado por e-mail. Boa viagem!</p>
            <button onClick={() => { setStep("busca"); setVoo(null); setAssento(null); }} style={{ marginTop: 24, padding: "12px 24px", borderRadius: 14, background: C.btn, color: "#fff", fontWeight: 600, fontSize: 14 }}>Nova busca</button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

// ---------------- HOTÉIS ----------------
function Hoteis({ onReserve }: { onReserve: (d: Destination) => void }) {
  const hoteis = [
    { name: "Resort Costa Verde", local: "Algarve, Portugal", preco: "R$ 890/noite", rating: 4.9, image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80" },
    { name: "Hotel Burj Vista", local: "Dubai, EAU", preco: "R$ 1.450/noite", rating: 5, image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=900&q=80" },
    { name: "Mountain Lodge", local: "Pokhara, Nepal", preco: "R$ 420/noite", rating: 4.7, image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=900&q=80" },
    { name: "Soho Boutique", local: "Nova York, EUA", preco: "R$ 1.290/noite", rating: 4.8, image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=900&q=80" },
  ];
  const amen = [
    { i: Wifi, l: "Wi-Fi grátis" }, { i: Coffee, l: "Café incluso" }, { i: Tv, l: "Smart TV" }, { i: Bath, l: "Spa" },
  ];
  return (
    <section style={{ marginTop: 32 }}>
      <SectionTitle kicker="Hospedagem" title="Hotéis selecionados" sub="Hospedagens confortáveis com avaliação acima de 4.5★." />
      <div className="wishes-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        {hoteis.map((h, i) => (
          <motion.article
            key={h.name}
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}
            whileHover={{ y: -6 }}
            style={{ background: C.paper, border: `1px solid ${C.border}`, borderRadius: 24, overflow: "hidden" }}
          >
            <div style={{ height: 200, overflow: "hidden" }}>
              <img onError={imgFallback} src={h.image} alt={h.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.6s" }} className="hover:scale-105" />
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.ink }}>{h.name}</div>
                  <div style={{ marginTop: 4, fontSize: 13, color: C.inkSoft, display: "flex", alignItems: "center", gap: 4 }}><MapPin size={12} /> {h.local}</div>
                </div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 999, background: C.blue, fontSize: 12, fontWeight: 700, color: C.ink }}>
                  <Star size={11} fill="#FFB400" stroke="#FFB400" /> {h.rating}
                </div>
              </div>
              <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
                {amen.map((a) => (
                  <div key={a.l} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: C.inkSoft, padding: "4px 10px", borderRadius: 999, background: C.pill }}>
                    <a.i size={11} /> {a.l}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.ink }}>{h.preco}</div>
                <motion.button whileHover={{ scale: 1.05 }} onClick={() => onReserve(DESTINATIONS[i % DESTINATIONS.length])} style={{ padding: "10px 18px", borderRadius: 12, background: C.btn, color: "#fff", fontSize: 13, fontWeight: 600 }}>Reservar</motion.button>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

// ---------------- EXPERIÊNCIAS ----------------
function Experiencias() {
  const exps = [
    { title: "Safari no Deserto", local: "Dubai", duracao: "6h", preco: "R$ 590", image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=900&q=80" },
    { title: "Trekking no Himalaia", local: "Nepal", duracao: "3 dias", preco: "R$ 2.290", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80" },
    { title: "Tour de Bondinho", local: "Lisboa", duracao: "2h", preco: "R$ 180", image: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=900&q=80" },
    { title: "Cruzeiro em Santorini", local: "Grécia", duracao: "5h", preco: "R$ 890", image: "https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?auto=format&fit=crop&w=900&q=80" },
    { title: "Broadway Night", local: "Nova York", duracao: "3h", preco: "R$ 690", image: "https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?auto=format&fit=crop&w=900&q=80" },
    { title: "Pôr do Sol no Cox Bazar", local: "Bangladesh", duracao: "4h", preco: "R$ 290", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80" },
  ];
  return (
    <section style={{ marginTop: 32 }}>
      <SectionTitle kicker="Experiências" title="Viva momentos únicos" sub="Atividades guiadas escolhidas em cada destino." />
      <div className="wishes-3col" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
        {exps.map((e, i) => (
          <motion.article
            key={e.title}
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: (i % 3) * 0.08 }}
            whileHover={{ y: -6 }}
            style={{ background: C.paper, border: `1px solid ${C.border}`, borderRadius: 24, overflow: "hidden", cursor: "pointer" }}
            className="group"
          >
            <div style={{ height: 200, overflow: "hidden", position: "relative" }}>
              <img onError={imgFallback} src={e.image} alt={e.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.7s" }} className="group-hover:scale-110" />
              <div style={{ position: "absolute", top: 12, left: 12, padding: "4px 10px", borderRadius: 999, background: "rgba(255,255,255,0.9)", fontSize: 11, fontWeight: 600, color: C.ink, display: "inline-flex", alignItems: "center", gap: 4 }}>
                <Clock size={10} /> {e.duracao}
              </div>
            </div>
            <div style={{ padding: 18 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.ink }}>{e.title}</div>
              <div style={{ marginTop: 4, fontSize: 12, color: C.inkSoft, display: "flex", alignItems: "center", gap: 4 }}><MapPinned size={11} /> {e.local}</div>
              <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>{e.preco}</div>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.ink, display: "inline-flex", alignItems: "center", gap: 4 }}>Reservar <ArrowRight size={12} /></span>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

// ---------------- BLOG ----------------
function Blog() {
  const posts = [
    { title: "10 destinos imperdíveis em 2026", cat: "Guia", date: "12 mai", image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=900&q=80" },
    { title: "Como economizar em viagens internacionais", cat: "Dicas", date: "08 mai", image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=900&q=80" },
    { title: "Roteiro de 7 dias em Lisboa", cat: "Roteiro", date: "02 mai", image: "https://images.unsplash.com/photo-1513735718075-2e2d37cb1bfd?auto=format&fit=crop&w=900&q=80" },
    { title: "O que levar na mala para o Himalaia", cat: "Aventura", date: "28 abr", image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=900&q=80" },
  ];
  return (
    <section style={{ marginTop: 32 }}>
      <SectionTitle kicker="Blog" title="Inspiração para sua próxima viagem" sub="Histórias, dicas e roteiros escritos por viajantes." />
      <div className="wishes-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        {posts.map((p, i) => (
          <motion.article
            key={p.title}
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}
            whileHover={{ y: -4 }}
            style={{ background: C.paper, border: `1px solid ${C.border}`, borderRadius: 24, overflow: "hidden", display: "grid", gridTemplateColumns: "180px 1fr", cursor: "pointer" }}
            className="wishes-card-horizontal group"
          >
            <div style={{ overflow: "hidden" }}>
              <img onError={imgFallback} src={p.image} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.6s" }} className="group-hover:scale-105" />
            </div>
            <div style={{ padding: 18 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 11, color: C.inkSoft }}>
                <span style={{ padding: "3px 8px", borderRadius: 999, background: C.blue, color: C.ink, fontWeight: 600 }}>{p.cat}</span>
                <span>{p.date}</span>
              </div>
              <div style={{ marginTop: 10, fontSize: 17, fontWeight: 700, color: C.ink, lineHeight: 1.3 }}>{p.title}</div>
              <div style={{ marginTop: 12, fontSize: 13, fontWeight: 600, color: C.ink, display: "inline-flex", alignItems: "center", gap: 4 }}>Ler mais <ArrowRight size={12} /></div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

// ---------------- CONTATO ----------------
function Contato() {
  const [sent, setSent] = useState(false);
  return (
    <section style={{ marginTop: 32 }}>
      <SectionTitle kicker="Contato" title="Fale com a equipe Wishes" sub="Estamos prontos para planejar sua próxima viagem." />
      <div className="wishes-2col" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 24 }}>
        <motion.form
          initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}
          onSubmit={(e) => { e.preventDefault(); setSent(true); }}
          style={{ background: C.paper, border: `1px solid ${C.border}`, borderRadius: 24, padding: 28 }}
        >
          <Field label="Nome completo"><input required style={inputStyle} placeholder="Seu nome" /></Field>
          <Field label="E-mail"><input required type="email" style={inputStyle} placeholder="voce@email.com" /></Field>
          <Field label="Assunto"><input style={inputStyle} placeholder="Sobre o que deseja falar?" /></Field>
          <Field label="Mensagem">
            <textarea required style={{ ...inputStyle, height: 120, padding: 14, resize: "none" }} placeholder="Conte um pouco mais..." />
          </Field>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" style={{ width: "100%", height: 50, borderRadius: 14, background: C.btn, color: "#fff", fontWeight: 600, fontSize: 14, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {sent ? <><Check size={14} /> Enviado</> : <><Send size={14} /> Enviar mensagem</>}
          </motion.button>
        </motion.form>

        <motion.aside
          initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          {[
            { i: Phone, l: "Telefone", v: "+55 (11) 4000-0000" },
            { i: Mail, l: "E-mail", v: "ola@wishes.travel" },
            { i: MapPin, l: "Endereço", v: "Av. Paulista, 1000 · São Paulo" },
            { i: Clock, l: "Horário", v: "Seg–Sex · 9h às 19h" },
          ].map((c, i) => (
            <motion.div
              key={c.l}
              initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: i * 0.08 }}
              whileHover={{ x: 4 }}
              style={{ padding: 18, borderRadius: 18, background: C.paper, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 14 }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, background: C.blue, display: "inline-flex", alignItems: "center", justifyContent: "center", color: C.ink }}>
                <c.i size={18} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: C.inkSoft, textTransform: "uppercase", letterSpacing: 1 }}>{c.l}</div>
                <div style={{ marginTop: 2, fontSize: 14, fontWeight: 600, color: C.ink }}>{c.v}</div>
              </div>
            </motion.div>
          ))}
          <div style={{ marginTop: 4, height: 160, borderRadius: 20, background: `linear-gradient(135deg, ${C.blue}, ${C.pill})`, border: `1px solid ${C.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", color: C.inkSoft, fontSize: 12 }}>
            <MapPinned size={20} style={{ marginRight: 6 }} /> Mapa interativo (placeholder)
          </div>
        </motion.aside>
      </div>
    </section>
  );
}

// ---------------- Reservar / Pacotes / Lugares (mantidos com pequenos ajustes) ----------------
function Reservar({ onConfirm }: { onConfirm: (d: Destination) => void }) {
  const [destino, setDestino] = useState(DESTINATIONS[0].id);
  const [ida, setIda] = useState(""); const [volta, setVolta] = useState("");
  const [hospedes, setHospedes] = useState("2"); const [tipo, setTipo] = useState("Completo");
  const sel = DESTINATIONS.find(d => d.id === destino)!;
  return (
    <section style={{ marginTop: 32 }}>
      <SectionTitle kicker="Reservar" title="Planeje sua próxima viagem" />
      <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24 }} className="wishes-content">
        <motion.form initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} onSubmit={(e) => { e.preventDefault(); onConfirm(sel); }} style={{ background: C.paper, border: `1px solid ${C.border}`, borderRadius: 24, padding: 24 }}>
          <Field label="Destino">
            <select value={destino} onChange={(e) => setDestino(e.target.value)} style={inputStyle}>
              {DESTINATIONS.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
            </select>
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Data de ida"><input type="date" value={ida} onChange={(e) => setIda(e.target.value)} style={inputStyle} /></Field>
            <Field label="Data de volta"><input type="date" value={volta} onChange={(e) => setVolta(e.target.value)} style={inputStyle} /></Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Hóspedes"><select value={hospedes} onChange={(e) => setHospedes(e.target.value)} style={inputStyle}>{["1","2","3","4+"].map(x => <option key={x}>{x}</option>)}</select></Field>
            <Field label="Tipo de pacote"><select value={tipo} onChange={(e) => setTipo(e.target.value)} style={inputStyle}>{["Completo","Econômico","Premium","Lua de mel"].map(x => <option key={x}>{x}</option>)}</select></Field>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} type="submit" style={{ marginTop: 8, width: "100%", height: 52, borderRadius: 14, background: C.btn, color: "#fff", fontWeight: 600, fontSize: 15, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Search size={16} /> Buscar Viagens
          </motion.button>
        </motion.form>
        <motion.aside initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ background: C.paper, border: `1px solid ${C.border}`, borderRadius: 24, overflow: "hidden" }}>
          <img onError={imgFallback} src={sel.image} alt={sel.title} style={{ width: "100%", height: 200, objectFit: "cover" }} />
          <div style={{ padding: 20 }}>
            <div style={{ fontSize: 12, color: C.inkSoft, textTransform: "uppercase", letterSpacing: 1.2 }}>Destino escolhido</div>
            <div style={{ marginTop: 6, fontSize: 22, fontWeight: 700, color: C.ink }}>{sel.title}</div>
            <div style={{ marginTop: 4, fontSize: 13, color: C.inkSoft }}>{sel.locationLabel}</div>
            <div style={{ marginTop: 12, fontSize: 14, color: C.ink }}>{sel.description}</div>
            <div style={{ marginTop: 16, fontSize: 14, fontWeight: 700, color: C.ink }}>{sel.priceLabel}</div>
          </div>
        </motion.aside>
      </div>
    </section>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", height: 44, padding: "0 14px", borderRadius: 12, border: `1px solid ${C.border}`, background: "#FAFCFC", color: C.ink, fontSize: 14, outline: "none",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "block", marginBottom: 14 }}>
      <span style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.ink, marginBottom: 6 }}>{label}</span>
      {children}
    </label>
  );
}

function Pacotes({ filter, setFilter, items, onReserve }: { filter: FilterKey; setFilter: (f: FilterKey) => void; items: Destination[]; onReserve: (d: Destination) => void }) {
  return (
    <section style={{ marginTop: 32 }}>
      <SectionTitle kicker="Pacotes" title="Pacotes selecionados" sub="Viagens organizadas com hospedagem e experiência." />
      <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
        {FILTERS.map(f => {
          const active = filter === f.key;
          return (
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} key={f.key} onClick={() => setFilter(f.key)} style={{ padding: "10px 16px", borderRadius: 999, fontSize: 13, fontWeight: 600, background: active ? C.blue : C.pill, color: C.ink }}>{f.label}</motion.button>
          );
        })}
      </div>
      <div style={{ marginTop: 28, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 18 }}>
        <AnimatePresence mode="popLayout">
          {items.map((d, idx) => (
            <motion.article
              key={d.id} layout
              initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.32, delay: idx * 0.04 }}
              whileHover={{ y: -6, boxShadow: "0 18px 40px rgba(22,27,28,0.12)" }}
              style={{ borderRadius: 24, overflow: "hidden", background: C.paper, border: `1px solid ${C.border}` }}
            >
              <div style={{ height: 180, overflow: "hidden" }}>
                <img onError={imgFallback} src={d.image} alt={d.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.6s" }} className="hover:scale-105" />
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 17, fontWeight: 700, color: C.ink }}>{d.title}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: C.inkSoft }}><Star size={12} fill="#FFB400" stroke="#FFB400" /> {d.rating}</div>
                </div>
                <div style={{ marginTop: 4, fontSize: 12, color: C.inkSoft }}>{d.locationLabel}</div>
                <div style={{ marginTop: 12, fontSize: 13, color: C.ink, fontWeight: 600 }}>{d.priceLabel}</div>
                <motion.button whileHover={{ scale: 1.02 }} onClick={() => onReserve(d)} style={{ marginTop: 12, width: "100%", height: 42, borderRadius: 12, background: C.btn, color: "#fff", fontWeight: 600, fontSize: 13 }}>Reservar</motion.button>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}

function Lugares({ onReserve }: { onReserve: (d: Destination) => void }) {
  return (
    <section style={{ marginTop: 32 }}>
      <SectionTitle kicker="Lugares" title="Lugares populares" sub="Destinos escolhidos por viajantes." />
      <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 18 }}>
        {DESTINATIONS.map((d, idx) => (
          <motion.article
            key={d.id}
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.32, delay: (idx % 3) * 0.08 }}
            whileHover={{ y: -6 }}
            style={{ position: "relative", height: 320, borderRadius: 24, overflow: "hidden", border: `1px solid ${C.border}` }}
            className="group"
          >
            <img onError={imgFallback} src={d.image} alt={d.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.6s" }} className="group-hover:scale-110" />
            <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(255,255,255,0.9)", padding: "6px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600 }}>{d.country}</div>
            <div style={{ position: "absolute", left: 10, right: 10, bottom: 10, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(10px)", borderRadius: 16, padding: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.ink }}>{d.title}</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: C.inkSoft }}><Star size={12} fill="#FFB400" stroke="#FFB400" /> {d.rating}</div>
                <motion.button whileHover={{ scale: 1.05 }} onClick={() => onReserve(d)} style={{ fontSize: 12, fontWeight: 600, color: "#fff", padding: "6px 12px", borderRadius: 999, background: C.btn }}>Reservar</motion.button>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

// ---------------- Footer ----------------
function Footer({ goTo }: { goTo: (p: PageKey) => void }) {
  return (
    <footer style={{ marginTop: 72, paddingTop: 32, borderTop: `1px solid ${C.divider}` }}>
      <div className="wishes-4col" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 24, marginBottom: 32 }}>
        <div>
          <div className="flex items-center gap-2" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ background: C.ink, color: "#fff", width: 28, height: 28, borderRadius: 8, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <Plane size={14} />
            </span>
            <span style={{ fontWeight: 700, fontSize: 15 }}>Wishes</span>
          </div>
          <p style={{ marginTop: 12, fontSize: 13, color: C.inkSoft, lineHeight: 1.6, maxWidth: 280 }}>Experiências de viagem cuidadosamente selecionadas para você viver o melhor de cada destino.</p>
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.ink, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Navegação</div>
          {(["inicio","passagens","hoteis","pacotes"] as PageKey[]).map(k => {
            const item = NAV_ITEMS.find(n => n.key === k)!;
            return <button key={k} onClick={() => goTo(k)} style={{ display: "block", marginBottom: 8, fontSize: 13, color: C.inkSoft }} className="hover:text-black">{item.label}</button>;
          })}
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.ink, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Empresa</div>
          {["Sobre","Carreiras","Imprensa","Parceiros"].map(l => <div key={l} style={{ marginBottom: 8, fontSize: 13, color: C.inkSoft }} className="hover:text-black">{l}</div>)}
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.ink, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Legal</div>
          {["Termos","Privacidade","Cookies"].map(l => <div key={l} style={{ marginBottom: 8, fontSize: 13, color: C.inkSoft }} className="hover:text-black">{l}</div>)}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, paddingTop: 20, borderTop: `1px solid ${C.divider}` }}>
        <div style={{ fontSize: 12, color: C.inkSoft }}>© {new Date().getFullYear()} Wishes · Experiência de Viagem</div>
        <div style={{ display: "flex", gap: 8, fontSize: 12, color: C.inkSoft }}>
          <span>BR · PT</span><span>·</span><span>R$ BRL</span>
        </div>
      </div>
    </footer>
  );
}

// ---------------- Booking Modal ----------------
function BookingModal({ destination, onClose }: { destination: Destination; onClose: () => void }) {
  const [name, setName] = useState(""); const [whats, setWhats] = useState("");
  const [date, setDate] = useState(""); const [guests, setGuests] = useState("2");
  const [done, setDone] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, background: "rgba(22,27,28,0.45)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 14 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: 14 }} transition={{ duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
        style={{ background: C.paper, borderRadius: 28, padding: 32, maxWidth: 520, width: "100%", boxShadow: "0 30px 80px rgba(22,27,28,0.25)" }}
      >
        {done ? (
          <div style={{ textAlign: "center" }}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} style={{ width: 56, height: 56, margin: "0 auto", borderRadius: 999, background: C.blue, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <Check size={26} color={C.ink} />
            </motion.div>
            <h3 style={{ marginTop: 16, fontSize: 22, fontWeight: 700, color: C.ink }}>Reserva solicitada</h3>
            <p style={{ marginTop: 8, fontSize: 14, color: C.inkSoft }}>Nossa equipe entrará em contato para confirmar os detalhes.</p>
            <button onClick={onClose} style={{ marginTop: 20, height: 46, padding: "0 24px", borderRadius: 14, background: C.btn, color: "#fff", fontWeight: 600 }}>Fechar</button>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setDone(true); }}>
            <h3 style={{ fontSize: 22, fontWeight: 700, color: C.ink }}>Finalizar reserva</h3>
            <p style={{ marginTop: 6, fontSize: 14, color: C.inkSoft }}>Preencha seus dados para continuar.</p>
            <div style={{ marginTop: 20 }}>
              <Field label="Nome completo"><input required value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} placeholder="Seu nome" /></Field>
              <Field label="WhatsApp"><input required value={whats} onChange={(e) => setWhats(e.target.value)} style={inputStyle} placeholder="(11) 90000-0000" /></Field>
              <Field label="Destino"><input readOnly value={destination.title} style={{ ...inputStyle, background: C.pill }} /></Field>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Data"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} required /></Field>
                <Field label="Hóspedes">
                  <select value={guests} onChange={(e) => setGuests(e.target.value)} style={inputStyle}>{["1","2","3","4+"].map(x => <option key={x}>{x}</option>)}</select>
                </Field>
              </div>
            </div>
            <div style={{ marginTop: 12, display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button type="button" onClick={onClose} style={{ height: 46, padding: "0 18px", borderRadius: 14, background: C.pill, color: C.ink, fontWeight: 600 }}>Cancelar</button>
              <motion.button whileHover={{ scale: 1.04 }} type="submit" style={{ height: 46, padding: "0 22px", borderRadius: 14, background: C.btn, color: "#fff", fontWeight: 600 }}>Confirmar Reserva</motion.button>
            </div>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}
