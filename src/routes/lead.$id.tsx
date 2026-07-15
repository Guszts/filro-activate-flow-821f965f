import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, MessageCircle, Mail, ExternalLink, Copy } from "lucide-react";
import { toast } from "sonner";
import { formatBRL, formatDateTime } from "@/lib/format";
import { useSignedBusinessAsset } from "@/hooks/useSignedBusinessAsset";

function SignedImg({ path, alt, className }: { path: string; alt: string; className?: string }) {
  const url = useSignedBusinessAsset(path);
  if (!url) return <div className={(className ?? "") + " bg-muted animate-pulse"} aria-label={alt} />;
  return <img src={url} alt={alt} className={className} />;
}
function SignedFileLink({ path, children, className }: { path: string; children: React.ReactNode; className?: string }) {
  const url = useSignedBusinessAsset(path);
  if (!url) return <span className={className}>Loading…</span>;
  return <a href={url} target="_blank" rel="noreferrer" className={className}>{children}</a>;
}

export const Route = createFileRoute("/lead/$id")({
  component: LeadPage,
  head: () => ({ meta: [
    { title: "Lead · Filro" },
    { name: "robots", content: "noindex,nofollow" },
  ]}),
});

interface BusinessInfo {
  name?: string; description?: string; segment?: string; slogan?: string;
  brand_color_primary?: string; brand_color_secondary?: string; logo_url?: string;
  whatsapp?: string; instagram?: string; address?: string; hours?: string;
  products?: { name: string; price: string; description: string; image_url: string }[];
  promotions?: string;
  model_choice?: string; model_link?: string; model_file_url?: string; model_notes?: string;
}

