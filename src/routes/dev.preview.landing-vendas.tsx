import { createFileRoute } from "@tanstack/react-router";
import type { Variants } from "framer-motion";
import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowUpRight, Menu, X, Check, Plus, Minus, Phone, Mail, MapPin, Clock, Heart, Wind, Activity, Users, Leaf, Sun } from "lucide-react";
import heroImg from "@/assets/yoga-hero.png";
import card1 from "@/assets/yoga-card-1.jpg";
import card2 from "@/assets/yoga-card-2.jpg";
import card3 from "@/assets/yoga-card-3.jpg";
import testimonialImg from "@/assets/yoga-testimonial.jpg";
import studioImg from "@/assets/yoga-studio.jpg";
import av1 from "@/assets/yoga-avatar-1.jpg";
import av2 from "@/assets/yoga-avatar-2.jpg";
import av3 from "@/assets/yoga-avatar-3.jpg";
import av4 from "@/assets/yoga-avatar-4.jpg";
import av5 from "@/assets/yoga-avatar-5.jpg";

export const Route = createFileRoute("/dev/preview/landing-vendas")({
  component: SerenityYoga,
});

const C = {
  bg: "#FFFFFF",
  lavender: "#EEE8FA",
  lavender2: "#DCD3F4",
  lavender3: "#E6DDF8",
  purple: "#7B64B8",
  peach: "#F3A07E",
  ink: "#15151A",
  charcoal: "#1E2933",
  mute: "#666A73",
  light: "#F4F4F2",
  soft: "#F8F7F4",
  blue: "#CDEAF6",
  beige: "#D9D7CE",
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <circle cx="13" cy="13" r="11" stroke="#15151A" strokeWidth="2" fill="none" strokeDasharray="55 10" transform="rotate(-30 13 13)" />
        <circle cx="13" cy="13" r="2.5" fill="#15151A" />
      </svg>
      <span className="font-bold tracking-[0.04em] text-[16px] sm:text-[18px]" style={{ color: C.ink }}>
        SERENITY YOGA
      </span>
    </div>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const links = [
    { label: "About Us", href: "#about" },
    { label: "Reviews", href: "#reviews" },
    { label: "Services", href: "#services" },
    { label: "Classes", href: "#classes" },
  ];
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b" style={{ borderColor: "rgba(21,21,26,0.06)" }}>
      <div className="mx-auto max-w-[1280px] px-6 md:px-10 h-[70px] flex items-center justify-between">
        <a href="#top"><Logo /></a>
        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <a key={l.label} href={l.href}
              className="px-4 py-2 rounded-full text-[14px] font-medium text-[#15151A] transition-all hover:bg-[#EEE8FA]">
              {l.label}
            </a>
          ))}
          <a href="#contact" className="ml-2 px-5 py-2.5 rounded-full text-[14px] font-medium text-white transition-transform hover:-translate-y-0.5"
            style={{ background: C.ink }}>Book a class</a>
        </nav>
        <button className="md:hidden p-2" onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu size={22} />
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 bg-white animate-fade-in md:hidden">
          <div className="flex items-center justify-between px-6 h-[70px] border-b" style={{ borderColor: "rgba(21,21,26,0.06)" }}>
            <Logo />
            <button onClick={() => setOpen(false)} aria-label="Close menu"><X size={22} /></button>
          </div>
          <div className="flex flex-col gap-2 p-8">
            {links.map((l) => (
              <a key={l.label} href={l.href} onClick={() => setOpen(false)}
                className="px-5 py-4 rounded-2xl text-xl font-semibold text-[#15151A] hover:bg-[#EEE8FA]">
                {l.label}
              </a>
            ))}
            <a href="#contact" onClick={() => setOpen(false)} className="mt-4 px-5 py-4 rounded-2xl text-center text-white text-lg font-semibold"
              style={{ background: C.ink }}>Book a class</a>
          </div>
        </div>
      )}
    </header>
  );
}

