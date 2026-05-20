import { createFileRoute } from "@tanstack/react-router";
export { MornaMarket as LojaPreview };
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ShoppingCart, Search, User, Heart, Menu, X, Phone, Mail,
  Facebook, Instagram, Youtube, Twitter, Linkedin, ChevronDown,
  MapPin, Truck, Clock, Leaf, Package, Star, Plus, Minus, ArrowRight,
  Apple, Croissant, Milk, Coffee, Cookie, Sparkles as Spark, Home, Tag,
} from "lucide-react";
import heroImg from "@/assets/morna-hero.jpg";
import about1 from "@/assets/morna-about-1.jpg";
import about2 from "@/assets/morna-about-2.jpg";
import about3 from "@/assets/morna-about-3.jpg";

export const Route = createFileRoute("/dev/preview/loja-local")({
  component: MornaMarket,
  head: () => ({
    meta: [
      { title: "Morna Market · Fresh local essentials" },
      { name: "description", content: "Morna Market — your neighborhood store for fresh groceries, bakery, snacks, drinks and daily essentials. Pickup and local delivery." },
    ],
  }),
});

// ------------ Theme ------------
const C = {
  blue: "#EFF8FC", white: "#FFFFFF", off: "#FBFAF6",
  ink: "#1D1D1F", inkSoft: "#2A2A2A", muted: "#7B7F86",
  orange: "#F47A2A", orangeDeep: "#DE5F16", orangeLight: "#FFE2C8",
  green: "#7CB342", yellow: "#F7C948", teal: "#7ACBC4", peach: "#FFF0E3",
  border: "#E9EEF1",
};

// ------------ Data ------------
const NAV = [
  { label: "Home", href: "#home" },
  { label: "Shop", href: "#categories" },
  { label: "Deals", href: "#deals" },
  { label: "About", href: "#about" },
  { label: "Pickup", href: "#delivery" },
  { label: "Blog", href: "#why" },
  { label: "Contact", href: "#contact" },
];

const CATEGORIES = [
  { name: "Fresh Produce", count: 42, bg: "#E8F5E0", icon: Apple },
  { name: "Bakery", count: 24, bg: "#FFE2C8", icon: Croissant },
  { name: "Dairy & Eggs", count: 18, bg: "#EFF8FC", icon: Milk },
  { name: "Snacks", count: 36, bg: "#FFF0E3", icon: Cookie },
  { name: "Drinks", count: 28, bg: "#E7F5F3", icon: Coffee },
  { name: "Pantry Basics", count: 52, bg: "#FBF3D4", icon: Package },
  { name: "Household", count: 31, bg: "#F1ECFB", icon: Home },
  { name: "Local Favorites", count: 19, bg: "#FFE2C8", icon: Spark },
];

