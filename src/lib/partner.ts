// Captura e persistência do código de parceiro (B2B privado).
// Doesn't show anything to visitors. Also validated on the backend.

const STORAGE_KEY = "filro:partnerCode";
const COOKIE_KEY = "filro_partner_code";
const COOKIE_DAYS = 30;
const PARAM_KEYS = ["ref", "partner", "parceiro", "codigo"] as const;
const CODE_RE = /^[a-z0-9_-]{3,40}$/;

function normalizeCode(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim().toLowerCase();
  return CODE_RE.test(trimmed) ? trimmed : null;
}

function setCookie(value: string) {
  if (typeof document === "undefined") return;
  const maxAge = COOKIE_DAYS * 24 * 60 * 60;
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE_KEY}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; SameSite=Lax${secure}`;
}

function getCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE_KEY}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/** Lê params de parceria da URL atual, valida e persiste por 30 dias. */
export function capturePartnerFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const params = new URLSearchParams(window.location.search);
    for (const key of PARAM_KEYS) {
      const raw = params.get(key);
      const code = normalizeCode(raw);
      if (code) {
        try { localStorage.setItem(STORAGE_KEY, code); } catch { /* noop */ }
        setCookie(code);
        return code;
      }
    }
  } catch { /* noop */ }
  return null;
}

/** Recupera o código persistido (localStorage > cookie). */
export function getStoredPartnerCode(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const ls = localStorage.getItem(STORAGE_KEY);
    const code = normalizeCode(ls);
    if (code) return code;
  } catch { /* noop */ }
  return normalizeCode(getCookie());
}

export function isValidPartnerCode(code: string | null | undefined): code is string {
  return !!normalizeCode(code);
}
