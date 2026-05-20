import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import clinicEyeHero from "@/assets/clinic-eye-hero.jpg";

export const Route = createFileRoute("/dev/preview/clinica-local")({
  component: ClinicaPreview,
  head: () => ({
    meta: [
      { title: "eye surgeons · Saving Eyes, Changing Lives" },
      { name: "description", content: "Premium ophthalmology care — cataract, corneal and laser vision treatments delivered by fellowship-trained surgeons." },
    ],
  }),
});

// ---------------- Theme ----------------
const C = {
  bg: "#000000",
  ink: "#050505",
  card: "#111111",
  cardDeep: "#161616",
  paper: "#F7F7F2",
  soft: "#E8E5DF",
  muted: "#9A9893",
  deep: "#4A4A46",
  beige: "#C5A47E",
  border: "rgba(255,255,255,0.14)",
};

// ---------------- Assets (with fallbacks) ----------------
const HERO_EYE = clinicEyeHero;
const HERO_EYE_FB = clinicEyeHero;

const SURGEONS = [
  {
    id: "mckelvie",
    name: "Dr James McKelvie",
    specialty: "Corneal & Cataract Surgeon",
    bio: "Focused on advanced cataract, corneal, and anterior segment care.",
    photo: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "hart",
    name: "Dr Amelia Hart",
    specialty: "Refractive Surgery Specialist",
    bio: "Specialises in vision correction consultations and laser treatment pathways.",
    photo: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "clarke",
    name: "Dr Ethan Clarke",
    specialty: "Retinal & Diagnostic Specialist",
    bio: "Leads detailed diagnostic assessments and retinal care planning.",
    photo: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=900&q=80",
  },
];

const PROCEDURES = [
  { t: "Cataract Surgery", d: "Modern cataract treatment designed to restore clarity and improve everyday vision." },
  { t: "Corneal Surgery", d: "Specialist care for corneal conditions using advanced surgical techniques." },
  { t: "Laser Vision Correction", d: "Personalised assessment and treatment options for reducing dependence on glasses." },
  { t: "Glaucoma Management", d: "Ongoing monitoring and treatment planning to protect long-term eye health." },
  { t: "Retinal Assessment", d: "Detailed imaging and assessment for retinal symptoms and risk factors." },
  { t: "Dry Eye Treatment", d: "Targeted treatment pathways for irritation, discomfort, and unstable tear film." },
];

const REASONS = [
  "Expert Surgical Team",
  "State-of-the-Art Equipment",
  "Tailored Patient Care",
  "Trusted Clinical Pathways",
  "Modern Comfortable Facilities",
  "Seamless Consultation Process",
];

const METRICS = [
  { n: "20+", l: "Years Experience" },
  { n: "10,000+", l: "Procedures Supported" },
  { n: "98%", l: "Patient Satisfaction" },
];

const TECH = [
  { t: "High-Resolution Imaging", d: "Detailed scans help identify subtle changes and guide treatment decisions." },
  { t: "Laser-Assisted Precision", d: "Advanced tools support accurate planning and careful procedural execution." },
  { t: "Comprehensive Diagnostics", d: "A complete assessment helps create a clearer picture of your eye health." },
  { t: "Recovery Planning", d: "Treatment plans include guidance for preparation, aftercare, and follow-up." },
];

const TESTIMONIALS = [
  { name: "Margaret L.", treatment: "Cataract Surgery", quote: "The team explained everything clearly. I felt informed, calm, and supported throughout the entire process." },
  { name: "Daniel R.", treatment: "Corneal Consultation", quote: "The consultation was thorough and professional. I left with a clear understanding of my options." },
  { name: "Helen S.", treatment: "Vision Assessment", quote: "The clinic felt modern, calm, and highly organised. Every step was handled with care." },
];

