import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Phone,
  Menu,
  X,
  Star,
  Wrench,
  Gauge,
  Disc,
  Droplets,
  BatteryCharging,
  CircleDot,
  Bike,
  ShieldCheck,
  LifeBuoy,
  PhoneCall,
  Calendar,
  ClipboardCheck,
  Hammer,
  CheckCircle2,
  Plus,
  Minus,
  Mail,
  MapPin,
  Clock,
} from "lucide-react";
import heroImg from "@/assets/autorepair-hero.jpg";
import carImg from "@/assets/autorepair-car.jpg";
import bikeImg from "@/assets/autorepair-bike.jpg";
import ctaImg from "@/assets/autorepair-cta.jpg";

export const Route = createFileRoute("/dev/preview/oficina-auto")({
  component: OficinaPreview,
  head: () => ({
    meta: [
      { title: "AutoRepair · Local Auto & Bike Repair Workshop" },
      {
        name: "description",
        content:
          "AutoRepair — local auto and bike repair workshop. Engine diagnostics, brake repair, same-day service and emergency help.",
      },
    ],
  }),
});

const NAV = [
  { id: "home", label: "Home" },
  { id: "services", label: "Services" },
  { id: "process", label: "Process" },
  { id: "reviews", label: "Reviews" },
  { id: "contact", label: "Contact Us" },
];

const SERVICES = [
  { icon: Gauge, title: "Engine Diagnostics", desc: "Pinpoint engine issues using proper diagnostic tools and clear reporting." },
  { icon: Disc, title: "Brake Repair", desc: "Pads, discs, fluid and full brake system inspection and repair." },
  { icon: Droplets, title: "Oil Change", desc: "Quick oil and filter service using the correct grade for your vehicle." },
  { icon: BatteryCharging, title: "Battery Replacement", desc: "Battery testing, electrical checks and reliable replacements." },
  { icon: CircleDot, title: "Tire & Wheel Service", desc: "Tire change, balancing, alignment checks and wheel inspection." },
  { icon: Bike, title: "Bike Chain & Gear Repair", desc: "Chain adjustment, gear tuning and drivetrain service for bikes." },
  { icon: ShieldCheck, title: "Suspension Inspection", desc: "Shocks, struts and steering inspection for safe handling." },
  { icon: LifeBuoy, title: "Emergency Roadside Help", desc: "Urgent repair help and same-day service availability." },
];

const PROCESS = [
  { icon: PhoneCall, title: "Call Or Book", desc: "Tell us what happened and choose the best time." },
  { icon: ClipboardCheck, title: "Inspection", desc: "Our mechanic checks the issue and confirms what needs repair." },
  { icon: Calendar, title: "Clear Estimate", desc: "You receive a simple explanation and price before work starts." },
  { icon: Hammer, title: "Repair Work", desc: "We complete the repair using proper tools and reliable parts." },
  { icon: CheckCircle2, title: "Final Check", desc: "We test the vehicle or bike before returning it to you." },
];

const WHY = [
  "Certified Mechanics",
  "Same-Day Availability",
  "Clear Repair Estimates",
  "Proper Diagnostic Tools",
  "Auto & Bike Expertise",
  "Local Workshop Support",
];

const METRICS = [
  { v: "1.6K+", l: "Happy Customers" },
  { v: "4.7/5", l: "Average Rating" },
  { v: "3.6K+", l: "People Reached" },
  { v: "24h", l: "Fast Booking Window" },
];

const REVIEWS = [
  { name: "Marcus Reed", svc: "Brake Repair", quote: "They fixed my brakes the same day and explained the cost before starting.", loc: "Camden" },
  { name: "Aisha Bennett", svc: "Engine Diagnostics", quote: "Professional, quick, and honest. The workshop felt organized and reliable.", loc: "Islington" },
  { name: "Tomás Pereira", svc: "Bike Repair", quote: "My bike gear issue was solved faster than expected.", loc: "Hackney" },
  { name: "Hannah Klein", svc: "Oil Change", quote: "Good communication and no surprise charges.", loc: "Shoreditch" },
  { name: "Daniel Okafor", svc: "Engine Diagnostics", quote: "The mechanic found the engine issue quickly.", loc: "Central London" },
  { name: "Priya Shah", svc: "Tire Service", quote: "Easy booking, fast service, and fair price.", loc: "Soho" },
];

