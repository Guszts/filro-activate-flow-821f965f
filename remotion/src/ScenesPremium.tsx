import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { THEME } from "./theme";
import type { CSSProperties } from "react";

// Shared helpers (mirrored from Scenes.tsx so we keep style/typography consistent)
const useEnter = (delay = 0) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping: 16, stiffness: 160 }, durationInFrames: 30 });
};
const useFloat = (amp = 6, speed = 60) => {
  const frame = useCurrentFrame();
  return Math.sin(frame / speed) * amp;
};

const Kicker: React.FC<{ children: React.ReactNode; bg?: string }> = ({ children, bg = THEME.lime }) => (
  <div
    style={{
      alignSelf: "flex-start",
      fontFamily: "Inter, sans-serif",
      fontWeight: 700,
      fontSize: 22,
      letterSpacing: 4,
      color: THEME.ink,
      background: bg,
      padding: "8px 16px",
      borderRadius: 999,
      border: `3px solid ${THEME.ink}`,
    }}
  >
    {children}
  </div>
);

const Headline: React.FC<{ children: React.ReactNode; size?: number }> = ({ children, size = 96 }) => (
  <h1
    style={{
      margin: 0,
      fontFamily: "Archivo, sans-serif",
      fontWeight: 900,
      fontSize: size,
      lineHeight: 0.95,
      letterSpacing: -3,
      color: THEME.ink,
      wordBreak: "break-word",
    }}
  >
    {children}
  </h1>
);

