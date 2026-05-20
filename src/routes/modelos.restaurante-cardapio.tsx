import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, ArrowRight, Star, Plus, Minus, Phone, Mail, MapPin, Clock, Menu as MenuIcon, X } from "lucide-react";
import heroImg from "@/assets/sushi-hero.jpg";
import chefImg from "@/assets/sushi-chef.jpg";
import aboutImg from "@/assets/sushi-about.jpg";

export const Route = createFileRoute("/modelos/restaurante-cardapio")({
  component: SushiXTI,
  head: () => ({
    meta: [
      { title: "SUSHI X TI — Japanese Restaurant & Catering" },
      { name: "description", content: "Authentic Japanese sushi, omakase, and private catering. Reserve a seat at the counter." },
      { property: "og:title", content: "SUSHI X TI — Japanese Restaurant & Catering" },
      { property: "og:description", content: "Authentic Japanese sushi, omakase, and private catering." },
      { property: "og:image", content: heroImg },
    ],
  }),
});

const NAV = [
  { label: "About Us", href: "#about" },
  { label: "Menu", href: "#menu" },
  { label: "Omakase", href: "#omakase" },
  { label: "Catering & Events", href: "#catering" },
];

const FULL_NAV = [
  { label: "About Us", href: "#about" },
  { label: "Menu", href: "#menu" },
  { label: "Omakase", href: "#omakase" },
  { label: "Catering", href: "#catering" },
  { label: "Events", href: "#catering" },
  { label: "Gallery", href: "#gallery" },
  { label: "Contact", href: "#contact" },
];

