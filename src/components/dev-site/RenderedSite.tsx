type ServiceItem = { name: string; description: string };
type Content = {
  hero?: { eyebrow?: string; title?: string; subtitle?: string; ctaPrimary?: string; ctaSecondary?: string };
  about?: { title?: string; body?: string };
  services?: { title?: string; items?: ServiceItem[] };
  highlights?: string[];
  testimonial?: { quote?: string; author?: string };
  cta?: { title?: string; body?: string; buttonLabel?: string };
  contact?: { whatsapp?: string; address?: string; hours?: string };
  colors?: { primary?: string; accent?: string; background?: string; ink?: string };
};

function waLink(phone?: string, message?: string) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  const full = digits.startsWith("55") ? digits : `55${digits}`;
  const text = encodeURIComponent(message ?? "Olá! Vim pelo site.");
  return `https://wa.me/${full}?text=${text}`;
}

export function RenderedSite({ content, businessName }: { content: Content; businessName: string }) {
  const c = content ?? {};
  const colors = c.colors ?? {};
  const primary = colors.primary || "#0F172A";
  const accent = colors.accent || "#F97316";
  const bg = colors.background || "#FAFAF7";
  const ink = colors.ink || "#0F172A";
  const wa = waLink(c.contact?.whatsapp);

  return (
    <div style={{ background: bg, color: ink, fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif" }} className="min-h-screen">
      {/* Hero */}
      <section className="px-6 md:px-12 pt-16 md:pt-24 pb-20 md:pb-32 max-w-[1280px] mx-auto">
        {c.hero?.eyebrow && (
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em]" style={{ color: accent }}>
            <span className="h-px w-8" style={{ background: accent }} /> {c.hero.eyebrow}
          </div>
        )}
        <h1 className="mt-5 text-4xl md:text-7xl font-black leading-[1.05] tracking-tight max-w-4xl" style={{ color: ink }}>
          {c.hero?.title || businessName}
        </h1>
        {c.hero?.subtitle && (
          <p className="mt-6 max-w-2xl text-base md:text-xl leading-relaxed opacity-80">{c.hero.subtitle}</p>
        )}
        <div className="mt-10 flex flex-wrap gap-3">
          {wa && (
            <a href={wa} target="_blank" rel="noreferrer"
              className="inline-flex items-center h-14 px-8 rounded-2xl font-bold text-base"
              style={{ background: primary, color: bg }}>
              {c.hero?.ctaPrimary || "Falar no WhatsApp"}
            </a>
          )}
          {c.hero?.ctaSecondary && (
            <a href="#sobre"
              className="inline-flex items-center h-14 px-8 rounded-2xl font-semibold border"
              style={{ borderColor: ink, color: ink }}>{c.hero.ctaSecondary}</a>
          )}
        </div>
      </section>

      {/* Highlights */}
      {c.highlights && c.highlights.length > 0 && (
        <section className="px-6 md:px-12 py-10 max-w-[1280px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {c.highlights.slice(0, 6).map((h, i) => (
              <div key={i} className="rounded-2xl p-5 border" style={{ borderColor: `${ink}15`, background: `${ink}05` }}>
                <div className="text-xs font-bold uppercase tracking-wider" style={{ color: accent }}>0{i + 1}</div>
                <div className="mt-2 text-sm font-semibold">{h}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* About */}
      {c.about?.body && (
        <section id="sobre" className="px-6 md:px-12 py-20 max-w-[1280px] mx-auto">
          <div className="grid md:grid-cols-3 gap-10">
            <div>
              <div className="text-xs uppercase tracking-[0.2em]" style={{ color: accent }}>Sobre</div>
              <h2 className="mt-3 text-3xl md:text-5xl font-black tracking-tight">{c.about.title || `Sobre ${businessName}`}</h2>
            </div>
            <p className="md:col-span-2 text-base md:text-lg leading-relaxed opacity-85">{c.about.body}</p>
          </div>
        </section>
      )}

      {/* Services */}
      {c.services?.items && c.services.items.length > 0 && (
        <section className="px-6 md:px-12 py-20 max-w-[1280px] mx-auto">
          <div className="text-xs uppercase tracking-[0.2em]" style={{ color: accent }}>Serviços</div>
          <h2 className="mt-3 text-3xl md:text-5xl font-black tracking-tight">{c.services.title || "O que oferecemos"}</h2>
          <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {c.services.items.map((s, i) => (
              <div key={i} className="rounded-2xl p-6 border" style={{ borderColor: `${ink}15`, background: bg }}>
                <div className="text-xs font-bold uppercase tracking-wider" style={{ color: accent }}>Serviço {String(i + 1).padStart(2, "0")}</div>
                <div className="mt-3 text-xl font-bold">{s.name}</div>
                <p className="mt-2 text-sm opacity-75 leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Testimonial */}
      {c.testimonial?.quote && (
        <section className="px-6 md:px-12 py-20 max-w-[1280px] mx-auto">
          <div className="rounded-3xl p-10 md:p-16" style={{ background: `${ink}08` }}>
            <div className="text-6xl leading-none" style={{ color: accent }}>“</div>
            <p className="mt-4 text-xl md:text-3xl font-medium leading-snug">{c.testimonial.quote}</p>
            {c.testimonial.author && (
              <div className="mt-6 text-sm opacity-70 uppercase tracking-wider">— {c.testimonial.author}</div>
            )}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="px-6 md:px-12 py-20 max-w-[1280px] mx-auto">
        <div className="rounded-3xl p-10 md:p-16 flex flex-col md:flex-row md:items-end justify-between gap-8"
          style={{ background: primary, color: bg }}>
          <div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight max-w-xl">{c.cta?.title || "Vamos conversar?"}</h2>
            {c.cta?.body && <p className="mt-4 opacity-85 max-w-xl">{c.cta.body}</p>}
          </div>
          {wa && (
            <a href={wa} target="_blank" rel="noreferrer"
              className="inline-flex items-center h-14 px-8 rounded-2xl font-bold whitespace-nowrap"
              style={{ background: accent, color: ink }}>
              {c.cta?.buttonLabel || "Falar no WhatsApp"}
            </a>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-12 border-t" style={{ borderColor: `${ink}15` }}>
        <div className="max-w-[1280px] mx-auto flex flex-wrap items-end justify-between gap-6 text-sm opacity-70">
          <div>
            <div className="font-bold text-lg" style={{ color: ink }}>{businessName}</div>
            {c.contact?.address && <div className="mt-1">{c.contact.address}</div>}
            {c.contact?.hours && <div>{c.contact.hours}</div>}
          </div>
          <div className="text-xs">
            © {new Date().getFullYear()}
          </div>
        </div>
      </footer>
    </div>
  );
}