const Chip: React.FC<{ children: React.ReactNode; bg?: string; color?: string; rot?: number; delay?: number; fz?: number }> = ({
  children, bg = THEME.white, color = THEME.ink, rot = 0, delay = 0, fz = 28,
}) => {
  const s = useEnter(delay);
  return (
    <div
      style={{
        background: bg,
        color,
        border: `4px solid ${THEME.ink}`,
        boxShadow: `6px 6px 0 ${THEME.ink}`,
        borderRadius: 18,
        padding: "16px 26px",
        fontFamily: "Inter, sans-serif",
        fontWeight: 700,
        fontSize: fz,
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
  children, bg = THEME.white, style, delay = 0,
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

// 1. HOOK — PREMIUM big stamp with crown-like accent
const HookP = () => {
  const s = useEnter(2);
  const float = useFloat(4, 50);
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          position: "relative",
          transform: `rotate(-3deg) scale(${interpolate(s, [0, 1], [0.6, 1])}) translateY(${float}px)`,
          opacity: s,
        }}
      >
        <div
          style={{
            background: THEME.flame,
            border: `8px solid ${THEME.ink}`,
            boxShadow: `16px 16px 0 ${THEME.ink}`,
            borderRadius: 36,
            padding: "60px 100px",
            fontFamily: "Archivo, sans-serif",
            fontWeight: 900,
            fontSize: 200,
            letterSpacing: -8,
            color: THEME.white,
            lineHeight: 0.9,
          }}
        >
          PREMIUM
        </div>
        <div
          style={{
            position: "absolute",
            top: -50,
            left: -30,
            background: THEME.lime,
            border: `5px solid ${THEME.ink}`,
            boxShadow: `8px 8px 0 ${THEME.ink}`,
            borderRadius: 999,
            padding: "12px 24px",
            fontFamily: "Archivo, sans-serif",
            fontWeight: 900,
            fontSize: 26,
            transform: "rotate(-8deg)",
          }}>
            ★ TOP TIER
          </div>
        <div
          style={{
            position: "absolute",
            bottom: -40,
            right: -30,
            background: THEME.azure,
            border: `5px solid ${THEME.ink}`,
            boxShadow: `8px 8px 0 ${THEME.ink}`,
            borderRadius: 999,
            padding: "12px 24px",
            fontFamily: "Archivo, sans-serif",
            fontWeight: 900,
            fontSize: 26,
            color: THEME.white,
            transform: "rotate(6deg)",
          }}>
            BY FILRO
          </div>
      </div>
    </div>
  );
};

// 2. COMPLETE — three stacked layered cards growing in size: "completa, refinada, confiável"
const CompleteP = () => {
  const labels = [
    { t: "COMPLETA", bg: THEME.white, rot: -4 },
    { t: "REFINADA", bg: THEME.lime, rot: 2 },
    { t: "CONFIÁVEL", bg: THEME.azure, color: THEME.white, rot: -2 },
  ];
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 24, justifyContent: "center" }}>
      <Kicker>O JEITO PREMIUM</Kicker>
      <Headline>Presença digital sob medida.</Headline>
      <div style={{ display: "flex", gap: 24, marginTop: 18, flexWrap: "wrap" }}>
        {labels.map((l, i) => {
          const s = useEnter(12 + i * 10);
          return (
            <div key={l.t}
              style={{
                background: l.bg,
                color: (l as any).color ?? THEME.ink,
                border: `5px solid ${THEME.ink}`,
                boxShadow: `10px 10px 0 ${THEME.ink}`,
                borderRadius: 22,
                padding: "26px 44px",
                fontFamily: "Archivo, sans-serif",
                fontWeight: 900,
                fontSize: 64,
                letterSpacing: -1,
                transform: `rotate(${l.rot}deg) scale(${interpolate(s, [0, 1], [0.5, 1])})`,
                opacity: s,
              }}>
              {l.t}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 3. ADVANCED — tier ladder with bars showing levels
const AdvancedP = () => {
  const levels = [
    { lbl: "Start", h: 80, bg: THEME.paperWarm },
    { lbl: "Essencial", h: 130, bg: THEME.white },
    { lbl: "Plus", h: 180, bg: THEME.lime },
    { lbl: "Profissional", h: 230, bg: THEME.azure, color: THEME.white },
    { lbl: "PREMIUM", h: 300, bg: THEME.flame, color: THEME.white, hl: true },
  ];
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 32, justifyContent: "center" }}>
      <Kicker>ESTRUTURA AVANÇADA</Kicker>
      <Headline size={84}>Mais visual. Mais organização.</Headline>
      <div style={{ display: "flex", gap: 18, alignItems: "flex-end", marginTop: 16 }}>
        {levels.map((lv, i) => {
          const s = useEnter(10 + i * 6);
          const h = interpolate(s, [0, 1], [10, lv.h]);
          return (
            <div key={lv.lbl} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, flex: 1 }}>
              <div style={{
                width: "100%",
                height: h,
                background: lv.bg,
                color: (lv as any).color ?? THEME.ink,
                border: `5px solid ${THEME.ink}`,
                boxShadow: lv.hl ? `8px 8px 0 ${THEME.ink}` : `4px 4px 0 ${THEME.ink}`,
                borderRadius: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "Archivo, sans-serif",
                fontWeight: 900,
                fontSize: lv.hl ? 30 : 22,
                opacity: s,
              }}>
                {lv.hl ? "★" : ""}
              </div>
              <div style={{ fontFamily: "Inter, sans-serif", fontWeight: lv.hl ? 800 : 600, fontSize: lv.hl ? 22 : 18, color: THEME.ink, opacity: lv.hl ? 1 : 0.6 }}>
                {lv.lbl}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 4. BEYOND BASIC — basic struck-through, premium highlighted
const BeyondP = () => {
  const s1 = useEnter(4);
  const s2 = useEnter(18);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 30, justifyContent: "center", alignItems: "flex-start" }}>
      <Kicker bg={THEME.white}>ALÉM DO BÁSICO</Kicker>
      <div style={{ position: "relative", opacity: s1, transform: `translateX(${interpolate(s1, [0, 1], [-40, 0])}px)` }}>
        <div style={{
          fontFamily: "Archivo, sans-serif", fontWeight: 900, fontSize: 100, color: THEME.inkSoft, letterSpacing: -2,
        }}>
          Apenas estar online
        </div>
        <div style={{
          position: "absolute", top: "50%", left: -10, right: -10, height: 12, background: THEME.flame,
          transform: "translateY(-50%) rotate(-2deg)", borderRadius: 6,
        }} />
      </div>
      <div style={{
        opacity: s2,
        transform: `translateY(${interpolate(s2, [0, 1], [30, 0])}px)`,
        background: THEME.azure,
        border: `6px solid ${THEME.ink}`,
        boxShadow: `12px 12px 0 ${THEME.ink}`,
        padding: "20px 36px",
        borderRadius: 24,
        color: THEME.white,
        fontFamily: "Archivo, sans-serif",
        fontWeight: 900,
        fontSize: 100,
        letterSpacing: -2,
      }}>
        Estar bem apresentado.
      </div>
    </div>
  );
};

// 5. VALUE — stamp + headline
const ValueP = () => {
  const s = useEnter(4);
  const float = useFloat(5, 40);
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 50 }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
        <Kicker>PERCEPÇÃO DE VALOR</Kicker>
        <Headline>Mais convincente desde o primeiro acesso.</Headline>
      </div>
      <div
        style={{
          background: THEME.lime,
          border: `8px solid ${THEME.ink}`,
          boxShadow: `14px 14px 0 ${THEME.ink}`,
          borderRadius: 999,
          width: 320, height: 320,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "Archivo, sans-serif", fontWeight: 900,
          fontSize: 90, color: THEME.ink, lineHeight: 0.9, textAlign: "center",
          transform: `rotate(-8deg) translateY(${float}px) scale(${interpolate(s, [0, 1], [0.6, 1])})`,
          opacity: s,
        }}
      >
        VALOR<br />REAL
      </div>
    </div>
  );
};

