import { motion } from "framer-motion";
import videoCardImg from "@/assets/video-card-flaro.jpg?w=1920&format=webp";

export function VideoHero() {
  return (
    <section className="relative w-full flex justify-center py-12 md:py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-[95vw] lg:w-[90vw] max-w-[1600px] aspect-[16/9] rounded-[32px] lg:rounded-[48px] overflow-hidden z-10 border border-border bg-paper shadow-2xl hero-shadow transition-all duration-500 md:duration-1000"
      >
        <img
          src={videoCardImg}
          alt="Ilustração no estilo Flaro: ativação completa em 24h"
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
          width={1920}
          height={1080}
        />

        <div className="absolute z-10 bottom-6 left-6 md:bottom-8 md:left-10 text-ink">
          <div className="text-xs tracking-[0.2em] uppercase opacity-70">Entrega 24h</div>
          <div className="mt-1 font-display font-black text-2xl md:text-4xl">Ativação completa em um dia.</div>
        </div>
      </motion.div>
    </section>
  );
}
