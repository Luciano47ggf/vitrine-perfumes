/**
 * Acordes disponíveis. Cores inspiradas nas usadas por perfumistas,
 * suavizadas para combinar com a vitrine clara.
 */
export const ACCORDS = [
  { key: "amadeirado", label: "Amadeirado", color: "#7b5b3e" },
  { key: "citrico", label: "Cítrico", color: "#e8dc78" },
  { key: "aromatico", label: "Aromático", color: "#6fa199" },
  { key: "especiado-fresco", label: "Especiado fresco", color: "#a9c77c" },
  { key: "especiado-quente", label: "Especiado quente", color: "#b4643f" },
  { key: "atalcado", label: "Atalcado", color: "#ebe2d4" },
  { key: "almiscarado", label: "Almiscarado", color: "#dcd5e2" },
  { key: "frutado", label: "Frutado", color: "#e69a82" },
  { key: "iris", label: "Íris", color: "#c8c2dc" },
  { key: "canela", label: "Canela", color: "#d29a6c" },
  { key: "verde", label: "Verde", color: "#86b089" },
  { key: "ambar", label: "Âmbar", color: "#c58a3f" },
  { key: "baunilha", label: "Baunilha", color: "#eedcb2" },
  { key: "couro", label: "Couro", color: "#6a4a3a" },
  { key: "floral", label: "Floral", color: "#e7bac6" },
  { key: "aquatico", label: "Aquático", color: "#8fc2d3" },
  { key: "fresco", label: "Fresco", color: "#bcdde0" },
  { key: "doce", label: "Doce", color: "#e6a9b4" },
  { key: "lavanda", label: "Lavanda", color: "#a89ac8" },
  { key: "oud", label: "Oud", color: "#4f3c34" },
  { key: "tabaco", label: "Tabaco", color: "#8a6542" },
  { key: "defumado", label: "Defumado", color: "#8c8985" },
  { key: "terroso", label: "Terroso", color: "#8b7b5d" },
  { key: "herbal", label: "Herbal", color: "#9bb48b" },
  { key: "patchouli", label: "Patchouli", color: "#6f6a45" },
  { key: "mineral", label: "Mineral", color: "#b3b9bd" },
] as const;

export type AccordKey = (typeof ACCORDS)[number]["key"];
export type Accord = { key: string; value: number };

export const MAX_ACCORDS = 10;

const byKey = new Map<string, (typeof ACCORDS)[number]>(ACCORDS.map((a) => [a.key, a]));

export function accordInfo(key: string) {
  return byKey.get(key) ?? null;
}

/** Texto escuro sobre cores claras, branco sobre cores escuras. */
export function textOn(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.3 ? "#16191d" : "#ffffff";
}

/** Limpa e ordena (mais forte primeiro); ignora acordes desconhecidos. */
export function normalizeAccords(input: unknown): Accord[] {
  if (!Array.isArray(input)) return [];
  return input
    .filter((a): a is Accord => !!a && typeof a.key === "string" && byKey.has(a.key) && typeof a.value === "number")
    .map((a) => ({ key: a.key, value: Math.max(10, Math.min(100, Math.round(a.value))) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, MAX_ACCORDS);
}