const FAQS = [
  { q: "How do I know which procedure is right for me?", a: "Your surgeon will assess your eye health, symptoms, imaging results, and personal goals before recommending suitable treatment options." },
  { q: "What happens during my first consultation?", a: "Your first visit usually includes a detailed history, diagnostic testing, imaging, and a discussion of possible treatment pathways." },
  { q: "Is cataract surgery painful?", a: "Most patients report minimal discomfort. Your care team will explain the process, anaesthetic approach, and aftercare before treatment." },
  { q: "How long is recovery?", a: "Recovery depends on the procedure and your individual condition. Your surgeon will provide specific instructions and follow-up timing." },
  { q: "Do you offer payment plans?", a: "The clinic team can explain available payment options during your consultation or booking process." },
  { q: "Can I return to normal activities quickly?", a: "Many patients return to light daily activities soon after treatment, but timelines vary by procedure and clinical advice." },
];

const NAV = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "procedures", label: "Procedures" },
  { id: "surgeons", label: "Surgeons" },
  { id: "technology", label: "Technology" },
  { id: "testimonials", label: "Testimonials" },
  { id: "faq", label: "FAQ" },
  { id: "contact", label: "Contact" },
];

// ---------------- Small UI primitives ----------------
function ArrowCircle({ light = false, size = 32 }: { light?: boolean; size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full transition-transform"
      style={{
        width: size, height: size,
        background: light ? "#FFFFFF" : "#050505",
        color: light ? "#050505" : "#FFFFFF",
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    </span>
  );
}

function PillButton({ children, dark = false, onClick }: { children: React.ReactNode; dark?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group inline-flex items-center gap-3 pl-5 pr-1.5 rounded-full text-sm font-medium transition-all hover:-translate-y-0.5"
      style={{
        height: 48,
        background: dark ? "#050505" : "#FFFFFF",
        color: dark ? "#FFFFFF" : "#050505",
        boxShadow: dark ? "none" : "0 8px 24px rgba(0,0,0,0.18)",
        border: dark ? "1px solid rgba(255,255,255,0.18)" : "1px solid rgba(0,0,0,0.05)",
      }}
    >
      <span>{children}</span>
      <ArrowCircle light={dark} size={36} />
    </button>
  );
}

function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <span
      className="inline-block text-[11px] tracking-[0.22em] uppercase font-medium mb-5"
      style={{ color: light ? C.muted : C.deep }}
    >
      {children}
    </span>
  );
}