const MENU: Record<string, { name: string; desc: string; price: string; img: string }[]> = {
  Sushi: [
    { name: "Salmon Nigiri", desc: "Fresh salmon, seasoned rice, wasabi", price: "$12", img: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=70" },
    { name: "Tuna Nigiri", desc: "Premium bluefin, hand-pressed rice", price: "$14", img: "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=600&q=70" },
  ],
  Sashimi: [
    { name: "Tuna Sashimi", desc: "Premium tuna, shiso, citrus soy", price: "$18", img: "https://images.unsplash.com/photo-1583623025817-d180a2221d0a?w=600&q=70" },
    { name: "Hamachi Sashimi", desc: "Yellowtail, yuzu kosho, daikon", price: "$22", img: "https://images.unsplash.com/photo-1607301406259-dfb186e15de8?w=600&q=70" },
  ],
  Rolls: [
    { name: "Dragon Roll", desc: "Eel, cucumber, avocado, sweet tare", price: "$21", img: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=600&q=70" },
    { name: "Spicy Tuna Roll", desc: "Tuna, chili, scallion, sesame", price: "$16", img: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=600&q=70" },
  ],
  "Hot Dishes": [
    { name: "Wagyu Tataki", desc: "Seared wagyu, ponzu, scallion", price: "$28", img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=70" },
    { name: "Miso Black Cod", desc: "Charred cod, miso glaze, pickled daikon", price: "$32", img: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&q=70" },
    { name: "Omakase Bites", desc: "Chef-selected seasonal tasting", price: "$42", img: "https://images.unsplash.com/photo-1564489563601-c53cfc451e93?w=600&q=70" },
  ],
  Drinks: [
    { name: "Matcha Tiramisu", desc: "Matcha cream, soft sponge, cocoa", price: "$11", img: "https://images.unsplash.com/photo-1515467837915-15c4777ba46a?w=600&q=70" },
    { name: "Yuzu Spritz", desc: "Yuzu, soda, citrus peel", price: "$9", img: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&q=70" },
  ],
};

const GALLERY = [
  { src: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=70", caption: "Fresh Nigiri", h: 360 },
  { src: "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=800&q=70", caption: "Chef's Counter", h: 440 },
  { src: "https://images.unsplash.com/photo-1583623025817-d180a2221d0a?w=800&q=70", caption: "Seasonal Fish", h: 320 },
  { src: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=800&q=70", caption: "Private Catering", h: 400 },
  { src: "https://images.unsplash.com/photo-1564489563601-c53cfc451e93?w=800&q=70", caption: "Omakase Course", h: 380 },
  { src: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=70", caption: "Warm Sake", h: 340 },
  { src: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&q=70", caption: "Evening Service", h: 420 },
  { src: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&q=70", caption: "Japanese Detail", h: 360 },
];

const FAQS = [
  { q: "Do you offer omakase?", a: "Yes. Omakase reservations are available on selected evenings and depend on seasonal ingredient availability." },
  { q: "Do you provide private catering?", a: "Yes. We provide Japanese catering for private dinners, corporate events, and celebrations." },
  { q: "Can you handle dietary restrictions?", a: "Please mention dietary restrictions during booking so the team can confirm what can be accommodated." },
  { q: "Do I need a reservation?", a: "Reservations are recommended, especially for omakase and evening service." },
  { q: "How far in advance should I book catering?", a: "For catering, booking at least one to two weeks in advance is recommended." },
  { q: "Do you serve drinks?", a: "Yes. The menu may include sake, tea, Japanese-inspired cocktails, and non-alcoholic options." },
];

export function SushiXTI() {
  const [tab, setTab] = useState<keyof typeof MENU>("Sushi");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [formSent, setFormSent] = useState(false);
  const [catSent, setCatSent] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setMobileOpen(false); setSearchOpen(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-screen bg-[#050706] text-[#F5F2EA] font-sans antialiased overflow-x-hidden" style={{ fontFamily: "Inter, Manrope, system-ui, sans-serif" }}>
      {/* HERO */}
      <section id="home" className="relative w-full min-h-[780px] lg:h-screen overflow-hidden">
        {/* background */}
        <div className="absolute inset-0">
          <img src={heroImg} alt="" className="absolute inset-0 w-full h-full object-cover scale-105 animate-[heroZoom_18s_ease-out_forwards]" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050706]/70 via-[#050706]/40 to-[#050706]/90" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050706]/80 via-transparent to-[#050706]/60" />
          <div className="absolute inset-0" style={{ background: "radial-gradient(80% 50% at 50% 70%, rgba(184,74,30,0.25), transparent 70%)" }} />
          <div className="absolute inset-0 opacity-[0.07] mix-blend-overlay pointer-events-none" style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence baseFrequency='0.9'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")" }} />
        </div>

        {/* header */}
        <header className={`absolute top-0 left-0 right-0 z-30 transition-all duration-500 ${scrolled ? "py-3" : "py-5 sm:py-7"}`}>
          <div className="px-5 sm:px-8 lg:px-14 flex items-center justify-between gap-4">
            {/* logo */}
            <a href="#home" className="flex flex-col leading-none">
              <span className="text-white font-black tracking-[-0.02em] text-[18px] sm:text-[20px]">SUSHI <span className="text-[#E46B3F]">X</span> TI</span>
              <span className="text-[10px] tracking-[0.3em] uppercase text-white/50 mt-1">restaurant</span>
            </a>

            {/* center pill (desktop) */}
            <nav className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-1 h-12 px-7 rounded-full border border-white/10 backdrop-blur-xl" style={{ background: "rgba(22,31,27,0.62)" }}>
              {NAV.map((n) => (
                <a key={n.label} href={n.href} className="px-3 text-[13px] text-white/75 hover:text-white transition-colors">{n.label}</a>
              ))}
            </nav>

            {/* right */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button aria-label="Search" onClick={() => setSearchOpen(true)} className="hidden sm:inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10 transition">
                <Search className="h-4 w-4" />
              </button>
              <a href="#contact" className="hidden sm:inline-flex items-center h-11 px-5 rounded-full bg-white text-black text-[13px] font-medium hover:-translate-y-0.5 transition">Contact Us</a>
              <button aria-label="Menu" onClick={() => setMobileOpen(true)} className="lg:hidden h-11 w-11 inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 text-white">
                <MenuIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* hero content */}
        <div className="relative z-20 px-5 sm:px-8 lg:px-14 pt-32 sm:pt-40 lg:pt-48 pb-28 sm:pb-32 lg:pb-36 min-h-[780px] lg:min-h-screen flex flex-col justify-center">
          <div className="max-w-[680px]">
            <p className="text-[12px] sm:text-[13px] tracking-[0.3em] uppercase text-white/70 font-medium mb-5 sm:mb-7 animate-[fadeUp_0.8s_ease-out_0.2s_both]">Home of Sushi</p>
            <h1 className="text-white font-extrabold tracking-[-0.055em] leading-[0.93] text-[46px] sm:text-[64px] md:text-[78px] lg:text-[92px] xl:text-[104px]">
              <span className="block animate-[fadeUp_0.9s_ease-out_0.35s_both]">Discovering</span>
              <span className="block animate-[fadeUp_0.9s_ease-out_0.5s_both]">The Finest</span>
              <span className="block animate-[fadeUp_0.9s_ease-out_0.65s_both]">Flavors Of</span>
              <span className="block animate-[fadeUp_0.9s_ease-out_0.8s_both]">Japan!</span>
            </h1>
          </div>

          {/* slider dots */}
          <div className="mt-10 lg:absolute lg:bottom-12 lg:left-14 flex items-center gap-2 animate-[fadeUp_0.8s_ease-out_1.1s_both]">
            {[0,1,2,3,4].map((i) => (
              <span key={i} className={`h-1.5 rounded-full transition-all ${i===0 ? "w-8 bg-white" : "w-2 bg-white/30"}`} />
            ))}
          </div>

          {/* right card */}
          <div className="mt-10 lg:mt-0 lg:absolute lg:right-8 xl:right-20 lg:bottom-20 w-full lg:w-[400px] rounded-3xl border border-white/10 p-6 sm:p-7 backdrop-blur-xl animate-[fadeUp_0.9s_ease-out_0.9s_both]" style={{ background: "rgba(5,7,6,0.55)" }}>
            <h3 className="text-white text-xl sm:text-2xl font-semibold tracking-tight leading-tight">Authentic Japanese Catering</h3>
            <p className="mt-3 text-[14px] text-white/65 leading-relaxed">With the finest ingredients, skilled chefs, and traditional preparation, we create memorable Japanese dining experiences for private events and special occasions.</p>
            <a href="#menu" className="mt-5 inline-flex items-center gap-2 text-white text-[13px] font-medium group">
              View Menu <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
            </a>
          </div>

          {/* tiny floating label */}
          <div className="hidden md:block absolute left-14 bottom-28 lg:bottom-32 px-3 py-1.5 rounded-full border border-white/15 backdrop-blur-md text-[11px] uppercase tracking-[0.2em] text-white/70" style={{ background: "rgba(5,7,6,0.5)" }}>
            Fresh daily · Chef-selected fish
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="relative py-24 sm:py-32 px-5 sm:px-8 lg:px-14 bg-[#050706]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <p className="text-[12px] tracking-[0.3em] uppercase text-[#97A36B] mb-5">About Us</p>
            <h2 className="text-white text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.04em] leading-[0.98]">Japanese Craft, Modern Hospitality</h2>
            <p className="mt-6 text-[#B9BDB4] leading-relaxed max-w-lg">SUSHI X TI brings together traditional Japanese preparation, seasonal ingredients, and a refined dining experience designed for guests who value precision, freshness, and atmosphere.</p>
            <p className="mt-4 text-[#8F978E] leading-relaxed max-w-lg">From intimate dinners to private catering, every detail is shaped around balance, texture, and the quiet discipline of sushi craftsmanship.</p>

            <div className="mt-10 grid grid-cols-2 gap-3 max-w-lg">
              {["Seasonal Ingredients","Traditional Technique","Private Dining","Premium Catering"].map((f) => (
                <div key={f} className="rounded-2xl p-4 border border-white/8 bg-[#111A16] hover:border-[#B84A1E]/40 transition">
                  <div className="h-8 w-8 rounded-full bg-[#B84A1E]/20 text-[#E46B3F] flex items-center justify-center text-xs">●</div>
                  <p className="mt-3 text-sm font-medium text-white">{f}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <img src={chefImg} alt="Chef preparing nigiri" loading="lazy" className="rounded-[34px] w-full h-[480px] sm:h-[560px] object-cover" />
            <div className="absolute -bottom-5 -left-4 sm:-left-6 rounded-2xl bg-[#F5F2EA] text-black px-5 py-4 shadow-2xl">
              <div className="text-2xl font-bold">12+</div>
              <div className="text-xs text-black/60 uppercase tracking-[0.2em] mt-1">Years of craft</div>
            </div>
            <div className="absolute top-6 right-6 rounded-2xl bg-[#050706]/70 backdrop-blur-md border border-white/10 px-4 py-3">
              <div className="text-lg font-semibold text-white">Fresh</div>
              <div className="text-[10px] text-white/60 uppercase tracking-[0.2em]">Daily selection</div>
            </div>
          </div>
        </div>
      </section>

      {/* MENU */}
      <section id="menu" className="py-24 sm:py-32 px-5 sm:px-8 lg:px-14 bg-[#F5F2EA] text-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-[12px] tracking-[0.3em] uppercase text-black/50 mb-4">Signature Menu</p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.04em] leading-[1]">A Curated Selection Of Japanese Favorites</h2>
            <p className="mt-5 text-black/60">Explore signature sushi, sashimi, hot dishes, and seasonal chef selections.</p>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-2 p-1.5 rounded-full bg-black/5 w-fit mx-auto">
            {(Object.keys(MENU) as (keyof typeof MENU)[]).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`px-5 py-2.5 rounded-full text-sm font-medium transition ${tab===t ? "bg-black text-white" : "text-black/70 hover:text-black"}`}>{t}</button>
            ))}
          </div>

          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-[fadeUp_0.4s_ease-out]" key={tab as string}>
            {MENU[tab].map((m) => (
              <div key={m.name} className="group rounded-3xl bg-white overflow-hidden border border-black/5 hover:shadow-xl transition">
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={m.img} alt={m.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-lg">{m.name}</h3>
                    <span className="shrink-0 rounded-full bg-black text-white text-xs font-medium px-3 py-1.5">{m.price}</span>
                  </div>
                  <p className="mt-2 text-sm text-black/55 leading-relaxed">{m.desc}</p>
                  <button className="mt-4 inline-flex items-center gap-2 text-sm font-medium group/btn">Details <ArrowRight className="h-3.5 w-3.5 group-hover/btn:translate-x-1 transition" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OMAKASE */}
      <section id="omakase" className="relative py-28 sm:py-36 px-5 sm:px-8 lg:px-14 bg-[#0B1410] overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <img src={chefImg} alt="" className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#050706] via-[#0B1410]/90 to-[#050706]" />
        </div>
        <div className="absolute top-10 right-10 text-[80px] text-[#E46B3F]/15 font-bold leading-none select-none hidden md:block" style={{ writingMode: "vertical-rl" }}>寿司</div>

        <div className="relative max-w-6xl mx-auto">
          <p className="text-[12px] tracking-[0.3em] uppercase text-[#E46B3F] mb-5">Omakase</p>
          <h2 className="text-white text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.04em] leading-[1] max-w-3xl">Let The Chef Guide The Experience</h2>
          <p className="mt-6 text-[#B9BDB4] max-w-2xl leading-relaxed">Our omakase experience is built around seasonality, balance, and precision. Each course is prepared in sequence, allowing the flavors of Japan to unfold naturally.</p>
          <a href="#contact" className="mt-8 inline-flex items-center gap-2 h-12 px-6 rounded-full bg-white text-black text-sm font-medium hover:-translate-y-0.5 transition">Reserve Omakase <ArrowRight className="h-4 w-4" /></a>

          <div className="mt-16 grid md:grid-cols-3 gap-5">
            {[
              { n: "01", t: "Seasonal Selection", d: "Each course built around the day's freshest catch and produce." },
              { n: "02", t: "Counter Preparation", d: "Watch every piece shaped in front of you at the chef's counter." },
              { n: "03", t: "Guided Tasting", d: "A curated sequence revealing balance, texture, and aroma." },
            ].map((s) => (
              <div key={s.n} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur">
                <div className="text-[#E46B3F] text-sm font-mono">{s.n}</div>
                <h3 className="mt-3 text-white text-lg font-semibold">{s.t}</h3>
                <div className="mt-3 h-px w-10 bg-white/20" />
                <p className="mt-3 text-sm text-white/60 leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATERING */}
      <section id="catering" className="py-24 sm:py-32 px-5 sm:px-8 lg:px-14 bg-[#F5F2EA] text-black">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <p className="text-[12px] tracking-[0.3em] uppercase text-black/50 mb-4">Catering & Events</p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.04em] leading-[1]">Authentic Japanese Catering For Private Occasions</h2>
            <p className="mt-5 text-black/60">From corporate receptions to private dinners, we bring a refined sushi experience directly to your event.</p>
          </div>

          <div className="mt-12 grid md:grid-cols-3 gap-5">
            {[
              { t: "Private Dinners", d: "Intimate chef-led dining.", img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=70" },
              { t: "Corporate Events", d: "Elegant sushi catering for teams and guests.", img: "https://images.unsplash.com/photo-1555244162-803834f70033?w=900&q=70" },
              { t: "Celebrations", d: "Birthdays, launches, weddings, and special occasions.", img: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=900&q=70" },
            ].map((c) => (
              <div key={c.t} className="group relative rounded-[34px] overflow-hidden h-[420px]">
                <img src={c.img} alt={c.t} loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-7 text-white">
                  <h3 className="text-2xl font-semibold">{c.t}</h3>
                  <p className="mt-2 text-sm text-white/75">{c.d}</p>
                  <button className="mt-4 inline-flex items-center gap-2 text-sm font-medium">Plan Event <ArrowRight className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>

          {/* mini form */}
          <form onSubmit={(e) => { e.preventDefault(); setCatSent(true); }} className="mt-14 rounded-3xl bg-white border border-black/5 p-6 sm:p-8 grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <input required placeholder="Event Type" className="h-12 rounded-xl border border-black/10 px-4 text-sm bg-white" />
            <input required type="number" min="1" placeholder="Guest Count" className="h-12 rounded-xl border border-black/10 px-4 text-sm bg-white" />
            <input required type="date" className="h-12 rounded-xl border border-black/10 px-4 text-sm bg-white" />
            <input required type="email" placeholder="Contact Email" className="h-12 rounded-xl border border-black/10 px-4 text-sm bg-white" />
            <button className="h-12 rounded-xl bg-black text-white text-sm font-medium hover:-translate-y-0.5 transition">{catSent ? "Request sent" : "Request Catering"}</button>
            {catSent && <p className="sm:col-span-2 lg:col-span-5 text-sm text-emerald-700">Request received. Our team will contact you soon.</p>}
          </form>
        </div>
      </section>

      {/* GALLERY */}
      <section id="gallery" className="py-24 sm:py-32 px-5 sm:px-8 lg:px-14 bg-[#050706]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-[12px] tracking-[0.3em] uppercase text-[#97A36B] mb-4">Gallery</p>
            <h2 className="text-white text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.04em] leading-[1]">Moments From The Counter</h2>
          </div>
          <div className="mt-12 columns-1 sm:columns-2 lg:columns-4 gap-4 space-y-4">
            {GALLERY.map((g, i) => (
              <div key={i} className="group relative break-inside-avoid rounded-2xl overflow-hidden bg-[#111A16]">
                <img src={g.src} alt={g.caption} loading="lazy" className="w-full object-cover group-hover:scale-105 transition duration-700" style={{ height: g.h }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-4">
                  <span className="text-white text-sm font-medium">{g.caption}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CHEF */}
      <section id="chef" className="py-24 sm:py-32 px-5 sm:px-8 lg:px-14 bg-[#F5F2EA] text-black">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="relative order-2 lg:order-1">
            <img src={aboutImg} alt="Chef Haruto Sato" loading="lazy" className="rounded-[34px] w-full h-[520px] object-cover" />
          </div>
          <div className="order-1 lg:order-2">
            <p className="text-[12px] tracking-[0.3em] uppercase text-black/50 mb-4">The Chef</p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.04em] leading-[1]">Discipline, Balance, And Respect For Ingredients</h2>
            <p className="mt-6 text-black/60 leading-relaxed max-w-xl">Our kitchen philosophy is simple: choose carefully, prepare precisely, and serve at the right moment. Every plate is shaped by restraint, technique, and respect for Japanese tradition.</p>

            <div className="mt-8">
              <p className="text-xl font-semibold">Chef Haruto Sato</p>
              <p className="text-sm text-black/50">Head Sushi Chef</p>
              <p className="mt-3 italic text-2xl tracking-tight" style={{ fontFamily: "Georgia, serif" }}>~ Haruto</p>
            </div>

            <div className="mt-8 grid sm:grid-cols-3 gap-3">
              {["Freshness First","Clean Technique","Seasonal Balance"].map((p) => (
                <div key={p} className="rounded-2xl border border-black/10 p-4 text-sm font-medium">{p}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* RESERVATION CTA */}
      <section id="reservations" className="py-24 sm:py-32 px-5 sm:px-8 lg:px-14 bg-[#050706]">
        <div className="max-w-7xl mx-auto relative rounded-[40px] overflow-hidden p-10 sm:p-16 lg:p-20">
          <img src={heroImg} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#050706]/90 via-[#0B1410]/85 to-[#050706]/90" />
          <div className="relative max-w-3xl">
            <p className="text-[12px] tracking-[0.3em] uppercase text-[#E46B3F] mb-4">Reservations</p>
            <h2 className="text-white text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.04em] leading-[1]">Book A Table Or Plan A Private Sushi Experience</h2>
            <p className="mt-5 text-white/70 max-w-xl leading-relaxed">Reserve your seat at the counter, schedule an omakase evening, or start planning a catered Japanese dining experience.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#contact" className="inline-flex items-center h-12 px-6 rounded-full bg-white text-black text-sm font-medium hover:-translate-y-0.5 transition">Book a Table</a>
              <a href="#catering" className="inline-flex items-center h-12 px-6 rounded-full border border-white/20 text-white text-sm font-medium hover:bg-white/10 transition">Plan Catering</a>
            </div>
            <div className="mt-10 grid sm:grid-cols-3 gap-4 text-sm text-white/70">
              <div>Open Tue — Sun</div>
              <div>Dinner 5 PM — 11 PM</div>
              <div>Private events available</div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="py-24 sm:py-32 px-5 sm:px-8 lg:px-14 bg-[#050706]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-[12px] tracking-[0.3em] uppercase text-[#97A36B] mb-4">Guest Notes</p>
            <h2 className="text-white text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.04em] leading-[1]">What Guests Say</h2>
          </div>
          <div className="mt-12 grid md:grid-cols-3 gap-5">
            {[
              { q: "The omakase was precise, calm, and unforgettable.", n: "Mika R.", i: "MR" },
              { q: "A beautiful catering experience with exceptional attention to detail.", n: "Daniel K.", i: "DK" },
              { q: "The atmosphere, service, and flavors felt truly premium.", n: "Laura M.", i: "LM" },
            ].map((t) => (
              <div key={t.n} className="rounded-[28px] border border-white/10 bg-white/[0.03] p-7 backdrop-blur">
                <div className="flex gap-1 text-[#E46B3F]">{[0,1,2,3,4].map((s) => <Star key={s} className="h-4 w-4 fill-current" />)}</div>
                <p className="mt-5 text-white text-lg leading-relaxed">"{t.q}"</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#B84A1E]/30 text-[#E46B3F] flex items-center justify-center text-xs font-semibold">{t.i}</div>
                  <div className="text-sm text-white/70">{t.n}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 sm:py-32 px-5 sm:px-8 lg:px-14 bg-[#F5F2EA] text-black">
        <div className="max-w-3xl mx-auto">
          <div className="text-center">
            <p className="text-[12px] tracking-[0.3em] uppercase text-black/50 mb-4">FAQ</p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.04em] leading-[1]">Common Questions</h2>
          </div>
          <div className="mt-12 space-y-3">
            {FAQS.map((f, i) => {
              const open = openFaq === i;
              return (
                <div key={i} className="rounded-2xl border border-black/10 bg-white overflow-hidden">
                  <button onClick={() => setOpenFaq(open ? null : i)} className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left">
                    <span className="font-medium text-base sm:text-lg">{f.q}</span>
                    {open ? <Minus className="h-4 w-4 shrink-0" /> : <Plus className="h-4 w-4 shrink-0" />}
                  </button>
                  {open && <div className="px-6 pb-5 text-sm text-black/60 leading-relaxed">{f.a}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-24 sm:py-32 px-5 sm:px-8 lg:px-14 bg-[#050706]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20">
          <div>
            <p className="text-[12px] tracking-[0.3em] uppercase text-[#97A36B] mb-4">Contact</p>
            <h2 className="text-white text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.04em] leading-[1]">Visit The Counter</h2>
            <p className="mt-5 text-[#B9BDB4] max-w-md">Book a table, ask about omakase, or plan a private Japanese dining experience.</p>
            <div className="mt-10 space-y-5 text-white/80">
              <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-[#E46B3F]" /> +1 808 555 0198</div>
              <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-[#E46B3F]" /> hello@sushix-ti.com</div>
              <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-[#E46B3F]" /> 28 Kyoto Lane, Downtown District</div>
              <div className="flex items-start gap-3"><Clock className="h-4 w-4 text-[#E46B3F] mt-1" /><div><div>Tuesday — Sunday</div><div className="text-white/60 text-sm">5:00 PM — 11:00 PM</div></div></div>
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); setFormSent(true); }} className="rounded-[34px] border border-white/10 bg-white/[0.03] backdrop-blur p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name"><input required className="form-i" /></Field>
            <Field label="Email"><input required type="email" className="form-i" /></Field>
            <Field label="Phone"><input className="form-i" /></Field>
            <Field label="Request Type">
              <select className="form-i">
                <option>Table Reservation</option><option>Omakase</option><option>Catering</option><option>Private Event</option>
              </select>
            </Field>
            <Field label="Preferred Date"><input type="date" className="form-i" /></Field>
            <Field label="Guest Count"><input type="number" min="1" className="form-i" /></Field>
            <div className="sm:col-span-2"><Field label="Message"><textarea rows={4} className="form-i resize-none" /></Field></div>
            <div className="sm:col-span-2 flex items-center justify-between gap-4 mt-2">
              {formSent ? <p className="text-sm text-emerald-400">Request received. Our team will contact you soon.</p> : <span />}
              <button className="h-12 px-7 rounded-full bg-white text-black text-sm font-medium hover:-translate-y-0.5 transition">Send Request</button>
            </div>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#030403] pt-20 pb-10 px-5 sm:px-8 lg:px-14">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-4 gap-10">
          <div className="lg:col-span-1">
            <div className="text-white font-black tracking-[-0.02em] text-xl">SUSHI <span className="text-[#E46B3F]">X</span> TI</div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/40 mt-2">Japanese Restaurant & Catering</p>
            <p className="mt-5 text-sm text-white/55 leading-relaxed max-w-xs">A refined sushi experience shaped by seasonal ingredients, traditional technique, and modern hospitality.</p>
          </div>
          <FooterCol title="Navigation" items={["About Us","Menu","Omakase","Catering","Gallery"]} />
          <FooterCol title="Experience" items={["Sushi Counter","Private Dining","Omakase","Events"]} />
          <FooterCol title="Contact" items={["+1 808 555 0198","hello@sushix-ti.com","28 Kyoto Lane","Tue — Sun · 5–11 PM"]} />
        </div>
        <div className="max-w-7xl mx-auto mt-14 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <p>© 2026 SUSHI X TI. All rights reserved.</p>
          <div className="flex gap-6"><a href="#" className="hover:text-white">Privacy Policy</a><a href="#" className="hover:text-white">Terms of Service</a></div>
        </div>
      </footer>

      {/* Sticky mobile reserve */}
      <a href="#contact" className="lg:hidden fixed bottom-4 left-4 right-4 z-40 h-12 rounded-full bg-white text-black text-sm font-medium flex items-center justify-center shadow-2xl">Reserve</a>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-[#050706]/97 backdrop-blur-xl flex flex-col p-6 animate-[fadeUp_0.3s_ease-out]">
          <div className="flex items-center justify-between">
            <div className="text-white font-black tracking-[-0.02em] text-lg">SUSHI <span className="text-[#E46B3F]">X</span> TI</div>
            <button aria-label="Close" onClick={() => setMobileOpen(false)} className="h-11 w-11 rounded-full border border-white/10 flex items-center justify-center text-white"><X className="h-5 w-5" /></button>
          </div>
          <nav className="mt-12 flex flex-col gap-5">
            {FULL_NAV.map((n) => (
              <a key={n.label} href={n.href} onClick={() => setMobileOpen(false)} className="text-white text-3xl font-semibold tracking-tight">{n.label}</a>
            ))}
          </nav>
          <a href="#contact" onClick={() => setMobileOpen(false)} className="mt-auto h-12 rounded-full bg-white text-black flex items-center justify-center font-medium">Contact Us</a>
        </div>
      )}

      {/* SEARCH OVERLAY */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-[#050706]/85 backdrop-blur-lg flex items-start justify-center pt-32 px-6" onClick={() => setSearchOpen(false)}>
          <div className="w-full max-w-xl" onClick={(e) => e.stopPropagation()}>
            <div className="rounded-2xl border border-white/10 bg-[#111A16] p-2 flex items-center gap-2">
              <Search className="h-5 w-5 text-white/50 ml-3" />
              <input autoFocus placeholder="Search menu, omakase, catering..." className="flex-1 bg-transparent text-white placeholder-white/40 px-2 py-3 outline-none" />
              <button onClick={() => setSearchOpen(false)} className="h-10 w-10 flex items-center justify-center text-white/60"><X className="h-4 w-4" /></button>
            </div>
            <div className="mt-3 rounded-2xl border border-white/10 bg-[#111A16] divide-y divide-white/5">
              {["Salmon Nigiri","Omakase","Private Catering","Reservations"].map((s) => (
                <a key={s} href="#menu" onClick={() => setSearchOpen(false)} className="block px-5 py-3 text-sm text-white/80 hover:bg-white/5">{s}</a>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes heroZoom { from { transform: scale(1.06);} to { transform: scale(1);} }
        @keyframes fadeUp { from { opacity:0; transform: translateY(18px);} to { opacity:1; transform: translateY(0);} }
        .form-i { width:100%; height:46px; border-radius:12px; background: rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); color:#fff; padding: 0 14px; font-size: 14px; outline:none; transition: border-color .2s; }
        .form-i:focus { border-color: rgba(228,107,63,0.6); }
        textarea.form-i { padding: 12px 14px; height:auto; }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.2em] text-white/50">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function FooterCol({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="text-white font-semibold text-sm">{title}</h4>
      <ul className="mt-4 space-y-2.5 text-sm text-white/55">
        {items.map((i) => <li key={i}><a href="#" className="hover:text-white transition">{i}</a></li>)}
      </ul>
    </div>
  );
}
