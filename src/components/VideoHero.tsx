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

        {/* Glassmorphism container with solid black play/pause button */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 rounded-full border border-white/30 bg-white/15 p-3 md:p-4 shadow-2xl backdrop-blur-xl backdrop-saturate-150">
          <button
            type="button"
            onClick={toggle}
            aria-label={isPlaying ? "Pausar vídeo" : "Reproduzir vídeo"}
            className="flex h-14 w-14 md:h-20 md:w-20 items-center justify-center rounded-full bg-black text-white shadow-lg transition-all hover:scale-105 active:scale-95"
          >
            {isPlaying ? (
              <Pause className="h-6 w-6 md:h-8 md:w-8 fill-white" strokeWidth={0} />
            ) : (
              <Play className="h-6 w-6 md:h-8 md:w-8 fill-white ml-1" strokeWidth={0} />
            )}
          </button>
        </div>

      </motion.div>
    </section>
  );
}
