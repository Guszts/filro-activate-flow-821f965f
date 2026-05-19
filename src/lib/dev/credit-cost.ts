// Hybrid credit cost calculator for AI edits on Flaro Dev.
// Combines prompt length bands with a complexity heuristic so that
// gigantic / multi-feature prompts cost more than a simple tweak.

export type EditCostBreakdown = {
  cost: number;
  band: "tiny" | "short" | "medium" | "long" | "huge";
  complexity: "simple" | "normal" | "complex" | "epic";
  reasons: string[];
};

const COMPLEX_PATTERNS = [
  /\b(adiciona(r)?|cria(r)?|novo|nova)\b/i,
  /\b(p[áa]gina|se[çc][ãa]o|secao|formul[áa]rio|integra[çc][ãa]o)\b/i,
  /\b(redesenha(r)?|refaz(er)?|refor(mu)?la(r)?|reestrutura(r)?)\b/i,
  /\b(tudo|completo|inteiro|todo o site|todas as)\b/i,
  /\b(api|backend|banco de dados|database|webhook)\b/i,
];

const EPIC_PATTERNS = [
  /\b(refaz(er)? (o )?site|reconstrua|do zero|come[çc]ar de novo)\b/i,
  /\b(m[úu]ltiplas p[áa]ginas|v[áa]rias p[áa]ginas|dashboard completo)\b/i,
];

export function estimateEditCost(instructionRaw: string): EditCostBreakdown {
  const instruction = (instructionRaw || "").trim();
  const len = instruction.length;
  const reasons: string[] = [];

  // 1. Length band
  let base = 1;
  let band: EditCostBreakdown["band"] = "tiny";
  if (len <= 80) { base = 1; band = "tiny"; }
  else if (len <= 280) { base = 2; band = "short"; }
  else if (len <= 700) { base = 3; band = "medium"; }
  else if (len <= 1200) { base = 5; band = "long"; }
  else { base = 7; band = "huge"; }
  reasons.push(`Tamanho do prompt: ${len} caracteres (${band})`);

  // 2. Complexity heuristic
  const complexMatches = COMPLEX_PATTERNS.filter((r) => r.test(instruction)).length;
  const epicMatches = EPIC_PATTERNS.filter((r) => r.test(instruction)).length;

  let complexity: EditCostBreakdown["complexity"] = "simple";
  let multiplier = 1;
  if (epicMatches > 0) { complexity = "epic"; multiplier = 2.2; reasons.push("Refatoração ampla detectada"); }
  else if (complexMatches >= 2) { complexity = "complex"; multiplier = 1.6; reasons.push("Múltiplas mudanças detectadas"); }
  else if (complexMatches === 1) { complexity = "normal"; multiplier = 1.2; reasons.push("Mudança estrutural detectada"); }

  // 3. Final cost
  const raw = Math.ceil(base * multiplier);
  const cost = Math.max(1, Math.min(15, raw));

  return { cost, band, complexity, reasons };
}
