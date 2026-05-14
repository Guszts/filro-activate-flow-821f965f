import { useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { motion } from "framer-motion";

export function VideoHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPaused(false); }
    else { v.pause(); setPaused(true); }
  };

  return (
    <section className="relative w-full flex justify-center py-12 md:py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-[95vw] lg:w-[90vw] max-w-[1600px] h-[85vh] lg:h-[80vh] min-h-[500px] rounded-[32px] lg:rounded-[48px] overflow-hidden z-10 border transition-all duration-500 md:duration-1000 border-white/10 bg-black/60 shadow-2xl hero-shadow backdrop-blur-md"
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          poster="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1920&q=80"
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source
            src="https://cdn.coverr.co/videos/coverr-typing-on-a-laptop-2584/1080p.mp4"
            type="video/mp4"
          />
        </video>

        {/* Glass inner gradient for legibility */}
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

        <button
          onClick={toggle}
          aria-label={paused ? "Reproduzir" : "Pausar"}
          className="absolute z-10 bottom-6 right-6 md:bottom-8 md:right-8 h-14 w-14 md:h-16 md:w-16 grid place-items-center rounded-full bg-paper/95 text-ink backdrop-blur transition-transform hover:scale-110 active:scale-95"
        >
          {paused ? <Play className="h-6 w-6 ml-1" /> : <Pause className="h-6 w-6" />}
        </button>

        <div className="absolute z-10 bottom-6 left-6 md:bottom-8 md:left-10 text-paper">
          <div className="text-xs tracking-[0.2em] uppercase opacity-80">Entrega 24h</div>
          <div className="mt-1 font-display font-black text-2xl md:text-4xl">Ativação completa em um dia.</div>
        </div>
      </motion.div>
    </section>
  );
}
