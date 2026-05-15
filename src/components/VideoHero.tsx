import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

export function VideoHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      // Unmute on first user-initiated play so o áudio é audível
      v.muted = false;
      setIsMuted(false);
      v.play();
      setIsPlaying(true);
    } else {
      v.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(v.muted);
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
          muted={isMuted}
          loop
          playsInline
          preload="metadata"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />

        {/* Glassmorphism thumbnail overlay — visible when paused */}
        <AnimatePresence>
          {!isPlaying && (
            <motion.button
              type="button"
              onClick={toggle}
              aria-label="Reproduzir vídeo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 z-20 flex items-center justify-center bg-white/15 backdrop-blur-xl backdrop-saturate-150"
            >
              <span className="flex h-20 w-20 md:h-28 md:w-28 items-center justify-center rounded-full bg-black text-white shadow-2xl transition-transform hover:scale-105 active:scale-95">
                <Play className="h-8 w-8 md:h-10 md:w-10 fill-white ml-1" strokeWidth={0} />
              </span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Small pause button shown while playing */}
        {isPlaying && (
          <button
            type="button"
            onClick={toggle}
            aria-label="Pausar vídeo"
            className="absolute bottom-4 right-4 md:bottom-6 md:right-6 z-20 flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full bg-black/70 text-white shadow-lg backdrop-blur-sm transition-all hover:bg-black hover:scale-105 active:scale-95"
          >
            <Pause className="h-5 w-5 md:h-6 md:w-6 fill-white" strokeWidth={0} />
          </button>
        )}
      </motion.div>
    </section>
  );
}
