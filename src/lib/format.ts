import { formatCurrency } from "./formatCurrency";

// Legacy alias — historical callers pass amounts in cents. Defaults to USD/en-US
// to match the new positioning. Pass a currency explicitly for historical BRL rows.
export function formatBRL(amountInCents: number, currency: string = "usd"): string {
  return formatCurrency(amountInCents, currency);
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}
