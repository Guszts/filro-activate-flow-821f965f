import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2, X, Check, ArrowRight, Globe } from "lucide-react";
import type { DevTemplate } from "@/lib/dev/templates";
import { TemplateCover } from "@/components/dev/TemplateCover";
import { useAuth } from "@/lib/auth";
import { checkDevSlugAvailable, generateDevSite } from "@/lib/dev/generator.functions";

function toSlug(v: string) {
  return v
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 40)
    .replace(/^-+|-+$/g, "");
}

export function TemplateStartModal({
  template,
  open,
  onClose,
}: {
  template: DevTemplate | null;
  open: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [touchedSlug, setTouchedSlug] = useState(false);
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const check = useServerFn(checkDevSlugAvailable);
  const generate = useServerFn(generateDevSite);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset state when opening
  useEffect(() => {
    if (open) {
      setName("");
      setSlug("");
      setTouchedSlug(false);
      setAvailable(null);
      setReason("");
      setSubmitting(false);
    }
  }, [open, template?.slug]);

  // Auto-derive slug from name
  useEffect(() => {
    if (!touchedSlug) setSlug(toSlug(name));
  }, [name, touchedSlug]);

  // Debounced availability check
  useEffect(() => {
    if (!slug || slug.length < 3) {
      setAvailable(null);
      setReason("");
      return;
    }
    setChecking(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await check({ data: { slug } });
        setAvailable(res.available);
        setReason(res.reason ?? "");
      } catch {
        setAvailable(null);
        setReason("Não consegui verificar agora.");
      } finally {
        setChecking(false);
      }
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [slug, check]);

  const canSubmit = useMemo(
    () => !!template && name.trim().length >= 2 && slug.length >= 3 && available === true && !submitting,
    [template, name, slug, available, submitting]
  );

  async function handleConfirm() {
    if (!template) return;
    if (!user) {
      onClose();
      navigate({ to: "/login", search: { redirect: "/dev" } });
      return;
    }
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const res = await generate({
        data: {
          templateSlug: template.slug,
          businessName: name.trim(),
          businessSegment: template.segment,
          description: "",
          preferredSlug: slug,
        },
      });
      if (!res.ok) throw new Error(res.error ?? "Falha ao gerar");
      toast.success("Site criado. Abrindo seu projeto…");
      navigate({ to: "/dev/projeto/$projectId", params: { projectId: res.projectId! } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha inesperada");
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {open && template && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[80] bg-ink/60 backdrop-blur-sm grid place-items-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[640px] bg-paper rounded-[2rem] border border-ink/10 overflow-hidden shadow-[0_40px_100px_-30px_rgba(0,0,0,0.45)]"
          >
            <button
              onClick={onClose}
              aria-label="Fechar"
              className="absolute top-4 right-4 z-10 h-9 w-9 grid place-items-center rounded-full bg-paper/90 border border-border text-ink hover:bg-muted transition"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative">
              <div className="aspect-[16/7] overflow-hidden bg-muted">
                <TemplateCover src={template.coverImage} name={template.name} previewRoute={template.previewRoute} />
              </div>
              <div className="absolute bottom-3 left-5 right-5 flex items-end justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-paper/80 bg-ink/70 backdrop-blur px-2 py-0.5 rounded inline-block">{template.segment}</div>
                  <div className="mt-1 font-display font-black text-xl md:text-2xl text-paper drop-shadow">{template.name}</div>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-7">
              <h3 className="editorial-headline text-2xl md:text-3xl text-ink">
                Usar este modelo?
              </h3>
              <p className="mt-1.5 text-sm text-ink-soft">
                Vamos criar seu projeto e abrir o chat para você editar tudo. Você pode mudar tudo depois pela conversa.
              </p>

              <div className="mt-5 space-y-4">
                <label className="block">
                  <span className="text-[11px] uppercase tracking-wider text-ink-soft">Nome do site / negócio</span>
                  <input
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={120}
                    placeholder="Ex: Padaria Bom Pão"
                    className="mt-1.5 w-full h-11 px-3 rounded-xl border border-border bg-paper text-ink outline-none focus:border-ink/60 transition"
                  />
                </label>

                <label className="block">
                  <span className="text-[11px] uppercase tracking-wider text-ink-soft">Endereço do site</span>
                  <div className={`mt-1.5 flex items-center rounded-xl border bg-paper overflow-hidden transition ${
                    available === false ? "border-destructive/50" : available === true ? "border-flame/60" : "border-border focus-within:border-ink/60"
                  }`}>
                    <span className="pl-3 pr-1 text-sm text-ink-soft inline-flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5" />
                    </span>
                    <input
                      value={slug}
                      onChange={(e) => { setTouchedSlug(true); setSlug(toSlug(e.target.value)); }}
                      maxLength={40}
                      placeholder="meu-site"
                      className="flex-1 h-11 bg-transparent outline-none text-sm text-ink"
                    />
                    <span className="pr-3 pl-1 text-xs text-ink-soft">.filro.site</span>
                  </div>
                  <div className="mt-1.5 text-[11px] min-h-[16px]">
                    {checking && <span className="text-ink-soft inline-flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Verificando…</span>}
                    {!checking && available === true && <span className="text-flame inline-flex items-center gap-1"><Check className="h-3 w-3" /> Disponível</span>}
                    {!checking && available === false && <span className="text-destructive">{reason || "Endereço indisponível."}</span>}
                    {!checking && available === null && slug.length > 0 && slug.length < 3 && <span className="text-ink-soft">Use ao menos 3 caracteres.</span>}
                  </div>
                </label>
              </div>

              <div className="mt-6 flex items-center justify-between gap-3 flex-wrap">
                <div className="text-[11px] text-ink-soft">
                  Custo: <span className="font-bold text-ink">5 créditos</span> · publicado automaticamente
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onClose}
                    className="h-11 px-4 rounded-xl border border-border bg-paper text-ink text-sm font-medium hover:bg-muted transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={!canSubmit}
                    className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-ink text-paper text-sm font-semibold disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] transition"
                  >
                    {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Criando…</> : <>Criar site <ArrowRight className="h-4 w-4" /></>}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
