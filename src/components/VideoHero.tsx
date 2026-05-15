import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { Play, Pause } from "lucide-react";

export function VideoHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setIsPlaying(true);
    } else {
      v.pause();
      setIsPlaying(false);
    }
  };

  return (
    <section className="relative w-full flex justify-center py-12 md:py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-[95vw] lg:w-[90vw] max-w-[1600px] aspect-[16/9] rounded-[32px] lg:rounded-[48px] overflow-hidden z-10 border border-border bg-paper shadow-2xl hero-shadow"
      >
        <video
          ref={videoRef}
          src="/videos/filro-hero.mp4"
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />

        {/* Glassmorphism play/pause control */}
        <button
          type="button"
          onClick={toggle}
          aria-label={isPlaying ? "Pausar vídeo" : "Reproduzir vídeo"}
          className="group absolute bottom-4 right-4 md:bottom-6 md:right-6 z-20 flex items-center gap-2 md:gap-3 rounded-full border border-white/30 bg-white/15 px-4 py-2.5 md:px-5 md:py-3 text-white shadow-lg backdrop-blur-xl backdrop-saturate-150 transition-all hover:bg-white/25 hover:scale-105 active:scale-95"
        >
          <span className="flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-full bg-white/25 border border-white/40">
            {isPlaying ? (
              <Pause className="h-4 w-4 md:h-4.5 md:w-4.5 fill-white" strokeWidth={0} />
            ) : (
              <Play className="h-4 w-4 md:h-4.5 md:w-4.5 fill-white ml-0.5" strokeWidth={0} />
            )}
          </span>
          <span className="text-xs md:text-sm font-medium tracking-wide pr-1">
            {isPlaying ? "Pausar" : "Reproduzir"}
          </span>
        </button>
      </motion.div>
    </section>
  );
}
