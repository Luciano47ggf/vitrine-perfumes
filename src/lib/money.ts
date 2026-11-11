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
  if (cleaned.includes(",")) normalized = cleaned.replace(/\./g, "").replace(",", ".");
  else if (/\.\d{3}$/.test(cleaned) || (cleaned.match(/\./g) ?? []).length > 1) normalized = cleaned.replace(/\./g, "");
  const value = Number(normalized);
  if (!Number.isFinite(value) || value < 0) return null;
  return Math.round(value * 100);
}

export function centsToInput(cents: number | null | undefined): string {
  if (cents == null) return "";
  return (cents / 100).toFixed(2).replace(".", ",");
}