// 6. SECTIONS — mosaic of section blocks (FAQ, WhatsApp, etc.)
const SectionsP = () => {
  const items = [
    { t: "Empresa", bg: THEME.white },
    { t: "Produtos", bg: THEME.lime },
    { t: "Diferenciais", bg: THEME.azure, c: THEME.white },
    { t: "Localização", bg: THEME.white },
    { t: "Imagens", bg: THEME.paperWarm },
    { t: "FAQ", bg: THEME.lime },
    { t: "WhatsApp", bg: THEME.azure, c: THEME.white },
    { t: "Atendimento", bg: THEME.white },
    { t: "Seções comerciais", bg: THEME.flame, c: THEME.white },
  ];
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 22, justifyContent: "center" }}>
      <Kicker>A ESTRUTURA</Kicker>
      <Headline size={72}>Tudo o que sua marca precisa mostrar.</Headline>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, marginTop: 8 }}>
        {items.map((it, i) => {
          const s = useEnter(8 + i * 5);
          return (
            <div key={it.t}
              style={{
                background: it.bg,
                color: it.c ?? THEME.ink,
                border: `4px solid ${THEME.ink}`,
                boxShadow: `8px 8px 0 ${THEME.ink}`,
                borderRadius: 18,
                padding: "26px 24px",
                fontFamily: "Archivo, sans-serif",
                fontWeight: 900,
                fontSize: 34,
                opacity: s,
                transform: `translateY(${interpolate(s, [0, 1], [30, 0])}px)`,
              }}>
              {it.t}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 7. JOURNEY — visitor steps with arrows
const JourneyP = () => {
  const steps = [
    { n: "01", t: "Entende" },
    { n: "02", t: "Confia" },
    { n: "03", t: "Contata" },
  ];
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 32, justifyContent: "center" }}>
      <Kicker>JORNADA DO VISITANTE</Kicker>
      <Headline>Do primeiro acesso ao WhatsApp.</Headline>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 16 }}>
        {steps.map((st, i) => (
          <React.Fragment key={st.n}>
            <Card bg={i === 1 ? THEME.lime : i === 2 ? THEME.azure : THEME.white} delay={10 + i * 12} style={{ flex: 1, minHeight: 200 }}>
              <div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 900, fontSize: 56, lineHeight: 1, color: i === 2 ? THEME.white : THEME.ink, opacity: 0.6 }}>{st.n}</div>
              <div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 900, fontSize: 58, color: i === 2 ? THEME.white : THEME.ink }}>{st.t}</div>
            </Card>
            {i < steps.length - 1 ? <div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 900, fontSize: 64, color: THEME.ink }}>→</div> : null}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// 8. DEVICES — phone + tablet + desktop mockups