const PACKAGES = [
  { name: "Quick Check", price: "$29", items: ["Basic inspection", "Fluid check", "Visual safety check", "Best for quick diagnosis"], highlight: false },
  { name: "Standard Repair", price: "$89", items: ["Brake or engine inspection", "Small adjustments", "Repair estimate", "Best for common issues"], highlight: true },
  { name: "Full Service", price: "$179", items: ["Full diagnostic", "Priority booking", "Repair plan", "Final safety check"], highlight: false },
];

const FAQS = [
  { q: "Do I need an appointment?", a: "Appointments are recommended, but same-day availability may be possible depending on the issue." },
  { q: "Do you repair both cars and bikes?", a: "Yes. AutoRepair handles common auto repairs and bike service requests." },
  { q: "Can you diagnose brake problems?", a: "Yes. Our mechanics inspect brake pads, discs, fluid, and related components." },
  { q: "How long does a repair take?", a: "Timing depends on the issue, parts, and workshop availability. Simple checks may be completed the same day." },
  { q: "Do you give prices before repair?", a: "Yes. We explain the issue and provide an estimate before starting major repair work." },
  { q: "Can I call for emergency help?", a: "Yes. Use the call button for urgent repair help or same-day service requests." },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: [0.2, 0.7, 0.2, 1] as const },
};

function Stars({ color = "#F7C948", size = 14 }: { color?: string; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} fill={color} stroke={color} size={size} />
      ))}
    </div>
  );
}

