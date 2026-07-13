// Formats an amount stored in the smallest currency unit (cents) as a
// localized currency string. Defaults to en-US / USD; falls back cleanly for
// any legacy BRL rows that still ship through admin views.
export function formatCurrency(
  amountInMinorUnits: number | null | undefined,
  currency: string = "usd",
  locale?: string,
): string {
  const amount = ((amountInMinorUnits ?? 0) as number) / 100;
  const cur = (currency || "usd").toUpperCase();
  const loc = locale ?? (cur === "BRL" ? "pt-BR" : "en-US");
  try {
    return new Intl.NumberFormat(loc, {
      style: "currency",
      currency: cur,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    return `${cur} ${amount.toFixed(2)}`;
  }
}

export function formatUSD(amountInCents: number | null | undefined): string {
  return formatCurrency(amountInCents, "usd", "en-US");
}
