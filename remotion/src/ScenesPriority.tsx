import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { PRIORITY_THEME as T } from "./theme.priority";

// ---------- shared atoms ----------
const useEnter = (delay = 0, dur = 26) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping: 22, stiffness: 140 }, durationInFrames: dur });
};

const useFloat = (amp = 4, speed = 90) => {
  const frame = useCurrentFrame();
  return Math.sin(frame / speed) * amp;
};

const FONT_SERIF = "'Cormorant Garamond', Georgia, serif";
const FONT_SANS = "'Inter', system-ui, sans-serif";
const FONT_MONO = "'JetBrains Mono', ui-monospace, monospace";

const Kicker: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => {
  const s = useEnter(delay, 22);
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 14,
        opacity: s,
        transform: `translateX(${interpolate(s, [0, 1], [-12, 0])}px)`,
      }}
    >
      <span style={{ width: 36, height: 1, background: T.gold }} />
      <span
        style={{
          fontFamily: FONT_MONO,
          fontSize: 18,
          letterSpacing: 6,
          color: T.gold,
          textTransform: "uppercase",
          fontWeight: 500,
        }}
      >
        {children}
      </span>
    </div>
  );
};

const Display: React.FC<{ children: React.ReactNode; delay?: number; size?: number; italic?: boolean }> = ({
  children,
  delay = 4,
  size = 132,
  italic = false,
}) => {
  const s = useEnter(delay, 30);
  return (
    <h1
      style={{
        margin: 0,
        fontFamily: FONT_SERIF,
        fontWeight: 500,
        fontStyle: italic ? "italic" : "normal",
        fontSize: size,
        lineHeight: 0.98,
        letterSpacing: -2,
        color: T.ink,
        opacity: s,
        transform: `translateY(${interpolate(s, [0, 1], [24, 0])}px)`,
      }}
    >
      {children}
    </h1>
  );
};

const Body: React.FC<{ children: React.ReactNode; delay?: number; max?: number }> = ({ children, delay = 10, max = 640 }) => {
  const s = useEnter(delay, 26);
  return (
    <p
      style={{
        margin: 0,
        fontFamily: FONT_SANS,
        fontSize: 26,
        lineHeight: 1.45,
        color: T.inkSoft,
        maxWidth: max,
        opacity: s,
        transform: `translateY(${interpolate(s, [0, 1], [16, 0])}px)`,
      }}
    >
      {children}
    </p>
  );
};

// ---------- 1. HOOK ----------
const Hook = () => {
  const s = useEnter(0, 24);
  const float = useFloat(3, 80);
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
      <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%, -50%)", display: "flex", alignItems: "center", gap: 20, opacity: s }}>
        <span style={{ width: 60, height: 1, background: T.gold }} />
        <span style={{ fontFamily: FONT_MONO, fontSize: 16, letterSpacing: 8, color: T.gold, textTransform: "uppercase" }}>Filro</span>
        <span style={{ width: 60, height: 1, background: T.gold }} />
      </div>
      <div
        style={{
          textAlign: "center",
          transform: `translateY(${float}px) scale(${interpolate(s, [0, 1], [0.92, 1])})`,
          opacity: s,
        }}
      >
        <div
          style={{
            fontFamily: FONT_SERIF,
            fontStyle: "italic",
            fontSize: 280,
            lineHeight: 0.9,
            color: T.gold,
            letterSpacing: -6,
            textShadow: `0 0 60px ${T.gold}30`,
          }}
        >
          Priority
        </div>
      </div>
    </div>
  );
};

