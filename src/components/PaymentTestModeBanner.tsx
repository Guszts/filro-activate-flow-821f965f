const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN;

export function PaymentTestModeBanner() {
  // Renderiza apenas no preview (token de teste). Em produção (pk_live_) fica oculto.
  if (!clientToken?.startsWith("pk_test_")) return null;
  // Hide on template cover iframes (clean hero screenshots for cards).
  if (typeof window !== "undefined") {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("cover") === "1") return null;
    } catch {}
  }
  return (
    <div className="w-full bg-orange-100 border-b border-orange-300 px-4 py-2 text-center text-xs md:text-sm text-orange-800">
      <strong>Ambiente de pré-visualização</strong> — pagamentos em modo de teste. No site publicado (filro.site), as cobranças são reais.
    </div>
  );
}