const DevicesP = () => {
  const s = useEnter(4);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 28, justifyContent: "center" }}>
      <Kicker>RESPONSIVA</Kicker>
      <Headline size={84}>Boa em qualquer tela.</Headline>
      <div style={{ display: "flex", gap: 32, alignItems: "flex-end", justifyContent: "center", marginTop: 8 }}>
        {/* Desktop */}
        <div style={{
          width: 540, height: 340, background: THEME.white,
          border: `6px solid ${THEME.ink}`, boxShadow: `12px 12px 0 ${THEME.azure}`,
          borderRadius: 18, padding: 18, display: "flex", flexDirection: "column", gap: 10,
          transform: `translateY(${interpolate(s, [0, 1], [30, 0])}px)`, opacity: s,
        }}>
          <div style={{ height: 24, background: THEME.ink, borderRadius: 6, width: "50%" }} />
          <div style={{ height: 12, background: THEME.ink + "30", borderRadius: 4, width: "80%" }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 6 }}>
            {[0,1,2].map(i => <div key={i} style={{ height: 100, background: THEME.paperWarm, border: `2px solid ${THEME.ink}`, borderRadius: 8 }} />)}
          </div>
        </div>
        {/* Tablet */}
        <div style={{
          width: 240, height: 320, background: THEME.white,
          border: `6px solid ${THEME.ink}`, boxShadow: `10px 10px 0 ${THEME.lime}`,
          borderRadius: 22, padding: 14, display: "flex", flexDirection: "column", gap: 8,
          transform: `translateY(${interpolate(s, [0, 1], [40, 0])}px) rotate(-2deg)`, opacity: s,
        }}>
          <div style={{ height: 18, background: THEME.ink, borderRadius: 4, width: "60%" }} />
          <div style={{ height: 10, background: THEME.ink + "30", borderRadius: 3 }} />
          <div style={{ height: 70, background: THEME.paperWarm, border: `2px solid ${THEME.ink}`, borderRadius: 6 }} />
          <div style={{ height: 32, background: THEME.lime, border: `2px solid ${THEME.ink}`, borderRadius: 6 }} />
        </div>
        {/* Phone */}
        <div style={{
          width: 160, height: 320, background: THEME.white,
          border: `6px solid ${THEME.ink}`, boxShadow: `8px 8px 0 ${THEME.flame}`,
          borderRadius: 28, padding: 12, display: "flex", flexDirection: "column", gap: 6,
          transform: `translateY(${interpolate(s, [0, 1], [50, 0])}px) rotate(3deg)`, opacity: s,
        }}>
          <div style={{ height: 14, background: THEME.ink, borderRadius: 3, width: "55%" }} />
          <div style={{ height: 8, background: THEME.ink + "30", borderRadius: 3 }} />
          <div style={{ height: 60, background: THEME.paperWarm, border: `2px solid ${THEME.ink}`, borderRadius: 6 }} />
          <div style={{ height: 26, background: THEME.lime, border: `2px solid ${THEME.ink}`, borderRadius: 6 }} />
          <div style={{ height: 26, background: THEME.white, border: `2px solid ${THEME.ink}`, borderRadius: 6 }} />
        </div>
      </div>
    </div>
  );
};

