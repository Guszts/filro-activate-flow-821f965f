import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Phone, Mail, MapPin, Clock, Menu, X, ChevronDown, ArrowRight, ArrowLeft,
  Check, Plus, Minus, Star, Wrench, Hammer, Search, Home, Droplets, Zap,
  Shield, Award, Users, Clipboard, Facebook, Instagram, Linkedin, Youtube,
} from "lucide-react";
import heroImg from "@/assets/roofpro-hero.jpg";
import aboutImg from "@/assets/roofpro-about.jpg";
import crewImg from "@/assets/roofpro-crew.jpg";
import ctaImg from "@/assets/roofpro-cta.jpg";

export const Route = createFileRoute("/dev/preview/prestador-servico")({
  component: RoofProSite,
  head: () => ({
    meta: [
      { title: "RoofPro · Affordable & reliable roofing services" },
      { name: "description", content: "RoofPro — residential and commercial roofing. Repair, replacement, inspection and emergency roofing." },
    ],
  }),
});

const C = {
  white: "#FFFFFF", off: "#FAFAFA", soft: "#F6F6F4",
  ink: "#101010", inkSoft: "#1F1F1F", muted: "#6F6F6F",
  border: "#E9E9E6", orange: "#E64012", orangeDark: "#C9340E", pale: "#F2B29D",
};

const NAV = [
  { label: "Home", href: "#home" },
  { label: "About Us", href: "#about" },
  { label: "Project", href: "#project", hasDropdown: true },
  { label: "Service", href: "#service" },
  { label: "Blog", href: "#process" },
  { label: "Contact Us", href: "#contact" },
];

const SERVICES = [
  { I: Wrench, t: "Roof Repair", d: "Fast leak fixes, shingle replacement, and storm damage repair done right." },
  { I: Hammer, t: "Roof Replacement", d: "Full roof replacement with durable materials and clean worksite handling." },
  { I: Search, t: "Roof Inspection", d: "Thorough inspections with detailed reports and honest recommendations." },
  { I: Home, t: "Roof Installation", d: "New roofing systems installed by a licensed and insured crew." },
  { I: Droplets, t: "Gutter Services", d: "Gutter cleaning, repair, and full replacement to protect your home." },
  { I: Zap, t: "Emergency Roofing", d: "Urgent response for leaks, storm damage, and unsafe roof conditions." },
];

const FEATURES = [
  { t: "Licensed Roofing Team", d: "Experienced, insured, and certified crew." },
  { t: "Durable Materials", d: "Top-rated shingles, metal, and flat systems." },
  { t: "Clear Project Timeline", d: "You always know what comes next." },
  { t: "Honest Inspection Reports", d: "Transparent scope and pricing." },
  { t: "Residential & Commercial", d: "Roofing for homes and businesses." },
  { t: "Clean Worksite Promise", d: "We leave your property spotless." },
];

const STEPS = [
  { n: "01", t: "Free Roof Inspection", d: "We inspect your roof and identify damage, leaks, or aging materials." },
  { n: "02", t: "Clear Estimate", d: "You receive a detailed scope of work before the project begins." },
  { n: "03", t: "Roof Repair or Replacement", d: "Our crew completes the work using safe methods and reliable materials." },
  { n: "04", t: "Final Quality Check", d: "We review the completed roof and clean the work area before handoff." },
];