export function OficinaPreview() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen w-full bg-white text-[#111] font-sans antialiased [font-family:Inter,Manrope,system-ui,sans-serif]">
      {/* Top red emergency strip */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 inset-x-0 z-50 bg-[#D90014] text-white text-[12px] md:text-[13px] font-medium"
      >
        <div className="h-[34px] md:h-[36px] flex items-center justify-center px-4">
          <span className="hidden sm:inline">Need quick repair help? Call us +1-304-494-5083</span>
          <span className="sm:hidden">Emergency repair? Call +1-304-494-5083</span>
        </div>
      </motion.div>

      {/* Main nav */}
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="fixed top-[34px] md:top-[36px] inset-x-0 z-40 bg-white border-b border-[#E8E8E5]"
      >
        <div className="mx-auto max-w-[1240px] px-5 md:px-8 h-[68px] md:h-[78px] flex items-center justify-between">
          <button onClick={() => scrollTo("home")} className="flex items-center gap-2.5">
            <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#D90014] text-white shadow-sm">
              <Wrench size={18} strokeWidth={2.4} />
            </span>
            <span className="text-[18px] md:text-[20px] font-extrabold tracking-tight text-[#111]">AutoRepair</span>
          </button>

          <nav className="hidden lg:flex items-center gap-8">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => scrollTo(n.id)}
                className="text-[14px] font-medium text-[#111] hover:text-[#D90014] transition-colors"
              >
                {n.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="tel:+18775960606"
              className="hidden md:inline-flex items-center gap-2 h-[46px] px-6 bg-[#D90014] hover:bg-[#B80010] text-white text-[13px] font-semibold uppercase tracking-wide rounded-[2px] transition-all hover:-translate-y-0.5 shadow-sm"
            >
              Call Us +877-596-0606 <ArrowRight size={16} />
            </a>
            <button
              onClick={() => setMenuOpen(true)}
              className="lg:hidden inline-flex h-11 w-11 items-center justify-center rounded-md border border-[#E8E8E5] text-[#111]"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-[#050505] text-white lg:hidden"
          >
            <div className="flex items-center justify-between h-[78px] px-5 border-b border-white/10">
              <span className="text-lg font-extrabold">AutoRepair</span>
              <button onClick={() => setMenuOpen(false)} aria-label="Close menu" className="h-11 w-11 inline-flex items-center justify-center">
                <X size={24} />
              </button>
            </div>
            <div className="px-5 py-8 flex flex-col gap-5">
              {NAV.map((n) => (
                <button key={n.id} onClick={() => scrollTo(n.id)} className="text-left text-2xl font-bold">
                  {n.label}
                </button>
              ))}
              <a href="tel:+18775960606" className="mt-4 inline-flex items-center justify-center gap-2 h-14 bg-[#D90014] rounded-[2px] font-semibold uppercase">
                <Phone size={18} /> Call +877-596-0606
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO */}
      <section id="home" className="relative w-full overflow-hidden pt-[102px] md:pt-[114px] bg-[#050505]">
        <motion.div
          initial={{ scale: 1.04 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <img
            src={heroImg}
            alt="Mechanic inspecting underside of lifted vehicle"
            className="h-full w-full object-cover object-[70%_center] md:object-[center_center]"
          />
        </motion.div>
        {/* Overlays */}
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/15" />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/75 to-transparent" />

        {/* dotted pattern */}
        <div
          className="hidden md:block absolute left-6 bottom-10 h-32 w-40 opacity-25 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "10px 10px",
          }}
        />

        <div className="relative mx-auto max-w-[1240px] px-5 md:px-8 min-h-[620px] md:min-h-[720px] flex flex-col justify-center py-16 md:py-24">
          <div className="max-w-[640px]">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-white font-extrabold tracking-[-0.04em] leading-[1.05] text-[40px] sm:text-[52px] md:text-[64px] lg:text-[72px]"
            >
              Your Local Auto & Bike
              <br />
              Repair Workshop
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="mt-6 text-white/85 text-[16px] md:text-[18px] leading-relaxed max-w-[560px]"
            >
              Our mechanics quickly diagnose and fix engine and brake issues using proper tools. Call now!
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4"
            >
              <a
                href="tel:+18775960606"
                className="group inline-flex items-center justify-center gap-2 h-[54px] px-7 bg-[#D90014] hover:bg-[#B80010] text-white text-[14px] font-semibold uppercase tracking-wide rounded-[2px] shadow-lg transition-all hover:-translate-y-0.5"
              >
                Call Us +877-596-0606
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </a>
              <button
                onClick={() => scrollTo("services")}
                className="group inline-flex items-center justify-center gap-2 h-[54px] px-7 bg-transparent text-white border border-white/65 hover:bg-white hover:text-black text-[14px] font-semibold uppercase tracking-wide rounded-[2px] transition-all"
              >
                See All Services
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>

            {/* Review blocks */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.85 }}
              className="mt-12 flex flex-col sm:flex-row gap-8"
            >
              <div>
                <div className="flex items-center gap-2 text-white font-extrabold text-[17px] tracking-tight">
                  <Star fill="#F7C948" stroke="#F7C948" size={16} />
                  ZenZap
                </div>
                <div className="mt-2"><Stars /></div>
                <div className="mt-1.5 text-white/75 text-[13px]">4.7 out of 5</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-white font-extrabold text-[17px] tracking-tight">
                  <span className="inline-block h-3 w-1 bg-[#4CAF50] rounded-sm" />
                  <span className="inline-block h-4 w-1 bg-[#4CAF50] rounded-sm" />
                  <span className="inline-block h-2 w-1 bg-[#4CAF50] rounded-sm" />
                  <span className="ml-1">Pulse</span>
                </div>
                <div className="mt-2"><Stars /></div>
                <div className="mt-1.5 text-white/75 text-[13px]">4.7 out of 5</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="bg-[#F7F7F4] py-16 md:py-20">
        <div className="mx-auto max-w-[1240px] px-5 md:px-8 grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <motion.div {...fadeUp}>
            <div className="flex -space-x-2 mb-4">
              {["#D90014", "#1B1B1B", "#9B9B96", "#333", "#D90014"].map((c, i) => (
                <span key={i} className="h-9 w-9 rounded-full border-2 border-white" style={{ background: c }} />
              ))}
            </div>
            <div className="text-[12px] uppercase tracking-[0.18em] text-[#9B9B96] font-semibold">Ratings</div>
            <div className="mt-2 flex items-center gap-3">
              <Stars color="#D90014" size={18} />
              <span className="font-extrabold text-xl">4.7</span>
            </div>
            <div className="mt-1 text-sm text-[#333]">Loved by more than 3,600 people</div>
            <h2 className="mt-6 text-[34px] md:text-[44px] font-extrabold leading-[1.1] tracking-[-0.02em]">
              1.6K+ happy Customers
              <br />
              in Central London
            </h2>
          </motion.div>
          <motion.div {...fadeUp} className="bg-white p-7 md:p-10 border border-[#E8E8E5]">
            <Stars color="#D90014" size={18} />
            <p className="mt-5 text-[17px] md:text-[19px] leading-relaxed text-[#1B1B1B]">
              “Awesome experience! The folks at AutoRepair were incredibly professional and quick. I took my car in for a brake fix, and they got it done way earlier than I expected.”
            </p>
            <div className="mt-6 flex items-center gap-3">
              <span className="h-11 w-11 rounded-full bg-[#1B1B1B] text-white inline-flex items-center justify-center font-bold">DR</span>
              <div>
                <div className="font-bold">Darlene Roberson</div>
                <div className="text-sm text-[#9B9B96]">Local Visitor</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="bg-white py-20 md:py-28">
        <div className="mx-auto max-w-[1240px] px-5 md:px-8">
          <motion.div {...fadeUp} className="max-w-[720px] mb-12 md:mb-16">
            <div className="text-[12px] uppercase tracking-[0.2em] text-[#D90014] font-bold">Car + Bike</div>
            <h2 className="mt-3 text-[36px] md:text-[52px] font-extrabold leading-[1.05] tracking-[-0.02em]">Our Services</h2>
            <p className="mt-4 text-[#333] text-[16px] md:text-[17px] leading-relaxed">
              From quick diagnostics to full repair work, our mechanics handle common auto and bike problems with speed, precision, and clear communication.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SERVICES.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="group relative bg-white border border-[#E8E8E5] p-6 hover:-translate-y-1 hover:shadow-xl transition-all"
              >
                <span className="absolute inset-x-0 top-0 h-[3px] bg-[#D90014] scale-x-0 group-hover:scale-x-100 origin-left transition-transform" />
                <div className="inline-flex h-12 w-12 items-center justify-center bg-[#D90014] text-white">
                  <s.icon size={22} />
                </div>
                <h3 className="mt-5 text-[18px] font-extrabold tracking-tight">{s.title}</h3>
                <p className="mt-2 text-[14px] text-[#333] leading-relaxed">{s.desc}</p>
                <button className="mt-5 inline-flex items-center gap-1 text-[13px] font-semibold text-[#D90014]">
                  Learn More <ArrowRight size={14} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CAR + BIKE SPLIT */}
      <section className="bg-[#F7F7F4] py-20 md:py-24">
        <div className="mx-auto max-w-[1240px] px-5 md:px-8 grid md:grid-cols-2 gap-6">
          {[
            { title: "Auto Repair", img: carImg, items: ["Engine checks", "Brake systems", "Tires and wheels", "Battery and electrical"], cta: "Book Auto Service" },
            { title: "Bike Repair", img: bikeImg, items: ["Chain adjustment", "Brake tuning", "Tire replacement", "Full safety check"], cta: "Book Bike Service" },
          ].map((c) => (
            <motion.div
              key={c.title}
              {...fadeUp}
              className="relative overflow-hidden rounded-[20px] min-h-[440px] group"
            >
              <img src={c.img} alt={c.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/30" />
              <div className="relative h-full flex flex-col justify-end p-7 md:p-10 text-white">
                <h3 className="text-[32px] md:text-[40px] font-extrabold tracking-[-0.02em]">{c.title}</h3>
                <ul className="mt-4 space-y-1.5 text-[15px] text-white/85">
                  {c.items.map((i) => (
                    <li key={i} className="flex items-center gap-2"><span className="h-1.5 w-1.5 bg-[#D90014] rounded-full" />{i}</li>
                  ))}
                </ul>
                <button onClick={() => scrollTo("contact")} className="mt-6 self-start inline-flex items-center gap-2 h-12 px-6 bg-[#D90014] hover:bg-[#B80010] text-white text-[13px] font-semibold uppercase tracking-wide rounded-[2px] transition-all hover:-translate-y-0.5">
                  {c.cta} <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PROCESS */}
      <section id="process" className="bg-white py-20 md:py-28">
        <div className="mx-auto max-w-[1240px] px-5 md:px-8">
          <motion.div {...fadeUp} className="max-w-[760px] mb-14">
            <div className="text-[12px] uppercase tracking-[0.2em] text-[#D90014] font-bold">Process</div>
            <h2 className="mt-3 text-[36px] md:text-[52px] font-extrabold leading-[1.05] tracking-[-0.02em]">Simple Repair Process From Call To Completion</h2>
            <p className="mt-4 text-[#333] text-[16px] md:text-[17px] leading-relaxed">
              Know what happens before you arrive, during the inspection, and after your service is complete.
            </p>
          </motion.div>
          <div className="relative grid md:grid-cols-5 gap-6 md:gap-4">
            <div className="hidden md:block absolute top-7 left-[10%] right-[10%] h-px bg-[#E8E8E5]" />
            {PROCESS.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative bg-white"
              >
                <div className="relative z-10 mx-auto md:mx-0 h-14 w-14 rounded-full bg-[#D90014] text-white inline-flex items-center justify-center font-extrabold text-lg shadow-md">
                  {i + 1}
                </div>
                <div className="mt-5 flex items-center gap-2">
                  <p.icon size={18} className="text-[#D90014]" />
                  <h3 className="font-extrabold text-[17px]">{p.title}</h3>
                </div>
                <p className="mt-2 text-[14px] text-[#333] leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* EMERGENCY CTA */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <img src={ctaImg} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-black/75" />
        <div className="absolute top-0 left-0 h-1.5 w-32 bg-[#D90014]" />
        <div className="relative mx-auto max-w-[1100px] px-5 md:px-8 text-white text-center">
          <h2 className="text-[36px] md:text-[54px] font-extrabold leading-[1.05] tracking-[-0.02em]">Need Fast Repair Help Today?</h2>
          <p className="mt-5 text-white/80 text-[16px] md:text-[18px] max-w-[680px] mx-auto leading-relaxed">
            Call our local workshop for urgent diagnostics, brake issues, battery problems, and same-day service availability.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <a href="tel:+18775960606" className="inline-flex items-center justify-center gap-2 h-[54px] px-7 bg-[#D90014] hover:bg-[#B80010] text-white text-[14px] font-semibold uppercase tracking-wide rounded-[2px] transition-all hover:-translate-y-0.5">
              <Phone size={18} /> Call +877-596-0606
            </a>
            <button onClick={() => scrollTo("services")} className="inline-flex items-center justify-center gap-2 h-[54px] px-7 border border-white/65 hover:bg-white hover:text-black text-[14px] font-semibold uppercase tracking-wide rounded-[2px] transition-all">
              View Services <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE */}
      <section className="bg-[#F7F7F4] py-20 md:py-28">
        <div className="mx-auto max-w-[1240px] px-5 md:px-8">
          <motion.div {...fadeUp} className="max-w-[760px] mb-12">
            <div className="text-[12px] uppercase tracking-[0.2em] text-[#D90014] font-bold">Why Choose Us</div>
            <h2 className="mt-3 text-[36px] md:text-[52px] font-extrabold leading-[1.05] tracking-[-0.02em]">Reliable Mechanics, Clear Pricing, Faster Repairs</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {WHY.map((w) => (
              <motion.div key={w} {...fadeUp} className="bg-white border border-[#E8E8E5] p-6 flex items-center gap-3">
                <span className="h-10 w-10 inline-flex items-center justify-center bg-[#D90014] text-white"><CheckCircle2 size={18} /></span>
                <span className="font-bold text-[16px]">{w}</span>
              </motion.div>
            ))}
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {METRICS.map((m) => (
              <div key={m.l} className="bg-[#111] text-white p-6 md:p-8">
                <div className="text-[36px] md:text-[44px] font-extrabold tracking-[-0.02em] text-[#D90014]">{m.v}</div>
                <div className="mt-1 text-sm uppercase tracking-wider text-white/70">{m.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section id="reviews" className="bg-white py-20 md:py-28">
        <div className="mx-auto max-w-[1240px] px-5 md:px-8">
          <motion.div {...fadeUp} className="max-w-[760px] mb-12">
            <div className="text-[12px] uppercase tracking-[0.2em] text-[#D90014] font-bold">Reviews</div>
            <h2 className="mt-3 text-[36px] md:text-[52px] font-extrabold leading-[1.05] tracking-[-0.02em]">What Local Customers Say</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {REVIEWS.map((r, i) => (
              <motion.div
                key={r.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="bg-[#F7F7F4] p-7 border border-[#E8E8E5]"
              >
                <Stars color="#D90014" size={16} />
                <p className="mt-4 text-[15px] text-[#1B1B1B] leading-relaxed">"{r.quote}"</p>
                <div className="mt-6 flex items-center gap-3">
                  <span className="h-10 w-10 rounded-full bg-[#111] text-white inline-flex items-center justify-center font-bold text-sm">
                    {r.name.split(" ").map((n) => n[0]).join("")}
                  </span>
                  <div>
                    <div className="font-bold text-[14px]">{r.name}</div>
                    <div className="text-xs text-[#9B9B96]">{r.svc} · {r.loc}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="bg-[#F7F7F4] py-20 md:py-28">
        <div className="mx-auto max-w-[1240px] px-5 md:px-8">
          <motion.div {...fadeUp} className="max-w-[760px] mb-12">
            <div className="text-[12px] uppercase tracking-[0.2em] text-[#D90014] font-bold">Service Packages</div>
            <h2 className="mt-3 text-[36px] md:text-[52px] font-extrabold leading-[1.05] tracking-[-0.02em]">Clear Starting Prices For Common Repairs</h2>
            <p className="mt-4 text-[#333] text-[16px] leading-relaxed">
              Final pricing depends on inspection, vehicle type, parts, and repair complexity.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-5">
            {PACKAGES.map((p) => (
              <motion.div
                key={p.name}
                {...fadeUp}
                className={`bg-white p-8 border-2 ${p.highlight ? "border-[#D90014] shadow-xl md:-translate-y-2" : "border-[#E8E8E5]"}`}
              >
                <div className="text-[12px] uppercase tracking-[0.2em] font-bold text-[#9B9B96]">{p.name}</div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-[42px] font-extrabold text-[#D90014] tracking-[-0.02em]">{p.price}</span>
                  <span className="text-sm text-[#9B9B96]">starting</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {p.items.map((i) => (
                    <li key={i} className="flex items-start gap-2 text-[14px] text-[#1B1B1B]">
                      <CheckCircle2 size={16} className="text-[#D90014] mt-0.5 shrink-0" /> {i}
                    </li>
                  ))}
                </ul>
                <button onClick={() => scrollTo("contact")} className="mt-7 w-full inline-flex items-center justify-center gap-2 h-12 bg-[#D90014] hover:bg-[#B80010] text-white text-[13px] font-semibold uppercase tracking-wide rounded-[2px] transition-all">
                  Book Now <ArrowRight size={16} />
                </button>
              </motion.div>
            ))}
          </div>
          <p className="mt-6 text-xs text-[#9B9B96] text-center">Final pricing confirmed after inspection.</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-20 md:py-28">
        <div className="mx-auto max-w-[900px] px-5 md:px-8">
          <motion.div {...fadeUp} className="mb-10 text-center">
            <div className="text-[12px] uppercase tracking-[0.2em] text-[#D90014] font-bold">FAQ</div>
            <h2 className="mt-3 text-[36px] md:text-[52px] font-extrabold leading-[1.05] tracking-[-0.02em]">Common Repair Questions</h2>
          </motion.div>
          <div className="space-y-3">
            {FAQS.map((f, i) => {
              const open = openFaq === i;
              return (
                <div key={f.q} className={`border ${open ? "border-[#D90014]" : "border-[#E8E8E5]"} bg-[#F7F7F4]`}>
                  <button
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="w-full flex items-center justify-between text-left p-5 md:p-6"
                    aria-expanded={open}
                  >
                    <span className="font-bold text-[16px] md:text-[17px]">{f.q}</span>
                    <span className={`h-8 w-8 inline-flex items-center justify-center ${open ? "bg-[#D90014] text-white" : "bg-white text-[#111] border border-[#E8E8E5]"}`}>
                      {open ? <Minus size={16} /> : <Plus size={16} />}
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 md:px-6 pb-5 md:pb-6 text-[15px] text-[#333] leading-relaxed">{f.a}</div>
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
      <section id="contact" className="bg-[#111] text-white py-20 md:py-28">
        <div className="mx-auto max-w-[1240px] px-5 md:px-8 grid md:grid-cols-2 gap-10 md:gap-16">
          <motion.div {...fadeUp}>
            <div className="text-[12px] uppercase tracking-[0.2em] text-[#D90014] font-bold">Contact Us</div>
            <h2 className="mt-3 text-[36px] md:text-[52px] font-extrabold leading-[1.05] tracking-[-0.02em]">Book Your Repair</h2>
            <p className="mt-4 text-white/75 text-[16px] leading-relaxed max-w-[500px]">
              Tell us what happened and our team will help schedule the right inspection or repair service.
            </p>
            <div className="mt-8 space-y-4 text-[15px]">
              <div className="flex items-center gap-3"><Phone size={18} className="text-[#D90014]" /> +877-596-0606</div>
              <div className="flex items-center gap-3"><LifeBuoy size={18} className="text-[#D90014]" /> Emergency: +1-304-494-5083</div>
              <div className="flex items-center gap-3"><Mail size={18} className="text-[#D90014]" /> hello@autorepair.com</div>
              <div className="flex items-center gap-3"><MapPin size={18} className="text-[#D90014]" /> 128 Workshop Street, Central London</div>
              <div className="flex items-start gap-3"><Clock size={18} className="text-[#D90014] mt-0.5" />
                <div>
                  <div>Mon — Sat: 8:00 AM — 7:00 PM</div>
                  <div className="text-white/60">Sunday: Emergency calls only</div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.form
            {...fadeUp}
            onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
            className="bg-[#1B1B1B] border border-white/10 p-6 md:p-8 space-y-4"
          >
            {submitted ? (
              <div className="py-10 text-center">
                <CheckCircle2 size={48} className="mx-auto text-[#4CAF50]" />
                <h3 className="mt-4 text-2xl font-extrabold">Request received.</h3>
                <p className="mt-2 text-white/75">Our team will contact you shortly.</p>
              </div>
            ) : (
              <>
                {[
                  { label: "Full Name", type: "text" },
                  { label: "Phone Number", type: "tel" },
                  { label: "Email Address", type: "email" },
                ].map((f) => (
                  <div key={f.label}>
                    <label className="block text-xs uppercase tracking-wider text-white/70 mb-1.5">{f.label}</label>
                    <input required type={f.type} className="w-full h-12 bg-[#050505] border border-white/15 px-4 text-white focus:border-[#D90014] outline-none transition-colors" />
                  </div>
                ))}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-white/70 mb-1.5">Service Type</label>
                  <select required className="w-full h-12 bg-[#050505] border border-white/15 px-4 text-white focus:border-[#D90014] outline-none">
                    <option>Auto Repair</option>
                    <option>Bike Repair</option>
                    <option>Brake Repair</option>
                    <option>Engine Diagnostics</option>
                    <option>Battery Replacement</option>
                    <option>Tire Service</option>
                    <option>Emergency Help</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-white/70 mb-1.5">Preferred Date</label>
                  <input required type="date" className="w-full h-12 bg-[#050505] border border-white/15 px-4 text-white focus:border-[#D90014] outline-none" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-white/70 mb-1.5">Message / Issue Description</label>
                  <textarea rows={4} className="w-full bg-[#050505] border border-white/15 px-4 py-3 text-white focus:border-[#D90014] outline-none resize-none" />
                </div>
                <button type="submit" className="w-full inline-flex items-center justify-center gap-2 h-13 py-4 bg-[#D90014] hover:bg-[#B80010] text-white font-semibold uppercase tracking-wide rounded-[2px] transition-all">
                  Request Service <ArrowRight size={16} />
                </button>
              </>
            )}
          </motion.form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#050505] text-white/70 pt-16 pb-8">
        <div className="mx-auto max-w-[1240px] px-5 md:px-8 grid md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5">
              <span className="h-9 w-9 rounded-full bg-[#D90014] inline-flex items-center justify-center text-white"><Wrench size={18} /></span>
              <span className="text-white font-extrabold text-xl">AutoRepair</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed">
              Local auto and bike repair workshop providing diagnostics, brake service, engine checks, and emergency support.
            </p>
          </div>
          <div>
            <div className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Navigation</div>
            <ul className="space-y-2 text-sm">
              {NAV.map((n) => <li key={n.id}><button onClick={() => scrollTo(n.id)} className="hover:text-white">{n.label}</button></li>)}
            </ul>
          </div>
          <div>
            <div className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Services</div>
            <ul className="space-y-2 text-sm">
              <li>Engine Diagnostics</li><li>Brake Repair</li><li>Bike Repair</li><li>Oil Change</li><li>Battery Replacement</li>
            </ul>
          </div>
          <div>
            <div className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Contact</div>
            <ul className="space-y-2 text-sm">
              <li>+877-596-0606</li><li>hello@autorepair.com</li><li>128 Workshop Street, Central London</li><li>Mon — Sat 8AM — 7PM</li>
            </ul>
          </div>
        </div>
        <div className="mx-auto max-w-[1240px] px-5 md:px-8 mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between gap-3 text-xs text-white/50">
          <span>© 2026 AutoRepair. All rights reserved.</span>
          <div className="flex gap-5">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
