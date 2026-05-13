const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN;

export function PaymentTestModeBanner() {
  if (!clientToken?.startsWith("pk_test_")) return null;
  return (
    <div className="w-full bg-orange-100 border-b border-orange-300 px-4 py-2 text-center text-xs md:text-sm text-orange-800">
      Os pagamentos no preview estão em modo de teste — nenhuma cobrança real será feita.
    </div>
  );
}