const PRODUCTS = [
  { id: 1, name: "Fresh Baguette", cat: "Bakery", price: 4.5, img: "https://images.unsplash.com/photo-1568471173242-461f0a730452?auto=format&fit=crop&w=600&q=80", badge: null, bg: "#FFE2C8" },
  { id: 2, name: "Organic Bananas", cat: "Produce", price: 2.9, img: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80", badge: "-20%", bg: "#FBF3D4" },
  { id: 3, name: "Local Eggs", cat: "Dairy", price: 6.2, img: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=600&q=80", badge: null, bg: "#EFF8FC" },
  { id: 4, name: "Orange Juice", cat: "Drinks", price: 5.8, img: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=600&q=80", badge: "Fresh", bg: "#FFE2C8" },
  { id: 5, name: "Mixed Greens", cat: "Produce", price: 4.2, img: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80", badge: null, bg: "#E8F5E0" },
  { id: 6, name: "Roasted Coffee", cat: "Pantry", price: 12, img: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80", badge: "Top", bg: "#FFF0E3" },
  { id: 7, name: "Family Snack Box", cat: "Snacks", price: 9.5, img: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=600&q=80", badge: "-15%", bg: "#FBF3D4" },
  { id: 8, name: "Cleaning Essentials", cat: "Household", price: 7.9, img: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=600&q=80", badge: null, bg: "#F1ECFB" },
];

const FAQS = [
  { q: "Do you offer local delivery?", a: "Yes. Local delivery is available in selected nearby areas, with free delivery over $30." },
  { q: "Can I order online and pick up in store?", a: "Yes. Choose pickup at checkout and we will prepare your order for collection." },
  { q: "Are products updated daily?", a: "Fresh produce, bakery items, and selected local goods are updated regularly based on availability." },
  { q: "Do you sell household essentials?", a: "Yes. The store includes pantry basics, cleaning items, personal care, and daily household products." },
  { q: "Can I request a product?", a: "Yes. Use the contact form to ask about specific items or local products." },
  { q: "Do you have weekly discounts?", a: "Yes. Weekly deals are shown on the homepage and updated regularly." },
];

const TESTIMONIALS = [
  { name: "Amanda R.", text: "Fresh products, quick pickup, and fair prices. It feels like shopping from a real neighborhood store." },
  { name: "Marcus T.", text: "The weekly deals are useful, and the delivery is faster than expected." },
  { name: "Helen M.", text: "Clean website, easy ordering, and the bakery items are always fresh." },
];

// ------------ Bits ------------
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
} as const;

function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <a href="#home" className="flex items-center gap-2 group">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: C.orange }}>
        <ShoppingCart className="w-5 h-5 text-white" strokeWidth={2.5} />
      </div>
      <div className="leading-none">
        <div className="text-[20px] font-black tracking-tight" style={{ color: dark ? C.white : C.ink, fontFamily: "'Baloo 2', 'Nunito', system-ui" }}>MORNA</div>
        <div className="text-[10px] uppercase tracking-[0.22em]" style={{ color: dark ? "#888" : C.muted }}>market</div>
      </div>
    </a>
  );
}

function Doodle({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`absolute pointer-events-none opacity-40 ${className}`}>{children}</div>;
}

// ------------ Main ------------
export function MornaMarket() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<{ id: number; qty: number }[]>([
    { id: 1, qty: 1 }, { id: 4, qty: 2 },
  ]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [formSent, setFormSent] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 20);
    on();
    window.addEventListener("scroll", on);
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen || searchOpen || cartOpen ? "hidden" : "";
  }, [menuOpen, searchOpen, cartOpen]);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const addToCart = (id: number) => setCart((c) => {
    const ex = c.find((i) => i.id === id);
    return ex ? c.map((i) => i.id === id ? { ...i, qty: i.qty + 1 } : i) : [...c, { id, qty: 1 }];
  });
  const toggleWish = (id: number) => setWishlist((w) => w.includes(id) ? w.filter((x) => x !== id) : [...w, id]);

  return (
    <div id="home" className="min-h-screen w-full overflow-x-hidden" style={{ background: C.white, color: C.ink, fontFamily: "'Nunito Sans', 'Inter', system-ui" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700;800&family=Nunito+Sans:wght@400;600;700;800&display=swap');
        .heading{font-family:'Baloo 2','Nunito',system-ui;letter-spacing:-0.03em;line-height:1.02;}
      `}</style>

      {/* Top announcement */}
      <div className="text-white text-[12px]" style={{ background: "#5E7F8D" }}>
        <div className="max-w-[1280px] mx-auto px-4 h-[36px] flex items-center justify-between gap-4">
          <div className="hidden md:flex items-center gap-3 opacity-80">
            {[Facebook, Instagram, Youtube, Twitter, Linkedin].map((I, i) => (
              <a key={i} href="#" aria-label="social" className="hover:opacity-100"><I className="w-3.5 h-3.5" /></a>
            ))}
          </div>
          <div className="flex-1 text-center font-medium">
            <span className="hidden sm:inline">Summer Deal · 35% off fresh picks </span>
            <span className="opacity-60 hidden sm:inline">|</span>
            <span> Free delivery over $30</span>
          </div>
          <div className="hidden lg:flex items-center gap-4 opacity-90">
            <a href="tel:+12144819074" className="flex items-center gap-1.5 hover:opacity-100"><Phone className="w-3 h-3" />+1 214-481-9074</a>
            <a href="mailto:hello@mornamarket.com" className="flex items-center gap-1.5 hover:opacity-100"><Mail className="w-3 h-3" />hello@mornamarket.com</a>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className={`sticky top-0 z-40 transition-all ${scrolled ? "shadow-sm" : ""}`} style={{ background: C.white }}>
        <div className="max-w-[1280px] mx-auto px-4 lg:px-6 h-[78px] lg:h-[90px] flex items-center justify-between gap-4">
          <Logo />
          <nav className="hidden lg:flex items-center gap-7 text-[14px] font-semibold" style={{ color: C.inkSoft }}>
            {NAV.map((n) => (
              <a key={n.label} href={n.href} className="hover:text-[color:var(--o)] transition-colors relative group" style={{ ["--o" as any]: C.orange }}>
                {n.label}
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 group-hover:w-full transition-all" style={{ background: C.orange }} />
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2 lg:gap-3">
            <div className="hidden xl:flex items-center gap-3 text-[13px]" style={{ color: C.muted }}>
              <button className="flex items-center gap-1 hover:text-[color:var(--i)]" style={{ ["--i" as any]: C.ink }}>USD <ChevronDown className="w-3 h-3" /></button>
              <span className="text-gray-300">|</span>
              <button className="flex items-center gap-1 hover:text-[color:var(--i)]" style={{ ["--i" as any]: C.ink }}>English <ChevronDown className="w-3 h-3" /></button>
            </div>
            <button onClick={() => setSearchOpen(true)} aria-label="Search" className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100"><Search className="w-[18px] h-[18px]" /></button>
            <button aria-label="Account" className="hidden sm:flex w-10 h-10 rounded-full items-center justify-center hover:bg-gray-100"><User className="w-[18px] h-[18px]" /></button>
            <button aria-label="Wishlist" className="hidden sm:flex relative w-10 h-10 rounded-full items-center justify-center hover:bg-gray-100">
              <Heart className="w-[18px] h-[18px]" />
              {wishlist.length > 0 && <span className="absolute top-1 right-1 text-[10px] font-bold text-white rounded-full w-4 h-4 flex items-center justify-center" style={{ background: C.orange }}>{wishlist.length}</span>}
            </button>
            <button onClick={() => setCartOpen(true)} aria-label="Cart" className="relative w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100">
              <ShoppingCart className="w-[18px] h-[18px]" />
              {cartCount > 0 && <span className="absolute top-1 right-1 text-[10px] font-bold text-white rounded-full w-4 h-4 flex items-center justify-center" style={{ background: C.orange }}>{cartCount}</span>}
            </button>
            <button onClick={() => setMenuOpen(true)} aria-label="Menu" className="lg:hidden w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100"><Menu className="w-5 h-5" /></button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "tween" }} className="fixed inset-0 z-50 bg-white p-6 lg:hidden">
            <div className="flex justify-between items-center mb-8"><Logo /><button onClick={() => setMenuOpen(false)} aria-label="Close"><X className="w-6 h-6" /></button></div>
            <nav className="flex flex-col gap-4 text-2xl font-bold heading">
              {NAV.map((n) => <a key={n.label} href={n.href} onClick={() => setMenuOpen(false)}>{n.label}</a>)}
            </nav>
            <a href="#contact" onClick={() => setMenuOpen(false)} className="mt-8 inline-flex h-12 px-6 rounded-full items-center justify-center font-semibold text-white" style={{ background: C.orange }}>Contact us</a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={() => setSearchOpen(false)}>
            <motion.div initial={{ y: -40 }} animate={{ y: 0 }} className="bg-white p-6 max-w-2xl mx-auto mt-20 rounded-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 border-b pb-3">
                <Search className="w-5 h-5 text-gray-400" />
                <input autoFocus placeholder="Search groceries, bakery, drinks..." className="flex-1 outline-none text-lg" />
                <button onClick={() => setSearchOpen(false)}><X className="w-5 h-5" /></button>
              </div>
              <div className="mt-4 text-sm text-gray-500 mb-2">Suggestions</div>
              <div className="flex flex-wrap gap-2">
                {["Fresh Baguette", "Organic Bananas", "Orange Juice", "Local Eggs"].map((s) => (
                  <button key={s} className="px-3 py-1.5 rounded-full text-sm font-medium" style={{ background: C.blue, color: C.ink }}>{s}</button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart drawer */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40" onClick={() => setCartOpen(false)} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "tween" }} className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-white flex flex-col">
              <div className="flex items-center justify-between p-5 border-b">
                <div className="font-bold text-lg heading">Your cart ({cartCount})</div>
                <button onClick={() => setCartOpen(false)} aria-label="Close"><X className="w-5 h-5" /></button>
              </div>
              <div className="flex-1 overflow-auto p-5 space-y-4">
                {cart.map((ci) => {
                  const p = PRODUCTS.find((p) => p.id === ci.id)!;
                  return (
                    <div key={ci.id} className="flex gap-3 items-center">
                      <div className="w-16 h-16 rounded-xl overflow-hidden" style={{ background: p.bg }}>
                        <img src={p.img} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{p.name}</div>
                        <div className="text-xs text-gray-500">${p.price.toFixed(2)}</div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <button onClick={() => setCart((c) => c.map((i) => i.id === ci.id ? { ...i, qty: Math.max(1, i.qty - 1) } : i))} className="w-7 h-7 rounded-full border flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                        <span className="w-5 text-center font-semibold">{ci.qty}</span>
                        <button onClick={() => setCart((c) => c.map((i) => i.id === ci.id ? { ...i, qty: i.qty + 1 } : i))} className="w-7 h-7 rounded-full border flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="border-t p-5 space-y-3">
                <div className="flex justify-between font-semibold"><span>Subtotal</span><span>${cart.reduce((s, ci) => s + PRODUCTS.find((p) => p.id === ci.id)!.price * ci.qty, 0).toFixed(2)}</span></div>
                <button className="w-full h-12 rounded-full text-white font-bold" style={{ background: C.orange }}>Checkout</button>
                <button className="w-full h-12 rounded-full font-bold border-2" style={{ borderColor: C.ink, color: C.ink }}>View Cart</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* HERO */}
      <section className="relative overflow-hidden" style={{ background: C.blue }}>
        {/* Doodles */}
        <Doodle className="top-20 left-10 text-gray-400"><Apple className="w-6 h-6" /></Doodle>
        <Doodle className="top-40 left-1/3 text-gray-400"><Croissant className="w-5 h-5" /></Doodle>
        <Doodle className="bottom-40 left-20 text-gray-400"><Leaf className="w-7 h-7" /></Doodle>
        <Doodle className="top-32 right-1/3 text-gray-400 rotate-12"><Tag className="w-5 h-5" /></Doodle>
        <Doodle className="bottom-32 right-10 text-gray-400"><ShoppingCart className="w-8 h-8" /></Doodle>

        <div className="max-w-[1280px] mx-auto px-4 lg:px-6 pt-12 pb-32 lg:py-24 grid lg:grid-cols-2 gap-10 items-center min-h-[620px] lg:min-h-[680px]">
          {/* Left */}
          <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.12 } } }} className="relative z-10 max-w-[600px]">
            <motion.div variants={fadeUp} className="flex items-center gap-2 mb-5">
              <span className="text-xs font-bold uppercase tracking-[0.22em]" style={{ color: C.orange }}>· Fresh Daily ·</span>
            </motion.div>
            <motion.h1 variants={fadeUp} className="heading font-black text-[42px] sm:text-[56px] lg:text-[78px]" style={{ color: C.ink, fontWeight: 900 }}>
              40% Savings on<br />Everyday Local<br />
              <span className="relative inline-block">
                Essentials
                <svg className="absolute left-0 -bottom-2 w-full" viewBox="0 0 240 14" fill="none">
                  <path d="M2 9 Q60 -2 120 6 T238 5" stroke={C.ink} strokeWidth="3" strokeLinecap="round" fill="none" />
                </svg>
              </span>
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-6 text-[16px] leading-[1.7] max-w-[560px]" style={{ color: C.muted }}>
              Shop fresh groceries, bakery favorites, snacks, drinks, and household basics from your trusted local store.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-5">
              <a href="#categories" className="group inline-flex items-center gap-3 h-[52px] pl-7 pr-2 rounded-full font-bold text-white transition-all hover:-translate-y-0.5" style={{ background: C.orange }}>
                Shop Now
                <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center group-hover:translate-x-1 transition-transform" style={{ color: C.orange }}><ArrowRight className="w-4 h-4" /></span>
              </a>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {["A", "M", "H", "J"].map((l, i) => (
                    <div key={i} className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold" style={{ background: [C.orange, C.green, C.teal, C.yellow][i] }}>{l}</div>
                  ))}
                  <div className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-bold" style={{ background: C.orange }}>1k</div>
                </div>
                <div className="text-sm">
                  <div className="font-bold flex items-center gap-1">{[1, 2, 3, 4, 5].map((i) => <Star key={i} className="w-3 h-3 fill-current" style={{ color: C.yellow }} />)}</div>
                  <div className="text-xs" style={{ color: C.muted }}>Local Reviews</div>
                </div>
              </div>
            </motion.div>
            <motion.div variants={fadeUp} className="mt-10 flex items-center gap-4 text-sm" style={{ color: C.muted }}>
              <div className="w-12 h-px bg-gray-400" />
              <span className="font-semibold">1/4</span>
              <button className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-white" style={{ borderColor: C.muted }}><ArrowRight className="w-4 h-4" /></button>
            </motion.div>
          </motion.div>

          {/* Right image */}
          <motion.div initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="relative">
            <div className="relative">
              <img src={heroImg} alt="Local shopper with grocery bag" className="relative z-10 w-full max-w-[560px] mx-auto" width={1280} height={1280} />
              {/* Floating doodles */}
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute top-10 left-0 z-20 bg-white rounded-2xl shadow-lg p-3 hidden sm:flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: C.orangeLight }}><Truck className="w-4 h-4" style={{ color: C.orange }} /></div>
                <div>
                  <div className="text-[10px]" style={{ color: C.muted }}>Free delivery</div>
                  <div className="text-xs font-bold">Over $30</div>
                </div>
              </motion.div>
              <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 5, repeat: Infinity }} className="absolute bottom-16 right-0 z-20 bg-white rounded-2xl shadow-lg p-3 hidden sm:flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#E8F5E0" }}><Leaf className="w-4 h-4" style={{ color: C.green }} /></div>
                <div>
                  <div className="text-[10px]" style={{ color: C.muted }}>100% Fresh</div>
                  <div className="text-xs font-bold">Daily picks</div>
                </div>
              </motion.div>
              <motion.div animate={{ rotate: [0, 10, 0] }} transition={{ duration: 6, repeat: Infinity }} className="absolute top-20 right-4 z-20 w-12 h-12 rounded-full border-2 flex items-center justify-center" style={{ borderColor: C.orange, color: C.orange }}>
                <ShoppingCart className="w-5 h-5" />
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Wave */}
        <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 1440 80" preserveAspectRatio="none" fill={C.white}>
          <path d="M0,40 C320,90 720,0 1080,40 C1260,60 1380,30 1440,40 L1440,80 L0,80 Z" />
        </svg>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-20 lg:py-28 relative" style={{ background: C.white }}>
        <div className="max-w-[1280px] mx-auto px-4 lg:px-6 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image collage */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="relative h-[480px] sm:h-[560px]">
            <div className="absolute top-0 left-0 w-[68%] h-[58%] rounded-[26px] overflow-hidden shadow-xl">
              <img src={about1} alt="Fresh produce" className="w-full h-full object-cover" loading="lazy" />
            </div>
            <div className="absolute top-[30%] right-0 w-[48%] h-[48%] rounded-[22px] overflow-hidden shadow-xl">
              <img src={about2} alt="Bakery" className="w-full h-full object-cover" loading="lazy" />
            </div>
            <div className="absolute bottom-0 left-[14%] w-[52%] h-[44%] rounded-[22px] overflow-hidden shadow-xl">
              <img src={about3} alt="Grocery bag" className="w-full h-full object-cover" loading="lazy" />
            </div>
            <div className="absolute top-4 right-4 z-10 bg-white rounded-full px-4 py-2 shadow-lg flex items-center gap-2 text-sm font-bold" style={{ color: C.orange }}>
              <Spark className="w-4 h-4" /> Local since 2018
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.1 }}>
            <div className="text-xs font-bold uppercase tracking-[0.22em] mb-4" style={{ color: C.orange }}>About Us</div>
            <h2 className="heading text-[36px] sm:text-[48px] font-black" style={{ color: C.ink }}>
              Fresh Essentials To Keep Your Home Stocked
            </h2>
            <p className="mt-5 text-[16px] leading-[1.7]" style={{ color: C.muted }}>
              Morna Market is a neighborhood store built for daily convenience. We bring together fresh produce, bakery items, snacks, drinks, pantry basics, and household essentials in one simple local shopping experience.
            </p>
            <p className="mt-3 text-[15px] leading-[1.7]" style={{ color: C.muted }}>
              Order online for pickup or local delivery, or visit the store for fresh daily finds.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[{ I: Apple, t: "Fresh Produce" }, { I: Croissant, t: "Daily Bakery" }, { I: Home, t: "Home Essentials" }].map((f, i) => (
                <div key={i} className="text-center">
                  <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-3" style={{ background: C.blue }}>
                    <f.I className="w-6 h-6" style={{ color: C.orange }} />
                  </div>
                  <div className="text-sm font-bold">{f.t}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section id="categories" className="py-20 lg:py-28" style={{ background: C.off }}>
        <div className="max-w-[1280px] mx-auto px-4 lg:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs font-bold uppercase tracking-[0.22em] mb-3" style={{ color: C.orange }}>Shop by Category</div>
            <h2 className="heading text-[36px] sm:text-[48px] font-black" style={{ color: C.ink }}>Everything You Need For The Week</h2>
            <p className="mt-4" style={{ color: C.muted }}>Browse daily essentials, fresh items, snacks, and local favorites.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {CATEGORIES.map((c, i) => (
              <motion.a key={c.name} href="#products" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="group rounded-3xl p-6 hover:-translate-y-1 transition-all border" style={{ background: c.bg, borderColor: "transparent" }}>
                <div className="w-14 h-14 rounded-2xl bg-white/70 flex items-center justify-center mb-4">
                  <c.icon className="w-6 h-6" style={{ color: C.ink }} />
                </div>
                <div className="font-black text-lg heading">{c.name}</div>
                <div className="text-sm mt-1 flex items-center justify-between" style={{ color: C.muted }}>
                  <span>{c.count} items</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" style={{ color: C.orange }} />
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section id="products" className="py-20 lg:py-28" style={{ background: C.white }}>
        <div className="max-w-[1280px] mx-auto px-4 lg:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs font-bold uppercase tracking-[0.22em] mb-3" style={{ color: C.orange }}>Featured Products</div>
            <h2 className="heading text-[36px] sm:text-[48px] font-black">Popular Picks From The Store</h2>
            <p className="mt-4" style={{ color: C.muted }}>Fresh, practical, and ready for pickup or delivery.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {PRODUCTS.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="group rounded-3xl border bg-white overflow-hidden hover:-translate-y-1.5 hover:shadow-xl transition-all" style={{ borderColor: C.border }}>
                <div className="relative aspect-square overflow-hidden" style={{ background: p.bg }}>
                  <img src={p.img} alt={p.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {p.badge && <span className="absolute top-3 left-3 text-[11px] font-bold text-white px-2.5 py-1 rounded-full" style={{ background: C.orange }}>{p.badge}</span>}
                  <button onClick={() => toggleWish(p.id)} aria-label="Wishlist" className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white shadow flex items-center justify-center">
                    <Heart className="w-4 h-4" fill={wishlist.includes(p.id) ? C.orange : "none"} style={{ color: wishlist.includes(p.id) ? C.orange : C.ink }} />
                  </button>
                </div>
                <div className="p-5">
                  <div className="text-[11px] uppercase tracking-wider font-semibold mb-1" style={{ color: C.muted }}>{p.cat}</div>
                  <div className="font-bold heading text-lg">{p.name}</div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="font-black text-lg" style={{ color: C.ink }}>${p.price.toFixed(2)}</div>
                    <button onClick={() => addToCart(p.id)} aria-label="Add to cart" className="h-9 px-4 rounded-full text-white text-sm font-bold flex items-center gap-1 hover:opacity-90" style={{ background: C.orange }}>
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WEEKLY DEALS */}
      <section id="deals" className="py-20 lg:py-28" style={{ background: C.blue }}>
        <div className="max-w-[1280px] mx-auto px-4 lg:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-xs font-bold uppercase tracking-[0.22em] mb-3" style={{ color: C.orange }}>Weekly Deals</div>
            <h2 className="heading text-[36px] sm:text-[48px] font-black">Fresh Savings Every Week</h2>
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="lg:col-span-2 rounded-[32px] p-8 lg:p-12 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${C.orange}, ${C.orangeDeep})` }}>
              <div className="relative z-10 text-white max-w-md">
                <div className="text-xs font-bold uppercase tracking-[0.22em] mb-3 opacity-80">Limited Time</div>
                <h3 className="heading text-[34px] sm:text-[44px] font-black leading-[1.05]">Save 40% On Everyday Essentials</h3>
                <p className="mt-4 opacity-90">Limited weekly selection on groceries, bakery, drinks, and pantry basics.</p>
                <div className="mt-6 flex gap-3">
                  {[{ v: "02", l: "Days" }, { v: "14", l: "Hours" }, { v: "38", l: "Min" }].map((t) => (
                    <div key={t.l} className="bg-white/20 backdrop-blur rounded-2xl px-4 py-3 text-center min-w-[70px]">
                      <div className="font-black text-2xl">{t.v}</div>
                      <div className="text-[11px] uppercase tracking-wider">{t.l}</div>
                    </div>
                  ))}
                </div>
                <button className="mt-7 inline-flex items-center gap-2 h-12 px-7 rounded-full bg-white font-bold" style={{ color: C.orange }}>View Deals <ArrowRight className="w-4 h-4" /></button>
              </div>
              <div className="absolute -right-10 -bottom-10 opacity-30">
                <ShoppingCart className="w-72 h-72 text-white" strokeWidth={1} />
              </div>
            </motion.div>
            <div className="flex flex-col gap-6">
              {[{ t: "Bakery Bundle", c: C.orangeLight, i: Croissant }, { t: "Fresh Fruit Pack", c: "#E8F5E0", i: Apple }, { t: "Breakfast Essentials", c: "#FBF3D4", i: Milk }].map((d) => (
                <div key={d.t} className="rounded-3xl p-6 flex items-center gap-4" style={{ background: d.c }}>
                  <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center"><d.i className="w-6 h-6" style={{ color: C.orange }} /></div>
                  <div className="flex-1">
                    <div className="heading font-black text-lg">{d.t}</div>
                    <div className="text-sm" style={{ color: C.muted }}>Up to 30% off</div>
                  </div>
                  <ArrowRight className="w-5 h-5" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* DELIVERY */}
      <section id="delivery" className="py-20 lg:py-28" style={{ background: C.white }}>
        <div className="max-w-[1280px] mx-auto px-4 lg:px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.22em] mb-3" style={{ color: C.orange }}>Pickup & Delivery</div>
            <h2 className="heading text-[34px] sm:text-[44px] font-black">Order Online, Pick Up Nearby, Or Get It Delivered</h2>
            <p className="mt-5" style={{ color: C.muted }}>Choose the shopping option that fits your day. We prepare your order locally and keep the process simple.</p>
            <div className="mt-8 space-y-4">
              {[
                { I: Package, t: "Store Pickup", d: "Order online and collect from the counter." },
                { I: Truck, t: "Local Delivery", d: "Fast delivery within selected nearby areas." },
                { I: Clock, t: "Same-Day Essentials", d: "Get urgent household basics without a long wait." },
              ].map((s) => (
                <div key={s.t} className="flex gap-4 p-5 rounded-2xl border" style={{ borderColor: C.border }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: C.orangeLight }}><s.I className="w-5 h-5" style={{ color: C.orange }} /></div>
                  <div>
                    <div className="font-bold heading text-lg">{s.t}</div>
                    <div className="text-sm" style={{ color: C.muted }}>{s.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative rounded-[32px] overflow-hidden p-8 min-h-[400px] flex items-end" style={{ background: C.blue }}>
            <div className="absolute inset-0 opacity-30">
              <svg viewBox="0 0 400 400" className="w-full h-full"><defs><pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M 30 0 L 0 0 0 30" fill="none" stroke={C.teal} strokeWidth="0.5" /></pattern></defs><rect width="400" height="400" fill="url(#grid)" /></svg>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border-2 border-dashed" style={{ borderColor: C.orange }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center" style={{ background: C.orange }}>
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div className="relative z-10 bg-white rounded-2xl p-5 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: C.orangeLight }}><Truck className="w-5 h-5" style={{ color: C.orange }} /></div>
                <div>
                  <div className="text-xs" style={{ color: C.muted }}>Free delivery over</div>
                  <div className="font-black text-xl heading">$30.00</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY */}
      <section id="why" className="py-20 lg:py-28" style={{ background: C.off }}>
        <div className="max-w-[1280px] mx-auto px-4 lg:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs font-bold uppercase tracking-[0.22em] mb-3" style={{ color: C.orange }}>Why Morna</div>
            <h2 className="heading text-[36px] sm:text-[48px] font-black">Local Shopping Made Easier</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-12">
            {[
              { I: Leaf, t: "Fresh Daily Stock" }, { I: User, t: "Friendly Local Service" },
              { I: Clock, t: "Quick Pickup" }, { I: Package, t: "Simple Online Orders" },
              { I: Tag, t: "Weekly Deals" }, { I: Heart, t: "Trusted by Neighbors" },
            ].map((f, i) => (
              <motion.div key={f.t} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="bg-white rounded-3xl p-6 border hover:shadow-lg transition-all" style={{ borderColor: C.border }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: C.blue }}><f.I className="w-5 h-5" style={{ color: C.orange }} /></div>
                <div className="font-bold heading text-lg">{f.t}</div>
              </motion.div>
            ))}
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {[{ v: "1.6K+", l: "Happy local customers" }, { v: "4.8/5", l: "Average rating" }, { v: "35%", l: "Weekly deal savings" }, { v: "30min", l: "Fast pickup prep" }].map((m) => (
              <div key={m.l} className="rounded-3xl p-6 text-center" style={{ background: C.orange, color: "white" }}>
                <div className="heading font-black text-4xl">{m.v}</div>
                <div className="text-sm mt-1 opacity-90">{m.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 lg:py-28" style={{ background: C.white }}>
        <div className="max-w-[1280px] mx-auto px-4 lg:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs font-bold uppercase tracking-[0.22em] mb-3" style={{ color: C.orange }}>Reviews</div>
            <h2 className="heading text-[36px] sm:text-[48px] font-black">Loved By Local Shoppers</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="rounded-[24px] p-7 border bg-white shadow-sm" style={{ borderColor: C.border }}>
                <div className="flex gap-1 mb-4">{[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-4 h-4 fill-current" style={{ color: C.yellow }} />)}</div>
                <p className="text-[15px] leading-relaxed" style={{ color: C.inkSoft }}>"{t.text}"</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-white" style={{ background: [C.orange, C.green, C.teal][i] }}>{t.name[0]}</div>
                  <div className="font-bold">{t.name}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 lg:py-28" style={{ background: C.off }}>
        <div className="max-w-3xl mx-auto px-4 lg:px-6">
          <div className="text-center mb-12">
            <div className="text-xs font-bold uppercase tracking-[0.22em] mb-3" style={{ color: C.orange }}>FAQ</div>
            <h2 className="heading text-[36px] sm:text-[48px] font-black">Common Questions</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: C.border }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full p-5 flex items-center justify-between text-left">
                  <span className="font-bold heading text-lg pr-4">{f.q}</span>
                  <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors" style={{ background: openFaq === i ? C.orange : C.blue, color: openFaq === i ? "white" : C.ink }}>
                    {openFaq === i ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </span>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="px-5 pb-5 text-[15px]" style={{ color: C.muted }}>{f.a}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-20 lg:py-28" style={{ background: C.white }}>
        <div className="max-w-[1280px] mx-auto px-4 lg:px-6 grid lg:grid-cols-2 gap-12">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.22em] mb-3" style={{ color: C.orange }}>Contact</div>
            <h2 className="heading text-[36px] sm:text-[48px] font-black">Visit Morna Market</h2>
            <p className="mt-4" style={{ color: C.muted }}>Stop by the store, place a pickup order, or contact us about local delivery.</p>
            <div className="mt-8 space-y-4">
              {[
                { I: Phone, l: "Phone", v: "+1 214-481-9074" },
                { I: Mail, l: "Email", v: "hello@mornamarket.com" },
                { I: MapPin, l: "Address", v: "128 Market Street, Downtown District" },
                { I: Clock, l: "Hours", v: "Mon — Sat: 8AM — 9PM · Sun: 9AM — 6PM" },
              ].map((c) => (
                <div key={c.l} className="flex gap-4 items-start">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: C.orangeLight }}><c.I className="w-5 h-5" style={{ color: C.orange }} /></div>
                  <div>
                    <div className="text-xs uppercase tracking-wider font-semibold" style={{ color: C.muted }}>{c.l}</div>
                    <div className="font-bold">{c.v}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 rounded-2xl overflow-hidden h-48 relative" style={{ background: C.blue }}>
              <div className="absolute inset-0 opacity-40">
                <svg viewBox="0 0 400 200" className="w-full h-full"><path d="M0,100 Q100,40 200,100 T400,100" stroke={C.teal} fill="none" strokeWidth="2" /><path d="M0,140 Q150,80 300,140 T500,140" stroke={C.teal} fill="none" strokeWidth="1" /></svg>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center shadow-lg" style={{ background: C.orange }}>
                <MapPin className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); setFormSent(true); }} className="rounded-[28px] p-7 lg:p-9 shadow-xl border" style={{ borderColor: C.border, background: C.white }}>
            {formSent ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-green-100 mx-auto flex items-center justify-center mb-4"><Spark className="w-7 h-7 text-green-600" /></div>
                <h3 className="heading font-black text-2xl">Message received</h3>
                <p className="mt-2" style={{ color: C.muted }}>Our team will contact you soon.</p>
              </div>
            ) : (
              <>
                <h3 className="heading font-black text-2xl mb-1">Send us a message</h3>
                <p className="text-sm mb-6" style={{ color: C.muted }}>We reply within one business day.</p>
                <div className="space-y-4">
                  {[{ l: "Full Name", t: "text" }, { l: "Email", t: "email" }, { l: "Phone", t: "tel" }].map((f) => (
                    <div key={f.l}>
                      <label className="text-sm font-semibold mb-1.5 block">{f.l}</label>
                      <input type={f.t} required className="w-full h-12 rounded-xl border px-4 outline-none focus:border-[color:var(--o)]" style={{ borderColor: C.border, ["--o" as any]: C.orange }} />
                    </div>
                  ))}
                  <div>
                    <label className="text-sm font-semibold mb-1.5 block">Request Type</label>
                    <select className="w-full h-12 rounded-xl border px-4 outline-none bg-white" style={{ borderColor: C.border }}>
                      <option>Pickup Order</option><option>Delivery Question</option><option>Product Request</option><option>General Contact</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-1.5 block">Message</label>
                    <textarea rows={4} required className="w-full rounded-xl border px-4 py-3 outline-none" style={{ borderColor: C.border }} />
                  </div>
                  <button type="submit" className="w-full h-13 py-3.5 rounded-full font-bold text-white text-base hover:-translate-y-0.5 transition-all" style={{ background: C.orange }}>Send Message</button>
                </div>
              </>
            )}
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="pt-16 pb-8" style={{ background: C.ink, color: "white" }}>
        <div className="max-w-[1280px] mx-auto px-4 lg:px-6 grid lg:grid-cols-4 gap-10">
          <div>
            <Logo dark />
            <p className="mt-4 text-sm text-gray-400 max-w-xs">Your local neighborhood store for fresh groceries, bakery items, snacks, drinks, and daily essentials.</p>
            <div className="mt-5 flex gap-2">
              {[Facebook, Instagram, Youtube, Twitter, Linkedin].map((I, i) => (
                <a key={i} href="#" aria-label="social" className="w-9 h-9 rounded-full bg-white/10 hover:bg-orange-500 flex items-center justify-center transition-colors"><I className="w-4 h-4" /></a>
              ))}
            </div>
          </div>
          {[
            { t: "Shop", l: ["Fresh Produce", "Bakery", "Dairy & Eggs", "Snacks", "Household"] },
            { t: "Company", l: ["About", "Deals", "Pickup", "Delivery", "Contact"] },
            { t: "Support", l: ["FAQ", "Order Help", "Returns", "Privacy Policy", "Terms of Service"] },
          ].map((col) => (
            <div key={col.t}>
              <div className="font-bold heading mb-4">{col.t}</div>
              <ul className="space-y-2.5 text-sm text-gray-400">
                {col.l.map((li) => <li key={li}><a href="#" className="hover:text-white transition-colors">{li}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-[1280px] mx-auto px-4 lg:px-6 mt-12 pt-6 border-t border-white/10 text-sm text-gray-500 text-center">
          © 2026 Morna Market. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function MornaMarketRoute() {
  return <MornaMarket />;
}
export default MornaMarketRoute;
