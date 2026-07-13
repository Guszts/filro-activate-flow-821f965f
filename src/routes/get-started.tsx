import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { createServerFn } from "@tanstack/react-start";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { toast } from "sonner";

const schema = z.object({
  full_name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(40).optional(),
  company_name: z.string().trim().max(160).optional(),
  company_website: z.string().trim().max(255).optional(),
  industry: z.string().trim().max(80).optional(),
  team_size: z.string().trim().max(40).optional(),
  country: z.string().trim().max(80).optional(),
  current_stack: z.string().trim().max(1000).optional(),
  goals: z.string().trim().max(2000).optional(),
  timeline: z.string().trim().max(80).optional(),
  budget_range: z.string().trim().max(80).optional(),
  preferred_plan: z.string().trim().max(40).optional(),
  message: z.string().trim().max(2000).optional(),
  hp: z.string().max(200).optional(), // honeypot
});

export const submitImplementationRequest = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => schema.parse(input))
  .handler(async ({ data }) => {
    if (data.hp && data.hp.length > 0) return { ok: true } as const;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("implementation_requests").insert({
      full_name: data.full_name,
      email: data.email,
      phone: data.phone ?? null,
      company_name: data.company_name ?? null,
      company_website: data.company_website ?? null,
      industry: data.industry ?? null,
      team_size: data.team_size ?? null,
      country: data.country ?? null,
      current_stack: data.current_stack ?? null,
      goals: data.goals ?? null,
      timeline: data.timeline ?? null,
      budget_range: data.budget_range ?? null,
      preferred_plan: data.preferred_plan ?? null,
      message: data.message ?? null,
    });
    if (error) throw new Error(error.message);
    return { ok: true } as const;
  });

export const Route = createFileRoute("/get-started")({
  head: () => ({
    meta: [
      { title: "Get a written plan — Filro" },
      { name: "description", content: "Tell us about your business and we'll send back a written implementation plan with scope, timeline and price." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: GetStartedPage,
});

function GetStartedPage() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const plans = useMemo(() => ["Launch", "Growth", "Revenue System", "Scale", "Not sure yet"], []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData(e.currentTarget);
      const data = Object.fromEntries(fd.entries());
      await submitImplementationRequest({ data: data as any });
      setDone(true);
    } catch (err) {
      toast.error((err as Error).message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-paper text-ink">
        <SiteHeader />
        <main className="mx-auto max-w-[720px] px-5 md:px-10 py-24 text-center">
          <h1 className="font-display font-black text-4xl tracking-tight">Thanks — we got it.</h1>
          <p className="mt-4 text-ink-soft">
            A senior member of our team will review your request and reply with a written plan within one business day.
          </p>
          <Link to="/" className="mt-8 inline-flex h-12 items-center rounded-full bg-ink px-6 text-sm font-semibold text-paper">
            Back home
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const inputCls = "mt-1.5 w-full h-11 rounded-xl border border-border/70 bg-paper px-3.5 text-sm outline-none focus:border-ink";
  const areaCls = "mt-1.5 w-full min-h-[110px] rounded-xl border border-border/70 bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-ink";
  const labelCls = "block text-xs font-semibold uppercase tracking-wide text-ink-soft";

  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteHeader />
      <main className="mx-auto max-w-[880px] px-5 md:px-10 py-16 md:py-24">
        <h1 className="font-display font-black text-3xl md:text-5xl tracking-tight">Get a written plan</h1>
        <p className="mt-3 text-ink-soft max-w-xl">
          Share what you're working on. We'll come back within one business day with a written plan — scope, timeline and price.
        </p>

        <form onSubmit={onSubmit} className="mt-10 grid gap-5 md:grid-cols-2">
          <input type="text" name="hp" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
          <div><label className={labelCls}>Full name*</label><input name="full_name" required minLength={2} maxLength={120} className={inputCls} /></div>
          <div><label className={labelCls}>Work email*</label><input name="email" type="email" required maxLength={255} className={inputCls} /></div>
          <div><label className={labelCls}>Phone</label><input name="phone" maxLength={40} className={inputCls} /></div>
          <div><label className={labelCls}>Company</label><input name="company_name" maxLength={160} className={inputCls} /></div>
          <div><label className={labelCls}>Website</label><input name="company_website" maxLength={255} className={inputCls} placeholder="https://" /></div>
          <div><label className={labelCls}>Industry</label><input name="industry" maxLength={80} className={inputCls} /></div>
          <div><label className={labelCls}>Team size</label>
            <select name="team_size" className={inputCls} defaultValue="">
              <option value="">Select…</option>
              <option>Just me</option><option>2–10</option><option>11–50</option><option>51–200</option><option>200+</option>
            </select>
          </div>
          <div><label className={labelCls}>Country</label><input name="country" maxLength={80} className={inputCls} defaultValue="United States" /></div>
          <div className="md:col-span-2"><label className={labelCls}>Current tools / stack</label>
            <textarea name="current_stack" maxLength={1000} className={areaCls} placeholder="Website, CRM, payments, tools you use today…" />
          </div>
          <div className="md:col-span-2"><label className={labelCls}>Goals</label>
            <textarea name="goals" maxLength={2000} className={areaCls} placeholder="What outcome do you want in the next 6–12 months?" />
          </div>
          <div><label className={labelCls}>Timeline</label>
            <select name="timeline" className={inputCls} defaultValue="">
              <option value="">Select…</option>
              <option>ASAP</option><option>1–2 months</option><option>3–6 months</option><option>Exploring</option>
            </select>
          </div>
          <div><label className={labelCls}>Budget range</label>
            <select name="budget_range" className={inputCls} defaultValue="">
              <option value="">Select…</option>
              <option>Under $5k</option><option>$5k–$15k</option><option>$15k–$30k</option><option>$30k+</option>
            </select>
          </div>
          <div className="md:col-span-2"><label className={labelCls}>Preferred plan</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {plans.map((p) => (
                <label key={p} className="inline-flex items-center gap-2 rounded-full border border-border/60 px-3.5 h-9 text-sm cursor-pointer has-[:checked]:bg-ink has-[:checked]:text-paper has-[:checked]:border-ink">
                  <input type="radio" name="preferred_plan" value={p} className="sr-only" />{p}
                </label>
              ))}
            </div>
          </div>
          <div className="md:col-span-2"><label className={labelCls}>Anything else?</label>
            <textarea name="message" maxLength={2000} className={areaCls} />
          </div>
          <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
            <button type="submit" disabled={submitting} className="inline-flex h-12 items-center rounded-full bg-ink px-7 text-sm font-semibold text-paper disabled:opacity-60">
              {submitting ? "Sending…" : "Send my request"}
            </button>
          </div>
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}
