import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { THEME } from "./theme";
import { usePlanLabel } from "./PlanLabelContext";
import type { CSSProperties } from "react";

// ---------- shared helpers ----------
const useEnter = (delay = 0) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping: 16, stiffness: 160 }, durationInFrames: 30 });
};

const useFloat = (amp = 6, speed = 60) => {
  const frame = useCurrentFrame();
  return Math.sin(frame / speed) * amp;
};

const HeadlineRow: React.FC<{ kicker?: string; title: string }> = ({ kicker, title }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: "100%" }}>
    {kicker ? (
      <div
        style={{
          alignSelf: "flex-start",
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: 22,
          letterSpacing: 4,
          color: THEME.ink,
          background: THEME.lime,
          padding: "8px 16px",
          borderRadius: 999,
          border: `3px solid ${THEME.ink}`,
        }}
      >
        {kicker}
      </div>
    ) : null}
    <h1
      style={{
        margin: 0,
        fontFamily: "Archivo, sans-serif",
        fontWeight: 900,
        fontSize: 96,
        lineHeight: 0.95,
        letterSpacing: -3,
        color: THEME.ink,
        wordBreak: "break-word",
      }}
    >
      {title}
    </h1>
  </div>
);

const Chip: React.FC<{ children: React.ReactNode; bg?: string; rot?: number; delay?: number }> = ({
  children,
  bg = THEME.white,
  rot = 0,
  delay = 0,
}) => {
  const s = useEnter(delay);
  return (
    <div
      style={{
        background: bg,
        border: `4px solid ${THEME.ink}`,
        boxShadow: `6px 6px 0 ${THEME.ink}`,
        borderRadius: 18,
        padding: "18px 28px",
        fontFamily: "Inter, sans-serif",
        fontWeight: 700,
        fontSize: 28,
        color: THEME.ink,
        transform: `rotate(${rot}deg) scale(${interpolate(s, [0, 1], [0.7, 1])}) translateY(${interpolate(s, [0, 1], [30, 0])}px)`,
        opacity: s,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </div>
  );
};

const Card: React.FC<{ children: React.ReactNode; bg?: string; style?: CSSProperties; delay?: number }> = ({
  children,
  bg = THEME.white,
  style,
  delay = 0,
}) => {
  const s = useEnter(delay);
  return (
    <div
      style={{
        background: bg,
        border: `4px solid ${THEME.ink}`,
        boxShadow: `10px 10px 0 ${THEME.ink}`,
        borderRadius: 24,
        padding: 28,
        opacity: s,
        transform: `translateY(${interpolate(s, [0, 1], [40, 0])}px)`,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ---------- 1. HOOK ----------
const Hook = () => {
  const s = useEnter(2);
  const float = useFloat(4, 50);
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          position: "relative",
          transform: `rotate(${-3}deg) scale(${interpolate(s, [0, 1], [0.6, 1])}) translateY(${float}px)`,
          opacity: s,
        }}
      >
        <div
          style={{
            background: THEME.azure,
            border: `8px solid ${THEME.ink}`,
            boxShadow: `16px 16px 0 ${THEME.ink}`,
            borderRadius: 36,
            padding: "60px 96px",
            fontFamily: "Archivo, sans-serif",
            fontWeight: 900,
            fontSize: 220,
            letterSpacing: -8,
            color: THEME.white,
            lineHeight: 0.9,
          }}
        >
          {usePlanLabel()}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: -50,
            right: -40,
            background: THEME.lime,
            border: `5px solid ${THEME.ink}`,
            boxShadow: `8px 8px 0 ${THEME.ink}`,
            borderRadius: 999,
            padding: "14px 28px",
            fontFamily: "Archivo, sans-serif",
            fontWeight: 900,
            fontSize: 28,
            transform: "rotate(6deg)",
          }}
        >
          BY FILRO
        </div>
      </div>
    </div>
  );
};

// ---------- 2. PROMISE ----------
const Promise_ = () => {
  const words = [
    { t: "SIMPLES", bg: THEME.lime, rot: -3 },
    { t: "PROFISSIONAL", bg: THEME.white, rot: 2 },
    { t: "RÁPIDO", bg: THEME.azure, rot: -2, color: THEME.white },
  ];
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: 36 }}>
      <HeadlineRow kicker="O JEITO START" title="Sua presença digital, sem complicação." />
      <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
        {words.map((w, i) => {
          const s = useEnter(10 + i * 8);
          return (
            <div
              key={w.t}
              style={{
                background: w.bg,
                color: (w as any).color ?? THEME.ink,
                border: `5px solid ${THEME.ink}`,
                boxShadow: `8px 8px 0 ${THEME.ink}`,
                borderRadius: 22,
                padding: "26px 44px",
                fontFamily: "Archivo, sans-serif",
                fontWeight: 900,
                fontSize: 60,
                letterSpacing: -1,
                transform: `rotate(${w.rot}deg) scale(${interpolate(s, [0, 1], [0.5, 1])})`,
                opacity: s,
              }}
            >
              {w.t}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------- 3. PAGE (build a mock site) ----------
const Page = () => {
  return (
    <div style={{ height: "100%", display: "flex", gap: 40, alignItems: "stretch" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 24 }}>
        <HeadlineRow kicker="A PÁGINA" title="Objetiva e direta ao ponto." />
        <p
          style={{
            margin: 0,
            fontFamily: "Inter, sans-serif",
            fontWeight: 500,
            fontSize: 26,
            lineHeight: 1.4,
            color: THEME.inkSoft,
            maxWidth: 520,
          }}
        >
          Apresenta sua empresa, mostra o que você oferece e facilita o contato pelo WhatsApp.
        </p>
      </div>
      <Card bg={THEME.white} style={{ flex: 1, padding: 0, justifyContent: "stretch" }}>
        <div style={{ height: 36, background: THEME.ink, display: "flex", alignItems: "center", paddingLeft: 16, gap: 8 }}>
          <span style={{ width: 12, height: 12, borderRadius: 999, background: "#FF5F57" }} />
          <span style={{ width: 12, height: 12, borderRadius: 999, background: "#FEBC2E" }} />
          <span style={{ width: 12, height: 12, borderRadius: 999, background: "#28C840" }} />
        </div>
        <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 18, flex: 1 }}>
          <div style={{ height: 38, width: "55%", background: THEME.ink, borderRadius: 8 }} />
          <div style={{ height: 18, width: "80%", background: THEME.ink + "30", borderRadius: 6 }} />
          <div style={{ height: 18, width: "70%", background: THEME.ink + "30", borderRadius: 6 }} />
          <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
            <Chip bg={THEME.lime} delay={20}>WhatsApp</Chip>
            <Chip bg={THEME.white} delay={26}>Localização</Chip>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 12 }}>
            {[0, 1, 2].map((i) => {
              const s = useEnter(30 + i * 6);
              return (
                <div
                  key={i}
                  style={{
                    height: 90,
                    background: THEME.paperWarm,
                    border: `3px solid ${THEME.ink}`,
                    borderRadius: 12,
                    opacity: s,
                    transform: `translateY(${interpolate(s, [0, 1], [20, 0])}px)`,
                  }}
                />
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
};

// ---------- 4. FIELDS ----------
const Fields = () => {
  const items = ["Nome", "Segmento", "Descrição", "Cores", "Imagens", "Localização", "Atendimento"];
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 32, justifyContent: "center" }}>
      <HeadlineRow kicker="VOCÊ ENVIA" title="As informações do seu negócio." />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 18, maxWidth: "100%" }}>
        {items.map((t, i) => (
          <Chip key={t} bg={i % 2 === 0 ? THEME.white : THEME.lime} rot={i % 2 === 0 ? -1 : 1} delay={10 + i * 6}>
            {t}
          </Chip>
        ))}
      </div>
    </div>
  );
};

