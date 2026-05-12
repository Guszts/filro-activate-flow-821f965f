import { motion } from "framer-motion";

const models = [
  { name: "Clínica", desc: "Estrutura clara para clínicas e consultórios.", tone: "from-azure/20 to-paper" },
  { name: "Padaria", desc: "Cardápio visual e localização em destaque.", tone: "from-flame/15 to-paper" },
  { name: "Auto", desc: "Serviços, agendamento e contato direto.", tone: "from-ink/10 to-paper" },
  { name: "Moda", desc: "Coleções e vitrine de produtos.", tone: "from-lime/25 to-paper" },
  { name: "Restaurante", desc: "Menu, fotos e reservas via WhatsApp.", tone: "from-azure/15 to-paper" },
  { name: "Hambúrguer", desc: "Cardápio rápido e pedido por WhatsApp.", tone: "from-flame/20 to-paper" },
];

export function ModelGrid() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {models.map((m, i) => (
        <motion.article
          key={m.name}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
          className="group rounded-3xl bg-paper border border-border overflow-hidden flex flex-col"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className={`relative h-56 bg-gradient-to-br ${m.tone} overflow-hidden`}>
            <div className="absolute inset-0 grid place-items-center">
              <div className="font-display font-black text-[7rem] leading-none text-ink/15 select-none">
                {m.name[0]}
              </div>
            </div>
            <div className="absolute bottom-4 left-4 right-4 h-20 rounded-2xl bg-paper/90 backdrop-blur border border-border flex items-center px-4">
              <div className="text-xs tracking-wide text-ink-soft">filro / modelo</div>
            </div>
          </div>
          <div className="p-6 flex flex-col flex-1">
            <h3 className="font-display text-2xl font-black tracking-tight">{m.name}</h3>
            <p className="mt-2 text-sm text-ink-soft flex-1">{m.desc}</p>
            <div className="mt-6 flex gap-2">
              <button className="flex-1 h-10 rounded-2xl border border-border text-xs font-semibold tracking-wider hover:bg-ink hover:text-paper transition-colors">
                Ver exemplo
              </button>
              <a
                href="/#ativacao"
                className="flex-1 h-10 grid place-items-center rounded-2xl bg-ink text-paper text-xs font-semibold tracking-wider hover:scale-[1.02] transition-transform"
              >
                Usar este
              </a>
            </div>
          </div>
        </motion.article>
      ))}
    </div>
  );
}