// ---------------- Component ----------------
export function ClinicaPreview() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [surgeonIdx, setSurgeonIdx] = useState(0);
  const [active, setActive] = useState("home");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [sent, setSent] = useState(false);
  const [showFloat, setShowFloat] = useState(false);

  const surgeon = SURGEONS[surgeonIdx];

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const onScroll = () => {
      setShowFloat(window.scrollY > 700);
      // active section
      let cur = "home";
      for (const item of NAV) {
        const el = sectionRefs.current[item.id];
        if (el && el.getBoundingClientRect().top < 160) cur = item.id;
      }
      setActive(cur);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div style={{ background: C.bg, color: "#fff", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }} className="min-h-screen overflow-x-hidden">
      {/* ============ HERO ============ */}
      <section
        id="home"
        ref={(el) => { sectionRefs.current.home = el; }}
        className="relative"
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative mx-auto overflow-hidden"
          style={{
            width: "calc(100% - 24px)",
            maxWidth: 1360,
            marginTop: 16,
            marginBottom: 64,
            borderRadius: 28,
            minHeight: 520,
            boxShadow: "0 60px 120px rgba(0,0,0,0.55), 0 0 80px rgba(90,52,36,0.25)",
          }}
        >
          {/* Background eye image */}
          <motion.img
            src={HERO_EYE}
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = HERO_EYE_FB; }}
            alt="Macro close-up of a human eye"
            initial={{ scale: 1.06 }}
            animate={{ scale: 1 }}
            transition={{ duration: 2.4, ease: "easeOut" }}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: "center" }}
          />
          {/* Overlays */}
          <div className="absolute inset-0" style={{
            background: "linear-gradient(90deg, rgba(70,36,20,0.45) 0%, rgba(0,0,0,0.08) 45%, rgba(0,0,0,0.55) 100%)",
          }} />
          <div className="absolute inset-0" style={{
            background: "radial-gradient(120% 80% at 50% 50%, transparent 35%, rgba(0,0,0,0.7) 100%)",
          }} />
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.22)" }} />

          {/* Top pill nav (inside hero) */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="absolute left-1/2 -translate-x-1/2 z-20 px-3 sm:px-5"
            style={{
              top: 16,
              width: "calc(100% - 24px)",
              maxWidth: 1240,
              height: 58,
              borderRadius: 999,
              background: "rgba(5,5,5,0.78)",
              backdropFilter: "blur(14px)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div className="flex items-center justify-between h-full">
              {/* Left: menu */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMenuOpen(true)}
                  aria-label="Open menu"
                  className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="3" width="6" height="6" rx="1"/><rect x="3" y="15" width="6" height="6" rx="1"/><rect x="15" y="15" width="6" height="6" rx="1"/></svg>
                </button>
                <span
                  className="hidden sm:inline-flex items-center px-3 h-8 rounded-full text-xs text-white/80"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  Menu
                </span>
              </div>

              {/* Center brand */}
              <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 pointer-events-none">
                <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                <span className="text-white text-[14px] sm:text-[16px] tracking-tight lowercase whitespace-nowrap" style={{ fontWeight: 600 }}>eye surgeons</span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
              </div>

              {/* Right */}
              <div className="flex items-center gap-2">
                <button aria-label="Call" className="hidden sm:flex w-9 h-9 rounded-full bg-white text-black items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92Z"/></svg>
                </button>
                <div className="hidden lg:flex flex-col leading-tight text-white">
                  <span className="text-[11px]">[telefone aqui]</span>
                  <span className="text-[11px] text-white/60">[telefone alternativo]</span>
                </div>
                <button
                  onClick={() => scrollTo("contact")}
                  aria-label="Contact Us"
                  className="hidden sm:inline-flex items-center gap-2 pl-3.5 pr-1 h-9 rounded-full bg-white text-black text-[13px] font-medium hover:-translate-y-0.5 transition"
                >
                  Contact Us
                  <ArrowCircle size={28} />
                </button>
                <button
                  onClick={() => scrollTo("contact")}
                  aria-label="Contact Us"
                  className="sm:hidden w-9 h-9 rounded-full bg-white text-black flex items-center justify-center"
                >
                  <ArrowCircle size={28} />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Hero content */}
          <div className="relative z-10 pt-[120px] sm:pt-[160px] lg:pt-[180px] px-6 sm:px-10 lg:px-[110px] pb-10 lg:pb-24 min-h-[520px] lg:min-h-[720px] flex flex-col lg:block">
            <div className="max-w-[620px]">
              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.7 }}
                className="text-white"
                style={{
                  fontSize: "clamp(40px, 8.4vw, 78px)",
                  fontWeight: 800,
                  lineHeight: 1.0,
                  letterSpacing: "-0.04em",
                }}
              >
                Saving Eyes,<br />Changing Lives
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.6 }}
                className="mt-6 max-w-[560px] text-[15px] sm:text-[16px] leading-relaxed"
                style={{ color: "rgba(255,255,255,0.82)" }}
              >
                Our team of fellowship-trained surgeons are dedicated to restoring and protecting your vision with world-class eye care.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="mt-7"
              >
                <PillButton onClick={() => scrollTo("contact")}>Book an Appointment</PillButton>
              </motion.div>

              <div className="mt-10 hidden lg:flex items-center gap-3 text-white/50 text-xs">
                <span className="inline-block w-px h-6 bg-white/30" />
                Scroll Down to Learn More
              </div>
            </div>

            {/* Doctor card */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.7 }}
              className="lg:absolute mt-10 lg:mt-0 mx-auto lg:mx-0"
              style={{ right: 56, top: 220, width: "min(280px, 100%)" }}
            >
              <div
                className="bg-white text-black p-2.5 pb-6"
                style={{ borderRadius: 24, boxShadow: "0 30px 80px rgba(0,0,0,0.45)" }}
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={surgeon.id}
                    src={surgeon.photo}
                    alt={surgeon.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    className="w-full object-cover"
                    style={{ height: 220, borderRadius: 18 }}
                  />
                </AnimatePresence>
                <div className="px-3 pt-4 text-center">
                  <div className="font-bold text-[19px] tracking-tight">{surgeon.name}</div>
                  <div className="text-[12.5px] mt-0.5" style={{ color: C.muted }}>{surgeon.specialty}</div>
                  <button
                    onClick={() => scrollTo("surgeons")}
                    className="mt-4 w-full h-[42px] rounded-full bg-black text-white text-sm font-medium hover:bg-[#161616] transition"
                  >
                    Meet Your Surgeon
                  </button>
                </div>
              </div>

              {/* Carousel controls */}
              <div className="mt-4 flex items-center justify-center gap-2">
                <button
                  onClick={() => setSurgeonIdx((i) => (i - 1 + SURGEONS.length) % SURGEONS.length)}
                  aria-label="Previous surgeon"
                  className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center shadow"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <div className="h-9 px-4 rounded-full bg-white flex items-center gap-1.5 shadow">
                  {SURGEONS.map((_, i) => (
                    <span key={i} className="block rounded-full transition-all" style={{
                      width: i === surgeonIdx ? 18 : 6, height: 6,
                      background: i === surgeonIdx ? "#050505" : "#C8C5BE",
                    }} />
                  ))}
                </div>
                <button
                  onClick={() => setSurgeonIdx((i) => (i + 1) % SURGEONS.length)}
                  aria-label="Next surgeon"
                  className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center shadow"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ============ INTRO STRIP ============ */}
      <section className="px-6 pb-20 max-w-[1200px] mx-auto text-center">
        <p className="text-white/80 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
          Specialist eye surgery, advanced diagnostics, and personalised treatment from consultation to recovery.
        </p>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {["Fellowship-Trained Team", "Modern Surgical Suites", "Personalised Care Plans"].map((t) => (
            <div key={t} className="rounded-2xl px-6 py-5 text-left" style={{ background: C.card, border: `1px solid ${C.border}` }}>
              <div className="text-xs uppercase tracking-[0.18em]" style={{ color: C.beige }}>Trust</div>
              <div className="mt-2 text-white font-semibold">{t}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ ABOUT ============ */}
      <Section id="about" refSet={sectionRefs} bg={C.paper} textDark>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <Eyebrow>About Us</Eyebrow>
            <h2 className="text-[40px] sm:text-[52px] font-bold leading-[1.05] tracking-tight" style={{ color: C.ink }}>
              Precision Eye Care With A Human Approach
            </h2>
            <p className="mt-6 text-[16px] leading-relaxed" style={{ color: C.deep }}>
              At eye surgeons, we combine specialist surgical expertise with clear communication, advanced diagnostics, and a deeply personal approach to care. Every patient receives a tailored treatment pathway designed around their condition, lifestyle, and long-term vision health.
            </p>
            <p className="mt-4 text-[15px] leading-relaxed" style={{ color: C.deep }}>
              From cataract and corneal procedures to advanced diagnostic assessments, our team focuses on safety, clarity, and outcomes at every stage.
            </p>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=85"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&w=1200&q=85"; }}
              alt="Modern clinic consultation"
              className="w-full h-[420px] object-cover"
              style={{ borderRadius: 32 }}
            />
            <div className="absolute -bottom-5 -left-4 bg-white px-5 py-3 rounded-2xl shadow-lg">
              <div className="text-[22px] font-bold" style={{ color: C.ink }}>10,000+</div>
              <div className="text-xs" style={{ color: C.muted }}>Procedures</div>
            </div>
            <div className="absolute top-5 -right-3 bg-white px-5 py-3 rounded-2xl shadow-lg">
              <div className="text-[22px] font-bold" style={{ color: C.ink }}>20+</div>
              <div className="text-xs" style={{ color: C.muted }}>Years Experience</div>
            </div>
          </div>
        </div>

        <div className="mt-20 grid sm:grid-cols-3 gap-5">
          {[
            { t: "Fellowship-Trained Surgeons", d: "Specialist care led by experienced surgical professionals." },
            { t: "Advanced Diagnostics", d: "High-resolution assessments to guide precise treatment." },
            { t: "Personalised Treatment", d: "Clear options and care plans tailored to your eyes." },
          ].map((f, i) => (
            <motion.div
              key={f.t}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-7 rounded-3xl"
              style={{ border: `1px solid ${C.soft}` }}
            >
              <div className="text-[18px] font-semibold" style={{ color: C.ink }}>{f.t}</div>
              <p className="mt-2 text-sm" style={{ color: C.deep }}>{f.d}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ============ PROCEDURES ============ */}
      <Section id="procedures" refSet={sectionRefs} bg="#FFFFFF" textDark>
        <div className="max-w-[760px]">
          <Eyebrow>Procedures</Eyebrow>
          <h2 className="text-[40px] sm:text-[52px] font-bold leading-[1.05] tracking-tight" style={{ color: C.ink }}>
            Specialist Treatments For Every Stage Of Vision Care
          </h2>
          <p className="mt-5 text-[16px]" style={{ color: C.deep }}>
            Explore our core ophthalmology services, from consultation and diagnosis to surgical treatment and recovery support.
          </p>
        </div>
        <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {PROCEDURES.map((p, i) => (
            <motion.div
              key={p.t}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: (i % 3) * 0.08 }}
              whileHover={{ y: -6 }}
              className="group p-8 rounded-[28px] bg-white transition-shadow hover:shadow-xl"
              style={{ border: `1px solid ${C.soft}` }}
            >
              <div className="text-[20px] font-semibold" style={{ color: C.ink }}>{p.t}</div>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: C.deep }}>{p.d}</p>
              <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium" style={{ color: C.ink }}>
                Learn More
                <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ============ SURGEONS ============ */}
      <Section id="surgeons" refSet={sectionRefs} bg={C.ink}>
        <div className="max-w-[760px]">
          <Eyebrow light>Our Surgeons</Eyebrow>
          <h2 className="text-[40px] sm:text-[52px] font-bold text-white leading-[1.05] tracking-tight">
            Meet The Specialists Behind Your Care
          </h2>
          <p className="mt-5 text-[16px] text-white/70">
            Our surgeons combine advanced clinical training with a calm, transparent approach to every patient journey.
          </p>
        </div>
        <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SURGEONS.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className="bg-white rounded-[28px] overflow-hidden group"
            >
              <div className="overflow-hidden">
                <img src={s.photo} alt={s.name} className="w-full h-[320px] object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6">
                <div className="text-[20px] font-bold" style={{ color: C.ink }}>{s.name}</div>
                <div className="text-sm mt-1" style={{ color: C.muted }}>{s.specialty}</div>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: C.deep }}>{s.bio}</p>
                <button className="mt-5 inline-flex items-center gap-2 pl-5 pr-1.5 h-11 rounded-full bg-black text-white text-sm font-medium hover:-translate-y-0.5 transition">
                  View Profile <ArrowCircle light size={32} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
        <p className="mt-12 text-center text-sm text-white/55 max-w-2xl mx-auto">
          Every consultation is designed to help you understand your options clearly before any treatment decision is made.
        </p>
      </Section>

      {/* ============ WHY CHOOSE US ============ */}
      <Section id="why" refSet={sectionRefs} bg={C.paper} textDark>
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <Eyebrow>Why Choose Us</Eyebrow>
            <h2 className="text-[40px] sm:text-[52px] font-bold leading-[1.05] tracking-tight" style={{ color: C.ink }}>
              Clear Guidance, Advanced Care, Trusted Outcomes
            </h2>
            <p className="mt-5 text-[16px]" style={{ color: C.deep }}>
              We focus on clinical precision and patient confidence. From your first assessment to recovery, our process is built around safety, transparency, and personalised support.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {REASONS.map((r) => (
              <div key={r} className="bg-white rounded-2xl p-5" style={{ border: `1px solid ${C.soft}` }}>
                <div className="text-sm font-semibold" style={{ color: C.ink }}>{r}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 grid sm:grid-cols-3 gap-5">
          {METRICS.map((m) => (
            <div key={m.l} className="rounded-3xl p-8" style={{ background: C.ink, color: "#fff" }}>
              <div className="w-10 h-px mb-5" style={{ background: C.beige }} />
              <div className="text-[48px] font-bold tracking-tight">{m.n}</div>
              <div className="mt-2 text-sm text-white/70">{m.l}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ============ TECHNOLOGY ============ */}
      <Section id="technology" refSet={sectionRefs} bg="#FFFFFF" textDark>
        <div className="max-w-[760px]">
          <Eyebrow>Technology</Eyebrow>
          <h2 className="text-[40px] sm:text-[52px] font-bold leading-[1.05] tracking-tight" style={{ color: C.ink }}>
            Advanced Imaging And Precision Treatment Planning
          </h2>
          <p className="mt-5 text-[16px]" style={{ color: C.deep }}>
            Modern ophthalmology depends on clarity. Our diagnostic process uses detailed imaging and specialist assessment to support safer decisions and more personalised outcomes.
          </p>
        </div>
        <div className="mt-14 grid lg:grid-cols-2 gap-8 items-start">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=1200&q=85"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?auto=format&fit=crop&w=1200&q=85"; }}
              alt="Ophthalmology diagnostic equipment"
              className="w-full h-[460px] object-cover rounded-[32px]"
            />
            <span className="absolute top-5 left-5 px-4 py-2 rounded-full text-xs font-medium" style={{ background: C.beige, color: C.ink }}>
              Precision-led care
            </span>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {TECH.map((t) => (
              <div key={t.t} className="rounded-3xl p-6" style={{ background: C.ink, color: "#fff" }}>
                <div className="text-[16px] font-semibold">{t.t}</div>
                <p className="mt-2 text-sm text-white/70 leading-relaxed">{t.d}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ============ TESTIMONIALS ============ */}
      <Section id="testimonials" refSet={sectionRefs} bg={C.ink}>
        <div className="max-w-[760px]">
          <Eyebrow light>Testimonials</Eyebrow>
          <h2 className="text-[40px] sm:text-[52px] font-bold text-white leading-[1.05] tracking-tight">
            What Patients Say About Their Care
          </h2>
          <p className="mt-5 text-[16px] text-white/70">
            Realistic patient feedback presented as proof of clarity, communication, and trust.
          </p>
        </div>
        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="p-7 rounded-[28px]"
              style={{ background: C.card, border: `1px solid ${C.border}` }}
            >
              <div className="flex gap-1 mb-5" style={{ color: C.beige }}>
                {Array.from({ length: 5 }).map((_, k) => <span key={k}>★</span>)}
              </div>
              <p className="text-white/85 text-[15px] leading-relaxed">“{t.quote}”</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold" style={{ background: C.beige, color: C.ink }}>
                  {t.name.split(" ").map(s => s[0]).join("")}
                </div>
                <div>
                  <div className="text-white font-medium text-sm">{t.name}</div>
                  <div className="text-xs text-white/55">{t.treatment}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ============ BOOKING CTA ============ */}
      <section className="px-3 sm:px-6 py-16" style={{ background: C.paper }}>
        <div
          className="relative mx-auto max-w-[1280px] overflow-hidden text-white px-7 sm:px-12 lg:px-16 py-14 lg:py-20"
          style={{ background: C.ink, borderRadius: 38 }}
        >
          <div className="absolute inset-0 pointer-events-none" style={{
            background: "radial-gradient(60% 80% at 20% 30%, rgba(197,164,126,0.18), transparent 60%)",
          }} />
          <div className="relative max-w-[760px]">
            <Eyebrow light>Book A Consultation</Eyebrow>
            <h2 className="text-[40px] sm:text-[56px] font-bold leading-[1.02] tracking-tight">
              Take The First Step Toward Clearer Vision
            </h2>
            <p className="mt-5 text-white/75 text-[16px] max-w-[640px]">
              Schedule a consultation with our experienced team and receive a clear, personalised treatment pathway based on your needs.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <PillButton onClick={() => scrollTo("contact")}>Book an Appointment</PillButton>
              <button
                onClick={() => scrollTo("contact")}
                className="inline-flex items-center gap-2 h-12 px-6 rounded-full text-sm font-medium border text-white hover:bg-white/5 transition"
                style={{ borderColor: "rgba(255,255,255,0.25)" }}
              >
                Call the Clinic
              </button>
            </div>
            <p className="mt-5 text-xs text-white/55">Available Monday to Friday · 8:00 AM — 6:00 PM</p>
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <Section id="faq" refSet={sectionRefs} bg={C.paper} textDark>
        <div className="max-w-[760px]">
          <Eyebrow>FAQ</Eyebrow>
          <h2 className="text-[40px] sm:text-[52px] font-bold leading-[1.05] tracking-tight" style={{ color: C.ink }}>
            Common Questions Before Your Consultation
          </h2>
        </div>
        <div className="mt-12 max-w-3xl space-y-3">
          {FAQS.map((f, i) => {
            const open = openFaq === i;
            return (
              <div key={f.q} className="bg-white rounded-2xl shadow-sm" style={{ border: `1px solid ${C.soft}` }}>
                <button
                  onClick={() => setOpenFaq(open ? null : i)}
                  className="w-full flex items-center justify-between gap-4 text-left px-6 py-5"
                >
                  <span className="font-medium text-[15.5px]" style={{ color: C.ink }}>{f.q}</span>
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center text-lg transition-transform"
                    style={{ background: open ? C.ink : C.soft, color: open ? "#fff" : C.ink, transform: open ? "rotate(45deg)" : "none" }}
                  >+</span>
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-5 text-sm leading-relaxed" style={{ color: C.deep }}>{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </Section>

      {/* ============ CONTACT ============ */}
      <Section id="contact" refSet={sectionRefs} bg="#FFFFFF" textDark>
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          <div>
            <Eyebrow>Contact</Eyebrow>
            <h2 className="text-[40px] sm:text-[52px] font-bold leading-[1.05] tracking-tight" style={{ color: C.ink }}>
              Speak With Our Team
            </h2>
            <p className="mt-5 text-[16px]" style={{ color: C.deep }}>
              Book a consultation, ask a question, or request more information about specialist eye care.
            </p>
            <dl className="mt-8 space-y-4 text-sm" style={{ color: C.ink }}>
              <Row label="Phone" value="[telefone aqui]" />
              <Row label="Alternate" value="[telefone alternativo]" />
              <Row label="Email" value="[email aqui]" />
              <Row label="Address" value="[endereço completo aqui]" />
              <Row label="Hours" value="Monday — Friday, 8:00 AM — 6:00 PM" />
            </dl>
            <div
              className="mt-8 h-[200px] rounded-3xl flex items-center justify-center text-sm"
              style={{ background: "#1a1a1a", color: C.muted, backgroundImage: "linear-gradient(135deg, #0a0a0a 25%, #1a1a1a 25%, #1a1a1a 50%, #0a0a0a 50%, #0a0a0a 75%, #1a1a1a 75%)", backgroundSize: "20px 20px" }}
            >
              <span className="bg-black/80 text-white px-4 py-2 rounded-full text-xs">📍 Clinic Location</span>
            </div>
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); setSent(true); }}
            className="bg-white p-7 sm:p-9 rounded-[32px]"
            style={{ border: `1px solid ${C.soft}` }}
          >
            {sent ? (
              <div className="text-center py-10">
                <div className="text-[22px] font-bold" style={{ color: C.ink }}>Request received.</div>
                <p className="mt-2 text-sm" style={{ color: C.deep }}>Our team will contact you soon.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <Field label="Full Name"><input required className="w-full h-11 px-4 rounded-xl text-sm" style={{ background: C.paper, border: `1px solid ${C.soft}`, color: C.ink }} /></Field>
                <Field label="Email Address"><input type="email" required className="w-full h-11 px-4 rounded-xl text-sm" style={{ background: C.paper, border: `1px solid ${C.soft}`, color: C.ink }} /></Field>
                <Field label="Phone Number"><input className="w-full h-11 px-4 rounded-xl text-sm" style={{ background: C.paper, border: `1px solid ${C.soft}`, color: C.ink }} /></Field>
                <Field label="Preferred Procedure">
                  <select className="w-full h-11 px-4 rounded-xl text-sm" style={{ background: C.paper, border: `1px solid ${C.soft}`, color: C.ink }}>
                    <option>Cataract Surgery</option>
                    <option>Corneal Surgery</option>
                    <option>Laser Vision Correction</option>
                    <option>General Consultation</option>
                    <option>Other</option>
                  </select>
                </Field>
                <Field label="Message"><textarea rows={4} className="w-full p-4 rounded-xl text-sm resize-none" style={{ background: C.paper, border: `1px solid ${C.soft}`, color: C.ink }} /></Field>
                <button type="submit" className="mt-2 inline-flex items-center gap-2 pl-5 pr-1.5 h-12 rounded-full bg-black text-white text-sm font-medium hover:-translate-y-0.5 transition">
                  Send Request <ArrowCircle light size={36} />
                </button>
              </div>
            )}
          </form>
        </div>
      </Section>

      {/* ============ FOOTER ============ */}
      <footer className="px-6 pt-16 pb-10" style={{ background: C.ink, color: "#fff" }}>
        <div className="max-w-[1280px] mx-auto">
          <div className="grid lg:grid-cols-4 gap-10">
            <div>
              <div className="text-xl lowercase font-semibold tracking-tight">eye surgeons</div>
              <p className="mt-4 text-sm text-white/60 max-w-xs leading-relaxed">
                Specialist ophthalmology care with advanced diagnostics, surgical expertise, and personalised patient support.
              </p>
            </div>
            <FooterCol title="Navigation" items={["Home","About","Procedures","Surgeons","Contact"]} />
            <FooterCol title="Procedures" items={["Cataract Surgery","Corneal Surgery","Laser Vision Correction","Glaucoma Management"]} />
            <FooterCol title="Contact" items={["[telefone aqui]","[email aqui]","[endereço aqui]"]} />
          </div>
          <p className="mt-12 text-[11px] text-white/40 max-w-2xl">
            Information on this website is general in nature and does not replace personalised medical advice.
          </p>
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-white/50">
            <span>© 2026 eye surgeons. All rights reserved.</span>
            <div className="flex gap-5">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Patient Information</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ============ FLOATING CTA ============ */}
      <AnimatePresence>
        {showFloat && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => scrollTo("contact")}
            className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 pl-5 pr-1.5 h-12 rounded-full bg-white text-black text-sm font-medium shadow-2xl hover:-translate-y-0.5 transition"
          >
            Book Appointment <ArrowCircle size={36} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ============ MOBILE / FULL MENU ============ */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-5">
              <span className="text-white text-base lowercase font-semibold">eye surgeons</span>
              <button onClick={() => setMenuOpen(false)} aria-label="Close menu" className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <nav className="flex-1 flex flex-col items-start gap-3 px-8 pt-10">
              {NAV.map((n, i) => (
                <motion.button
                  key={n.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  onClick={() => scrollTo(n.id)}
                  className="text-white text-3xl sm:text-4xl font-bold tracking-tight hover:text-white/60 transition"
                  style={{ color: active === n.id ? C.beige : "#fff" }}
                >
                  {n.label}
                </motion.button>
              ))}
            </nav>
            <div className="p-6">
              <PillButton onClick={() => scrollTo("contact")}>Book an Appointment</PillButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------- Helpers ----------------
function Section({
  id, refSet, bg, textDark, children,
}: {
  id: string;
  refSet: React.MutableRefObject<Record<string, HTMLElement | null>>;
  bg: string;
  textDark?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      ref={(el) => { refSet.current[id] = el; }}
      className="px-6 sm:px-10 py-20 lg:py-28"
      style={{ background: bg, color: textDark ? "#050505" : "#fff" }}
    >
      <div className="max-w-[1280px] mx-auto">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-4">
      <dt className="w-20 text-[11px] uppercase tracking-[0.18em]" style={{ color: C.muted }}>{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium mb-1.5" style={{ color: C.deep }}>{label}</span>
      {children}
    </label>
  );
}

function FooterCol({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-[0.2em] mb-4" style={{ color: C.beige }}>{title}</div>
      <ul className="space-y-2 text-sm text-white/70">
        {items.map((i) => <li key={i}>{i}</li>)}
      </ul>
    </div>
  );
}