function PurpleRibbon() {
  // Curved ribbon with white text along the path
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1200 460" preserveAspectRatio="none">
      <defs>
        <path id="purpleCurve" d="M 80 280 C 380 100, 720 420, 1180 180" fill="none" />
      </defs>
      <path d="M 80 280 C 380 100, 720 420, 1180 180" stroke={C.purple} strokeWidth="50" fill="none" strokeLinecap="round" />
      <text fill="white" fontSize="14" letterSpacing="2" fontWeight="500">
        <textPath href="#purpleCurve" startOffset="0%">
          flexibility · mental clarity · emotional balance · reduce stress · flexibility · mental clarity · emotional balance ·
        </textPath>
      </text>
    </svg>
  );
}

function Hero() {
  return (
    <section id="top" className="px-4 md:px-8 pt-3">
      <motion.div initial="hidden" animate="show" variants={fadeUp}
        className="relative mx-auto max-w-[1280px] overflow-hidden"
        style={{ background: C.lavender, borderRadius: 32, minHeight: 420 }}>
        {/* glows */}
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full" style={{ background: C.lavender2, filter: "blur(40px)", opacity: 0.6 }} />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 rounded-full" style={{ background: "#FFFFFF", filter: "blur(60px)", opacity: 0.4 }} />

        <div className="hidden md:block">
          <PurpleRibbon />
        </div>

        <div className="relative grid md:grid-cols-2 gap-6 p-7 md:p-14 items-center">
          <div className="relative z-10">
            <motion.span variants={fadeUp}
              className="inline-block px-4 py-2 rounded-full text-[13px] font-medium"
              style={{ background: "rgba(255,255,255,0.55)", border: "1px solid rgba(21,21,26,0.08)", color: C.ink }}>
              Meditation and Balance
            </motion.span>
            <motion.h1 variants={fadeUp}
              className="mt-5 font-bold text-[#15151A]"
              style={{ fontSize: "clamp(34px, 5vw, 56px)", lineHeight: 1.08, letterSpacing: "-0.04em", maxWidth: 580 }}>
              Achieve balance in<br />mind, body, and soul.
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-5 text-[15px] md:text-[16px]" style={{ color: "#555B66", lineHeight: 1.6, maxWidth: 500 }}>
              Find your center through guided yoga, mindful movement, breathing practices, and calming classes designed for every level.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-7 flex flex-wrap gap-3">
              <a href="#classes" className="px-6 py-3 rounded-full text-white text-[14px] font-medium transition-transform hover:-translate-y-0.5"
                style={{ background: C.ink }}>Explore classes</a>
              <a href="#about" className="px-6 py-3 rounded-full text-[14px] font-medium border transition-all hover:bg-white"
                style={{ borderColor: "rgba(21,21,26,0.12)", color: C.ink }}>Learn more</a>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, delay: 0.2 }}
            className="relative h-[300px] md:h-[420px]">
            <img src={heroImg} alt="Woman in advanced yoga pose" loading="eager"
              className="absolute inset-0 w-full h-full object-contain object-right-bottom z-10" />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