// ---------- 5. MOBILE ----------
const Mobile = () => {
  const float = useFloat(8, 40);
  const s = useEnter(4);
  return (
    <div style={{ height: "100%", display: "flex", gap: 48, alignItems: "center" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 22 }}>
        <HeadlineRow kicker="MOBILE FIRST" title="Feita para o celular." />
        <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 540 }}>
          {["Carregamento leve", "Visual limpo", "Navegação fácil"].map((t, i) => {
            const ss = useEnter(14 + i * 8);
            return (
              <div
                key={t}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  background: THEME.white,
                  border: `3px solid ${THEME.ink}`,
                  borderRadius: 14,
                  padding: "14px 20px",
                  fontFamily: "Inter, sans-serif",
                  fontSize: 24,
                  fontWeight: 600,
                  opacity: ss,
                  transform: `translateX(${interpolate(ss, [0, 1], [-30, 0])}px)`,
                }}
              >
                <span style={{ width: 14, height: 14, borderRadius: 999, background: THEME.azure }} />
                {t}
              </div>
            );
          })}
        </div>
      </div>
      <div
        style={{
          width: 280,
          height: 560,
          borderRadius: 44,
          border: `8px solid ${THEME.ink}`,
          boxShadow: `14px 14px 0 ${THEME.azure}`,
          background: THEME.white,
          padding: 18,
          transform: `translateY(${float}px) scale(${interpolate(s, [0, 1], [0.85, 1])})`,
          opacity: s,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          overflow: "hidden",
        }}
      >
        <div style={{ height: 26, width: "60%", background: THEME.ink, borderRadius: 6 }} />
        <div style={{ height: 12, width: "85%", background: THEME.ink + "30", borderRadius: 4 }} />
        <div style={{ height: 12, width: "75%", background: THEME.ink + "30", borderRadius: 4 }} />
        <div style={{ height: 110, background: THEME.paperWarm, borderRadius: 12, border: `2px solid ${THEME.ink}` }} />
        <div style={{ height: 44, background: THEME.lime, borderRadius: 12, border: `3px solid ${THEME.ink}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 16 }}>
          WhatsApp
        </div>
        <div style={{ height: 44, background: THEME.white, borderRadius: 12, border: `3px solid ${THEME.ink}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 16 }}>
          Localização
        </div>
      </div>
    </div>
  );
};

