import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, Calendar } from "lucide-react";

interface Props {
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null; // ISO
  userId: string;
  onReactivate: () => void;
  reactivating?: boolean;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

export function SubscriptionCancellationModals({
  cancelAtPeriodEnd,
  currentPeriodEnd,
  userId,
  onReactivate,
  reactivating,
}: Props) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showSevenDay, setShowSevenDay] = useState(false);

  const endsAt = currentPeriodEnd ? new Date(currentPeriodEnd).getTime() : 0;
  const now = Date.now();
  const daysLeft = endsAt ? Math.ceil((endsAt - now) / (1000 * 60 * 60 * 24)) : 0;

  useEffect(() => {
    if (!cancelAtPeriodEnd || !currentPeriodEnd) return;

    const seenKey = `cancel-seen-${userId}-${currentPeriodEnd}`;
    if (!localStorage.getItem(seenKey)) {
      setShowCancelConfirm(true);
    }

    if (daysLeft > 0 && daysLeft <= 7) {
      const reminderKey = `cancel-7d-${userId}-${currentPeriodEnd}`;
      if (!localStorage.getItem(reminderKey)) {
        setShowSevenDay(true);
      }
    }
  }, [cancelAtPeriodEnd, currentPeriodEnd, userId, daysLeft]);

  const dismissCancelConfirm = () => {
    localStorage.setItem(`cancel-seen-${userId}-${currentPeriodEnd}`, "1");
    setShowCancelConfirm(false);
  };
  const dismissSevenDay = () => {
    localStorage.setItem(`cancel-7d-${userId}-${currentPeriodEnd}`, "1");
    setShowSevenDay(false);
  };

  if (!cancelAtPeriodEnd) return null;

  return (
    <AnimatePresence>
      {showCancelConfirm && (
        <Modal key="cancel-confirm" onClose={dismissCancelConfirm}>
          <div className="flex items-start gap-3 mb-4">
            <div className="h-10 w-10 rounded-2xl bg-azure/15 text-azure grid place-items-center shrink-0">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display font-black text-2xl text-ink leading-tight">Cancelamento confirmado</h2>
              <p className="mt-2 text-sm text-ink-soft">
                Seu site continuará no ar e você manterá o acesso ao painel até <strong className="text-ink">{formatDate(currentPeriodEnd)}</strong>.
              </p>
              <p className="mt-2 text-sm text-ink-soft">
                Depois dessa data, o acesso ao painel será encerrado e tiraremos o seu site do ar. Nada mais será cobrado.
              </p>
            </div>
          </div>
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end mt-6">
            <button onClick={dismissCancelConfirm} className="h-11 px-5 rounded-2xl border border-border text-ink font-semibold text-sm">
              Entendi
            </button>
            <button
              onClick={onReactivate}
              disabled={reactivating}
              className="h-11 px-5 rounded-2xl bg-ink text-paper font-semibold text-sm disabled:opacity-60"
            >
              {reactivating ? "Abrindo..." : "Back com a assinatura"}
            </button>
          </div>
        </Modal>
      )}

      {!showCancelConfirm && showSevenDay && (
        <Modal key="seven-day" onClose={dismissSevenDay}>
          <div className="flex items-start gap-3 mb-4">
            <div className="h-10 w-10 rounded-2xl bg-flame/15 text-flame grid place-items-center shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display font-black text-2xl text-ink leading-tight">
                {daysLeft === 1 ? "Falta 1 dia" : `Faltam ${daysLeft} dias`} para seu site sair do ar
              </h2>
              <p className="mt-2 text-sm text-ink-soft">
                Seu acesso ao painel e o seu site serão encerrados em <strong className="text-ink">{formatDate(currentPeriodEnd)}</strong>.
              </p>
              <p className="mt-2 text-sm text-ink-soft">
                Quer continuar? Reative agora e mantenha tudo no ar sem perder nada.
              </p>
            </div>
          </div>
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end mt-6">
            <button onClick={dismissSevenDay} className="h-11 px-5 rounded-2xl border border-border text-ink font-semibold text-sm">
              Not now
            </button>
            <button
              onClick={onReactivate}
              disabled={reactivating}
              className="h-11 px-5 rounded-2xl bg-lime text-ink font-semibold text-sm disabled:opacity-60"
            >
              {reactivating ? "Abrindo..." : "Back com a assinatura"}
            </button>
          </div>
        </Modal>
      )}
    </AnimatePresence>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onEsc);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onEsc); document.body.style.overflow = ""; };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-ink/50 backdrop-blur-sm grid place-items-end sm:place-items-center p-0 sm:p-5"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
        transition={{ type: "spring", damping: 22 }}
        className="relative w-full sm:max-w-md bg-paper rounded-t-3xl sm:rounded-3xl p-6 sm:p-7 shadow-elegant"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 h-9 w-9 grid place-items-center rounded-full hover:bg-muted text-ink-soft hover:text-ink transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </motion.div>
    </motion.div>
  );
}
