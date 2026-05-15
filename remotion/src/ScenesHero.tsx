import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate, AbsoluteFill } from "remotion";
import { HERO_THEME as T } from "./theme.hero";

const useEnter = (delay = 0, dur = 28) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 180 }, durationInFrames: dur });
};
const useFloat = (amp = 6, speed = 60, phase = 0) => {
  const frame = useCurrentFrame();
  return Math.sin(frame / speed + phase) * amp;
};

// Heavy-border card (matches plan video brand language)
const Card: React.FC<{ children: React.ReactNode; bg?: string; rot?: number; delay?: number; pad?: string; shadow?: string }> = ({
  children, bg = T.white, rot = 0, delay = 0, pad = "22px 30px", shadow = T.ink,
}) => {
  const s = useEnter(delay);
  return (
    <div style={{
      background: bg, border: `4px solid ${T.ink}`, boxShadow: `8px 8px 0 ${shadow}`,
      borderRadius: 20, padding: pad, transformOrigin: "center",
      transform: `rotate(${rot}deg) scale(${interpolate(s, [0,1], [0.85,1])}) translateY(${interpolate(s, [0,1], [24,0])}px)`,
      opacity: s,
    }}>{children}</div>
  );
};

// ---------- Scene 1: Hook ----------
const QuestionHook: React.FC = () => {
  const f = useCurrentFrame();
  const exit = interpolate(f, [180, 207], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center", opacity: exit }}>
      <div style={{ position: "relative", width: "100%", maxWidth: 1500, padding: "0 80px" }}>
        <div style={{
          fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 26, letterSpacing: 6,
          color: T.ink, marginBottom: 32,
          transform: `translateX(${interpolate(useEnter(0), [0,1], [-40,0])}px)`,
          opacity: useEnter(0),
        }}>UMA PERGUNTA HONESTA →</div>
        <h1 style={{
          margin: 0, fontFamily: "Archivo, sans-serif", fontWeight: 900,
          fontSize: 122, lineHeight: 0.95, letterSpacing: -4, color: T.ink,
        }}>
          <span style={{ display: "block", opacity: useEnter(8) }}>Seu negócio</span>
          <span style={{ display: "block", opacity: useEnter(20) }}>ainda depende</span>
          <span style={{ display: "block", opacity: useEnter(34) }}>
            só do <span style={{ background: T.lime, padding: "2px 18px", borderRadius: 14, border: `4px solid ${T.ink}`, boxShadow: `6px 6px 0 ${T.ink}`, display: "inline-block", transform: `rotate(${useFloat(1.5, 40)}deg)` }}>Instagram</span>
          </span>
          <span style={{ display: "block", opacity: useEnter(48), marginTop: 8 }}>
            e <span style={{ background: T.azure, color: T.white, padding: "2px 18px", borderRadius: 14, border: `4px solid ${T.ink}`, boxShadow: `6px 6px 0 ${T.ink}`, display: "inline-block", transform: `rotate(${useFloat(-1.5, 45, 1)}deg)` }}>WhatsApp</span>?
          </span>
        </h1>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Scene 2: Promise — "Filro cria páginas digitais" ----------
const Promise_: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "relative", width: "100%", maxWidth: 1500, padding: "0 80px", display: "flex", gap: 60, alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: 5, color: T.flame, marginBottom: 20, opacity: useEnter(0) }}>
            A FILRO RESOLVE
          </div>
          <h1 style={{ margin: 0, fontFamily: "Archivo, sans-serif", fontWeight: 900, fontSize: 104, lineHeight: 0.95, letterSpacing: -3, color: T.ink }}>
            <span style={{ display: "block", opacity: useEnter(6) }}>Páginas digitais</span>
            <span style={{ display: "block", opacity: useEnter(20) }}>para negócios</span>
            <span style={{ display: "block", opacity: useEnter(34), background: `linear-gradient(90deg, ${T.azure}, ${T.flame})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>locais.</span>
          </h1>
        </div>
        <div style={{ flex: 1, position: "relative", height: 480 }}>
          <div style={{ position: "absolute", top: 40, left: 0, transform: `translateY(${useFloat(8, 80)}px)` }}>
            <Card delay={50} bg={T.white} rot={-4} pad="0">
              <div style={{ width: 380, height: 260, padding: 22, display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ height: 14, width: 80, background: T.lime, borderRadius: 4 }} />
                <div style={{ height: 28, width: "85%", background: T.ink, borderRadius: 6 }} />
                <div style={{ height: 12, width: "70%", background: "#ddd", borderRadius: 4 }} />
                <div style={{ height: 12, width: "60%", background: "#ddd", borderRadius: 4 }} />
                <div style={{ marginTop: "auto", height: 44, width: 180, background: T.azure, borderRadius: 12, border: `3px solid ${T.ink}` }} />
              </div>
            </Card>
          </div>
          <div style={{ position: "absolute", top: 200, left: 220, transform: `translateY(${useFloat(8, 70, 1.5)}px)` }}>
            <Card delay={70} bg={T.lime} rot={5} pad="0">
              <div style={{ width: 280, height: 200, padding: 18, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ height: 12, width: 60, background: T.ink, borderRadius: 4 }} />
                <div style={{ height: 22, width: "90%", background: T.ink, borderRadius: 6 }} />
                <div style={{ marginTop: "auto", height: 36, width: 140, background: T.white, borderRadius: 10, border: `3px solid ${T.ink}` }} />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Scene 3: Structure — blueprint reveal ----------
const Structure: React.FC = () => {
  return (
    <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 1500, padding: "0 80px", display: "flex", flexDirection: "column", gap: 36 }}>
        <div>
          <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: 5, color: T.azure, opacity: useEnter(0) }}>
            ESTRUTURA PROFISSIONAL
          </div>
          <h2 style={{ margin: "10px 0 0", fontFamily: "Archivo, sans-serif", fontWeight: 900, fontSize: 76, lineHeight: 1, letterSpacing: -2, color: T.ink, opacity: useEnter(6) }}>
            Em vez de improvisar — uma base feita pra você.
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: 24, height: 320 }}>
          {[
            { label: "HERO", h: "100%", bg: T.ink, fg: T.paper, d: 20, tag: "Apresentação" },
            { label: "SOBRE", h: "100%", bg: T.white, fg: T.ink, d: 36, tag: "Diferenciais" },
            { label: "CTA", h: "100%", bg: T.flame, fg: T.white, d: 52, tag: "WhatsApp" },
          ].map((b, i) => {
            const s = useEnter(b.d);
            return (
              <div key={i} style={{
                background: b.bg, color: b.fg, border: `4px solid ${T.ink}`, boxShadow: `8px 8px 0 ${T.ink}`,
                borderRadius: 24, padding: 24, display: "flex", flexDirection: "column", justifyContent: "space-between",
                transform: `translateY(${interpolate(s, [0,1], [40,0])}px) scale(${interpolate(s, [0,1], [0.9,1])})`,
                opacity: s,
              }}>
                <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: 3, opacity: 0.7 }}>{b.label}</div>
                <div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 900, fontSize: 44, lineHeight: 1 }}>{b.tag}</div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, opacity: useEnter(80) }}>
          <span style={{ height: 6, width: 60, background: T.ink }} />
          <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 22, color: T.ink }}>
            Botão direto para atendimento incluído
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Scene 4: Content tag cloud ----------
const Content: React.FC = () => {
  const items = [
    { t: "Serviços", bg: T.lime, rot: -3 },
    { t: "Produtos", bg: T.white, rot: 2 },
    { t: "Localização", bg: T.azure, fg: T.white, rot: -1 },
    { t: "Diferenciais", bg: T.white, rot: 3 },
    { t: "Imagens", bg: T.flame, fg: T.white, rot: -2 },
    { t: "Contato", bg: T.white, rot: 4 },
    { t: "Horários", bg: T.lime, rot: -4 },
    { t: "Sobre", bg: T.white, rot: 1 },
  ];
  return (
    <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 1500, padding: "0 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: 5, color: T.flame, opacity: useEnter(0) }}>
            TUDO O QUE O CLIENTE PRECISA
          </div>
          <h2 style={{ margin: "10px 0 0", fontFamily: "Archivo, sans-serif", fontWeight: 900, fontSize: 80, lineHeight: 1, letterSpacing: -2, color: T.ink, opacity: useEnter(8) }}>
            Antes mesmo de chamar no WhatsApp.
          </h2>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 18, justifyContent: "center", maxWidth: 1100, margin: "0 auto" }}>
          {items.map((it, i) => {
            const s = useEnter(30 + i * 8, 24);
            return (
              <div key={i} style={{
                background: it.bg, color: it.fg ?? T.ink, border: `4px solid ${T.ink}`,
                boxShadow: `6px 6px 0 ${T.ink}`, borderRadius: 999,
                padding: "20px 36px", fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: 36,
                transform: `rotate(${it.rot}deg) scale(${interpolate(s, [0,1], [0.6,1])})`,
                opacity: s,
              }}>{it.t}</div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Scene 5: Trust — 3 metrics ----------
const Trust: React.FC = () => {
  const stats = [
    { n: "+confiável", bg: T.lime, d: 0 },
    { n: "+preparado", bg: T.azure, fg: T.white, d: 18 },
    { n: "+fácil", bg: T.flame, fg: T.white, d: 36 },
  ];
  return (
    <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 1500, padding: "0 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: 5, color: T.ink, opacity: useEnter(0) }}>
            O OBJETIVO É SIMPLES
          </div>
          <h2 style={{ margin: "10px 0 0", fontFamily: "Archivo, sans-serif", fontWeight: 900, fontSize: 84, lineHeight: 1, letterSpacing: -2, color: T.ink, opacity: useEnter(8) }}>
            Desde o primeiro acesso.
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28 }}>
          {stats.map((st, i) => {
            const s = useEnter(20 + st.d);
            return (
              <div key={i} style={{
                background: st.bg, color: st.fg ?? T.ink, border: `4px solid ${T.ink}`,
                boxShadow: `10px 10px 0 ${T.ink}`, borderRadius: 28, padding: "50px 30px",
                textAlign: "center", fontFamily: "Archivo, sans-serif", fontWeight: 900,
                fontSize: 64, letterSpacing: -2,
                transform: `translateY(${interpolate(s, [0,1], [60,0])}px) rotate(${(i-1)*1.5}deg)`,
                opacity: s,
              }}>{st.n}</div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Scene 6: Devices — responsive ----------
const Devices: React.FC = () => {
  const f = useCurrentFrame();
  const desktopS = useEnter(0);
  const tabletS = useEnter(20);
  const phoneS = useEnter(40);
  return (
    <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 1500, padding: "0 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: 5, color: T.azure, opacity: useEnter(0) }}>
            RESPONSIVO POR PADRÃO
          </div>
          <h2 style={{ margin: "10px 0 0", fontFamily: "Archivo, sans-serif", fontWeight: 900, fontSize: 76, lineHeight: 1, letterSpacing: -2, color: T.ink, opacity: useEnter(6) }}>
            Funciona bem em qualquer tela.
          </h2>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 40, height: 360 }}>
          {/* Desktop */}
          <div style={{
            width: 480, height: 320, background: T.white, border: `4px solid ${T.ink}`,
            boxShadow: `10px 10px 0 ${T.ink}`, borderRadius: 16, padding: 14,
            transform: `translateY(${interpolate(desktopS, [0,1], [40,0])}px) scale(${interpolate(desktopS, [0,1], [0.9,1])})`,
            opacity: desktopS, display: "flex", flexDirection: "column", gap: 8,
          }}>
            <div style={{ display: "flex", gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 999, background: T.flame }} />
              <div style={{ width: 10, height: 10, borderRadius: 999, background: T.lime }} />
              <div style={{ width: 10, height: 10, borderRadius: 999, background: T.azure }} />
            </div>
            <div style={{ flex: 1, background: T.paperWarm, borderRadius: 8, padding: 16, display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ height: 22, width: "70%", background: T.ink, borderRadius: 4 }} />
              <div style={{ height: 8, width: "85%", background: "#bbb", borderRadius: 4 }} />
              <div style={{ height: 8, width: "60%", background: "#bbb", borderRadius: 4 }} />
              <div style={{ marginTop: "auto", height: 32, width: 130, background: T.azure, borderRadius: 8, border: `2px solid ${T.ink}` }} />
            </div>
          </div>
          {/* Tablet */}
          <div style={{
            width: 220, height: 290, background: T.white, border: `4px solid ${T.ink}`,
            boxShadow: `8px 8px 0 ${T.ink}`, borderRadius: 18, padding: 12,
            transform: `translateY(${interpolate(tabletS, [0,1], [40,0])}px)`,
            opacity: tabletS,
          }}>
            <div style={{ width: "100%", height: "100%", background: T.lime, borderRadius: 10, padding: 12, display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ height: 16, width: "60%", background: T.ink, borderRadius: 4 }} />
              <div style={{ height: 6, width: "90%", background: T.ink, opacity: 0.4, borderRadius: 4 }} />
              <div style={{ marginTop: "auto", height: 28, width: "70%", background: T.ink, borderRadius: 6 }} />
            </div>
          </div>
          {/* Phone */}
          <div style={{
            width: 140, height: 260, background: T.white, border: `4px solid ${T.ink}`,
            boxShadow: `6px 6px 0 ${T.ink}`, borderRadius: 22, padding: 10,
            transform: `translateY(${interpolate(phoneS, [0,1], [40,0])}px) rotate(${useFloat(2, 70)}deg)`,
            opacity: phoneS,
          }}>
            <div style={{ width: "100%", height: "100%", background: T.flame, borderRadius: 14, padding: 10, display: "flex", flexDirection: "column", gap: 5 }}>
              <div style={{ height: 12, width: "70%", background: T.white, borderRadius: 3 }} />
              <div style={{ height: 5, width: "90%", background: T.white, opacity: 0.6, borderRadius: 3 }} />
              <div style={{ height: 5, width: "60%", background: T.white, opacity: 0.6, borderRadius: 3 }} />
              <div style={{ marginTop: "auto", height: 22, background: T.white, borderRadius: 5 }} />
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Scene 7: NoTech — crossed-out chips ----------
const NoTech: React.FC = () => {
  const items = ["Código", "Hospedagem", "Configuração", "Parte técnica"];
  return (
    <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 1500, padding: "0 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: 5, color: T.flame, opacity: useEnter(0) }}>
            VOCÊ NÃO PRECISA LIDAR COM
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 22, marginBottom: 56 }}>
          {items.map((it, i) => {
            const s = useEnter(10 + i * 10, 22);
            const cross = interpolate(useEnter(60 + i * 8, 30), [0, 1], [0, 100]);
            return (
              <div key={i} style={{
                position: "relative", background: T.white, color: T.ink, border: `4px solid ${T.ink}`,
                boxShadow: `6px 6px 0 ${T.ink}`, borderRadius: 16, padding: "18px 32px",
                fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 32,
                transform: `scale(${interpolate(s, [0,1], [0.7,1])})`, opacity: s,
              }}>
                {it}
                <div style={{
                  position: "absolute", top: "50%", left: 0, height: 5, background: T.flame,
                  width: `${cross}%`, transform: "translateY(-50%) rotate(-4deg)", transformOrigin: "left",
                  borderRadius: 4,
                }} />
              </div>
            );
          })}
        </div>
        <div style={{ textAlign: "center", opacity: useEnter(140) }}>
          <h2 style={{ margin: 0, fontFamily: "Archivo, sans-serif", fontWeight: 900, fontSize: 88, lineHeight: 1, letterSpacing: -2, color: T.ink }}>
            A Filro <span style={{ background: T.lime, padding: "2px 22px", border: `4px solid ${T.ink}`, borderRadius: 14, boxShadow: `6px 6px 0 ${T.ink}` }}>cuida</span> de tudo.
          </h2>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Scene 8: Triplet outcome ----------
const Triplet: React.FC = () => {
  const lines = [
    { t: "Uma página profissional.", c: T.ink, bg: T.paper, d: 0 },
    { t: "Um contato mais fácil.", c: T.ink, bg: T.lime, d: 30 },
    { t: "Uma imagem mais forte.", c: T.white, bg: T.ink, d: 60 },
  ];
  return (
    <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 1500, padding: "0 80px", display: "flex", flexDirection: "column", gap: 16 }}>
        {lines.map((l, i) => {
          const s = useEnter(l.d, 26);
          return (
            <div key={i} style={{
              background: l.bg, color: l.c, border: `4px solid ${T.ink}`,
              boxShadow: `10px 10px 0 ${T.ink}`, borderRadius: 24, padding: "32px 44px",
              fontFamily: "Archivo, sans-serif", fontWeight: 900, fontSize: 78, lineHeight: 1, letterSpacing: -2,
              transform: `translateX(${interpolate(s, [0,1], [i % 2 === 0 ? -80 : 80, 0])}px) rotate(${(i-1)*0.6}deg)`,
              opacity: s,
            }}>{l.t}</div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------- Scene 9: CTA ----------
const CTAEnd: React.FC = () => {
  return (
    <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 1300, padding: "0 80px", textAlign: "center" }}>
        <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: 26, letterSpacing: 6, color: T.flame, marginBottom: 28, opacity: useEnter(0) }}>
          ATIVE SUA PRESENÇA DIGITAL
        </div>
        <h1 style={{ margin: 0, fontFamily: "Archivo, sans-serif", fontWeight: 900, fontSize: 140, lineHeight: 0.92, letterSpacing: -5, color: T.ink, opacity: useEnter(6) }}>
          Conheça os
          <br />
          <span style={{ background: T.azure, color: T.white, padding: "0 28px", border: `5px solid ${T.ink}`, borderRadius: 22, boxShadow: `12px 12px 0 ${T.ink}`, display: "inline-block", transform: `rotate(${useFloat(1.2, 50)}deg)` }}>
            planos
          </span>
          <span> da Filro.</span>
        </h1>
        <div style={{ marginTop: 50, display: "inline-flex", alignItems: "center", gap: 18, opacity: useEnter(40) }}>
          <div style={{ background: T.ink, color: T.paper, border: `4px solid ${T.ink}`, boxShadow: `8px 8px 0 ${T.lime}`, borderRadius: 999, padding: "22px 44px", fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: 32 }}>
            filro.site/planos →
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const HeroScenes = {
  questionHook: QuestionHook,
  promise: Promise_,
  structure: Structure,
  content: Content,
  trust: Trust,
  devices: Devices,
  noTech: NoTech,
  triplet: Triplet,
  cta: CTAEnd,
};