function LeadPage() {
  const { id } = Route.useParams();
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!isAdmin) navigate({ to: "/login", search: { redirect: `/lead/${id}` } });
  }, [loading, isAdmin, navigate, id]);

  const { data } = useQuery({
    enabled: isAdmin,
    queryKey: ["lead", id],
    queryFn: async () => {
      const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", id).maybeSingle();
      const { data: project } = await supabase.from("projects").select("*").eq("user_id", id).maybeSingle();
      const { data: payments } = await supabase.from("payments").select("*").eq("user_id", id).order("created_at", { ascending: false });
      const { data: plans } = await supabase.from("plans").select("id, name, slug");
      return { profile, project, payments: payments ?? [], plans: plans ?? [] };
    },
  });

  if (loading || !isAdmin) return <div className="min-h-screen grid place-items-center text-ink-soft">Loading...</div>;
  if (!data?.profile) return <div className="min-h-screen grid place-items-center text-ink-soft">Lead não encontrado.</div>;

  const { profile, project, payments, plans } = data;
  const bi: BusinessInfo = (project?.business_info as BusinessInfo) ?? {};
  const paid = payments.find((p) => p.status === "paid");
  const planName = paid ? plans.find((pl) => pl.id === paid.plan_id)?.name : null;
  const wa = (bi.whatsapp || profile.whatsapp || "").replace(/\D/g, "");
  const waLink = wa ? `https://wa.me/${wa}` : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1200px] px-5 md:px-10 py-8 md:py-12">
        <Link to="/console" className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink"><ArrowLeft className="h-4 w-4" /> Console</Link>

        <motion.header initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-6 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="text-xs tracking-wide text-ink-soft uppercase">Lead</div>
            <h1 className="mt-2 editorial-headline text-4xl md:text-6xl text-ink">{bi.name || profile.business_name || profile.name || "Sem nome"}</h1>
            <p className="mt-2 text-ink-soft">{bi.segment || profile.business_segment} {bi.slogan && `· ${bi.slogan}`}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {waLink && <a href={waLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-lime text-ink text-sm font-semibold hover:scale-105 transition"><MessageCircle className="h-4 w-4" /> WhatsApp</a>}
            <a href={`mailto:${profile.email}`} className="inline-flex items-center gap-2 h-11 px-5 rounded-full border border-border text-ink text-sm font-semibold hover:bg-muted transition"><Mail className="h-4 w-4" /> Email</a>
          </div>
        </motion.header>

        <div className="mt-10 grid lg:grid-cols-3 gap-6">
          <Card title="Status">
            <Row label="Plan" value={planName ?? "—"} />
            <Row label="Payment" value={paid ? `${formatBRL(paid.amount)} · pago em ${formatDateTime(paid.paid_at ?? paid.created_at)}` : "Pending"} />
            <Row label="Project" value={project?.project_status ?? "—"} />
            <Row label="Info enviada" value={project?.business_info_submitted ? "Yes" : "Aguardando"} />
          </Card>
          <Card title="Contato">
            <Row label="Name" value={profile.name} />
            <Row label="Email" value={profile.email} />
            <Row label="WhatsApp" value={bi.whatsapp || profile.whatsapp} />
            <Row label="Instagram" value={bi.instagram} />
            <Row label="Endereço" value={bi.address} />
            <Row label="Horário" value={bi.hours} multiline />
          </Card>
          <Card title="Identidade">
            <div className="flex items-center gap-4 mb-3">
              {bi.logo_url && <SignedImg path={bi.logo_url} alt="logo" className="h-16 w-16 rounded-xl object-cover border border-border" />}
              <div className="flex gap-2">
                {bi.brand_color_primary && <ColorSwatch hex={bi.brand_color_primary} />}
                {bi.brand_color_secondary && <ColorSwatch hex={bi.brand_color_secondary} />}
              </div>
            </div>
            <Row label="Description" value={bi.description} multiline />
          </Card>
        </div>

        {bi.products && bi.products.length > 0 && (
          <section className="mt-10">
            <h2 className="font-display font-black text-2xl text-ink mb-4">Catálogo ({bi.products.length})</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {bi.products.map((p, i) => (
                <div key={i} className="card-elevated p-4">
                  {p.image_url && <SignedImg path={p.image_url} alt={p.name} className="aspect-video w-full object-cover rounded-xl mb-3" />}
                  <div className="font-semibold text-ink">{p.name}</div>
                  <div className="text-sm text-ink-soft">{p.price}</div>
                  <p className="mt-1 text-sm text-ink-soft">{p.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mt-10 grid md:grid-cols-2 gap-6">
          <Card title="Promoções">
            <p className="text-sm text-ink-soft whitespace-pre-wrap">{bi.promotions || "—"}</p>
          </Card>
          <Card title="Modelo de referência">
            <Row label="Notas" value={bi.model_notes} multiline />
            {bi.model_link && <p className="text-sm"><a href={bi.model_link} target="_blank" rel="noreferrer" className="text-ink underline inline-flex items-center gap-1">Link <ExternalLink className="h-3 w-3" /></a></p>}
            {bi.model_file_url && <p className="text-sm mt-2"><SignedFileLink path={bi.model_file_url} className="text-ink underline inline-flex items-center gap-1">Ver arquivo <ExternalLink className="h-3 w-3" /></SignedFileLink></p>}
          </Card>
        </section>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card-elevated p-6">
      <div className="text-xs tracking-wide text-ink-soft uppercase mb-4">{title}</div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
function Row({ label, value, multiline }: { label: string; value?: string | null; multiline?: boolean }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] tracking-wide text-ink-soft/70 uppercase">{label}</span>
      <span className={`text-sm text-ink ${multiline ? "whitespace-pre-wrap" : ""}`}>{value}</span>
    </div>
  );
}

function ColorSwatch({ hex }: { hex: string }) {
  const copy = async () => {
    try { await navigator.clipboard.writeText(hex); toast.success(`Copied ${hex}`); }
    catch { toast.error("Could not copy"); }
  };
  return (
    <button onClick={copy} title={`Click to copy ${hex}`}
      className="group relative h-10 w-10 rounded-lg border border-border overflow-hidden hover:scale-110 transition-transform"
      style={{ background: hex }}>
      <span className="absolute inset-0 grid place-items-center bg-ink/0 group-hover:bg-ink/40 transition-colors">
        <Copy className="h-3.5 w-3.5 text-paper opacity-0 group-hover:opacity-100" />
      </span>
    </button>
  );
}