function FeatureCards() {
  const Pill = ({ children }: { children: React.ReactNode }) => (
    <span className="inline-block px-3 py-1.5 rounded-full bg-white text-[12px] font-medium text-[#15151A]">{children}</span>
  );
  const Arrow = () => (
    <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center transition-transform group-hover:rotate-12">
      <ArrowUpRight size={16} className="text-[#15151A]" />
    </span>
  );
  const Card = ({ img, title, pill = "View video", className = "" }: { img: string; title: React.ReactNode; pill?: string; className?: string }) => (
    <div className={`group relative overflow-hidden rounded-[30px] h-[260px] md:h-[300px] ${className}`}>
      <img src={img} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
      <div className="relative p-5 flex justify-between">
        <Pill>{pill}</Pill>
        <Arrow />
      </div>
      <div className="absolute bottom-5 left-5 right-5">
        <h3 className="text-white font-semibold text-[24px] md:text-[28px] leading-tight tracking-tight">{title}</h3>
      </div>
    </div>
  );
  return (
    <section className="px-4 md:px-8 mt-6">
      <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
        variants={{ show: { transition: { staggerChildren: 0.12 } } }}
        className="mx-auto max-w-[1280px] grid gap-5 md:grid-cols-[1fr_1fr_1.5fr]">
        <motion.div variants={fadeUp}><Card img={card1} title={<>Improved<br />Flexibility</>} /></motion.div>
        <motion.div variants={fadeUp}><Card img={card2} title="Stress Reduction" /></motion.div>
        <motion.div variants={fadeUp}>
          <div className="group relative overflow-hidden rounded-[30px] h-[260px] md:h-[300px]">
            <img src={card3} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent" />
            <div className="relative p-5 flex justify-between">
              <span className="inline-block px-3 py-1.5 rounded-full bg-white text-[12px] font-medium text-[#15151A]">Join By Class</span>
              <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center transition-transform group-hover:rotate-12">
                <ArrowUpRight size={16} className="text-[#15151A]" />
              </span>
            </div>
            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
              <h3 className="text-white font-semibold text-[24px] md:text-[28px] leading-tight tracking-tight">Join Us For A Yoga<br />Class Today.</h3>
              <div className="flex gap-2 shrink-0">
                <a href="#about" className="px-3.5 py-2 rounded-full text-[12px] text-white border border-white/60 hover:bg-white/10">Read more</a>
                <a href="#contact" className="px-3.5 py-2 rounded-full text-[12px] font-medium bg-white text-[#15151A]">Get started</a>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

function OrangeRibbon() {
  return (
    <svg className="absolute left-0 right-0 top-1/2 -translate-y-1/4 w-full h-[260px] pointer-events-none" viewBox="0 0 1280 260" preserveAspectRatio="none">
      <defs>
        <path id="orangeCurve" d="M -20 200 C 320 40, 720 280, 1300 80" fill="none" />
      </defs>
      <path d="M -20 200 C 320 40, 720 280, 1300 80" stroke={C.peach} strokeWidth="58" fill="none" strokeLinecap="round" />
      <text fill="white" fontSize="15" letterSpacing="2" fontWeight="500">
        <textPath href="#orangeCurve" startOffset="0%">
          Reserve now a class · Better flexibility · Better lives through our classes · Read their stories · Reserve now a class ·
        </textPath>
      </text>
    </svg>
  );
}

function FloatingAvatar({ src, size, className, delay = 0 }: { src: string; size: number; className: string; delay?: number }) {
  return (
    <motion.div
      className={`absolute rounded-full overflow-hidden shadow-lg ring-4 ring-white ${className}`}
      style={{ width: size, height: size }}
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 4 + delay, repeat: Infinity, ease: "easeInOut", delay }}
    >
      <img src={src} alt="" loading="lazy" className="w-full h-full object-cover" />
    </motion.div>
  );
}