// ---------- 6. TRUST ----------
const Trust = () => {
  const items = [
    { k: "01", t: "Parecer", v: "Profissional", bg: THEME.white },
    { k: "02", t: "Facilitar", v: "Contato", bg: THEME.lime },
    { k: "03", t: "Criar", v: "Confiança", bg: THEME.azure, color: THEME.white },
  ];
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 36, justifyContent: "center" }}>
      <HeadlineRow kicker="O BÁSICO BEM FEITO" title="Presença confiável, sem rodeios." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
        {items.map((it, i) => (
          <Card key={it.k} bg={it.bg} delay={10 + i * 8} style={{ minHeight: 220, justifyContent: "space-between" }}>
            <div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 900, fontSize: 28, color: (it as any).color ?? THEME.ink, opacity: 0.6 }}>{it.k}</div>
            <div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 22, fontWeight: 600, color: (it as any).color ?? THEME.ink, opacity: 0.7 }}>{it.t}</div>
              <div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 900, fontSize: 50, lineHeight: 1, color: (it as any).color ?? THEME.ink }}>{it.v}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ---------- 7. FLOW ----------
const Flow = () => {
  const steps = [
    { n: "1", t: "Escolha", d: "o plano" },
    { n: "2", t: "Pague", d: "a ativação" },
    { n: "3", t: "Envie", d: "os dados" },
  ];
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 36, justifyContent: "center" }}>
      <HeadlineRow kicker="COMO COMEÇA" title="Três passos. Sem mistério." />
      <div style={{ display: "flex", alignItems: "stretch", gap: 18 }}>
        {steps.map((st, i) => (
          <React.Fragment key={st.n}>
            <Card bg={i === 1 ? THEME.lime : THEME.white} delay={10 + i * 10} style={{ flex: 1, minHeight: 200 }}>
              <div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 900, fontSize: 80, lineHeight: 1, color: THEME.ink }}>{st.n}</div>
              <div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 900, fontSize: 36, color: THEME.ink }}>{st.t}</div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 20, color: THEME.inkSoft }}>{st.d}</div>
            </Card>
            {i < steps.length - 1 ? (
              <div style={{ display: "flex", alignItems: "center", fontFamily: "Archivo, sans-serif", fontWeight: 900, fontSize: 56, color: THEME.ink }}>→</div>
            ) : null}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// ---------- 8. ADAPT ----------
