import { createFileRoute } from "@tanstack/react-router";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search, ChevronDown, MapPin, Star, Phone, Check, Quote, Send, Clock,
  CalendarDays, Stethoscope, Shield, ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/dev/preview/clinica-local")({
  component: ClinicaPreview,
  head: () => ({
    meta: [
      { title: "Vivara Clínica · Saúde e bem-estar" },
      { name: "description", content: "Vivara Clínica — especialidades, equipe, agendamento online e atendimento humanizado." },
    ],
  }),
});

// ---------------- Theme ----------------
const C = {
  page: "#EEF5F2", paper: "#FFFFFF", ink: "#142421", inkSoft: "#6E7C79",
  muted: "#A4ADAB", border: "#E4ECE9", mint: "#D7F0E5", btn: "#0F2C25",
  pill: "#EFF6F3", divider: "#E1EAE6", accent: "#2F8F73",
};

// ---------------- Data ----------------
type Specialty = {
  id: string; title: string; category: "geral" | "estetica" | "odonto" | "exames" | "bem-estar";
  image: string; rating: number; type: "horizontal" | "vertical";
  priceLabel: string; description: string; duration: string;
};

const SPECIALTIES: Specialty[] = [
  { id: "cardiologia", title: "Cardiologia", category: "geral", image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80", rating: 4.9, type: "horizontal", priceLabel: "Consulta R$ 280", description: "Avaliação cardiovascular completa com eletrocardiograma e orientações personalizadas.", duration: "45 min" },
  { id: "dermato", title: "Dermatologia", category: "estetica", image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=1200&q=80", rating: 4.8, type: "horizontal", priceLabel: "Consulta R$ 250", description: "Diagnóstico de pele, acompanhamento clínico e procedimentos estéticos minimamente invasivos.", duration: "40 min" },
  { id: "odonto", title: "Odontologia", category: "odonto", image: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=900&q=80", rating: 5, type: "vertical", priceLabel: "Avaliação grátis", description: "Tratamentos preventivos, estéticos e implantes com tecnologia de ponta.", duration: "60 min" },
  { id: "ortopedia", title: "Ortopedia", category: "geral", image: "https://images.unsplash.com/photo-1559757175-08fda58e1aef?auto=format&fit=crop&w=900&q=80", rating: 4.7, type: "vertical", priceLabel: "Consulta R$ 290", description: "Avaliação de articulações, coluna e reabilitação pós-cirúrgica.", duration: "45 min" },
  { id: "pediatria", title: "Pediatria", category: "geral", image: "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&w=1200&q=80", rating: 4.9, type: "horizontal", priceLabel: "Consulta R$ 260", description: "Acompanhamento do desenvolvimento infantil com ambiente acolhedor para crianças.", duration: "50 min" },
  { id: "nutricao", title: "Nutrição", category: "bem-estar", image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=900&q=80", rating: 5, type: "vertical", priceLabel: "Consulta R$ 220", description: "Plano alimentar personalizado com avaliação de bioimpedância.", duration: "60 min" },
];

const HERO_IMAGE = "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=1800&q=80";

const FILTERS = [
  { key: "geral", label: "Clínica geral" },
  { key: "estetica", label: "Estética" },
  { key: "odonto", label: "Odontologia" },
  { key: "exames", label: "Exames" },
  { key: "bem-estar", label: "Bem-estar" },
] as const;
type FilterKey = (typeof FILTERS)[number]["key"];

const NAV_ITEMS = [
  { key: "inicio", label: "Início" },
  { key: "especialidades", label: "Especialidades" },
  { key: "equipe", label: "Equipe" },
  { key: "tratamentos", label: "Tratamentos" },
  { key: "planos", label: "Planos" },
  { key: "convenios", label: "Convênios" },
  { key: "agendar", label: "Agendar" },
  { key: "blog", label: "Blog" },
  { key: "contato", label: "Contato" },
] as const;
type PageKey = (typeof NAV_ITEMS)[number]["key"];

const imgFallback = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const img = e.currentTarget;
  if (img.dataset.fb) return;
  img.dataset.fb = "1";
  const seed = encodeURIComponent(img.alt || "clinica");
  img.src = `https://picsum.photos/seed/${seed}/1200/800`;
};

// ---------------- Detail Context ----------------
type DetailItem = {
  id: string; kind: "especialidade" | "profissional" | "tratamento" | "post";
  title: string; subtitle?: string; image: string; priceLabel?: string;
  rating?: number; description: string; highlights?: string[];
};
type DetailCtx = { open: (item: DetailItem) => void; book: (s: Specialty) => void };
const DetailContext = createContext<DetailCtx | null>(null);
function useDetail() {
  const ctx = useContext(DetailContext);
  if (!ctx) throw new Error("DetailContext missing");
  return ctx;
}
function specToDetail(s: Specialty): DetailItem {
  return {
    id: `spec-${s.id}`, kind: "especialidade", title: s.title, subtitle: `Atendimento de ${s.duration}`,
    image: s.image, priceLabel: s.priceLabel, rating: s.rating, description: s.description,
    highlights: ["Profissionais certificados", "Equipamentos modernos", "Atendimento humanizado", "Retorno em 30 dias"],
  };
}

// ---------------- Root ----------------
export function ClinicaPreview() {
  const [page, setPage] = useState<PageKey>("inicio");
  const [filter, setFilter] = useState<FilterKey>("geral");
  const [openDropdown, setOpenDropdown] = useState<null | "esp" | "data" | "prof">(null);
  const [esp, setEsp] = useState("Qual especialidade?");
  const [data, setData] = useState("Escolha a data");
  const [prof, setProf] = useState("Qualquer profissional");
  const [bookingFor, setBookingFor] = useState<Specialty | null>(null);
  const [detail, setDetail] = useState<DetailItem | null>(null);

  const searchRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setOpenDropdown(null);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const filtered = useMemo(() => SPECIALTIES.filter(s => s.category === filter || filter === "geral" && true), [filter]);
  const filteredView = filter === "geral" ? SPECIALTIES : SPECIALTIES.filter(s => s.category === filter);

  useEffect(() => { setDetail(null); }, [page]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [detail]);

  const ctxValue: DetailCtx = { open: setDetail, book: setBookingFor };

  return (
    <DetailContext.Provider value={ctxValue}>
      <div style={{ background: C.page, color: C.ink, fontFamily: "Inter, Manrope, ui-sans-serif, system-ui" }} className="min-h-screen w-full">
        <ResponsiveStyles />
        <div
          className="clin-shell mx-auto"
          style={{
            background: C.paper, maxWidth: 1250, margin: "40px auto",
            borderRadius: 24, padding: "32px 56px 56px",
            boxShadow: "0 30px 80px rgba(20,36,33,0.08)",
          }}
        >
          <Header page={page} setPage={setPage} />

          <AnimatePresence mode="wait">
            {detail ? (
              <motion.div key={`detail-${detail.id}`}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}>
                <DetailView item={detail} onBack={() => setDetail(null)} onBook={() => {
                  const s = SPECIALTIES.find(x => `spec-${x.id}` === detail.id) ?? SPECIALTIES[0];
                  setBookingFor(s);
                }} />
              </motion.div>
            ) : (
              <motion.div key={page}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}>
                {page === "inicio" && <Home searchRef={searchRef} openDropdown={openDropdown} setOpenDropdown={setOpenDropdown}
                  esp={esp} setEsp={setEsp} data={data} setData={setData} prof={prof} setProf={setProf}
                  filter={filter} setFilter={setFilter} items={filteredView} goTo={setPage} />}
                {page === "especialidades" && <Especialidades filter={filter} setFilter={setFilter} items={filteredView} />}
                {page === "equipe" && <Equipe />}
                {page === "tratamentos" && <Tratamentos />}
                {page === "planos" && <Planos />}
                {page === "convenios" && <Convenios />}
                {page === "agendar" && <Agendar onConfirm={(s) => setBookingFor(s)} />}
                {page === "blog" && <Blog />}
                {page === "contato" && <Contato />}
              </motion.div>
            )}
          </AnimatePresence>

          <Footer goTo={setPage} />
        </div>

        <AnimatePresence>
          {bookingFor && <BookingModal specialty={bookingFor} onClose={() => setBookingFor(null)} />}
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
        .clin-shell { padding: 28px !important; margin: 16px !important; max-width: calc(100% - 32px) !important; border-radius: 20px !important; }
        .clin-content { grid-template-columns: 1fr !important; }
        .clin-bleed { margin-left: -28px !important; margin-right: -28px !important; }
        .clin-bleed > div[style*="padding"] { padding-left: 28px !important; padding-right: 28px !important; }
      }
      @media (max-width: 900px) {
        .clin-nav { gap: 6px !important; flex-wrap: wrap !important; justify-content: center; flex: 1 1 100%; order: 3; margin-top: 10px; padding-top: 10px; border-top: 1px solid ${C.divider}; }
        .clin-nav button { font-size: 12px !important; padding: 6px 10px; border-radius: 999px; background: ${C.pill}; }
        .clin-nav button[data-active="true"] { background: ${C.ink} !important; color: #fff !important; }
        .clin-header { flex-wrap: wrap !important; height: auto !important; padding-bottom: 8px; }
      }
      @media (max-width: 720px) {
        .clin-shell { padding: 18px !important; margin: 0 !important; max-width: 100% !important; border-radius: 0 !important; }
        .clin-bleed { margin-left: -18px !important; margin-right: -18px !important; }
        .clin-bleed > div[style*="padding"] { padding-left: 18px !important; padding-right: 18px !important; }
        .clin-header-cta { display: none !important; }
        .clin-hero { height: 380px !important; }
        .clin-hero-title { font-size: 36px !important; }
        .clin-search { width: 100% !important; margin-top: 18px !important; height: auto !important; grid-template-columns: 1fr !important; padding: 14px !important; gap: 10px !important; }
        .clin-search-btn { width: 100% !important; height: 52px !important; }
        .clin-search-divider { display: none !important; }
        .clin-content { grid-template-columns: 1fr !important; gap: 24px !important; margin-top: 28px !important; }
        .clin-right-grid { grid-template-columns: 1fr !important; }
        .clin-card-h { grid-template-columns: 1fr !important; }
        .clin-card-h img { height: 180px !important; width: 100% !important; }
        .clin-card-v { height: 360px !important; }
        .clin-2col { grid-template-columns: 1fr !important; }
        .clin-3col { grid-template-columns: 1fr !important; }
        .clin-4col { grid-template-columns: 1fr 1fr !important; }
        .clin-section-title { font-size: 28px !important; }
      }
      @media (max-width: 480px) {
        .clin-4col { grid-template-columns: 1fr !important; }
      }
    `}</style>
  );
}

// ---------------- Header ----------------
function Header({ page, setPage }: { page: PageKey; setPage: (k: PageKey) => void }) {
  return (
    <motion.header initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      style={{ height: 64, position: "relative" }} className="clin-header flex items-center justify-between">
      <button onClick={() => setPage("inicio")} className="flex items-center gap-2">
        <motion.span whileHover={{ rotate: 12, scale: 1.05 }}
          style={{ background: C.btn, color: "#fff", width: 30, height: 30, borderRadius: 10 }}
          className="inline-flex items-center justify-center">
          <Stethoscope size={14} />
        </motion.span>
        <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: -0.2 }}>Vivara Clínica</span>
      </button>

      <nav className="clin-nav flex items-center gap-6">
        {NAV_ITEMS.map((n) => {
          const active = page === n.key;
          return (
            <button key={n.key} data-active={active} onClick={() => setPage(n.key)}
              style={{ fontSize: 13, fontWeight: active ? 600 : 500, color: active ? C.ink : "#5F696C", position: "relative", transition: "color 0.2s" }}>
              {n.label}
              {active && <motion.span layoutId="navline" style={{ position: "absolute", left: 0, right: 0, bottom: -8, height: 2, background: C.accent, borderRadius: 2 }} />}
            </button>
          );
        })}
      </nav>

      <motion.button whileHover={{ scale: 1.04 }} onClick={() => setPage("agendar")}
        className="clin-header-cta"
        style={{ background: C.btn, color: "#fff", padding: "10px 18px", borderRadius: 999, fontSize: 13, fontWeight: 600 }}>
        Agendar consulta
      </motion.button>
    </motion.header>
  );
}

// ---------------- Home ----------------
type HomeProps = {
  searchRef: React.RefObject<HTMLDivElement>;
  openDropdown: null | "esp" | "data" | "prof";
  setOpenDropdown: (v: null | "esp" | "data" | "prof") => void;
  esp: string; setEsp: (v: string) => void;
  data: string; setData: (v: string) => void;
  prof: string; setProf: (v: string) => void;
  filter: FilterKey; setFilter: (v: FilterKey) => void;
  items: Specialty[]; goTo: (p: PageKey) => void;
};
function Home({ searchRef, openDropdown, setOpenDropdown, esp, setEsp, data, setData, prof, setProf, filter, setFilter, items, goTo }: HomeProps) {
  return (
    <div style={{ marginTop: 24 }}>
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
        className="clin-hero" style={{ position: "relative", height: 480, borderRadius: 28, overflow: "hidden" }}>
        <motion.img src={HERO_IMAGE} alt="Recepção da clínica" onError={imgFallback}
          initial={{ scale: 1.12 }} animate={{ scale: 1 }} transition={{ duration: 1.6, ease: "easeOut" }}
          style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(15,44,37,0.1), rgba(15,44,37,0.6))" }} />
        <div style={{ position: "absolute", left: 32, right: 32, bottom: 36, color: "#fff" }}>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ display: "inline-block", padding: "5px 14px", borderRadius: 999, background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", fontSize: 11, fontWeight: 600, letterSpacing: 1.4, textTransform: "uppercase" }}>
            Saúde com acolhimento
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="clin-hero-title" style={{ marginTop: 14, fontSize: 56, fontWeight: 700, letterSpacing: -0.025, lineHeight: 1.02, maxWidth: 720 }}>
            Cuidar de você é o que nos move
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            style={{ marginTop: 12, fontSize: 17, opacity: 0.92, maxWidth: 520 }}>
            Mais de 25 especialidades, equipe acolhedora e agendamento online em poucos cliques.
          </motion.p>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div ref={searchRef} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="clin-search"
        style={{
          marginTop: -34, marginLeft: "auto", marginRight: "auto", position: "relative", zIndex: 5,
          width: "92%", background: C.paper, borderRadius: 20, padding: "10px 12px",
          display: "grid", gridTemplateColumns: "1.3fr 8px 1fr 8px 1fr auto", alignItems: "center", gap: 8,
          boxShadow: "0 20px 50px rgba(20,36,33,0.12)",
        }}>
        <SearchField label="Especialidade" value={esp} onClick={() => setOpenDropdown(openDropdown === "esp" ? null : "esp")} open={openDropdown === "esp"}
          options={SPECIALTIES.map(s => s.title)} onPick={(v) => { setEsp(v); setOpenDropdown(null); }} icon={<Stethoscope size={14} />} />
        <div className="clin-search-divider" style={{ width: 1, height: 36, background: C.divider, margin: "0 auto" }} />
        <SearchField label="Data preferida" value={data} onClick={() => setOpenDropdown(openDropdown === "data" ? null : "data")} open={openDropdown === "data"}
          options={["Hoje", "Amanhã", "Esta semana", "Próxima semana"]} onPick={(v) => { setData(v); setOpenDropdown(null); }} icon={<CalendarDays size={14} />} />
        <div className="clin-search-divider" style={{ width: 1, height: 36, background: C.divider, margin: "0 auto" }} />
        <SearchField label="Profissional" value={prof} onClick={() => setOpenDropdown(openDropdown === "prof" ? null : "prof")} open={openDropdown === "prof"}
          options={["Qualquer profissional", "Dra. Marina Vega", "Dr. Felipe Sales", "Dra. Ana Cunha", "Dr. Bruno Lima"]}
          onPick={(v) => { setProf(v); setOpenDropdown(null); }} icon={<MapPin size={14} />} />
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} onClick={() => goTo("agendar")}
          className="clin-search-btn"
          style={{ background: C.btn, color: "#fff", width: 56, height: 56, borderRadius: 16, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <Search size={18} />
        </motion.button>
      </motion.div>

      {/* Filters + grid */}
      <div className="clin-content" style={{ marginTop: 56, display: "grid", gridTemplateColumns: "260px 1fr", gap: 32 }}>
        <aside>
          <div style={{ fontSize: 12, color: C.inkSoft, textTransform: "uppercase", letterSpacing: 1.4, fontWeight: 600 }}>Filtrar por</div>
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
            {FILTERS.map(f => {
              const active = filter === f.key;
              return (
                <motion.button key={f.key} whileHover={{ x: 4 }} onClick={() => setFilter(f.key)}
                  style={{
                    textAlign: "left", padding: "12px 16px", borderRadius: 14,
                    background: active ? C.ink : C.pill, color: active ? "#fff" : C.ink,
                    fontWeight: active ? 600 : 500, fontSize: 13, display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}>
                  {f.label} {active && <ArrowRight size={14} />}
                </motion.button>
              );
            })}
          </div>

          <div style={{ marginTop: 28, padding: 20, borderRadius: 18, background: C.mint }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.btn }}>Primeira consulta?</div>
            <div style={{ marginTop: 6, fontSize: 12, color: C.btn, opacity: 0.75, lineHeight: 1.55 }}>
              Avaliação inicial em até 48h. Confirmamos pelo WhatsApp.
            </div>
            <button style={{ marginTop: 14, fontSize: 12, fontWeight: 600, color: C.btn, padding: "8px 14px", borderRadius: 999, background: C.paper }}>
              Saber mais
            </button>
          </div>
        </aside>

        <div>
          <div className="flex items-end justify-between" style={{ marginBottom: 18 }}>
            <h2 className="clin-section-title" style={{ fontSize: 36, fontWeight: 700, letterSpacing: -0.025 }}>Nossas especialidades</h2>
            <button onClick={() => goTo("especialidades")} style={{ fontSize: 13, color: C.inkSoft, fontWeight: 500 }}>Ver todas →</button>
          </div>
          <div className="clin-right-grid" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18 }}>
            {items.slice(0, 4).map((s, i) => (
              s.type === "horizontal"
                ? <HCard key={s.id} s={s} delay={i * 0.08} />
                : <VCard key={s.id} s={s} delay={i * 0.08} />
            ))}
          </div>
        </div>
      </div>

      <Stats />
      <Features />
      <Testimonials />
      <Newsletter />
    </div>
  );
}

// ---------------- Search field ----------------
function SearchField({ label, value, onClick, open, options, onPick, icon }: {
  label: string; value: string; onClick: () => void; open: boolean;
  options: string[]; onPick: (v: string) => void; icon: React.ReactNode;
}) {
  return (
    <div style={{ position: "relative" }}>
      <button onClick={onClick} style={{ width: "100%", textAlign: "left", padding: "10px 14px", borderRadius: 14, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 30, height: 30, borderRadius: 10, background: C.pill, display: "inline-flex", alignItems: "center", justifyContent: "center", color: C.accent }}>{icon}</span>
        <span style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: C.inkSoft, textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 600 }}>{label}</div>
          <div style={{ fontSize: 13, color: C.ink, fontWeight: 600, marginTop: 2 }}>{value}</div>
        </span>
        <ChevronDown size={14} style={{ color: C.inkSoft, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, background: C.paper, borderRadius: 14, padding: 8, boxShadow: "0 18px 40px rgba(0,0,0,0.12)", zIndex: 50 }}>
            {options.map(o => (
              <button key={o} onClick={() => onPick(o)} style={{ width: "100%", textAlign: "left", padding: "9px 12px", borderRadius: 10, fontSize: 13, fontWeight: 500, color: C.ink }}
                onMouseEnter={(e) => (e.currentTarget.style.background = C.pill)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                {o}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------- Cards ----------------
function HCard({ s, delay = 0 }: { s: Specialty; delay?: number }) {
  const { open, book } = useDetail();
  return (
    <motion.button initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }} whileHover={{ y: -4 }}
      onClick={() => open(specToDetail(s))}
      className="clin-card-h text-left"
      style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: 16, background: C.paper, padding: 14, borderRadius: 20, border: `1px solid ${C.border}` }}>
      <img src={s.image} alt={s.title} onError={imgFallback} style={{ width: 150, height: 150, borderRadius: 14, objectFit: "cover" }} />
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "4px 4px 4px 0" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: C.inkSoft, textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 600 }}>
            <Clock size={11} /> {s.duration}
          </div>
          <div style={{ marginTop: 6, fontSize: 19, fontWeight: 700, letterSpacing: -0.01 }}>{s.title}</div>
          <div style={{ marginTop: 6, fontSize: 12, color: C.inkSoft, lineHeight: 1.5 }}>{s.description.slice(0, 80)}…</div>
        </div>
        <div className="flex items-center justify-between" style={{ marginTop: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: C.ink, fontWeight: 600 }}>
            <Star size={12} fill="#FFB400" stroke="#FFB400" /> {s.rating}
          </div>
          <button onClick={(e) => { e.stopPropagation(); book(s); }}
            style={{ fontSize: 12, fontWeight: 600, padding: "6px 12px", borderRadius: 999, background: C.btn, color: "#fff" }}>
            Agendar
          </button>
        </div>
      </div>
    </motion.button>
  );
}

function VCard({ s, delay = 0 }: { s: Specialty; delay?: number }) {
  const { open, book } = useDetail();
  return (
    <motion.button initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }} whileHover={{ y: -4 }}
      onClick={() => open(specToDetail(s))}
      className="clin-card-v text-left"
      style={{ position: "relative", height: 332, borderRadius: 20, overflow: "hidden" }}>
      <motion.img src={s.image} alt={s.title} onError={imgFallback}
        whileHover={{ scale: 1.06 }} transition={{ duration: 0.6 }}
        style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 35%, rgba(15,44,37,0.7))" }} />
      <div style={{ position: "absolute", inset: 16, display: "flex", flexDirection: "column", justifyContent: "space-between", color: "#fff" }}>
        <div style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 999, background: "rgba(255,255,255,0.22)", backdropFilter: "blur(6px)" }}>
          <Star size={11} fill="#FFB400" stroke="#FFB400" /> {s.rating}
        </div>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.01 }}>{s.title}</div>
          <div style={{ marginTop: 4, fontSize: 12, opacity: 0.85 }}>{s.priceLabel} · {s.duration}</div>
          <button onClick={(e) => { e.stopPropagation(); book(s); }}
            style={{ marginTop: 12, fontSize: 12, fontWeight: 600, padding: "8px 14px", borderRadius: 999, background: "#fff", color: C.ink }}>
            Agendar
          </button>
        </div>
      </div>
    </motion.button>
  );
}

// ---------------- Sections ----------------
function Stats() {
  const items = [
    { v: "25+", l: "Especialidades" },
    { v: "60", l: "Profissionais" },
    { v: "18", l: "Anos cuidando" },
    { v: "94%", l: "Satisfação" },
  ];
  return (
    <div className="clin-bleed" style={{ marginTop: 56 }}>
      <div style={{ padding: "56px 56px", background: C.btn, borderRadius: 24 }}>
        <div className="clin-4col" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
          {items.map((it, i) => (
            <motion.div key={it.l} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}>
              <div style={{ fontSize: 48, fontWeight: 700, color: "#fff", letterSpacing: -0.03 }}>{it.v}</div>
              <div style={{ marginTop: 6, fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{it.l}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Features() {
  const items = [
    { t: "Atendimento humanizado", d: "Equipe treinada para acolher cada paciente com calma e atenção real." },
    { t: "Resultados rápidos", d: "Laudos digitais entregues em até 24h em sua área do paciente." },
    { t: "Tecnologia atual", d: "Equipamentos modernos para diagnóstico preciso e procedimentos seguros." },
    { t: "Cobertura ampla", d: "Atendemos os principais planos de saúde e oferecemos parcelamento." },
  ];
  return (
    <section style={{ marginTop: 56 }}>
      <h2 className="clin-section-title" style={{ fontSize: 36, fontWeight: 700, letterSpacing: -0.025 }}>Por que escolher a Vivara</h2>
      <p style={{ marginTop: 8, fontSize: 14, color: C.inkSoft, maxWidth: 560 }}>Quatro pilares que orientam o cuidado em cada consulta.</p>
      <div className="clin-4col" style={{ marginTop: 26, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {items.map((f, i) => (
          <motion.div key={f.t} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: i * 0.08 }} whileHover={{ y: -4 }}
            style={{ padding: 24, borderRadius: 20, background: C.pill }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.ink }}>{f.t}</div>
            <div style={{ marginTop: 8, fontSize: 13, color: C.inkSoft, lineHeight: 1.6 }}>{f.d}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Testimonials() {
  const items = [
    { n: "Camila R.", r: 5, t: "Atendimento impecável, médico atencioso e ambiente super tranquilo." },
    { n: "Roberto M.", r: 5, t: "Consegui agendar pelo site em 2 minutos. Recomendo demais." },
    { n: "Helena S.", r: 4.9, t: "Equipe gentil do começo ao fim. Minha filha amou a pediatra." },
  ];
  return (
    <div className="clin-bleed" style={{ marginTop: 56 }}>
      <div style={{ padding: "64px 56px", background: C.mint, borderRadius: 24 }}>
        <h2 className="clin-section-title" style={{ fontSize: 32, fontWeight: 700, letterSpacing: -0.025, color: C.btn }}>O que dizem nossos pacientes</h2>
        <div className="clin-3col" style={{ marginTop: 28, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
          {items.map((it, i) => (
            <motion.div key={it.n} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.08 }} whileHover={{ y: -4 }}
              style={{ background: C.paper, padding: 26, borderRadius: 20 }}>
              <Quote size={20} style={{ color: C.accent }} />
              <p style={{ marginTop: 12, fontSize: 14, color: C.ink, lineHeight: 1.65 }}>“{it.t}”</p>
              <div style={{ marginTop: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{it.n}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
                  <Star size={12} fill="#FFB400" stroke="#FFB400" /> {it.r}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Newsletter() {
  return (
    <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      style={{ marginTop: 56, padding: 40, borderRadius: 24, background: C.btn, color: "#fff", display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 28, alignItems: "center" }}
      className="clin-content">
      <div>
        <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.02 }}>Dicas semanais de saúde</h2>
        <p style={{ marginTop: 8, fontSize: 14, opacity: 0.78, maxWidth: 420 }}>Receba conteúdos cuidadosamente selecionados pela nossa equipe médica, sem spam.</p>
      </div>
      <form onSubmit={(e) => e.preventDefault()} style={{ display: "flex", gap: 8, background: "rgba(255,255,255,0.1)", padding: 6, borderRadius: 14 }}>
        <input placeholder="Seu melhor e-mail" style={{ flex: 1, padding: "12px 14px", background: "transparent", color: "#fff", fontSize: 13, outline: "none", border: "none" }} />
        <motion.button whileHover={{ scale: 1.03 }} style={{ padding: "12px 20px", borderRadius: 10, background: "#fff", color: C.ink, fontWeight: 600, fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6 }}>
          Inscrever <Send size={13} />
        </motion.button>
      </form>
    </motion.section>
  );
}

// ---------------- Pages ----------------
function Especialidades({ filter, setFilter, items }: { filter: FilterKey; setFilter: (v: FilterKey) => void; items: Specialty[] }) {
  return (
    <section style={{ marginTop: 24 }}>
      <h1 className="clin-section-title" style={{ fontSize: 44, fontWeight: 700, letterSpacing: -0.03 }}>Todas as especialidades</h1>
      <p style={{ marginTop: 8, fontSize: 14, color: C.inkSoft, maxWidth: 560 }}>Cuidado completo em diversas áreas, com profissionais experientes e atendimento dedicado.</p>
      <div style={{ marginTop: 24, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {FILTERS.map(f => {
          const a = filter === f.key;
          return (
            <button key={f.key} onClick={() => setFilter(f.key)}
              style={{ padding: "10px 18px", borderRadius: 999, background: a ? C.ink : C.pill, color: a ? "#fff" : C.ink, fontSize: 13, fontWeight: 600 }}>
              {f.label}
            </button>
          );
        })}
      </div>
      <div className="clin-3col" style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
        {(items.length ? items : SPECIALTIES).map((s, i) => <VCard key={s.id} s={s} delay={i * 0.06} />)}
      </div>
    </section>
  );
}

function Equipe() {
  const team = [
    { n: "Dra. Marina Vega", esp: "Cardiologia", img: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80" },
    { n: "Dr. Felipe Sales", esp: "Ortopedia", img: "https://images.unsplash.com/photo-1612531386530-97286d97c2d2?auto=format&fit=crop&w=600&q=80" },
    { n: "Dra. Ana Cunha", esp: "Pediatria", img: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=600&q=80" },
    { n: "Dr. Bruno Lima", esp: "Dermatologia", img: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80" },
    { n: "Dra. Júlia Ramos", esp: "Nutrição", img: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&w=600&q=80" },
    { n: "Dr. Carlos Mota", esp: "Odontologia", img: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80" },
  ];
  return (
    <section style={{ marginTop: 24 }}>
      <h1 className="clin-section-title" style={{ fontSize: 44, fontWeight: 700, letterSpacing: -0.03 }}>Nossa equipe</h1>
      <p style={{ marginTop: 8, fontSize: 14, color: C.inkSoft, maxWidth: 560 }}>Profissionais experientes, com formações nas melhores universidades do país.</p>
      <div className="clin-3col" style={{ marginTop: 28, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
        {team.map((p, i) => (
          <motion.div key={p.n} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: i * 0.06 }} whileHover={{ y: -4 }}
            style={{ borderRadius: 20, overflow: "hidden", background: C.paper, border: `1px solid ${C.border}` }}>
            <div style={{ height: 240, overflow: "hidden" }}>
              <motion.img src={p.img} alt={p.n} onError={imgFallback} whileHover={{ scale: 1.05 }} transition={{ duration: 0.5 }}
                style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{p.n}</div>
              <div style={{ marginTop: 4, fontSize: 12, color: C.accent, fontWeight: 600 }}>{p.esp}</div>
              <div style={{ marginTop: 10, fontSize: 12, color: C.inkSoft, lineHeight: 1.55 }}>
                CRM ativo, especialista pela AMB, mais de 10 anos de experiência clínica.
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Tratamentos() {
  const tr = [
    { t: "Check-up executivo", d: "Bateria completa de exames em um único dia.", p: "R$ 890" },
    { t: "Acompanhamento gestacional", d: "Pré-natal humanizado com equipe multidisciplinar.", p: "R$ 1.290" },
    { t: "Tratamento de pele", d: "Limpeza profunda, peelings e laser.", p: "R$ 320" },
    { t: "Implante dentário", d: "Avaliação 3D, planejamento digital e garantia.", p: "Sob consulta" },
    { t: "Reeducação alimentar", d: "12 semanas com nutricionista e psicólogo.", p: "R$ 1.490" },
    { t: "Fisioterapia ortopédica", d: "Sessões individualizadas, equipamentos modernos.", p: "R$ 180" },
  ];
  return (
    <section style={{ marginTop: 24 }}>
      <h1 className="clin-section-title" style={{ fontSize: 44, fontWeight: 700, letterSpacing: -0.03 }}>Tratamentos</h1>
      <p style={{ marginTop: 8, fontSize: 14, color: C.inkSoft, maxWidth: 560 }}>Programas estruturados para resultados consistentes e duradouros.</p>
      <div className="clin-3col" style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {tr.map((t, i) => (
          <motion.div key={t.t} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: i * 0.06 }} whileHover={{ y: -4 }}
            style={{ padding: 24, borderRadius: 20, background: C.pill, display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 200 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{t.t}</div>
              <div style={{ marginTop: 8, fontSize: 13, color: C.inkSoft, lineHeight: 1.6 }}>{t.d}</div>
            </div>
            <div style={{ marginTop: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.btn }}>{t.p}</div>
              <button style={{ fontSize: 12, fontWeight: 600, padding: "8px 14px", borderRadius: 999, background: C.btn, color: "#fff" }}>Saiba mais</button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Planos() {
  const plans = [
    { n: "Essencial", p: "R$ 89", f: ["2 consultas por mês", "Desconto de 20% em exames", "Atendimento por WhatsApp"] },
    { n: "Família", p: "R$ 189", f: ["6 consultas por mês", "Desconto de 35% em exames", "Atendimento prioritário", "Telemedicina ilimitada"], dest: true },
    { n: "Premium", p: "R$ 349", f: ["Consultas ilimitadas", "Desconto de 50% em exames", "Check-up anual incluso", "Sala VIP de espera"] },
  ];
  return (
    <section style={{ marginTop: 24 }}>
      <h1 className="clin-section-title" style={{ fontSize: 44, fontWeight: 700, letterSpacing: -0.03 }}>Planos de assinatura</h1>
      <p style={{ marginTop: 8, fontSize: 14, color: C.inkSoft, maxWidth: 560 }}>Cuidado contínuo com mensalidades acessíveis e benefícios exclusivos.</p>
      <div className="clin-3col" style={{ marginTop: 28, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
        {plans.map((pl, i) => (
          <motion.div key={pl.n} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: i * 0.08 }} whileHover={{ y: -6 }}
            style={{ padding: 28, borderRadius: 24, background: pl.dest ? C.btn : C.paper, border: `1px solid ${pl.dest ? C.btn : C.border}`, color: pl.dest ? "#fff" : C.ink }}>
            {pl.dest && <div style={{ display: "inline-block", padding: "4px 10px", borderRadius: 999, background: C.mint, color: C.btn, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>Mais escolhido</div>}
            <div style={{ marginTop: pl.dest ? 14 : 0, fontSize: 18, fontWeight: 700 }}>{pl.n}</div>
            <div style={{ marginTop: 6, fontSize: 36, fontWeight: 700, letterSpacing: -0.02 }}>{pl.p}<span style={{ fontSize: 13, fontWeight: 500, opacity: 0.6 }}>/mês</span></div>
            <ul style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
              {pl.f.map(x => (
                <li key={x} style={{ fontSize: 13, display: "flex", gap: 10, alignItems: "center", opacity: pl.dest ? 0.92 : 0.85 }}>
                  <span style={{ width: 20, height: 20, borderRadius: 999, background: pl.dest ? "rgba(255,255,255,0.18)" : C.mint, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                    <Check size={11} color={pl.dest ? "#fff" : C.btn} />
                  </span>
                  {x}
                </li>
              ))}
            </ul>
            <button style={{ marginTop: 22, width: "100%", padding: "14px 0", borderRadius: 14, background: pl.dest ? "#fff" : C.btn, color: pl.dest ? C.ink : "#fff", fontSize: 13, fontWeight: 600 }}>
              Assinar plano
            </button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Convenios() {
  const conv = ["Unimed", "Bradesco Saúde", "SulAmérica", "Amil", "Hapvida", "NotreDame", "Porto Seguro", "Allianz", "Cassi", "GEAP"];
  return (
    <section style={{ marginTop: 24 }}>
      <h1 className="clin-section-title" style={{ fontSize: 44, fontWeight: 700, letterSpacing: -0.03 }}>Convênios aceitos</h1>
      <p style={{ marginTop: 8, fontSize: 14, color: C.inkSoft, maxWidth: 560 }}>Trabalhamos com os principais planos do país. Consulte cobertura por especialidade.</p>
      <div className="clin-4col" style={{ marginTop: 28, display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
        {conv.map((c, i) => (
          <motion.div key={c} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            transition={{ delay: i * 0.04 }} whileHover={{ y: -3 }}
            style={{ padding: "28px 16px", borderRadius: 16, background: C.pill, textAlign: "center", fontSize: 13, fontWeight: 600, color: C.ink }}>
            {c}
          </motion.div>
        ))}
      </div>
      <div style={{ marginTop: 36, padding: 28, borderRadius: 20, background: C.mint, color: C.btn, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>Não encontrou seu plano?</div>
        <div style={{ fontSize: 13, opacity: 0.8 }}>Fale com nossa equipe — temos opções de reembolso e parcerias adicionais.</div>
        <button style={{ marginTop: 8, alignSelf: "flex-start", padding: "10px 18px", borderRadius: 999, background: C.btn, color: "#fff", fontSize: 13, fontWeight: 600 }}>
          Falar com atendimento
        </button>
      </div>
    </section>
  );
}

function Agendar({ onConfirm }: { onConfirm: (s: Specialty) => void }) {
  const [chosen, setChosen] = useState<Specialty>(SPECIALTIES[0]);
  return (
    <section style={{ marginTop: 24 }}>
      <h1 className="clin-section-title" style={{ fontSize: 44, fontWeight: 700, letterSpacing: -0.03 }}>Agendar consulta</h1>
      <p style={{ marginTop: 8, fontSize: 14, color: C.inkSoft, maxWidth: 560 }}>Escolha a especialidade desejada e clique para abrir o formulário de agendamento.</p>
      <div className="clin-2col" style={{ marginTop: 28, display: "grid", gridTemplateColumns: "2fr 1fr", gap: 28 }}>
        <div className="clin-3col" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {SPECIALTIES.map(s => {
            const a = chosen.id === s.id;
            return (
              <motion.button key={s.id} whileHover={{ y: -3 }} onClick={() => setChosen(s)}
                style={{ padding: 18, borderRadius: 18, background: a ? C.ink : C.pill, color: a ? "#fff" : C.ink, textAlign: "left", border: a ? `2px solid ${C.accent}` : "2px solid transparent" }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{s.title}</div>
                <div style={{ marginTop: 4, fontSize: 11, opacity: 0.7 }}>{s.duration} · {s.priceLabel}</div>
              </motion.button>
            );
          })}
        </div>
        <motion.aside initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
          style={{ padding: 24, borderRadius: 20, background: C.paper, border: `1px solid ${C.border}`, alignSelf: "start", position: "sticky", top: 20 }}>
          <div style={{ fontSize: 12, color: C.inkSoft, textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 600 }}>Selecionado</div>
          <div style={{ marginTop: 6, fontSize: 22, fontWeight: 700 }}>{chosen.title}</div>
          <div style={{ marginTop: 4, fontSize: 13, color: C.inkSoft }}>{chosen.priceLabel} · {chosen.duration}</div>
          <button onClick={() => onConfirm(chosen)}
            style={{ marginTop: 20, width: "100%", padding: "14px 0", borderRadius: 14, background: C.btn, color: "#fff", fontWeight: 600, fontSize: 14 }}>
            Continuar agendamento
          </button>
          <div style={{ marginTop: 18, paddingTop: 16, borderTop: `1px solid ${C.divider}`, display: "flex", flexDirection: "column", gap: 10, fontSize: 12, color: C.inkSoft }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Shield size={13} /> Atendimento certificado</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Clock size={13} /> Confirmação em até 2h</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Phone size={13} /> Suporte por WhatsApp</div>
          </div>
        </motion.aside>
      </div>
    </section>
  );
}

function Blog() {
  const posts = [
    { t: "5 sinais de que você precisa de um check-up", c: "Saúde geral", i: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=900&q=80" },
    { t: "Como cuidar da pele no verão", c: "Dermatologia", i: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80" },
    { t: "Alimentação infantil: o que evitar", c: "Pediatria", i: "https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&w=900&q=80" },
    { t: "Postura no trabalho remoto", c: "Ortopedia", i: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=80" },
  ];
  const { open } = useDetail();
  return (
    <section style={{ marginTop: 24 }}>
      <h1 className="clin-section-title" style={{ fontSize: 44, fontWeight: 700, letterSpacing: -0.03 }}>Blog & saúde</h1>
      <p style={{ marginTop: 8, fontSize: 14, color: C.inkSoft, maxWidth: 560 }}>Artigos escritos por nossa equipe médica para informar e apoiar você.</p>
      <div className="clin-2col" style={{ marginTop: 28, display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 18 }}>
        {posts.map((p, i) => (
          <motion.button key={p.t} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: i * 0.06 }} whileHover={{ y: -4 }}
            onClick={() => open({ id: `post-${i}`, kind: "post", title: p.t, subtitle: p.c, image: p.i, description: "Artigo completo com orientações práticas para o seu dia a dia." })}
            className="text-left"
            style={{ borderRadius: 20, overflow: "hidden", background: C.paper, border: `1px solid ${C.border}` }}>
            <div style={{ height: 240, overflow: "hidden" }}>
              <motion.img src={p.i} alt={p.t} onError={imgFallback} whileHover={{ scale: 1.05 }} transition={{ duration: 0.5 }}
                style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ padding: 22 }}>
              <div style={{ fontSize: 11, color: C.accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.3 }}>{p.c}</div>
              <div style={{ marginTop: 8, fontSize: 18, fontWeight: 700, letterSpacing: -0.01 }}>{p.t}</div>
              <div style={{ marginTop: 14, fontSize: 12, color: C.inkSoft, display: "inline-flex", alignItems: "center", gap: 6 }}>
                Ler artigo <ArrowRight size={12} />
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </section>
  );
}

function Contato() {
  return (
    <section style={{ marginTop: 24 }}>
      <h1 className="clin-section-title" style={{ fontSize: 44, fontWeight: 700, letterSpacing: -0.03 }}>Fale com a gente</h1>
      <p style={{ marginTop: 8, fontSize: 14, color: C.inkSoft, maxWidth: 560 }}>Tire dúvidas, agende ou solicite informações sobre planos e convênios.</p>
      <div className="clin-2col" style={{ marginTop: 28, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div className="clin-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {[
            { t: "Telefone", v: "(11) 4002-8922" },
            { t: "WhatsApp", v: "(11) 99999-0000" },
            { t: "Endereço", v: "Av. das Acácias, 320 · São Paulo" },
            { t: "Horário", v: "Seg a sáb · 7h às 21h" },
          ].map((it) => (
            <motion.div key={it.t} whileHover={{ y: -3 }}
              style={{ padding: 22, borderRadius: 18, background: C.pill }}>
              <div style={{ fontSize: 11, color: C.inkSoft, textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 600 }}>{it.t}</div>
              <div style={{ marginTop: 6, fontSize: 15, fontWeight: 600, color: C.ink }}>{it.v}</div>
            </motion.div>
          ))}
        </div>

        <form onSubmit={(e) => e.preventDefault()} style={{ padding: 24, borderRadius: 20, background: C.paper, border: `1px solid ${C.border}`, display: "flex", flexDirection: "column", gap: 12 }}>
          <input placeholder="Nome completo" style={{ padding: "12px 14px", borderRadius: 12, background: C.pill, fontSize: 13, outline: "none", border: "none" }} />
          <input placeholder="WhatsApp" style={{ padding: "12px 14px", borderRadius: 12, background: C.pill, fontSize: 13, outline: "none", border: "none" }} />
          <textarea placeholder="Como podemos ajudar?" rows={4} style={{ padding: "12px 14px", borderRadius: 12, background: C.pill, fontSize: 13, outline: "none", border: "none", resize: "vertical" }} />
          <motion.button whileHover={{ scale: 1.02 }} style={{ padding: "14px 0", borderRadius: 12, background: C.btn, color: "#fff", fontWeight: 600, fontSize: 14 }}>
            Enviar mensagem
          </motion.button>
        </form>
      </div>
    </section>
  );
}

// ---------------- Detail ----------------
function DetailView({ item, onBack, onBook }: { item: DetailItem; onBack: () => void; onBook: () => void }) {
  const kindLabel = { especialidade: "Especialidade", profissional: "Profissional", tratamento: "Tratamento", post: "Artigo" }[item.kind];
  return (
    <article style={{ marginTop: 24 }}>
      <motion.button whileHover={{ x: -4 }} onClick={onBack}
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 18, padding: "8px 14px", borderRadius: 999, background: C.pill }}>
        ← Voltar
      </motion.button>

      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
        className="clin-hero" style={{ position: "relative", height: 420, borderRadius: 28, overflow: "hidden" }}>
        <motion.img src={item.image} alt={item.title} onError={imgFallback}
          initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 1.4, ease: "easeOut" }}
          style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(15,44,37,0.15), rgba(15,44,37,0.6))" }} />
        <div style={{ position: "absolute", left: 28, right: 28, bottom: 28, color: "#fff" }}>
          <div style={{ display: "inline-block", padding: "4px 12px", borderRadius: 999, background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", fontSize: 11, fontWeight: 600, letterSpacing: 1.2, textTransform: "uppercase" }}>{kindLabel}</div>
          <h1 className="clin-hero-title" style={{ marginTop: 10, fontSize: 48, fontWeight: 700, letterSpacing: -0.02, lineHeight: 1.05 }}>{item.title}</h1>
          {item.subtitle && <div style={{ marginTop: 6, fontSize: 16, opacity: 0.9 }}>{item.subtitle}</div>}
        </div>
      </motion.div>

      <div className="clin-content" style={{ marginTop: 32, display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 28 }}>
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700 }}>Sobre este atendimento</h2>
          <p style={{ marginTop: 10, fontSize: 15, lineHeight: 1.7, color: C.inkSoft }}>
            {item.description} Toda a equipe é treinada para oferecer um atendimento próximo, com escuta ativa e protocolos clínicos atualizados.
          </p>

          {item.highlights && (
            <div style={{ marginTop: 24 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 12 }}>O que está incluso</h3>
              <div className="clin-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {item.highlights.map((h, i) => (
                  <motion.div key={h} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.06 }}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 14, background: C.pill }}>
                    <span style={{ width: 26, height: 26, borderRadius: 999, background: C.mint, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                      <Check size={13} color={C.btn} />
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{h}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: 28 }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 12 }}>Como funciona</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {["Você escolhe a especialidade e horário", "Confirmamos por WhatsApp em até 2h", "Atendimento com profissional escolhido", "Acompanhamento pós-consulta digital"].map((s, i) => (
                <motion.div key={s} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  style={{ display: "flex", gap: 14, alignItems: "start", padding: 16, borderRadius: 16, border: `1px solid ${C.border}` }}>
                  <div style={{ width: 30, height: 30, borderRadius: 999, background: C.btn, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ fontSize: 14, lineHeight: 1.55 }}>{s}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.aside initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ background: C.paper, border: `1px solid ${C.border}`, borderRadius: 24, padding: 24, alignSelf: "start", position: "sticky", top: 20 }}>
          {item.priceLabel && (
            <>
              <div style={{ fontSize: 12, color: C.inkSoft, textTransform: "uppercase", letterSpacing: 1.2 }}>Valor</div>
              <div style={{ marginTop: 4, fontSize: 28, fontWeight: 700, letterSpacing: -0.02 }}>{item.priceLabel}</div>
            </>
          )}
          {item.rating && (
            <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: C.inkSoft }}>
              <Star size={13} fill="#FFB400" stroke="#FFB400" /> {item.rating} · {Math.round(item.rating * 42)} avaliações
            </div>
          )}
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            <motion.button whileHover={{ scale: 1.02 }} onClick={onBook}
              style={{ height: 50, borderRadius: 14, background: C.btn, color: "#fff", fontWeight: 600, fontSize: 14 }}>
              Agendar agora
            </motion.button>
            <button style={{ height: 46, borderRadius: 14, background: C.pill, color: C.ink, fontWeight: 600, fontSize: 13 }}>
              Tirar dúvidas
            </button>
          </div>
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${C.divider}`, display: "flex", flexDirection: "column", gap: 10 }}>
            {[{ i: Shield, l: "Sigilo médico garantido" }, { i: Clock, l: "Confirmação em 2h" }, { i: Phone, l: "Suporte por WhatsApp" }].map((b) => (
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

// ---------------- Booking Modal ----------------
function BookingModal({ specialty, onClose }: { specialty: Specialty; onClose: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(15,44,37,0.55)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
      <motion.div initial={{ scale: 0.94, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94, y: 20 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        onClick={(e) => e.stopPropagation()}
        style={{ background: C.paper, borderRadius: 24, padding: 32, width: "100%", maxWidth: 460 }}>
        {confirmed ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260 }}
              style={{ width: 64, height: 64, borderRadius: 999, background: C.mint, display: "inline-flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
              <Check size={28} color={C.btn} />
            </motion.div>
            <div style={{ marginTop: 18, fontSize: 22, fontWeight: 700 }}>Pedido recebido!</div>
            <div style={{ marginTop: 8, fontSize: 14, color: C.inkSoft }}>Confirmaremos seu horário em {specialty.title} pelo WhatsApp em até 2 horas.</div>
            <button onClick={onClose} style={{ marginTop: 22, padding: "12px 26px", borderRadius: 12, background: C.btn, color: "#fff", fontWeight: 600, fontSize: 13 }}>Fechar</button>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 11, color: C.inkSoft, textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 600 }}>Agendamento</div>
            <div style={{ marginTop: 6, fontSize: 22, fontWeight: 700 }}>{specialty.title}</div>
            <div style={{ marginTop: 4, fontSize: 13, color: C.inkSoft }}>{specialty.priceLabel} · {specialty.duration}</div>

            <form onSubmit={(e) => { e.preventDefault(); setConfirmed(true); }} style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 12 }}>
              <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome completo" style={{ padding: "12px 14px", borderRadius: 12, background: C.pill, fontSize: 13, outline: "none", border: "none" }} />
              <input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="WhatsApp" style={{ padding: "12px 14px", borderRadius: 12, background: C.pill, fontSize: 13, outline: "none", border: "none" }} />
              <input required value={date} onChange={(e) => setDate(e.target.value)} placeholder="Dia e período preferidos" style={{ padding: "12px 14px", borderRadius: 12, background: C.pill, fontSize: 13, outline: "none", border: "none" }} />
              <button type="submit" style={{ marginTop: 4, padding: "14px 0", borderRadius: 12, background: C.btn, color: "#fff", fontWeight: 600, fontSize: 14 }}>
                Solicitar agendamento
              </button>
              <button type="button" onClick={onClose} style={{ padding: "12px 0", fontSize: 13, color: C.inkSoft, fontWeight: 500 }}>Cancelar</button>
            </form>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

// ---------------- Footer ----------------
function Footer({ goTo }: { goTo: (p: PageKey) => void }) {
  return (
    <footer style={{ marginTop: 64, paddingTop: 36, borderTop: `1px solid ${C.divider}` }}>
      <div className="clin-content" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 28 }}>
        <div>
          <div className="flex items-center gap-2">
            <span style={{ background: C.btn, color: "#fff", width: 30, height: 30, borderRadius: 10 }} className="inline-flex items-center justify-center">
              <Stethoscope size={14} />
            </span>
            <span style={{ fontWeight: 700, fontSize: 15 }}>Vivara Clínica</span>
          </div>
          <p style={{ marginTop: 12, fontSize: 13, color: C.inkSoft, lineHeight: 1.65, maxWidth: 320 }}>
            Saúde com acolhimento. Especialidades médicas, exames e tratamentos com tecnologia atual.
          </p>
        </div>
        {[
          { t: "Atendimento", l: ["especialidades", "tratamentos", "agendar", "planos"] as PageKey[] },
          { t: "Clínica", l: ["equipe", "convenios", "blog", "contato"] as PageKey[] },
        ].map((col) => (
          <div key={col.t}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.ink, textTransform: "uppercase", letterSpacing: 1.2 }}>{col.t}</div>
            <ul style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
              {col.l.map((k) => {
                const item = NAV_ITEMS.find(n => n.key === k);
                return <li key={k}><button onClick={() => goTo(k)} style={{ fontSize: 13, color: C.inkSoft }}>{item?.label}</button></li>;
              })}
            </ul>
          </div>
        ))}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.ink, textTransform: "uppercase", letterSpacing: 1.2 }}>Contato</div>
          <ul style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: C.inkSoft }}>
            <li>(11) 4002-8922</li>
            <li>Av. das Acácias, 320</li>
            <li>São Paulo · SP</li>
          </ul>
        </div>
      </div>
      <div style={{ marginTop: 32, paddingTop: 18, borderTop: `1px solid ${C.divider}`, display: "flex", justifyContent: "space-between", fontSize: 12, color: C.muted }}>
        <span>© {new Date().getFullYear()} Vivara Clínica. Todos os direitos reservados.</span>
        <span>CNPJ 00.000.000/0001-00 · CRM/SP 000000</span>
      </div>
    </footer>
  );
}