// 9. MOBILE PRIORITY — phone hero w/ "celular primeiro"
const MobilePrioP = () => {
  const s = useEnter(4);
  const float = useFloat(8, 40);
  return (
    <div style={{ height: "100%", display: "flex", gap: 50, alignItems: "center" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 18 }}>
        <Kicker>NO CELULAR</Kicker>
        <Headline>É onde seu cliente está.</Headline>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 10 }}>
          {["Toque rápido para WhatsApp", "Carregamento leve", "Visual profissional"].map((t, i) => {
            const ss = useEnter(14 + i * 8);
            return (
              <div key={t} style={{
                display: "flex", alignItems: "center", gap: 14,
                background: THEME.white, border: `3px solid ${THEME.ink}`, borderRadius: 14,
                padding: "12px 20px", fontFamily: "Inter, sans-serif", fontSize: 24, fontWeight: 600,
                opacity: ss, transform: `translateX(${interpolate(ss, [0, 1], [-30, 0])}px)`,
              }}>
                <span style={{ width: 14, height: 14, borderRadius: 999, background: THEME.flame }} />
                {t}
              </div>
            );
          })}
        </div>
      </div>
      <div style={{
        width: 300, height: 600, borderRadius: 48,
        border: `8px solid ${THEME.ink}`, boxShadow: `14px 14px 0 ${THEME.flame}`,
        background: THEME.white, padding: 20, transform: `translateY(${float}px) scale(${interpolate(s, [0, 1], [0.85, 1])})`,
        opacity: s, display: "flex", flexDirection: "column", gap: 12,
      }}>
        <div style={{ height: 28, width: "60%", background: THEME.ink, borderRadius: 6 }} />
        <div style={{ height: 12, width: "85%", background: THEME.ink + "30", borderRadius: 4 }} />
        <div style={{ height: 130, background: THEME.paperWarm, borderRadius: 12, border: `2px solid ${THEME.ink}` }} />
        <div style={{ height: 14, background: THEME.ink + "30", borderRadius: 4 }} />
        <div style={{ height: 14, width: "70%", background: THEME.ink + "30", borderRadius: 4 }} />
        <div style={{ height: 50, background: THEME.lime, borderRadius: 12, border: `3px solid ${THEME.ink}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: 18 }}>
          WhatsApp
        </div>
        <div style={{ height: 50, background: THEME.white, borderRadius: 12, border: `3px solid ${THEME.ink}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: 18 }}>
          Localização
        </div>
      </div>
    </div>
  );
};

// 10. PAY INFO — payment + form upload
const PayInfoP = () => {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 28, justifyContent: "center" }}>
      <Kicker>COMO COMEÇA</Kicker>
      <Headline size={80}>Pague a ativação. Envie os dados.</Headline>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 28, alignItems: "center", marginTop: 12 }}>
        <Card bg={THEME.lime} delay={10} style={{ minHeight: 220 }}>
          <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 22, letterSpacing: 3, color: THEME.ink, opacity: 0.7 }}>PASSO 1</div>
          <div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 900, fontSize: 56, color: THEME.ink, lineHeight: 1 }}>Pagamento</div>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <Chip bg={THEME.white} delay={20} fz={20}>Stripe</Chip>
            <Chip bg={THEME.white} delay={26} fz={20}>Seguro</Chip>
          </div>
        </Card>
        <div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 900, fontSize: 72, color: THEME.ink }}>→</div>
        <Card bg={THEME.azure} delay={30} style={{ minHeight: 220 }}>
          <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 22, letterSpacing: 3, color: THEME.white, opacity: 0.8 }}>PASSO 2</div>
          <div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 900, fontSize: 56, color: THEME.white, lineHeight: 1 }}>Suas informações</div>
          <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
            <Chip bg={THEME.white} delay={40} fz={20}>Negócio</Chip>
            <Chip bg={THEME.lime} delay={46} fz={20}>Contato</Chip>
          </div>
        </Card>
      </div>
    </div>
  );
};

// 11. ADAPT — input list flowing into output preview
const AdaptP = () => {
  const items = ["Textos", "Cores", "Imagens", "Contatos", "Localização", "Serviços"];
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 28, justifyContent: "center" }}>
      <Kicker>ADAPTAMOS</Kicker>
      <Headline size={80}>Sua marca em cada detalhe.</Headline>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 10 }}>
        {items.map((t, i) => (
          <Chip key={t} bg={i % 3 === 0 ? THEME.lime : i % 3 === 1 ? THEME.white : THEME.azure} color={i % 3 === 2 ? THEME.white : THEME.ink} rot={i % 2 === 0 ? -2 : 2} delay={10 + i * 8} fz={32}>
            {t}
          </Chip>
        ))}
      </div>
    </div>
  );
};