const Adapt = () => {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 36, justifyContent: "center" }}>
      <HeadlineRow kicker="ADAPTAÇÃO" title="Sua marca, sua página." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 28, alignItems: "center" }}>
        <Card bg={THEME.white} delay={10} style={{ minHeight: 220 }}>
          <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 20, color: THEME.inkSoft }}>VOCÊ ENVIA</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 8 }}>
            {["Logo", "Cores", "Fotos", "Texto"].map((t, i) => (
              <Chip key={t} bg={THEME.paperWarm} delay={14 + i * 4}>{t}</Chip>
            ))}
          </div>
        </Card>
        <div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 900, fontSize: 72, color: THEME.ink }}>→</div>
        <Card bg={THEME.azure} delay={26} style={{ minHeight: 220 }}>
          <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 20, color: THEME.white, opacity: 0.85 }}>A FILRO ENTREGA</div>
          <div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 900, fontSize: 50, lineHeight: 1, color: THEME.white }}>
            Página clara,<br />organizada,<br />profissional.
          </div>
        </Card>
      </div>
    </div>
  );
};

// ---------- 9. ONE TIME ----------
const OneTime = () => {
  const s = useEnter(2);
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 50 }}>
      <div
        style={{
          background: THEME.lime,
          border: `8px solid ${THEME.ink}`,
          boxShadow: `14px 14px 0 ${THEME.ink}`,
          borderRadius: 999,
          width: 320,
          height: 320,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Archivo, sans-serif",
          fontWeight: 900,
          fontSize: 220,
          color: THEME.ink,
          transform: `rotate(-6deg) scale(${interpolate(s, [0, 1], [0.6, 1])})`,
          opacity: s,
          lineHeight: 1,
        }}
      >
        1x
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 600 }}>
        <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 24, letterSpacing: 4, color: THEME.ink, background: THEME.white, border: `3px solid ${THEME.ink}`, padding: "8px 16px", borderRadius: 999, alignSelf: "flex-start" }}>
          PAGAMENTO
        </div>
        <div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 900, fontSize: 92, lineHeight: 0.95, color: THEME.ink, letterSpacing: -2 }}>
          Ativação<br />paga uma vez.
        </div>
      </div>
    </div>
  );
};

// ---------- 10. MONTHLY ----------
const Monthly = () => {
  const items = [
    { t: "Hospedagem", d: "Sua página sempre online" },
    { t: "Suporte", d: "Atendimento básico quando precisar" },
    { t: "Alterações", d: "Pequenos ajustes mensais" },
  ];
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 28, justifyContent: "center" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 24, flexWrap: "wrap" }}>
        <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 22, letterSpacing: 4, color: THEME.ink, background: THEME.lime, padding: "8px 16px", borderRadius: 999, border: `3px solid ${THEME.ink}` }}>
          MANUTENÇÃO MENSAL
        </div>
        <div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 900, fontSize: 56, color: THEME.ink, letterSpacing: -1 }}>
          O que está incluso
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
        {items.map((it, i) => (
          <Card key={it.t} bg={i === 1 ? THEME.azure : THEME.white} delay={10 + i * 8} style={{ minHeight: 220 }}>
            <div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 900, fontSize: 40, color: i === 1 ? THEME.white : THEME.ink, lineHeight: 1 }}>{it.t}</div>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 22, color: i === 1 ? THEME.white : THEME.inkSoft, lineHeight: 1.3 }}>{it.d}</div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ---------- 11. NO TECH ----------