function Testimonials() {
  return (
    <section id="reviews" className="relative mt-28 md:mt-36 px-4 md:px-8">
      <div className="relative mx-auto max-w-[1280px] min-h-[560px] md:min-h-[680px]">
        <div className="hidden md:block"><OrangeRibbon /></div>

        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
          className="relative z-10 text-center max-w-[560px] mx-auto pt-8 md:pt-16">
          <span className="inline-block px-4 py-1.5 rounded-full text-[12px] font-medium" style={{ background: C.lavender, color: C.ink }}>Testimonial</span>
          <h2 className="mt-4 font-bold text-[#15151A]" style={{ fontSize: "clamp(32px, 4.5vw, 48px)", letterSpacing: "-0.04em", lineHeight: 1.05 }}>
            Student<br />Testimonials
          </h2>
          <p className="mt-4 text-[15px]" style={{ color: C.mute, lineHeight: 1.6 }}>
            See how our members have reduced stress and enhanced well-being with our support and guidance.
          </p>
        </motion.div>

        {/* Floating avatars - desktop */}
        <div className="hidden md:block">
          <FloatingAvatar src={av1} size={64} className="top-[80px] left-[60px]" delay={0} />
          <FloatingAvatar src={av2} size={56} className="top-[260px] left-[120px]" delay={0.5} />
          <FloatingAvatar src={av3} size={70} className="top-[420px] left-[260px]" delay={1} />
          <FloatingAvatar src={av4} size={60} className="top-[60px] left-1/2 -translate-x-1/2" delay={0.3} />
          <FloatingAvatar src={av5} size={54} className="top-[380px] left-[44%]" delay={0.7} />
          <FloatingAvatar src={av1} size={62} className="top-[120px] right-[80px]" delay={0.4} />
          <FloatingAvatar src={av2} size={56} className="top-[480px] right-[480px]" delay={0.9} />
        </div>

        {/* Lavender ring + testimonial card */}
        <div className="relative z-20 mt-10 md:mt-0 md:absolute md:right-[110px] md:bottom-[60px] flex flex-col items-center md:items-end">
          <div className="relative">
            <div className="absolute -top-16 right-8 md:right-16 w-[170px] h-[170px] rounded-full overflow-hidden" style={{ background: C.lavender3 }}>
              <img src={testimonialImg} alt="Student" loading="lazy" className="w-full h-full object-cover" />
            </div>
            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
              whileHover={{ rotate: -1 }}
              className="relative mt-20 w-[340px] md:w-[400px] p-7 rounded-[22px] text-white"
              style={{ background: C.charcoal, boxShadow: "0 30px 80px rgba(0,0,0,0.16)" }}>
              <p className="text-[14.5px] leading-relaxed text-white/85">
                "Joining this yoga community has been life-changing. The instructors are incredibly knowledgeable, and the classes have helped me build inner peace and improve my flexibility."
              </p>
              <div className="mt-5 flex items-center gap-3">
                <img src={testimonialImg} alt="" className="w-11 h-11 rounded-full object-cover" />
                <div>
                  <div className="font-semibold">Emily R.</div>
                  <div className="text-[12px] text-white/55">Yoga Student</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Classes() {
  const items = [
    { icon: Sun, title: "Beginner Yoga", desc: "Gentle entry into postures, breath, and alignment for new students." },
    { icon: Wind, title: "Morning Flow", desc: "Energizing sequences to start your day with focus and clarity." },
    { icon: Heart, title: "Meditation & Breathwork", desc: "Calm the mind with guided meditation and pranayama." },
    { icon: Activity, title: "Flexibility Training", desc: "Open the hips, hamstrings, and spine with deep stretching." },
    { icon: Leaf, title: "Stress Relief Yoga", desc: "Slow, restorative practices to soothe the nervous system." },
    { icon: Users, title: "Private Sessions", desc: "One-on-one guidance tailored to your body and goals." },
  ];
  return (
    <section id="classes" className="mt-32 py-20 md:py-28 px-4 md:px-8" style={{ background: C.soft }}>
      <div className="mx-auto max-w-[1280px]">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="max-w-[640px] mx-auto text-center">
          <span className="inline-block px-4 py-1.5 rounded-full text-[12px] font-medium bg-white" style={{ color: C.ink }}>Classes</span>
          <h2 className="mt-4 font-bold text-[#15151A]" style={{ fontSize: "clamp(30px, 4vw, 44px)", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
            Choose A Practice That Fits Your Rhythm
          </h2>
          <p className="mt-4 text-[15px]" style={{ color: C.mute, lineHeight: 1.6 }}>
            From calming beginner sessions to energizing flow classes, find the right practice for your body and mind.
          </p>
        </motion.div>

        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => (
            <motion.div key={it.title} variants={fadeUp}
              className="bg-white rounded-[26px] p-7 transition-all hover:-translate-y-1 hover:shadow-lg"
              style={{ border: "1px solid rgba(21,21,26,0.06)" }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: i % 2 === 0 ? C.lavender : "#FCE8DD", color: i % 2 === 0 ? C.purple : C.peach }}>
                <it.icon size={20} />
              </div>
              <h3 className="text-[19px] font-semibold text-[#15151A] mb-2">{it.title}</h3>
              <p className="text-[14px]" style={{ color: C.mute, lineHeight: 1.6 }}>{it.desc}</p>
              <a href="#contact" className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-medium" style={{ color: C.purple }}>
                View class <ArrowUpRight size={14} />
              </a>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function Services() {
  const benefits = [
    { icon: Activity, title: "Improved Flexibility", desc: "Increase mobility and range of motion." },
    { icon: Heart, title: "Stress Reduction", desc: "Calm the nervous system through breath and movement." },
    { icon: Users, title: "Better Posture", desc: "Strengthen the core for everyday alignment." },
    { icon: Wind, title: "Mindful Breathing", desc: "Learn pranayama for clarity and focus." },
    { icon: Leaf, title: "Emotional Balance", desc: "Cultivate steadiness on and off the mat." },
    { icon: Sun, title: "Community Support", desc: "Practice alongside a welcoming community." },
  ];
  return (
    <section id="about" className="py-24 px-4 md:px-8 bg-white">
      <div className="mx-auto max-w-[1280px] grid lg:grid-cols-2 gap-12 items-center">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="relative">
          <img src={studioImg} alt="Yoga studio interior" loading="lazy"
            className="w-full h-[420px] md:h-[560px] object-cover rounded-[30px]" />
          <div className="absolute -bottom-6 -right-2 md:-right-6 bg-white rounded-2xl p-5 shadow-xl border" style={{ borderColor: "rgba(21,21,26,0.06)" }}>
            <div className="text-3xl font-bold" style={{ color: C.ink }}>15+</div>
            <div className="text-[12px]" style={{ color: C.mute }}>Years of practice</div>
          </div>
        </motion.div>

        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
          <span className="inline-block px-4 py-1.5 rounded-full text-[12px] font-medium" style={{ background: C.lavender, color: C.ink }}>Services</span>
          <h2 className="mt-4 font-bold text-[#15151A]" style={{ fontSize: "clamp(30px, 3.8vw, 42px)", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
            Build Strength, Calm,<br />And Flexibility
          </h2>
          <p className="mt-4 text-[15px]" style={{ color: C.mute, lineHeight: 1.6, maxWidth: 480 }}>
            Our approach combines mindful movement, breathwork, and guided relaxation to support physical and emotional balance.
          </p>
          <div className="mt-8 grid sm:grid-cols-2 gap-5">
            {benefits.map((b) => (
              <div key={b.title} className="flex gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: C.lavender, color: C.purple }}>
                  <b.icon size={18} />
                </div>
                <div>
                  <h4 className="text-[15px] font-semibold text-[#15151A]">{b.title}</h4>
                  <p className="text-[13px] mt-0.5" style={{ color: C.mute, lineHeight: 1.5 }}>{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Pricing() {
  const plans = [
    { name: "Drop-In Class", price: 18, period: "session", features: ["Single session", "Beginner & group classes", "Studio mat included"], cta: "Book Class", highlight: false },
    { name: "Monthly Pass", price: 79, period: "month", features: ["Unlimited group classes", "Meditation sessions", "Member events"], cta: "Start Monthly", highlight: true },
    { name: "Private Session", price: 55, period: "session", features: ["One-on-one guidance", "Personal practice plan", "Flexible schedule"], cta: "Book Private", highlight: false },
  ];
  return (
    <section id="services" className="py-24 px-4 md:px-8" style={{ background: C.lavender }}>
      <div className="mx-auto max-w-[1280px]">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-center max-w-[600px] mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full text-[12px] font-medium bg-white" style={{ color: C.ink }}>Pricing</span>
          <h2 className="mt-4 font-bold text-[#15151A]" style={{ fontSize: "clamp(30px, 4vw, 44px)", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
            Simple Membership Options
          </h2>
        </motion.div>
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }}
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          className="mt-12 grid gap-6 md:grid-cols-3">
          {plans.map((p) => (
            <motion.div key={p.name} variants={fadeUp}
              className={`rounded-[28px] p-8 transition-all hover:-translate-y-1 ${p.highlight ? "text-white" : "bg-white text-[#15151A]"}`}
              style={p.highlight ? { background: C.purple, boxShadow: "0 30px 60px rgba(123,100,184,0.35)" } : { border: "1px solid rgba(21,21,26,0.06)" }}>
              <div className="text-[13px] font-medium opacity-70">{p.name}</div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-5xl font-bold">${p.price}</span>
                <span className="text-[13px] opacity-70">/ {p.period}</span>
              </div>
              <ul className="mt-6 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-[14px]">
                    <Check size={16} className={p.highlight ? "text-white" : ""} style={!p.highlight ? { color: C.purple } : {}} />
                    {f}
                  </li>
                ))}
              </ul>
              <a href="#contact" className={`mt-8 block text-center px-5 py-3 rounded-full text-[14px] font-medium transition-transform hover:-translate-y-0.5 ${p.highlight ? "bg-white text-[#15151A]" : "text-white"}`}
                style={p.highlight ? {} : { background: C.ink }}>{p.cta}</a>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function FAQ() {
  const items = [
    { q: "Do I need experience to join?", a: "No. Our beginner classes are designed for new students and include clear guidance." },
    { q: "What should I bring?", a: "Comfortable clothing, water, and a yoga mat. Mats may also be available at the studio." },
    { q: "Do you offer private sessions?", a: "Yes. Private sessions are available for students who want personal guidance." },
    { q: "Can yoga help with stress?", a: "Many students use yoga, breathwork, and meditation as part of a healthy stress-management routine." },
    { q: "How do I book a class?", a: "Use the contact form or class booking button to reserve your preferred session." },
    { q: "Are classes suitable for all ages?", a: "Many classes are adaptable, but students should choose sessions appropriate for their comfort and ability." },
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="py-24 px-4 md:px-8 bg-white">
      <div className="mx-auto max-w-[860px]">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-center">
          <span className="inline-block px-4 py-1.5 rounded-full text-[12px] font-medium" style={{ background: C.lavender, color: C.ink }}>FAQ</span>
          <h2 className="mt-4 font-bold text-[#15151A]" style={{ fontSize: "clamp(30px, 4vw, 44px)", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
            Common Questions
          </h2>
        </motion.div>
        <div className="mt-10 space-y-3">
          {items.map((it, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="rounded-2xl bg-white border transition-all" style={{ borderColor: isOpen ? C.purple : "rgba(21,21,26,0.08)" }}>
                <button onClick={() => setOpen(isOpen ? null : i)} className="w-full flex items-center justify-between p-5 text-left">
                  <span className="font-medium text-[15px] text-[#15151A]">{it.q}</span>
                  <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: isOpen ? C.purple : C.lavender, color: isOpen ? "white" : C.purple }}>
                    {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-[14px] animate-fade-in" style={{ color: C.mute, lineHeight: 1.6 }}>
                    {it.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const [sent, setSent] = useState(false);
  return (
    <section id="contact" className="py-24 px-4 md:px-8" style={{ background: C.soft }}>
      <div className="mx-auto max-w-[1280px] grid lg:grid-cols-2 gap-12">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
          <span className="inline-block px-4 py-1.5 rounded-full text-[12px] font-medium bg-white" style={{ color: C.ink }}>Contact</span>
          <h2 className="mt-4 font-bold text-[#15151A]" style={{ fontSize: "clamp(30px, 3.8vw, 42px)", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
            Start Your Practice With Serenity Yoga
          </h2>
          <p className="mt-4 text-[15px]" style={{ color: C.mute, lineHeight: 1.6, maxWidth: 480 }}>
            Ask about classes, book a session, or speak with our team about the best practice for your needs.
          </p>
          <div className="mt-8 space-y-4 text-[14px]">
            {[
              { icon: Phone, label: "+1 555 204 8890" },
              { icon: Mail, label: "hello@serenityyoga.com" },
              { icon: MapPin, label: "42 Harmony Street, Wellness District" },
              { icon: Clock, label: "Mon–Fri: 7:00 AM — 8:00 PM · Sat: 8:00 AM — 2:00 PM" },
            ].map((d) => (
              <div key={d.label} className="flex items-center gap-3" style={{ color: C.ink }}>
                <span className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: C.lavender, color: C.purple }}>
                  <d.icon size={16} />
                </span>
                {d.label}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.form initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
          onSubmit={(e) => { e.preventDefault(); setSent(true); }}
          className="bg-white rounded-[28px] p-8 md:p-10 shadow-xl" style={{ boxShadow: "0 30px 60px rgba(21,21,26,0.06)" }}>
          {sent ? (
            <div className="py-20 text-center">
              <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-4" style={{ background: C.lavender, color: C.purple }}>
                <Check size={22} />
              </div>
              <h3 className="text-xl font-semibold" style={{ color: C.ink }}>Message received</h3>
              <p className="mt-2 text-[14px]" style={{ color: C.mute }}>We will contact you soon.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {[
                { label: "Full Name", type: "text" },
                { label: "Email Address", type: "email" },
                { label: "Phone Number", type: "tel" },
              ].map((f) => (
                <div key={f.label}>
                  <label className="text-[12px] font-medium" style={{ color: C.mute }}>{f.label}</label>
                  <input required type={f.type}
                    className="mt-1.5 w-full px-4 py-3 rounded-xl text-[14px] border-0 outline-none transition-all focus:ring-2"
                    style={{ background: C.light }} />
                </div>
              ))}
              <div>
                <label className="text-[12px] font-medium" style={{ color: C.mute }}>Interest</label>
                <select className="mt-1.5 w-full px-4 py-3 rounded-xl text-[14px] border-0 outline-none" style={{ background: C.light }}>
                  <option>Beginner Yoga</option>
                  <option>Morning Flow</option>
                  <option>Meditation</option>
                  <option>Private Session</option>
                  <option>Membership</option>
                </select>
              </div>
              <div>
                <label className="text-[12px] font-medium" style={{ color: C.mute }}>Message</label>
                <textarea required rows={4} className="mt-1.5 w-full px-4 py-3 rounded-xl text-[14px] border-0 outline-none resize-none" style={{ background: C.light }} />
              </div>
              <button type="submit" className="w-full py-3.5 rounded-full text-white text-[14px] font-medium transition-transform hover:-translate-y-0.5"
                style={{ background: C.purple }}>Send Message</button>
            </div>
          )}
        </motion.form>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ background: C.ink, color: "white" }} className="px-4 md:px-8 pt-20 pb-8">
      <div className="mx-auto max-w-[1280px] grid gap-10 md:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-4 text-[13px] text-white/60 max-w-[260px] leading-relaxed">
            A calm space for yoga, meditation, flexibility, and balance.
          </p>
        </div>
        {[
          { title: "Navigation", links: ["About Us", "Reviews", "Services", "Classes"] },
          { title: "Classes", links: ["Beginner Yoga", "Morning Flow", "Meditation", "Private Sessions"] },
          { title: "Contact", links: ["+1 555 204 8890", "hello@serenityyoga.com", "42 Harmony Street", "Mon–Sat: 7:00 — 20:00"] },
        ].map((col) => (
          <div key={col.title}>
            <div className="text-[13px] font-semibold mb-4">{col.title}</div>
            <ul className="space-y-2.5 text-[13px] text-white/60">
              {col.links.map((l) => <li key={l} className="hover:text-white cursor-pointer transition-colors">{l}</li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto max-w-[1280px] mt-12 pt-6 border-t border-white/10 flex flex-wrap justify-between gap-3 text-[12px] text-white/50">
        <span>© 2026 Serenity Yoga. All rights reserved.</span>
        <div className="flex gap-5">
          <span className="hover:text-white cursor-pointer">Privacy Policy</span>
          <span className="hover:text-white cursor-pointer">Terms of Service</span>
        </div>
      </div>
    </footer>
  );
}

function SerenityYoga() {
  return (
    <div className="bg-white min-h-screen" style={{ fontFamily: "'Manrope', 'Inter', system-ui, sans-serif", color: C.ink }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');`}</style>
      <Header />
      <main>
        <Hero />
        <FeatureCards />
        <Testimonials />
        <Classes />
        <Services />
        <Pricing />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