// 12. PREMIUM STAMP — big seal
const PremiumStampP = () => {
  const s = useEnter(2);
  const float = useFloat(5, 35);
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{
        position: "relative",
        transform: `rotate(-5deg) scale(${interpolate(s, [0, 1], [0.6, 1])}) translateY(${float}px)`,
        opacity: s,
        background: THEME.flame,
        border: `10px solid ${THEME.ink}`,
        boxShadow: `18px 18px 0 ${THEME.ink}`,
        padding: "44px 84px",
        borderRadius: 32,
      }}>
        <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: 26, color: THEME.white, opacity: 0.85, letterSpacing: 6 }}>
          NO PLANO
        </div>
        <div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 900, fontSize: 180, color: THEME.white, lineHeight: 0.9, letterSpacing: -6 }}>
          PREMIUM
        </div>
        <div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 900, fontSize: 40, color: THEME.lime, lineHeight: 1, marginTop: 6 }}>
          Mais profissionalismo.
        </div>
      </div>
    </div>
  );
};

// 13. WE HANDLE — crossed out tech terms + "Filro cuida"
const WeHandleP = () => {
  const terms = ["Hospedagem", "Configuração", "Parte técnica"];
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 26, justifyContent: "center" }}>
      <Kicker bg={THEME.lime}>VOCÊ NÃO PRECISA</Kicker>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {terms.map((t, i) => {
          const s = useEnter(8 + i * 12);
          return (
            <div key={t} style={{ position: "relative", display: "inline-block", opacity: s, transform: `translateX(${interpolate(s, [0, 1], [-30, 0])}px)`, alignSelf: "flex-start" }}>
              <div style={{
                fontFamily: "Archivo, sans-serif", fontWeight: 900, fontSize: 80,
                color: THEME.inkSoft, padding: "8px 24px", background: THEME.white,
                border: `5px solid ${THEME.ink}`, boxShadow: `8px 8px 0 ${THEME.flame}`, borderRadius: 18,
                position: "relative",
              }}>
                {t}
                <div style={{
                  position: "absolute", top: "50%", left: 12, right: 12, height: 8,
                  background: THEME.flame, transform: "translateY(-50%) rotate(-2deg)", borderRadius: 4,
                }} />
              </div>
            </div>
          );
        })}
        <div style={{
          marginTop: 12,
          fontFamily: "Archivo, sans-serif", fontWeight: 900, fontSize: 70, color: THEME.ink, letterSpacing: -2,
        }}>
          A Filro cuida de tudo.
        </div>
      </div>
    </div>
  );
};

// 14. PRICING — 1x + monthly split
const PricingP = () => {
  const s = useEnter(2);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 28, justifyContent: "center" }}>
      <Kicker>PAGAMENTO</Kicker>
      <Headline size={76}>Ativação única + manutenção mensal.</Headline>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, marginTop: 12 }}>
        <Card bg={THEME.lime} delay={10} style={{ minHeight: 240 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
            <div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 900, fontSize: 140, color: THEME.ink, lineHeight: 1, transform: `scale(${interpolate(s, [0, 1], [0.6, 1])})` }}>1x</div>
            <div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 900, fontSize: 40, color: THEME.ink }}>Ativação</div>
          </div>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 22, color: THEME.ink, opacity: 0.75 }}>Paga uma vez para colocar tudo no ar.</div>
        </Card>
        <Card bg={THEME.azure} delay={22} style={{ minHeight: 240 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
            <div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 900, fontSize: 140, color: THEME.white, lineHeight: 1, transform: `scale(${interpolate(s, [0, 1], [0.6, 1])})` }}>/mês</div>
          </div>
          <div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 900, fontSize: 40, color: THEME.white }}>Manutenção</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
            <Chip bg={THEME.white} delay={32} fz={18}>Hospedagem</Chip>
            <Chip bg={THEME.lime} delay={38} fz={18}>Suporte</Chip>
            <Chip bg={THEME.white} delay={44} fz={18}>Ajustes</Chip>
          </div>
        </Card>
      </div>
    </div>
  );
};