const NoTech = () => {
  const s = useEnter(2);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 40, justifyContent: "center", alignItems: "flex-start" }}>
      <div style={{ position: "relative", display: "inline-block", transform: `rotate(-4deg) scale(${interpolate(s, [0, 1], [0.7, 1])})`, opacity: s }}>
        <div
          style={{
            fontFamily: "Archivo, sans-serif",
            fontWeight: 900,
            fontSize: 110,
            color: THEME.ink,
            background: THEME.white,
            border: `6px solid ${THEME.ink}`,
            boxShadow: `12px 12px 0 ${THEME.flame}`,
            padding: "16px 36px",
            borderRadius: 24,
            letterSpacing: -2,
            position: "relative",
          }}
        >
          PARTE TÉCNICA
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: 20,
              right: 20,
              height: 10,
              background: THEME.flame,
              transform: "translateY(-50%) rotate(-3deg)",
              borderRadius: 6,
            }}
          />
        </div>
      </div>
      <HeadlineRow title="A Filro cuida da adaptação e publicação." />
    </div>
  );
};

// ---------- 12. FOR WHO ----------
const ForWho = () => {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 32, justifyContent: "center" }}>
      <HeadlineRow kicker="INDICADO PARA" title="Quem está começando agora." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
        <Card bg={THEME.white} delay={10} style={{ minHeight: 200 }}>
          <div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 900, fontSize: 44, color: THEME.ink, lineHeight: 1 }}>Ainda sem site?</div>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 22, color: THEME.inkSoft }}>Comece com uma base séria e acessível.</div>
        </Card>
        <Card bg={THEME.lime} delay={20} style={{ minHeight: 200 }}>
          <div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 900, fontSize: 44, color: THEME.ink, lineHeight: 1 }}>Sem cardápio digital?</div>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 22, color: THEME.ink, opacity: 0.8 }}>Apresente o que você oferece com clareza.</div>
        </Card>
      </div>
    </div>
  );
};

// ---------- 13. SUMMARY ----------
const Summary = () => {
  const words = ["Simples", "Profissional", "Responsiva", "Pronta"];
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 28, justifyContent: "center" }}>
      <HeadlineRow kicker="EM RESUMO" title={`O plano ${usePlanLabel()} entrega:`} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 18 }}>
        {words.map((w, i) => {
          const s = useEnter(8 + i * 8);
          return (
            <div
              key={w}
              style={{
                background: i % 2 === 0 ? THEME.azure : THEME.white,
                color: i % 2 === 0 ? THEME.white : THEME.ink,
                border: `5px solid ${THEME.ink}`,
                boxShadow: `8px 8px 0 ${THEME.ink}`,
                borderRadius: 22,
                padding: "22px 36px",
                fontFamily: "Archivo, sans-serif",
                fontWeight: 900,
                fontSize: 54,
                letterSpacing: -1,
                transform: `translateY(${interpolate(s, [0, 1], [40, 0])}px) rotate(${i % 2 === 0 ? -2 : 2}deg)`,
                opacity: s,
              }}
            >
              {w}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------- 14. CTA ----------
const Cta = () => {
  const s = useEnter(2);
  const float = useFloat(6, 30);
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          background: THEME.azure,
          border: `8px solid ${THEME.ink}`,
          boxShadow: `16px 16px 0 ${THEME.ink}`,
          borderRadius: 32,
          padding: "48px 80px",
          display: "flex",
          alignItems: "center",
          gap: 32,
          transform: `translateY(${float}px) scale(${interpolate(s, [0, 1], [0.7, 1])})`,
          opacity: s,
        }}
      >
        <div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 900, fontSize: 120, color: THEME.white, lineHeight: 0.95, letterSpacing: -3 }}>
          CHECKOUT
        </div>
        <div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 900, fontSize: 140, color: THEME.lime, lineHeight: 1 }}>→</div>
      </div>
    </div>
  );
};

export const Scenes = {
  hook: Hook,
  promise: Promise_,
  page: Page,
  fields: Fields,
  mobile: Mobile,
  trust: Trust,
  flow: Flow,
  adapt: Adapt,
  oneTime: OneTime,
  monthly: Monthly,
  noTech: NoTech,
  forWho: ForWho,
  summary: Summary,
  cta: Cta,
};
