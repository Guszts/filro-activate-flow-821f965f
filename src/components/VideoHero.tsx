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
    <section className="relative w-full">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative aspect-video w-full overflow-hidden rounded-[2rem] md:rounded-[3rem] bg-ink shadow-elegant"
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
          <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/10 to-transparent" />

          <button
            onClick={toggle}
            aria-label={paused ? "Reproduzir" : "Pausar"}
            className="absolute bottom-6 right-6 md:bottom-8 md:right-8 h-14 w-14 md:h-16 md:w-16 grid place-items-center rounded-full bg-paper/95 text-ink backdrop-blur transition-transform hover:scale-110 active:scale-95"
          >
            {paused ? <Play className="h-6 w-6 ml-1" /> : <Pause className="h-6 w-6" />}
          </button>

          <div className="absolute bottom-6 left-6 md:bottom-8 md:left-10 text-paper">
            <div className="text-xs tracking-[0.2em] uppercase opacity-80">Entrega 24h</div>
            <div className="mt-1 font-display font-black text-2xl md:text-4xl">Ativação completa em um dia.</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
