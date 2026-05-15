import { motion } from "framer-motion";

export function VideoHero() {
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
          src="/videos/filro-hero.mp4"
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/videos/filro-hero.mp4"
        />
      </motion.div>
    </section>
  );
}