// 15. IMPRESSION — "impressão superior" with arrow rising
const ImpressionP = () => {
  const s = useEnter(4);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 26, justifyContent: "center" }}>
      <Kicker bg={THEME.flame}><span style={{ color: THEME.white }}>IDEAL PARA</span></Kicker>
      <Headline size={92}>Causar impressão superior.</Headline>
      <div style={{ display: "flex", alignItems: "center", gap: 28, marginTop: 18 }}>
        <Card bg={THEME.white} delay={10} style={{ minHeight: 180, flex: 1 }}>
          <div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 900, fontSize: 40, color: THEME.ink, lineHeight: 1 }}>Mais confiança</div>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 22, color: THEME.inkSoft }}>Antes mesmo do primeiro atendimento.</div>
        </Card>
        <Card bg={THEME.lime} delay={20} style={{ minHeight: 180, flex: 1 }}>
          <div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 900, fontSize: 40, color: THEME.ink, lineHeight: 1 }}>Diferenciais à mostra</div>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 22, color: THEME.ink, opacity: 0.7 }}>O que torna sua marca única.</div>
        </Card>
        <div style={{
          fontFamily: "Archivo, sans-serif", fontWeight: 900, fontSize: 200, color: THEME.flame, lineHeight: 1,
          transform: `rotate(-30deg) scale(${interpolate(s, [0, 1], [0.6, 1])})`, opacity: s,
        }}>↑</div>
      </div>
    </div>
  );
};

// 16. SUMMARY — keyword cloud
const SummaryP = () => {
  const words = ["Avançado", "Refinado", "Valor", "Confiança"];
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 24, justifyContent: "center" }}>
      <Kicker>EM RESUMO</Kicker>
      <Headline size={84}>O PREMIUM entrega:</Headline>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 18, marginTop: 8 }}>
        {words.map((w, i) => {
          const s = useEnter(6 + i * 8);
          const bg = [THEME.azure, THEME.white, THEME.flame, THEME.lime][i];
          const c = i === 0 || i === 2 ? THEME.white : THEME.ink;
          return (
            <div key={w} style={{
              background: bg, color: c,
              border: `5px solid ${THEME.ink}`, boxShadow: `10px 10px 0 ${THEME.ink}`,
              borderRadius: 22, padding: "22px 36px",
              fontFamily: "Archivo, sans-serif", fontWeight: 900, fontSize: 60, letterSpacing: -1,
              transform: `translateY(${interpolate(s, [0, 1], [40, 0])}px) rotate(${i % 2 === 0 ? -2 : 2}deg)`,
              opacity: s,
            }}>{w}</div>
          );
        })}
      </div>
    </div>
  );
};

// 17. CTA — checkout
const CtaP = () => {
  const s = useEnter(2);
  const float = useFloat(6, 30);
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{
        background: THEME.flame, border: `8px solid ${THEME.ink}`, boxShadow: `16px 16px 0 ${THEME.ink}`,
        borderRadius: 32, padding: "48px 80px", display: "flex", alignItems: "center", gap: 32,
        transform: `translateY(${float}px) scale(${interpolate(s, [0, 1], [0.7, 1])})`, opacity: s,
      }}>
        <div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 900, fontSize: 120, color: THEME.white, lineHeight: 0.95, letterSpacing: -3 }}>
          CHECKOUT
        </div>
        <div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 900, fontSize: 140, color: THEME.lime, lineHeight: 1 }}>→</div>
      </div>
    </div>
  );
};

export const PremiumScenes = {
  hookP: HookP,
  completeP: CompleteP,
  advancedP: AdvancedP,
  beyondP: BeyondP,
  valueP: ValueP,
  sectionsP: SectionsP,
  journeyP: JourneyP,
  devicesP: DevicesP,
  mobilePrioP: MobilePrioP,
  payInfoP: PayInfoP,
  adaptP: AdaptP,
  premiumStampP: PremiumStampP,
  weHandleP: WeHandleP,
  pricingP: PricingP,
  impressionP: ImpressionP,
  summaryP: SummaryP,
  ctaP: CtaP,
};
