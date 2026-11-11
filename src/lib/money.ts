// Preços trafegam como CENTAVOS inteiros.

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatBRL(cents: number | null | undefined): string {
  if (cents == null) return "";
  return brl.format(cents / 100);
}

/** "1.234,56" | "450" | "R$ 450,00" -> centavos (ou null se inválido) */
export function parseBRL(input: string): number | null {
  const cleaned = input.replace(/[^\d,.]/g, "").trim();
  if (!cleaned) return null;
  let normalized = cleaned;
  const lastComma = cleaned.lastIndexOf(","), lastDot = cleaned.lastIndexOf(".");
  if (lastComma >= 0 && lastDot > lastComma) normalized = cleaned.replace(/,/g, ""); // "1,290.00" (formato americano)
  else if (lastComma >= 0) normalized = cleaned.replace(/\./g, "").replace(",", "."); // "1.290,00"
  else if (/\.\d{3}$/.test(cleaned) || (cleaned.match(/\./g) ?? []).length > 1) normalized = cleaned.replace(/\./g, ""); // "1.290"
  const value = Number(normalized);
  if (!Number.isFinite(value) || value < 0) return null;
  return Math.round(value * 100);
}

const inputFmt = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Centavos -> texto do campo, ex.: 129000 -> "1.290,00" */
export function centsToInput(cents: number | null | undefined): string {
  if (cents == null) return "";
  return inputFmt.format(cents / 100);
}
