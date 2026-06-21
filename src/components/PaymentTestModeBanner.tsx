const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN;

export function PaymentTestModeBanner() {
  // Renderiza apenas no preview (token de teste). Em produção (pk_live_) fica oculto.
  if (!clientToken?.startsWith("pk_test_")) return null;
  if (typeof window === "undefined") return null;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("cover") === "1") return null;
  } catch {}
  // Só exibe em hosts de pré-visualização da Lovable. No domínio publicado fica oculto.
  const host = window.location.hostname;
  const isPreviewHost =
    host.endsWith(".lovableproject.com") ||
    host.includes("-preview--") ||
    host === "localhost" ||
    host === "127.0.0.1";
  if (!isPreviewHost) return null;
  return (
    <div className="w-full bg-orange-100 border-b border-orange-300 px-4 py-2 text-center text-xs md:text-sm text-orange-800">
      <strong>Ambiente de pré-visualização</strong> — pagamentos em modo de teste. No site publicado (filro.site), as cobranças são reais.
    </div>
  );
}