const PROJECTS = [
  { t: "Residential Roof Replacement", c: "Shingle", img: "https://images.unsplash.com/photo-1632759145355-3f3631a2faa2?auto=format&fit=crop&w=900&q=80" },
  { t: "Metal Roof Installation", c: "Metal", img: "https://images.unsplash.com/photo-1605152276897-4f618f831968?auto=format&fit=crop&w=900&q=80" },
  { t: "Storm Damage Repair", c: "Repair", img: "https://images.unsplash.com/photo-1591588582259-e675bd2e6088?auto=format&fit=crop&w=900&q=80" },
  { t: "Gutter Replacement", c: "Gutter", img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=900&q=80" },
  { t: "Shingle Roof Upgrade", c: "Upgrade", img: "https://images.unsplash.com/photo-1503594384566-461fe158e797?auto=format&fit=crop&w=900&q=80" },
  { t: "Commercial Flat Roof", c: "Commercial", img: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=900&q=80" },
];

const TESTIMONIALS = [
  { t: "RoofPro replaced our old roof quickly and kept everything clean. The estimate was clear and the crew was professional.", n: "Sarah Mitchell", l: "Austin, TX" },
  { t: "They repaired a leak that two other companies could not fix. Very reliable team.", n: "Daniel Cooper", l: "Round Rock, TX" },
  { t: "Great communication from inspection to final walkthrough. The new roof looks excellent.", n: "Emily Johnson", l: "Cedar Park, TX" },
];

const FAQS = [
  { q: "How do I know if my roof needs repair?", a: "Common signs include leaks, missing shingles, sagging areas, water stains, and visible storm damage." },
  { q: "Do you provide roof inspections?", a: "Yes. We provide roof inspections to assess damage, aging materials, and repair needs." },
  { q: "How long does a roof replacement take?", a: "Most residential roof replacements can be completed within a few days depending on roof size, materials, and weather." },
  { q: "What roofing materials do you use?", a: "We work with asphalt shingles, metal roofing, flat roofing systems, and other durable materials." },
  { q: "Do you offer emergency roofing service?", a: "Yes. Emergency support is available for urgent leaks, storm damage, and safety concerns." },
  { q: "Do you handle both residential and commercial roofs?", a: "Yes. RoofPro provides roofing services for homes and selected commercial properties." },
];

const ABOUT_CARDS = [
  { t: "Our Mission", d: "With years of experience in the industry, our team of skilled professionals is dedicated to delivering top-quality roofing solutions that are not only durable but also enhance the safety and value of your home." },
  { t: "Our Vision", d: "To be the most trusted local roofing partner — known for craftsmanship, honesty, and roofs that last decades." },
  { t: "Our Value", d: "Quality work, clear pricing, and reliable communication on every project, big or small." },
];

function Logo({ dark = false }: { dark?: boolean }) {
  const color = dark ? "#FFFFFF" : C.ink;
  return (
    <a href="#home" className="flex items-center gap-2.5">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M4 18 L16 6 L28 18 L25 18 L16 9 L7 18 Z" fill={color} />
        <path d="M9 18 L9 26 L14 26 L14 21 L18 21 L18 26 L23 26 L23 18" stroke={color} strokeWidth="2.5" fill="none" strokeLinejoin="round" />
      </svg>
      <span className="text-[24px] font-bold tracking-tight" style={{ color }}>RoofPro</span>
    </a>
  );
}

function RoofProSite() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(0);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on);
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);

  return (
    <div id="home" className="min-h-screen w-full overflow-x-hidden" style={{ background: C.white, color: C.ink, fontFamily: "'Inter', 'Manrope', system-ui" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@500;600;700;800&display=swap');
        .heading{font-family:'Manrope','Inter',system-ui;letter-spacing:-0.045em;}
      `}</style>

      {/* HEADER */}
      <header className={`sticky top-0 z-40 bg-white transition-shadow ${scrolled ? "shadow-sm" : ""}`}>
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8 h-[80px] lg:h-[88px] flex items-center justify-between gap-4">
          <Logo />
          <nav className="hidden lg:flex items-center gap-8 text-[14px] font-medium" style={{ color: C.ink }}>
            {NAV.map((n) => (
              <a key={n.label} href={n.href} className="flex items-center gap-1 hover:text-[color:var(--o)] transition-colors" style={{ ["--o" as any]: C.orange }}>
                {n.label}{n.hasDropdown && <ChevronDown className="w-3.5 h-3.5" />}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <a href="tel:+1234567890" className="hidden sm:inline-flex items-center gap-2 h-12 px-6 rounded-md font-bold text-white text-sm hover:-translate-y-0.5 transition-all" style={{ background: C.orange }}>
              <Phone className="w-4 h-4" /> +123 456 7890
            </a>
            <button onClick={() => setMenuOpen(true)} aria-label="Menu" className="lg:hidden w-11 h-11 rounded-md flex items-center justify-center hover:bg-gray-100">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "tween" }} className="fixed inset-0 z-50 bg-white p-6 lg:hidden">
            <div className="flex justify-between items-center mb-8"><Logo /><button onClick={() => setMenuOpen(false)} aria-label="Close"><X className="w-6 h-6" /></button></div>
            <nav className="flex flex-col gap-5 text-2xl font-bold heading">
              {NAV.map((n) => <a key={n.label} href={n.href} onClick={() => setMenuOpen(false)}>{n.label}</a>)}
            </nav>
            <a href="tel:+1234567890" className="mt-8 flex items-center justify-center gap-2 h-12 rounded-md font-bold text-white" style={{ background: C.orange }}>
              <Phone className="w-4 h-4" /> +123 456 7890
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO */}
      <section className="pt-6 pb-20 lg:pb-32" style={{ background: C.white }}>
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9 }}
            className="relative rounded-[28px] lg:rounded-[34px] overflow-hidden" style={{ height: "min(680px, 80vh)", minHeight: 560 }}>
            <img src={heroImg} alt="Professional roofer on roof" className="absolute inset-0 w-full h-full object-cover" width={1536} height={1024} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

            {/* Slider arrows */}
            <div className="absolute right-5 lg:right-8 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-20">
              <motion.button initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} aria-label="Next" className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg hover:-translate-y-0.5 transition-all" style={{ background: C.orange }}>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              <motion.button initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }} aria-label="Previous" className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-black shadow-lg hover:-translate-y-0.5 transition-all">
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Overlay card */}
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
              className="absolute bg-white shadow-2xl rounded-md lg:rounded-lg"
              style={{
                left: "max(16px, 5%)", right: "max(16px, 7%)", bottom: "max(20px, 8%)",
                padding: "clamp(24px, 4vw, 56px)",
              }}>
              <div className="grid lg:grid-cols-[62%_38%] gap-6 lg:gap-10 items-center">
                <div>
                  <div className="text-[11px] lg:text-[13px] font-bold uppercase tracking-[0.12em] mb-3" style={{ color: C.orange }}>
                    Affordable Reliable and Built to Last
                  </div>
                  <h1 className="heading font-semibold text-[36px] sm:text-[48px] lg:text-[64px] xl:text-[72px] leading-[1.02]" style={{ color: C.ink }}>
                    Strong Durable and<br />Affordable Roofing
                  </h1>
                </div>
                <div>
                  <p className="text-[15px] lg:text-[16px] leading-[1.65] max-w-[360px]" style={{ color: C.muted }}>
                    When it comes to protecting your home, your roof is the first line of defense. We provide matching weather designed to refine and last.
                  </p>
                  <a href="#contact" className="mt-5 inline-flex items-center gap-2 h-[52px] px-7 rounded-[4px] text-white font-bold text-[13px] uppercase tracking-wider hover:-translate-y-0.5 transition-all" style={{ background: C.orange }}>
                    Schedule Your Roof Repair <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-20 lg:py-28" style={{ background: C.white }}>
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8 grid lg:grid-cols-[1.1fr_0.9fr_1fr] gap-10 lg:gap-14 items-center">
          {/* Left text */}
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="text-[12px] font-bold uppercase tracking-[0.12em] mb-4" style={{ color: C.pale }}>About Us</div>
            <h2 className="heading text-[34px] sm:text-[44px] lg:text-[50px] font-semibold leading-[1.1]" style={{ color: C.ink }}>
              Transforming Homes with Quality Roofing Solutions
            </h2>
            <p className="mt-5 text-[15px] leading-[1.7]" style={{ color: C.muted }}>
              From repairs to full roof replacements, we treat each home as our own, providing personalized solutions tailored to meet the unique needs of our clients.
            </p>
            <a href="#service" className="mt-7 inline-flex items-center gap-2 h-12 px-7 rounded-[4px] text-white font-bold text-[12px] uppercase tracking-wider hover:-translate-y-0.5 transition-all" style={{ background: C.orange }}>
              Learn More <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>

          {/* Center image */}
          <motion.div initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
            className="rounded-md overflow-hidden shadow-lg hidden lg:block" style={{ height: 380 }}>
            <img src={aboutImg} alt="Roof installation" className="w-full h-full object-cover" loading="lazy" />
          </motion.div>

          {/* Accordion */}
          <div className="space-y-3">
            {ABOUT_CARDS.map((c, i) => {
              const active = aboutOpen === i;
              return (
                <motion.button key={c.t} onClick={() => setAboutOpen(i)} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="w-full text-left rounded-lg overflow-hidden transition-all"
                  style={{
                    background: active ? C.orange : C.white,
                    color: active ? C.white : C.ink,
                    border: `1px solid ${active ? C.orange : C.border}`,
                    padding: active ? "26px 28px" : "22px 24px",
                    boxShadow: active ? "0 12px 32px rgba(230,64,18,0.25)" : "0 2px 8px rgba(0,0,0,0.04)",
                  }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="font-bold text-[18px]">{c.t}</div>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: active ? "#FFFFFF" : C.soft, color: active ? C.orange : C.ink }}>
                      {active ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </div>
                  </div>
                  <AnimatePresence>
                    {active && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <p className="mt-3 text-[14px] leading-[1.65] opacity-95">{c.d}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="service" className="py-20 lg:py-28" style={{ background: C.soft }}>
        <div className="max-w-[1180px] mx-auto px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-[12px] font-bold uppercase tracking-[0.12em] mb-3" style={{ color: C.orange }}>Our Service</div>
            <h2 className="heading text-[36px] sm:text-[48px] font-semibold leading-[1.1]" style={{ color: C.ink }}>
              Protect Your Home with<br />Our Roofing Services
            </h2>
            <p className="mt-4 text-[15px]" style={{ color: C.muted }}>
              Reliable roof repair, replacement, inspection, and maintenance services designed to keep your property safe in every season.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SERVICES.map((s, i) => (
              <motion.div key={s.t} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className="group bg-white rounded-lg p-8 border hover:-translate-y-1.5 hover:shadow-xl transition-all" style={{ borderColor: C.border }}>
                <div className="w-14 h-14 rounded-md flex items-center justify-center mb-5 group-hover:scale-110 transition-transform" style={{ background: "#FFE6DC" }}>
                  <s.I className="w-6 h-6" style={{ color: C.orange }} />
                </div>
                <h3 className="font-bold text-[20px] heading mb-2" style={{ color: C.ink }}>{s.t}</h3>
                <p className="text-[14px] leading-[1.65]" style={{ color: C.muted }}>{s.d}</p>
                <a href="#contact" className="mt-5 inline-flex items-center gap-1 text-[12px] font-bold uppercase tracking-wider" style={{ color: C.orange }}>
                  Read More <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="py-20 lg:py-28" style={{ background: C.white }}>
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="rounded-2xl overflow-hidden">
            <img src={crewImg} alt="Roofing crew" className="w-full h-[520px] object-cover" loading="lazy" />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="text-[12px] font-bold uppercase tracking-[0.12em] mb-3" style={{ color: C.orange }}>Why Choose Us</div>
            <h2 className="heading text-[34px] sm:text-[44px] font-semibold leading-[1.1]" style={{ color: C.ink }}>
              Roofing Work Built Around Trust, Safety, and Durability
            </h2>
            <p className="mt-4 text-[15px]" style={{ color: C.muted }}>
              We combine skilled workmanship, reliable materials, clear communication, and local experience to deliver roofing solutions that last.
            </p>
            <div className="mt-7 grid sm:grid-cols-2 gap-4">
              {FEATURES.map((f) => (
                <div key={f.t} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "#FFE6DC" }}>
                    <Check className="w-4 h-4" style={{ color: C.orange }} />
                  </div>
                  <div>
                    <div className="font-bold text-[15px]" style={{ color: C.ink }}>{f.t}</div>
                    <div className="text-[13px]" style={{ color: C.muted }}>{f.d}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4 pt-6 border-t" style={{ borderColor: C.border }}>
              {[{ v: "15+", l: "Years Experience" }, { v: "2.4K+", l: "Roofs Completed" }, { v: "98%", l: "Client Satisfaction" }].map((m) => (
                <div key={m.l}>
                  <div className="heading font-bold text-3xl lg:text-4xl" style={{ color: C.orange }}>{m.v}</div>
                  <div className="text-[12px] mt-1" style={{ color: C.muted }}>{m.l}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* PROCESS */}
      <section id="process" className="py-20 lg:py-28" style={{ background: C.soft }}>
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-[12px] font-bold uppercase tracking-[0.12em] mb-3" style={{ color: C.orange }}>Our Process</div>
            <h2 className="heading text-[36px] sm:text-[44px] font-semibold leading-[1.1]" style={{ color: C.ink }}>
              Simple Roofing Process From Inspection To Completion
            </h2>
          </div>
          <div className="relative grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="hidden lg:block absolute top-12 left-[12%] right-[12%] h-px border-t border-dashed" style={{ borderColor: C.border }} />
            {STEPS.map((s, i) => (
              <motion.div key={s.n} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="relative bg-white rounded-lg p-7 border" style={{ borderColor: C.border }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-sm mb-5 relative z-10" style={{ background: C.orange }}>{s.n}</div>
                <h3 className="font-bold text-[18px] heading mb-2" style={{ color: C.ink }}>{s.t}</h3>
                <p className="text-[14px] leading-[1.6]" style={{ color: C.muted }}>{s.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      <section id="project" className="py-20 lg:py-28" style={{ background: C.white }}>
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-[12px] font-bold uppercase tracking-[0.12em] mb-3" style={{ color: C.orange }}>Recent Projects</div>
            <h2 className="heading text-[36px] sm:text-[44px] font-semibold" style={{ color: C.ink }}>Roofing Projects Completed With Care</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PROJECTS.map((p, i) => (
              <motion.a key={p.t} href="#contact" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="group relative rounded-lg overflow-hidden block aspect-[4/3]">
                <img src={p.img} alt={p.t} loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white flex items-end justify-between">
                  <div>
                    <div className="text-[11px] uppercase tracking-wider opacity-80">{p.c}</div>
                    <div className="font-bold text-[18px] heading mt-1">{p.t}</div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center group-hover:bg-[color:var(--o)] transition-colors" style={{ ["--o" as any]: C.orange }}>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 lg:py-28" style={{ background: C.soft }}>
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-[12px] font-bold uppercase tracking-[0.12em] mb-3" style={{ color: C.orange }}>Testimonials</div>
            <h2 className="heading text-[36px] sm:text-[44px] font-semibold" style={{ color: C.ink }}>What Homeowners Say About RoofPro</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.n} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white rounded-lg p-7 border shadow-sm" style={{ borderColor: C.border }}>
                <div className="flex gap-1 mb-4">{[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-4 h-4 fill-current" style={{ color: C.orange }} />)}</div>
                <p className="text-[15px] leading-[1.7] mb-6" style={{ color: C.inkSoft }}>"{t.t}"</p>
                <div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor: C.border }}>
                  <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-white" style={{ background: C.orange }}>{t.n[0]}</div>
                  <div>
                    <div className="font-bold text-[14px]">{t.n}</div>
                    <div className="text-[12px]" style={{ color: C.muted }}>{t.l}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-12 lg:py-20" style={{ background: C.white }}>
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
          <div className="relative rounded-2xl overflow-hidden p-10 lg:p-16 text-center">
            <img src={ctaImg} alt="Roof at dusk" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-black/70" />
            <div className="relative text-white max-w-2xl mx-auto">
              <h2 className="heading text-[32px] sm:text-[44px] font-semibold leading-[1.1]">Need Roof Repair or Replacement?</h2>
              <p className="mt-4 opacity-90 text-[15px]">Schedule a professional roof inspection and get a clear estimate for your home.</p>
              <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
                <a href="#contact" className="inline-flex items-center justify-center gap-2 h-13 px-8 py-3.5 rounded-md font-bold text-white text-[12px] uppercase tracking-wider" style={{ background: C.orange }}>
                  Schedule Roof Repair <ArrowRight className="w-4 h-4" />
                </a>
                <a href="tel:+1234567890" className="inline-flex items-center justify-center gap-2 h-13 px-8 py-3.5 rounded-md font-bold text-black bg-white text-[12px] uppercase tracking-wider">
                  <Phone className="w-4 h-4" /> Call +123 456 7890
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 lg:py-28" style={{ background: C.white }}>
        <div className="max-w-3xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <div className="text-[12px] font-bold uppercase tracking-[0.12em] mb-3" style={{ color: C.orange }}>FAQ</div>
            <h2 className="heading text-[36px] sm:text-[44px] font-semibold" style={{ color: C.ink }}>Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((f, i) => {
              const active = faqOpen === i;
              return (
                <div key={i} className="rounded-lg overflow-hidden border transition-all" style={{ borderColor: active ? C.orange : C.border, background: active ? C.orange : C.white, color: active ? "white" : C.ink }}>
                  <button onClick={() => setFaqOpen(active ? null : i)} className="w-full p-5 flex items-center justify-between text-left">
                    <span className="font-bold heading text-[16px] pr-4">{f.q}</span>
                    <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: active ? "white" : C.soft, color: active ? C.orange : C.ink }}>
                      {active ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </span>
                  </button>
                  <AnimatePresence>
                    {active && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="px-5 pb-5 text-[14px] opacity-95">{f.a}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-20 lg:py-28" style={{ background: C.soft }}>
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8 grid lg:grid-cols-2 gap-12">
          <div>
            <div className="text-[12px] font-bold uppercase tracking-[0.12em] mb-3" style={{ color: C.orange }}>Contact Us</div>
            <h2 className="heading text-[36px] sm:text-[44px] font-semibold" style={{ color: C.ink }}>Schedule Your Roof Repair</h2>
            <p className="mt-4 text-[15px]" style={{ color: C.muted }}>
              Tell us about your roofing issue and our team will contact you to arrange an inspection or estimate.
            </p>
            <div className="mt-8 space-y-4">
              {[
                { I: Phone, l: "Phone", v: "+123 456 7890" },
                { I: Mail, l: "Email", v: "hello@roofpro.com" },
                { I: MapPin, l: "Address", v: "128 Roofing Avenue, Austin, TX" },
                { I: Clock, l: "Hours", v: "Mon — Sat: 8:00 AM — 6:00 PM" },
              ].map((c) => (
                <div key={c.l} className="flex gap-4 items-start">
                  <div className="w-11 h-11 rounded-md flex items-center justify-center shrink-0" style={{ background: "#FFE6DC" }}><c.I className="w-5 h-5" style={{ color: C.orange }} /></div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wider font-bold" style={{ color: C.muted }}>{c.l}</div>
                    <div className="font-semibold mt-0.5" style={{ color: C.ink }}>{c.v}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="rounded-xl p-7 lg:p-9 shadow-lg" style={{ background: C.white }}>
            {sent ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4" style={{ background: "#FFE6DC" }}>
                  <Check className="w-7 h-7" style={{ color: C.orange }} />
                </div>
                <h3 className="heading font-bold text-2xl">Request received</h3>
                <p className="mt-2" style={{ color: C.muted }}>Our team will contact you shortly.</p>
              </div>
            ) : (
              <>
                <h3 className="heading font-bold text-2xl mb-6">Request your free estimate</h3>
                <div className="space-y-4">
                  {[
                    { l: "Full Name", t: "text" },
                    { l: "Phone Number", t: "tel" },
                    { l: "Email Address", t: "email" },
                  ].map((f) => (
                    <div key={f.l}>
                      <label className="text-[13px] font-semibold mb-1.5 block">{f.l}</label>
                      <input type={f.t} required className="w-full h-12 rounded-md px-4 outline-none text-[14px] focus:ring-2" style={{ background: C.soft, ["--tw-ring-color" as any]: C.orange }} />
                    </div>
                  ))}
                  <div>
                    <label className="text-[13px] font-semibold mb-1.5 block">Service Needed</label>
                    <select className="w-full h-12 rounded-md px-4 outline-none text-[14px]" style={{ background: C.soft }}>
                      <option>Roof Repair</option><option>Roof Replacement</option><option>Roof Inspection</option><option>Gutter Services</option><option>Emergency Roofing</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[13px] font-semibold mb-1.5 block">Message</label>
                    <textarea rows={4} required className="w-full rounded-md px-4 py-3 outline-none text-[14px]" style={{ background: C.soft }} />
                  </div>
                  <button type="submit" className="w-full h-13 py-3.5 rounded-md text-white font-bold text-[12px] uppercase tracking-wider hover:-translate-y-0.5 transition-all" style={{ background: C.orange }}>
                    Send Request
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="pt-16 pb-8" style={{ background: C.ink, color: "white" }}>
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8 grid lg:grid-cols-4 gap-10">
          <div>
            <Logo dark />
            <p className="mt-4 text-sm text-gray-400 max-w-xs">Affordable, reliable, and durable roofing services for homes and businesses.</p>
            <div className="mt-5 flex gap-2">
              {[Facebook, Instagram, Youtube, Linkedin].map((I, i) => (
                <a key={i} href="#" aria-label="social" className="w-9 h-9 rounded-md bg-white/10 hover:bg-[color:var(--o)] flex items-center justify-center transition-colors" style={{ ["--o" as any]: C.orange }}><I className="w-4 h-4" /></a>
              ))}
            </div>
          </div>
          {[
            { t: "Navigation", l: ["Home", "About Us", "Project", "Service", "Blog", "Contact Us"] },
            { t: "Services", l: ["Roof Repair", "Roof Replacement", "Roof Inspection", "Gutter Services"] },
            { t: "Contact", l: ["+123 456 7890", "hello@roofpro.com", "128 Roofing Ave, Austin TX", "Mon — Sat: 8AM — 6PM"] },
          ].map((col) => (
            <div key={col.t}>
              <div className="font-bold heading mb-4">{col.t}</div>
              <ul className="space-y-2.5 text-sm text-gray-400">
                {col.l.map((li) => <li key={li}><a href="#" className="hover:text-white transition-colors">{li}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8 mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-3 justify-between text-sm text-gray-500">
          <div>© 2026 RoofPro. All rights reserved.</div>
          <div className="flex gap-5"><a href="#" className="hover:text-white">Privacy Policy</a><a href="#" className="hover:text-white">Terms of Service</a></div>
        </div>
      </footer>
    </div>
  );
}