// ---------- 2. PROMISE ----------
const Promise_ = () => {
  const words = ["Completa.", "Estratégica.", "Prioritária."];
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: 36 }}>
      <Kicker>Para quem leva a sério</Kicker>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {words.map((w, i) => {
          const s = useEnter(8 + i * 14, 30);
          return (
            <div
              key={w}
              style={{
                fontFamily: FONT_SERIF,
                fontWeight: 500,
                fontStyle: "italic",
                fontSize: 150,
                lineHeight: 1.0,
                letterSpacing: -3,
                color: i === 2 ? T.gold : T.ink,
                opacity: s,
                transform: `translateX(${interpolate(s, [0, 1], [-30, 0])}px)`,
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

// ---------- 3. STRUCTURE ----------
const Structure = () => {
  const bars = [70, 90, 55, 80, 95, 65];
  return (
    <div style={{ height: "100%", display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 60, alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <Kicker>O que você recebe</Kicker>
        <Display size={108}>Estrutura<br />que sustenta<br /><span style={{ color: T.gold, fontStyle: "italic" }}>confiança.</span></Display>
        <Body delay={24}>Visual profissional e organização comercial pensada para causar boa impressão desde o primeiro acesso.</Body>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: 36, background: T.panel, border: `1px solid ${T.hairline}`, borderRadius: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: 14, letterSpacing: 4, color: T.gold }}>STRUCTURE</span>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: T.gold }} />
        </div>
        {bars.map((w, i) => {
          const s = useEnter(14 + i * 5, 22);
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6, opacity: s }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT_MONO, fontSize: 13, color: T.inkSoft, letterSpacing: 1 }}>
                <span>{["APRESENTAÇÃO", "PRODUTOS", "DIFERENCIAIS", "VISUAL", "ORGANIZAÇÃO", "CONFIANÇA"][i]}</span>
                <span style={{ color: T.gold }}>{w}%</span>
              </div>
              <div style={{ height: 6, background: T.noirSoft, borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${interpolate(s, [0, 1], [0, w])}%`, background: `linear-gradient(90deg, ${T.goldLo}, ${T.goldHi})` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------- 4. BEYOND (short beat) ----------
const Beyond = () => {
  const s1 = useEnter(2, 20);
  const s2 = useEnter(14, 24);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start", gap: 24 }}>
      <div
        style={{
          fontFamily: FONT_SERIF,
          fontSize: 110,
          lineHeight: 1,
          color: T.inkSoft,
          opacity: s1,
          textDecoration: "line-through",
          textDecorationColor: T.gold,
          textDecorationThickness: 3,
        }}
      >
        Apenas uma página online.
      </div>
      <div
        style={{
          fontFamily: FONT_SERIF,
          fontStyle: "italic",
          fontSize: 150,
          lineHeight: 1,
          letterSpacing: -3,
          color: T.gold,
          opacity: s2,
          transform: `translateX(${interpolate(s2, [0, 1], [40, 0])}px)`,
        }}
      >
        Muito mais.
      </div>
    </div>
  );
};

// ---------- 5. DIFFERENTIALS ----------
const Differentials = () => {
  const items = [
    { k: "01", t: "Apresentar melhor" },
    { k: "02", t: "Destacar diferenciais" },
    { k: "03", t: "Caminho direto ao WhatsApp" },
  ];
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: 40 }}>
      <Kicker>Onde o PRIORITY age</Kicker>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {items.map((it, i) => {
          const s = useEnter(10 + i * 14, 26);
          return (
            <div
              key={it.k}
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 40,
                padding: "26px 0",
                borderTop: `1px solid ${T.hairline}`,
                borderBottom: i === items.length - 1 ? `1px solid ${T.hairline}` : "none",
                opacity: s,
                transform: `translateY(${interpolate(s, [0, 1], [20, 0])}px)`,
              }}
            >
              <div style={{ fontFamily: FONT_MONO, fontSize: 24, color: T.gold, letterSpacing: 2, minWidth: 60 }}>{it.k}</div>
              <div style={{ fontFamily: FONT_SERIF, fontSize: 84, lineHeight: 1.05, color: T.ink, fontWeight: 500 }}>{it.t}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------- 6. SECTIONS (grid of modules) ----------
const Sections = () => {
  const items = ["Apresentação", "Produtos", "Diferenciais", "Localização", "FAQ", "Atendimento", "Imagens", "Comercial"];
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 32, justifyContent: "center" }}>
      <Kicker>Seções incluídas</Kicker>
      <Display size={86}>Tudo o que sua página <span style={{ color: T.gold, fontStyle: "italic" }}>precisa ter.</span></Display>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: 8 }}>
        {items.map((t, i) => {
          const s = useEnter(16 + i * 5, 22);
          return (
            <div
              key={t}
              style={{
                padding: "22px 22px",
                background: T.panel,
                border: `1px solid ${T.hairline}`,
                borderRadius: 6,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                minHeight: 120,
                opacity: s,
                transform: `translateY(${interpolate(s, [0, 1], [18, 0])}px)`,
              }}
            >
              <div style={{ fontFamily: FONT_MONO, fontSize: 12, letterSpacing: 3, color: T.gold }}>{String(i + 1).padStart(2, "0")}</div>
              <div style={{ fontFamily: FONT_SERIF, fontSize: 30, color: T.ink, lineHeight: 1.1 }}>{t}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------- 7. CLARITY ----------
const Clarity = () => {
  const questions = [
    { q: "O que oferece?", a: "Claro." },
    { q: "Por que confiar?", a: "Evidente." },
    { q: "Como entrar em contato?", a: "Imediato." },
  ];
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 28, justifyContent: "center" }}>
      <Kicker>O visitante entende rápido</Kicker>
      <div style={{ display: "flex", flexDirection: "column", gap: 22, marginTop: 8 }}>
        {questions.map((it, i) => {
          const s = useEnter(10 + i * 12, 24);
          return (
            <div key={it.q} style={{ display: "flex", alignItems: "baseline", gap: 32, opacity: s, transform: `translateX(${interpolate(s, [0, 1], [-20, 0])}px)` }}>
              <div style={{ fontFamily: FONT_SERIF, fontSize: 58, color: T.inkSoft, fontWeight: 400, minWidth: 480 }}>{it.q}</div>
              <div style={{ fontFamily: FONT_SERIF, fontStyle: "italic", fontSize: 72, color: T.gold, lineHeight: 1 }}>{it.a}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------- 8. RESPONSIVE ----------
const Responsive = () => {
  const float = useFloat(5, 70);
  const s1 = useEnter(4, 26);
  const s2 = useEnter(14, 26);
  const s3 = useEnter(24, 26);
  return (
    <div style={{ height: "100%", display: "flex", gap: 60, alignItems: "center" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 22 }}>
        <Kicker>Responsiva</Kicker>
        <Display size={96}>Em qualquer<br /><span style={{ color: T.gold, fontStyle: "italic" }}>dispositivo.</span></Display>
        <Body delay={22} max={520}>Celular, computador, tablet. Experiência profissional em todas as telas.</Body>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 24, transform: `translateY(${float}px)` }}>
        {/* Desktop */}
        <div style={{ opacity: s1, transform: `scale(${interpolate(s1, [0, 1], [0.85, 1])})` }}>
          <div style={{ width: 360, height: 230, background: T.panel, border: `1px solid ${T.gold}`, borderRadius: 6, padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ height: 14, width: "55%", background: T.gold, borderRadius: 2 }} />
            <div style={{ height: 8, width: "80%", background: T.hairline, borderRadius: 2 }} />
            <div style={{ height: 8, width: "70%", background: T.hairline, borderRadius: 2 }} />
            <div style={{ flex: 1, background: T.noirSoft, borderRadius: 4, marginTop: 6 }} />
          </div>
          <div style={{ width: 100, height: 8, background: T.panel, borderRadius: 2, margin: "8px auto 0" }} />
        </div>
        {/* Tablet */}
        <div style={{ opacity: s2, transform: `scale(${interpolate(s2, [0, 1], [0.85, 1])})` }}>
          <div style={{ width: 150, height: 200, background: T.panel, border: `1px solid ${T.hairline}`, borderRadius: 10, padding: 10, display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ height: 10, width: "60%", background: T.gold, borderRadius: 2 }} />
            <div style={{ height: 6, background: T.hairline, borderRadius: 2 }} />
            <div style={{ flex: 1, background: T.noirSoft, borderRadius: 4 }} />
          </div>
        </div>
        {/* Phone */}
        <div style={{ opacity: s3, transform: `scale(${interpolate(s3, [0, 1], [0.85, 1])})` }}>
          <div style={{ width: 90, height: 175, background: T.panel, border: `1px solid ${T.hairline}`, borderRadius: 14, padding: 8, display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ height: 7, width: "55%", background: T.gold, borderRadius: 2 }} />
            <div style={{ flex: 1, background: T.noirSoft, borderRadius: 4 }} />
            <div style={{ height: 14, background: T.gold, borderRadius: 3 }} />
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------- 9. PAY FLOW ----------
const PayFlow = () => {
  const steps = [
    { n: "I", t: "Escolha", d: "o PRIORITY" },
    { n: "II", t: "Ativação", d: "pagamento único" },
    { n: "III", t: "Envie", d: "suas informações" },
  ];
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: 32 }}>
      <Kicker>Como começa</Kicker>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0 }}>
        {steps.map((st, i) => {
          const s = useEnter(10 + i * 12, 26);
          return (
            <div
              key={st.n}
              style={{
                padding: "32px 28px",
                borderLeft: i === 0 ? `1px solid ${T.gold}` : `1px solid ${T.hairline}`,
                borderRight: i === steps.length - 1 ? `1px solid ${T.gold}` : "none",
                opacity: s,
                transform: `translateY(${interpolate(s, [0, 1], [16, 0])}px)`,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <div style={{ fontFamily: FONT_SERIF, fontStyle: "italic", fontSize: 96, lineHeight: 0.9, color: T.gold }}>{st.n}</div>
              <div style={{ fontFamily: FONT_SERIF, fontSize: 50, color: T.ink, lineHeight: 1 }}>{st.t}</div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 14, letterSpacing: 3, color: T.inkSoft, textTransform: "uppercase" }}>{st.d}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------- 10. CUSTOMIZE ----------
const Customize = () => {
  const left = ["Textos", "Cores", "Imagens"];
  const right = ["Contatos", "Localização", "Serviços"];
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 30, justifyContent: "center" }}>
      <Kicker>Adaptamos para você</Kicker>
      <Display size={92}>Sua marca,<br /><span style={{ color: T.gold, fontStyle: "italic" }}>sua página.</span></Display>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 10 }}>
        {[left, right].map((col, ci) => (
          <div key={ci} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {col.map((t, i) => {
              const s = useEnter(14 + (ci * 3 + i) * 6, 22);
              return (
                <div
                  key={t}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 18,
                    padding: "16px 22px",
                    background: T.panel,
                    border: `1px solid ${T.hairline}`,
                    borderRadius: 4,
                    opacity: s,
                    transform: `translateX(${interpolate(s, [0, 1], [ci === 0 ? -18 : 18, 0])}px)`,
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: 999, background: T.gold }} />
                  <span style={{ fontFamily: FONT_SERIF, fontSize: 36, color: T.ink }}>{t}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

// ---------- 11. FOCUS ----------
const Focus = () => {
  const items = [
    { t: "Apresentação", d: "mais atenção" },
    { t: "Comercial", d: "mais clareza" },
    { t: "Visual", d: "mais força" },
  ];
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 32, justifyContent: "center" }}>
      <Kicker>O foco do PRIORITY</Kicker>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 22 }}>
        {items.map((it, i) => {
          const s = useEnter(10 + i * 10, 26);
          return (
            <div
              key={it.t}
              style={{
                padding: "40px 28px",
                background: i === 1 ? T.panelHi : T.panel,
                border: `1px solid ${i === 1 ? T.gold : T.hairline}`,
                borderRadius: 6,
                minHeight: 260,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                opacity: s,
                transform: `translateY(${interpolate(s, [0, 1], [22, 0])}px)`,
              }}
            >
              <div style={{ fontFamily: FONT_MONO, fontSize: 13, letterSpacing: 4, color: T.gold, textTransform: "uppercase" }}>{it.d}</div>
              <div style={{ fontFamily: FONT_SERIF, fontStyle: "italic", fontSize: 64, lineHeight: 1, color: T.ink }}>{it.t}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------- 12. WE HANDLE ----------
const WeHandle = () => {
  const items = ["Hospedagem", "Configuração", "Publicação", "Parte técnica"];
  return (
    <div style={{ height: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <Kicker>Você não lida com</Kicker>
        <Display size={96}>Nada disso<br /><span style={{ color: T.gold, fontStyle: "italic" }}>te atrapalha.</span></Display>
        <Body delay={22} max={520}>A Filro cuida da estrutura, da adaptação e da publicação. Sua página chega pronta.</Body>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {items.map((t, i) => {
          const s = useEnter(14 + i * 8, 24);
          return (
            <div
              key={t}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                padding: "20px 28px",
                background: T.panel,
                border: `1px solid ${T.hairline}`,
                borderRadius: 4,
                opacity: s,
                transform: `translateX(${interpolate(s, [0, 1], [24, 0])}px)`,
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  width: 28,
                  height: 28,
                  alignItems: "center",
                  justifyContent: "center",
                  border: `1px solid ${T.gold}`,
                  color: T.gold,
                  fontFamily: FONT_MONO,
                  fontSize: 16,
                  borderRadius: 999,
                }}
              >
                ✕
              </span>
              <span style={{ fontFamily: FONT_SERIF, fontSize: 38, color: T.ink, textDecoration: "line-through", textDecorationColor: T.goldLo }}>
                {t}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------- 13. PAY ONCE + MONTHLY ----------
const PayOnce = () => {
  const s1 = useEnter(4, 26);
  const s2 = useEnter(20, 26);
  return (
    <div style={{ height: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36, alignItems: "stretch" }}>
      <div
        style={{
          padding: 48,
          background: T.panel,
          border: `1px solid ${T.gold}`,
          borderRadius: 6,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          opacity: s1,
          transform: `translateY(${interpolate(s1, [0, 1], [20, 0])}px)`,
        }}
      >
        <div style={{ fontFamily: FONT_MONO, fontSize: 14, letterSpacing: 4, color: T.gold }}>ATIVAÇÃO</div>
        <div>
          <div style={{ fontFamily: FONT_SERIF, fontStyle: "italic", fontSize: 200, lineHeight: 0.9, color: T.gold }}>1×</div>
          <div style={{ fontFamily: FONT_SERIF, fontSize: 48, color: T.ink, marginTop: 8 }}>Pago apenas uma vez.</div>
        </div>
      </div>
      <div
        style={{
          padding: 48,
          background: T.noirSoft,
          border: `1px solid ${T.hairline}`,
          borderRadius: 6,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          opacity: s2,
          transform: `translateY(${interpolate(s2, [0, 1], [20, 0])}px)`,
        }}
      >
        <div style={{ fontFamily: FONT_MONO, fontSize: 14, letterSpacing: 4, color: T.inkSoft }}>MANUTENÇÃO MENSAL</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {["Hospedagem", "Suporte básico", "Pequenas alterações"].map((t, i) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: FONT_SERIF, fontSize: 32, color: T.ink }}>
              <span style={{ width: 22, height: 1, background: T.gold }} />
              {t}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ---------- 14. IDEAL (long beat — slow editorial moment) ----------
const Ideal = () => {
  const s1 = useEnter(8, 30);
  const s2 = useEnter(110, 30);
  const s3 = useEnter(230, 30);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: 30 }}>
      <Kicker>Ideal para</Kicker>
      <div
        style={{
          fontFamily: FONT_SERIF,
          fontSize: 110,
          lineHeight: 1.02,
          color: T.ink,
          letterSpacing: -2,
          opacity: s1,
          transform: `translateY(${interpolate(s1, [0, 1], [20, 0])}px)`,
          maxWidth: 1400,
        }}
      >
        empresas que querem uma{" "}
        <span style={{ color: T.gold, fontStyle: "italic" }}>entrega mais completa</span>,
      </div>
      <div
        style={{
          fontFamily: FONT_SERIF,
          fontSize: 90,
          lineHeight: 1.05,
          color: T.inkSoft,
          opacity: s2,
          transform: `translateY(${interpolate(s2, [0, 1], [20, 0])}px)`,
          maxWidth: 1400,
        }}
      >
        uma <span style={{ color: T.gold, fontStyle: "italic" }}>apresentação mais forte</span>
      </div>
      <div
        style={{
          fontFamily: FONT_SERIF,
          fontSize: 90,
          lineHeight: 1.05,
          color: T.inkSoft,
          opacity: s3,
          transform: `translateY(${interpolate(s3, [0, 1], [20, 0])}px)`,
          maxWidth: 1400,
        }}
      >
        e mais <span style={{ color: T.gold, fontStyle: "italic" }}>percepção de valor.</span>
      </div>
    </div>
  );
};

// ---------- 15. CTA ----------
const Cta = () => {
  const s1 = useEnter(4, 28);
  const s2 = useEnter(28, 26);
  const pulse = useFloat(4, 50);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: 36 }}>
      <div style={{ opacity: s1 }}>
        <Kicker>Próximo passo</Kicker>
      </div>
      <div
        style={{
          fontFamily: FONT_SERIF,
          fontSize: 140,
          lineHeight: 1,
          letterSpacing: -3,
          color: T.ink,
          opacity: s1,
          transform: `translateY(${interpolate(s1, [0, 1], [24, 0])}px)`,
        }}
      >
        Avance para o <span style={{ color: T.gold, fontStyle: "italic" }}>checkout.</span>
      </div>
      <div
        style={{
          display: "inline-flex",
          alignSelf: "flex-start",
          alignItems: "center",
          gap: 22,
          padding: "26px 44px",
          background: T.gold,
          color: T.noir,
          fontFamily: FONT_MONO,
          fontWeight: 600,
          fontSize: 22,
          letterSpacing: 4,
          textTransform: "uppercase",
          borderRadius: 4,
          opacity: s2,
          transform: `translateY(${interpolate(s2, [0, 1], [16, 0]) + pulse}px)`,
        }}
      >
        Continuar com PRIORITY
        <span style={{ fontFamily: FONT_SERIF, fontSize: 32 }}>→</span>
      </div>
    </div>
  );
};

export const ScenesPriority = {
  hook: Hook,
  promise: Promise_,
  structure: Structure,
  beyond: Beyond,
  differentials: Differentials,
  sections: Sections,
  clarity: Clarity,
  responsive: Responsive,
  payFlow: PayFlow,
  customize: Customize,
  focus: Focus,
  weHandle: WeHandle,
  payOnce: PayOnce,
  ideal: Ideal,
  cta: Cta,
} as const;
