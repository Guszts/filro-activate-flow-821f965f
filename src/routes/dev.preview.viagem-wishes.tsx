import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  ChevronDown,
  MapPin,
  Play,
  Star,
  Menu,
  X,
  Plane,
  ArrowRight,
  Check,
} from "lucide-react";

export const Route = createFileRoute("/dev/preview/viagem-wishes")({
  component: WishesPreview,
  head: () => ({
    meta: [
      { title: "Wishes · Experiência de Viagem" },
      { name: "description", content: "Reserve sua próxima viagem com a Wishes — pacotes, destinos e experiências." },
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
  {
    id: "nova-york",
    title: "Nova York",
    country: "EUA",
    locationLabel: "Cidade dos EUA",
    category: "america",
    image: "https://images.unsplash.com/photo-1492217140050-8c43e0a3923f?auto=format&fit=crop&w=1200&q=80",
    rating: 4.8,
    type: "horizontal",
    priceLabel: "A partir de R$ 7.490",
    description: "Roteiro urbano com hospedagem em Manhattan e passeios guiados.",
  },
  {
    id: "bangladesh",
    title: "Bangladesh",
    country: "Bangladesh",
    locationLabel: "Cox Bazar",
    category: "asia",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    rating: 4.6,
    type: "horizontal",
    priceLabel: "A partir de R$ 5.290",
    description: "Praias de águas turquesa e cultura local imersiva.",
  },
  {
    id: "nepal",
    title: "Nepal",
    country: "Nepal",
    locationLabel: "Himalaia",
    category: "asia",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=900&q=80",
    rating: 5,
    type: "vertical",
    priceLabel: "A partir de R$ 8.990",
    description: "Trekking nas montanhas com guias locais e lodges premium.",
  },
  {
    id: "dubai",
    title: "Dubai",
    country: "EAU",
    locationLabel: "Emirados Árabes Unidos",
    category: "oriente-medio",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80",
    rating: 5,
    type: "vertical",
    priceLabel: "A partir de R$ 9.790",
    description: "Hotéis 5 estrelas, deserto e arquitetura moderna.",
  },
  {
    id: "lisboa",
    title: "Lisboa",
    country: "Portugal",
    locationLabel: "Europa",
    category: "europa",
    image: "https://images.unsplash.com/photo-1513735718075-2e2d37cb1bfd?auto=format&fit=crop&w=1200&q=80",
    rating: 4.7,
    type: "horizontal",
    priceLabel: "A partir de R$ 6.490",
    description: "Bondinhos amarelos, miradouros e gastronomia portuguesa.",
  },
  {
    id: "santorini",
    title: "Santorini",
    country: "Grécia",
    locationLabel: "Mar Egeu",
    category: "europa",
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=900&q=80",
    rating: 5,
    type: "vertical",
    priceLabel: "A partir de R$ 10.290",
    description: "Casas brancas, pôr do sol em Oia e cruzeiros na caldera.",
  },
];

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1800&q=80";

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
  { key: "reservar", label: "Reservar" },
  { key: "pacotes", label: "Pacotes" },
  { key: "lugares", label: "Lugares Populares" },
] as const;

type PageKey = (typeof NAV_ITEMS)[number]["key"];

// ---------------- Theme tokens (scoped) ----------------
const C = {
  page: "#EAF1EF",
  paper: "#FFFFFF",
  ink: "#161B1C",
  inkSoft: "#7B8588",
  muted: "#A3ACAE",
  border: "#E8EEEE",
  blue: "#DDF4FA",
  btn: "#202523",
  pill: "#EEF4F4",
  divider: "#E3E9E9",
};

// ---------------- Component ----------------
function WishesPreview() {
  const [page, setPage] = useState<PageKey>("inicio");
  const [menuOpen, setMenuOpen] = useState(false);
  const [filter, setFilter] = useState<FilterKey>("ofertas");
  const [openDropdown, setOpenDropdown] = useState<null | "loc" | "date" | "guests">(null);
  const [loc, setLoc] = useState<string>("Para onde você vai?");
  const [date, setDate] = useState<string>("Escolha a data");
  const [guests, setGuests] = useState<string>("Adicionar");
  const [bookingFor, setBookingFor] = useState<Destination | null>(null);

  const searchRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const filtered = useMemo(() => {
    if (filter === "ofertas") return DESTINATIONS;
    return DESTINATIONS.filter((d) => d.category === filter);
  }, [filter]);

  return (
    <div
      style={{ background: C.page, color: C.ink, fontFamily: "Inter, Manrope, ui-sans-serif, system-ui" }}
      className="min-h-screen w-full"
    >
      <div
        className="mx-auto"
        style={{
          background: C.paper,
          maxWidth: 1250,
          margin: "78px auto",
          borderRadius: 2,
          padding: "42px 64px 56px",
          boxShadow: "0 30px 80px rgba(22,27,28,0.08)",
        }}
        // responsive override via inline style limited; use class for breakpoints below
      >
        <ResponsiveStyles />
        <Header page={page} setPage={setPage} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            {page === "inicio" && (
              <Home
                searchRef={searchRef}
                openDropdown={openDropdown}
                setOpenDropdown={setOpenDropdown}
                loc={loc} setLoc={setLoc}
                date={date} setDate={setDate}
                guests={guests} setGuests={setGuests}
                filter={filter} setFilter={setFilter}
                items={filtered}
                onReserve={(d) => setBookingFor(d)}
                onGoPacotes={() => setPage("pacotes")}
              />
            )}
            {page === "reservar" && <Reservar onConfirm={(d) => setBookingFor(d)} />}
            {page === "pacotes" && (
              <Pacotes filter={filter} setFilter={setFilter} items={filtered} onReserve={(d) => setBookingFor(d)} />
            )}
            {page === "lugares" && <Lugares onReserve={(d) => setBookingFor(d)} />}
          </motion.div>
        </AnimatePresence>

        <Footer />
      </div>

      <AnimatePresence>
        {bookingFor && <BookingModal destination={bookingFor} onClose={() => setBookingFor(null)} />}
      </AnimatePresence>
    </div>
  );
}

// ---------------- Responsive CSS (scoped to this preview) ----------------
function ResponsiveStyles() {
  return (
    <style>{`
      @media (max-width: 1024px) {
        .wishes-shell { padding: 28px !important; margin: 16px !important; width: calc(100% - 32px) !important; }
      }
      @media (max-width: 720px) {
        .wishes-shell { padding: 20px !important; margin: 0 !important; width: 100% !important; border-radius: 0 !important; }
        .wishes-nav { display: none !important; }
        .wishes-menu-btn { display: inline-flex !important; }
        .wishes-hero { height: 340px !important; }
        .wishes-hero-title { font-size: 32px !important; }
        .wishes-hero-sub { font-size: 18px !important; }
        .wishes-search { margin-top: 20px !important; height: auto !important; grid-template-columns: 1fr !important; padding: 14px !important; }
        .wishes-search-btn { width: 100% !important; height: 52px !important; }
        .wishes-content { grid-template-columns: 1fr !important; gap: 24px !important; margin-top: 32px !important; }
        .wishes-right-grid { grid-template-columns: 1fr !important; }
        .wishes-card-horizontal { grid-template-columns: 1fr !important; }
        .wishes-card-horizontal img { height: 180px !important; width: 100% !important; }
        .wishes-card-vertical { height: 380px !important; }
      }
    `}</style>
  );
}

// ---------------- Header ----------------
function Header({
  page, setPage, menuOpen, setMenuOpen,
}: { page: PageKey; setPage: (k: PageKey) => void; menuOpen: boolean; setMenuOpen: (b: boolean) => void }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ height: 72 }}
      className="flex items-center justify-between"
    >
      <div className="flex items-center gap-2">
        <span
          style={{ background: C.ink, color: "#fff", width: 28, height: 28, borderRadius: 8 }}
          className="inline-flex items-center justify-center"
        >
          <Plane size={14} />
        </span>
        <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: -0.2 }}>Wishes</span>
      </div>

      <nav className="wishes-nav flex items-center gap-8">
        {NAV_ITEMS.map((n) => {
          const active = page === n.key;
          return (
            <button
              key={n.key}
              onClick={() => setPage(n.key)}
              style={{
                fontSize: 14,
                fontWeight: active ? 600 : 500,
                color: active ? C.ink : "#5F696C",
                position: "relative",
                transition: "transform 0.2s ease, color 0.2s ease",
              }}
              className="hover:-translate-y-0.5"
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
        <button
          style={{ background: C.pill, color: C.ink, width: 82, height: 38, borderRadius: 999, fontSize: 14, fontWeight: 600, transition: "background 0.2s" }}
          className="hover:brightness-95"
        >
          Entrar
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            style={{ position: "absolute", top: 72, right: 16, background: C.paper, border: `1px solid ${C.border}`, borderRadius: 16, padding: 12, zIndex: 30, boxShadow: "0 20px 60px rgba(22,27,28,0.12)" }}
          >
            {NAV_ITEMS.map((n) => (
              <button
                key={n.key}
                onClick={() => { setPage(n.key); setMenuOpen(false); }}
                style={{ display: "block", padding: "10px 16px", fontSize: 14, fontWeight: page === n.key ? 600 : 500, color: page === n.key ? C.ink : "#5F696C", width: "100%", textAlign: "left", borderRadius: 10 }}
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
  searchRef: React.RefObject<HTMLDivElement>;
  openDropdown: null | "loc" | "date" | "guests";
  setOpenDropdown: (v: null | "loc" | "date" | "guests") => void;
  loc: string; setLoc: (s: string) => void;
  date: string; setDate: (s: string) => void;
  guests: string; setGuests: (s: string) => void;
  filter: FilterKey; setFilter: (f: FilterKey) => void;
  items: Destination[];
  onReserve: (d: Destination) => void;
  onGoPacotes: () => void;
}) {
  const { searchRef, openDropdown, setOpenDropdown, loc, setLoc, date, setDate, guests, setGuests, filter, setFilter, items, onReserve } = props;

  return (
    <>
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, scale: 0.985 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="wishes-hero"
        style={{ marginTop: 32, height: 420, borderRadius: 28, overflow: "hidden", position: "relative" }}
      >
        <img
          src={HERO_IMAGE}
          alt="Resort à beira-mar com águas turquesa"
          style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.95)" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.18), rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.25))" }} />
        <div style={{ position: "absolute", top: 62, left: 0, right: 0, textAlign: "center", color: "#fff" }}>
          <h1 className="wishes-hero-title" style={{ fontSize: 52, fontWeight: 700, letterSpacing: -0.02, lineHeight: 1.05 }}>Praia Verde</h1>
          <p className="wishes-hero-sub" style={{ marginTop: 8, fontSize: 28, fontWeight: 400, opacity: 0.95 }}>Experiência de Viagem</p>
        </div>
        <button
          aria-label="Reproduzir vídeo"
          style={{ position: "absolute", left: "50%", top: "58%", transform: "translateX(-50%)", width: 74, height: 74, borderRadius: 999, background: "rgba(255,255,255,0.55)", backdropFilter: "blur(8px)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", transition: "transform 0.2s" }}
          className="hover:scale-105"
        >
          <Play size={26} fill="#fff" />
        </button>
      </motion.section>

      {/* Floating search */}
      <motion.div
        ref={searchRef}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="wishes-search"
        style={{ position: "relative", width: "74%", margin: "-48px auto 0", height: 96, background: C.paper, borderRadius: 24, boxShadow: "0 20px 60px rgba(22,27,28,0.12)", display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", alignItems: "center", padding: "0 14px", gap: 8, zIndex: 5 }}
      >
        <SearchField label="Localização" value={loc} open={openDropdown === "loc"} onToggle={() => setOpenDropdown(openDropdown === "loc" ? null : "loc")}
          options={["Lisboa", "Dubai", "Nepal", "Nova York", "Bangladesh"]} onPick={(v) => { setLoc(v); setOpenDropdown(null); }} />
        <Divider />
        <SearchField label="Data" value={date} open={openDropdown === "date"} onToggle={() => setOpenDropdown(openDropdown === "date" ? null : "date")}
          options={["Hoje", "Amanhã", "Próxima Semana", "Próximo Mês"]} onPick={(v) => { setDate(v); setOpenDropdown(null); }} />
        <Divider />
        <SearchField label="Hóspedes" value={guests} open={openDropdown === "guests"} onToggle={() => setOpenDropdown(openDropdown === "guests" ? null : "guests")}
          options={["1", "2", "3", "4+"]} onPick={(v) => { setGuests(v); setOpenDropdown(null); }} />
        <button
          className="wishes-search-btn"
          onClick={() => setOpenDropdown(null)}
          style={{ background: C.btn, color: "#fff", width: 180, height: 70, borderRadius: 14, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, fontWeight: 600, transition: "transform 0.2s, filter 0.2s" }}
        >
          <Search size={16} /> Buscar
        </button>
      </motion.div>

      {/* Below hero */}
      <div className="wishes-content" style={{ marginTop: 64, display: "grid", gridTemplateColumns: "300px 1fr", gap: 44 }}>
        <Sidebar filter={filter} setFilter={setFilter} />
        <RightGrid items={items} onReserve={onReserve} />
      </div>
    </>
  );
}

function Divider() {
  return <span style={{ width: 1, height: 36, background: C.divider, display: "inline-block" }} />;
}

function SearchField({
  label, value, options, open, onToggle, onPick,
}: { label: string; value: string; options: string[]; open: boolean; onToggle: () => void; onPick: (v: string) => void }) {
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
            initial={{ opacity: 0, scale: 0.96, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -6 }}
            transition={{ duration: 0.18 }}
            style={{ position: "absolute", top: 64, left: 8, right: 8, background: C.paper, border: `1px solid ${C.border}`, borderRadius: 16, padding: 8, boxShadow: "0 20px 60px rgba(22,27,28,0.12)", zIndex: 20 }}
          >
            {options.map((o) => (
              <button key={o} onClick={() => onPick(o)} style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 12px", fontSize: 13, color: C.ink, borderRadius: 10 }} className="hover:bg-black/5">
                {o}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------- Sidebar ----------------
function Sidebar({ filter, setFilter }: { filter: FilterKey; setFilter: (f: FilterKey) => void }) {
  return (
    <aside style={{ width: 285, padding: 28, borderRadius: 28, background: C.paper, border: `1px solid #EEF2F2`, boxShadow: "0 4px 18px rgba(22,27,28,0.04)" }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: C.ink }}>Ofertas de Pacotes</div>
      <ul style={{ marginTop: 18 }}>
        {FILTERS.map((f, i) => {
          const active = filter === f.key;
          return (
            <li key={f.key} style={{ borderBottom: i < FILTERS.length - 1 ? `1px solid ${C.divider}` : "none" }}>
              <button
                onClick={() => setFilter(f.key)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 14px",
                  borderRadius: 14,
                  margin: "6px 0",
                  background: active ? C.blue : "transparent",
                  color: active ? C.ink : C.inkSoft,
                  fontWeight: active ? 600 : 500,
                  fontSize: 15,
                  transition: "background 0.25s ease, color 0.25s ease",
                }}
                className={active ? "" : "hover:bg-[#F5FAFA]"}
              >
                <span>{f.label}</span>
                {active && (
                  <span style={{ width: 28, height: 28, borderRadius: 8, background: C.paper, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                    <ArrowRight size={14} />
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

// ---------------- Right grid ----------------
function RightGrid({ items, onReserve }: { items: Destination[]; onReserve: (d: Destination) => void }) {
  const horizontals = items.filter((i) => i.type === "horizontal").slice(0, 2);
  const verticals = items.filter((i) => i.type === "vertical").slice(0, 2);

  // Fallbacks when filter yields too few of a type
  const fillHorizontals = horizontals.length ? horizontals : items.slice(0, 2);
  const fillVerticals = verticals.length ? verticals : items.slice(items.length - 2);

  return (
    <div className="wishes-right-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <AnimatePresence mode="popLayout">
          {fillHorizontals.map((d, idx) => (
            <motion.div
              key={d.id}
              layout
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.32, delay: idx * 0.05 }}
            >
              <HorizontalCard d={d} onReserve={() => onReserve(d)} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <AnimatePresence mode="popLayout">
          {fillVerticals.map((d, idx) => (
            <motion.div
              key={d.id}
              layout
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.32, delay: idx * 0.05 }}
            >
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
    <div
      className="wishes-card-horizontal group"
      style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 14, padding: 14, borderRadius: 18, border: `1px solid ${C.border}`, background: C.paper, transition: "transform 0.3s, box-shadow 0.3s" }}
    >
      <div style={{ overflow: "hidden", borderRadius: 14, height: 120 }}>
        <img src={d.image} alt={d.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s" }} className="group-hover:scale-105" />
      </div>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "4px 4px 4px 0" }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.ink }}>{d.title}</div>
          <div style={{ fontSize: 13, color: C.inkSoft, marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
            <MapPin size={12} /> {d.locationLabel}
          </div>
        </div>
        <button onClick={onReserve} style={{ alignSelf: "flex-start", fontSize: 13, fontWeight: 600, color: C.ink, padding: "8px 12px", borderRadius: 10, background: C.pill, transition: "background 0.2s" }} className="hover:bg-[#DDF4FA]">
          Reservar
        </button>
      </div>
    </div>
  );
}

function VerticalCard({ d, onReserve }: { d: Destination; onReserve: () => void }) {
  return (
    <div
      className="wishes-card-vertical group"
      style={{ position: "relative", height: 320, borderRadius: 28, overflow: "hidden", border: `1px solid ${C.border}`, transition: "transform 0.3s, box-shadow 0.3s" }}
    >
      <img src={d.image} alt={d.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.6s" }} className="group-hover:scale-105" />
      <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(6px)", padding: "6px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, color: C.ink, display: "inline-flex", alignItems: "center", gap: 4 }}>
        <MapPin size={11} /> {d.country}
      </div>
      <div style={{ position: "absolute", left: 10, right: 10, bottom: 10, background: "rgba(255,255,255,0.78)", backdropFilter: "blur(10px)", borderRadius: 18, padding: 12 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.ink }}>{d.title === "Nepal" ? "Montanha" : d.title}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
          <div style={{ display: "flex", gap: 1 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={11} fill="#FFB400" stroke="#FFB400" />
            ))}
          </div>
          <button onClick={onReserve} style={{ fontSize: 12, fontWeight: 600, color: "#fff", padding: "6px 12px", borderRadius: 999, background: C.btn }}>
            Reservar
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------- Reservar ----------------
function Reservar({ onConfirm }: { onConfirm: (d: Destination) => void }) {
  const [destino, setDestino] = useState(DESTINATIONS[0].id);
  const [ida, setIda] = useState("");
  const [volta, setVolta] = useState("");
  const [hospedes, setHospedes] = useState("2");
  const [tipo, setTipo] = useState("Completo");
  const sel = DESTINATIONS.find((d) => d.id === destino)!;

  return (
    <section style={{ marginTop: 40 }}>
      <h2 style={{ fontSize: 36, fontWeight: 700, color: C.ink, letterSpacing: -0.02 }}>Planeje sua próxima viagem</h2>
      <p style={{ marginTop: 8, color: C.inkSoft, maxWidth: 620 }}>Escolha destino, data e quantidade de hóspedes para encontrar a melhor experiência.</p>

      <div style={{ marginTop: 32, display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24 }} className="wishes-content">
        <form
          onSubmit={(e) => { e.preventDefault(); onConfirm(sel); }}
          style={{ background: C.paper, border: `1px solid ${C.border}`, borderRadius: 24, padding: 24 }}
        >
          <Field label="Destino">
            <select value={destino} onChange={(e) => setDestino(e.target.value)} style={inputStyle}>
              {DESTINATIONS.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}
            </select>
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Data de ida">
              <input type="date" value={ida} onChange={(e) => setIda(e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Data de volta">
              <input type="date" value={volta} onChange={(e) => setVolta(e.target.value)} style={inputStyle} />
            </Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Hóspedes">
              <select value={hospedes} onChange={(e) => setHospedes(e.target.value)} style={inputStyle}>
                {["1", "2", "3", "4+"].map((x) => <option key={x}>{x}</option>)}
              </select>
            </Field>
            <Field label="Tipo de pacote">
              <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={inputStyle}>
                {["Completo", "Econômico", "Premium", "Lua de mel"].map((x) => <option key={x}>{x}</option>)}
              </select>
            </Field>
          </div>
          <button type="submit" style={{ marginTop: 16, width: "100%", height: 52, borderRadius: 14, background: C.btn, color: "#fff", fontWeight: 600, fontSize: 15, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Search size={16} /> Buscar Viagens
          </button>
        </form>

        <aside style={{ background: C.paper, border: `1px solid ${C.border}`, borderRadius: 24, overflow: "hidden" }}>
          <img src={sel.image} alt={sel.title} style={{ width: "100%", height: 200, objectFit: "cover" }} />
          <div style={{ padding: 20 }}>
            <div style={{ fontSize: 12, color: C.inkSoft, textTransform: "uppercase", letterSpacing: 1.2 }}>Destino escolhido</div>
            <div style={{ marginTop: 6, fontSize: 22, fontWeight: 700, color: C.ink }}>{sel.title}</div>
            <div style={{ marginTop: 4, fontSize: 13, color: C.inkSoft }}>{sel.locationLabel}</div>
            <div style={{ marginTop: 12, fontSize: 14, color: C.ink }}>{sel.description}</div>
            <div style={{ marginTop: 16, fontSize: 14, fontWeight: 700, color: C.ink }}>{sel.priceLabel}</div>
          </div>
        </aside>
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

// ---------------- Pacotes ----------------
function Pacotes({ filter, setFilter, items, onReserve }: { filter: FilterKey; setFilter: (f: FilterKey) => void; items: Destination[]; onReserve: (d: Destination) => void }) {
  return (
    <section style={{ marginTop: 40 }}>
      <h2 style={{ fontSize: 36, fontWeight: 700, color: C.ink, letterSpacing: -0.02 }}>Pacotes selecionados</h2>
      <p style={{ marginTop: 8, color: C.inkSoft, maxWidth: 620 }}>Viagens organizadas com hospedagem, experiência e suporte.</p>

      <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", gap: 8 }}>
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{ padding: "10px 16px", borderRadius: 999, fontSize: 13, fontWeight: 600, background: active ? C.blue : C.pill, color: C.ink, transition: "background 0.2s, transform 0.2s" }} className="hover:scale-[1.02]">
              {f.label}
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 28, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 18 }}>
        <AnimatePresence mode="popLayout">
          {items.map((d, idx) => (
            <motion.article
              key={d.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.32, delay: idx * 0.04 }}
              style={{ borderRadius: 24, overflow: "hidden", background: C.paper, border: `1px solid ${C.border}`, transition: "transform 0.3s, box-shadow 0.3s" }}
              className="hover:-translate-y-1 hover:shadow-lg"
            >
              <div style={{ height: 180, overflow: "hidden" }}>
                <img src={d.image} alt={d.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 17, fontWeight: 700, color: C.ink }}>{d.title}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: C.inkSoft }}>
                    <Star size={12} fill="#FFB400" stroke="#FFB400" /> {d.rating}
                  </div>
                </div>
                <div style={{ marginTop: 4, fontSize: 12, color: C.inkSoft }}>{d.locationLabel}</div>
                <div style={{ marginTop: 12, fontSize: 13, color: C.ink, fontWeight: 600 }}>{d.priceLabel}</div>
                <button onClick={() => onReserve(d)} style={{ marginTop: 12, width: "100%", height: 42, borderRadius: 12, background: C.btn, color: "#fff", fontWeight: 600, fontSize: 13 }}>
                  Reservar
                </button>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}

// ---------------- Lugares Populares ----------------
function Lugares({ onReserve }: { onReserve: (d: Destination) => void }) {
  return (
    <section style={{ marginTop: 40 }}>
      <h2 style={{ fontSize: 36, fontWeight: 700, color: C.ink, letterSpacing: -0.02 }}>Lugares populares</h2>
      <p style={{ marginTop: 8, color: C.inkSoft, maxWidth: 620 }}>Destinos escolhidos por viajantes que buscam conforto, paisagens e experiências memoráveis.</p>

      <div style={{ marginTop: 28, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 18 }}>
        {DESTINATIONS.map((d, idx) => (
          <motion.article
            key={d.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, delay: idx * 0.05 }}
            style={{ position: "relative", height: 320, borderRadius: 24, overflow: "hidden", border: `1px solid ${C.border}` }}
            className="group hover:-translate-y-1 transition-transform"
          >
            <img src={d.image} alt={d.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s" }} className="group-hover:scale-105" />
            <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(255,255,255,0.9)", padding: "6px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600 }}>
              {d.country}
            </div>
            <div style={{ position: "absolute", left: 10, right: 10, bottom: 10, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(10px)", borderRadius: 16, padding: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.ink }}>{d.title}</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: C.inkSoft }}>
                  <Star size={12} fill="#FFB400" stroke="#FFB400" /> {d.rating}
                </div>
                <button onClick={() => onReserve(d)} style={{ fontSize: 12, fontWeight: 600, color: "#fff", padding: "6px 12px", borderRadius: 999, background: C.btn }}>
                  Reservar
                </button>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

// ---------------- Footer ----------------
function Footer() {
  return (
    <footer style={{ marginTop: 56, paddingTop: 24, borderTop: `1px solid ${C.divider}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
      <div style={{ fontSize: 13, color: C.inkSoft }}>© Wishes · Experiência de Viagem</div>
      <div style={{ display: "flex", gap: 18, fontSize: 13, color: C.inkSoft }}>
        <span>Sobre</span><span>Suporte</span><span>Termos</span><span>Privacidade</span>
      </div>
    </footer>
  );
}

// ---------------- Booking Modal ----------------
function BookingModal({ destination, onClose }: { destination: Destination; onClose: () => void }) {
  const [name, setName] = useState("");
  const [whats, setWhats] = useState("");
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState("2");
  const [done, setDone] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, background: "rgba(22,27,28,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.22 }}
        onClick={(e) => e.stopPropagation()}
        style={{ background: C.paper, borderRadius: 28, padding: 32, maxWidth: 520, width: "100%", boxShadow: "0 30px 80px rgba(22,27,28,0.25)" }}
      >
        {done ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 56, height: 56, margin: "0 auto", borderRadius: 999, background: C.blue, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <Check size={26} color={C.ink} />
            </div>
            <h3 style={{ marginTop: 16, fontSize: 22, fontWeight: 700, color: C.ink }}>Reserva solicitada</h3>
            <p style={{ marginTop: 8, fontSize: 14, color: C.inkSoft }}>Nossa equipe entrará em contato para confirmar os detalhes.</p>
            <button onClick={onClose} style={{ marginTop: 20, height: 46, padding: "0 24px", borderRadius: 14, background: C.btn, color: "#fff", fontWeight: 600 }}>Fechar</button>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setDone(true); }}>
            <h3 style={{ fontSize: 22, fontWeight: 700, color: C.ink }}>Finalizar reserva</h3>
            <p style={{ marginTop: 6, fontSize: 14, color: C.inkSoft }}>Preencha seus dados para continuar com a solicitação da viagem.</p>
            <div style={{ marginTop: 20 }}>
              <Field label="Nome completo"><input required value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} placeholder="Seu nome" /></Field>
              <Field label="WhatsApp"><input required value={whats} onChange={(e) => setWhats(e.target.value)} style={inputStyle} placeholder="(11) 90000-0000" /></Field>
              <Field label="Destino"><input readOnly value={destination.title} style={{ ...inputStyle, background: C.pill }} /></Field>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Data"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} required /></Field>
                <Field label="Hóspedes">
                  <select value={guests} onChange={(e) => setGuests(e.target.value)} style={inputStyle}>
                    {["1", "2", "3", "4+"].map((x) => <option key={x}>{x}</option>)}
                  </select>
                </Field>
              </div>
            </div>
            <div style={{ marginTop: 12, display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button type="button" onClick={onClose} style={{ height: 46, padding: "0 18px", borderRadius: 14, background: C.pill, color: C.ink, fontWeight: 600 }}>Cancelar</button>
              <button type="submit" style={{ height: 46, padding: "0 22px", borderRadius: 14, background: C.btn, color: "#fff", fontWeight: 600 }}>Confirmar Reserva</button>
            </div>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}
