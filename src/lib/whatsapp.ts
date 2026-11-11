import type { Product } from "./types";

/** DDDs brasileiros em uso (Anatel). */
const DDDS = new Set([
  11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27, 28, 31, 32, 33, 34, 35, 37, 38, 41, 42, 43, 44, 45, 46, 47, 48, 49,
  51, 53, 54, 55, 61, 62, 63, 64, 65, 66, 67, 68, 69, 71, 73, 74, 75, 77, 79, 81, 82, 83, 84, 85, 86, 87, 88, 89,
  91, 92, 93, 94, 95, 96, 97, 98, 99,
]);

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Normaliza para 55DDDNUMERO. Aceita "(65) 99999-0000", "065 99999-0000",
 * "+55 65 99999-0000" e "0055 65 99999-0000".
 */
export function normalizeBrazilPhone(value: string): string | null {
  let digits = onlyDigits(value);
  if (!digits) return null;
  if (digits.startsWith("00")) digits = digits.slice(2); // 0055...
  else if (digits.startsWith("0")) digits = digits.replace(/^0+/, ""); // 065...
  if (digits.length === 10 || digits.length === 11) digits = `55${digits}`;
  if (!digits.startsWith("55") || digits.length < 12 || digits.length > 13) return null;
  // DDD existente e celular começando com 9 quando tiver 9 dígitos
  if (!DDDS.has(Number(digits.slice(2, 4)))) return null;
  if (digits.length === 13 && digits[4] !== "9") return null;
  return digits;
}

/** "5565999990000" -> "(65) 99999-0000" */
export function formatBrazilPhone(digits: string | null): string {
  if (!digits) return "";
  const d = digits.replace(/^55/, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return d;
}

/** "@loja", "loja", "instagram.com/loja/", "https://www.instagram.com/loja?igsh=..." -> "loja" */
export function normalizeInstagram(value: string): string | null {
  let v = value.trim();
  if (!v) return null;
  const m = v.match(/instagram\.com\/([^/?#\s]+)/i);
  if (m) v = m[1];
  v = v.replace(/^@+/, "").replace(/\/+$/, "");
  return /^[A-Za-z0-9._]{1,30}$/.test(v) ? v.toLowerCase() : null;
}

export function waLink(phone: string | null, text: string): string {
  const encoded = encodeURIComponent(text);
  return phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
}

export function productInterestMessage(p: Pick<Product, "name" | "brand" | "volume_ml">): string {
  const nome = [p.brand, p.name].filter(Boolean).join(" ");
  const volume = p.volume_ml ? ` ${p.volume_ml} ml` : "";
  return `Olá! Tenho interesse no perfume ${nome}${volume} que vi no catálogo. Gostaria de saber mais informações e realizar meu pedido.`;
}

/** Produto cadastrado, mas sem estoque no momento. */
export function productOrderMessage(p: Pick<Product, "name" | "brand" | "volume_ml">): string {
  const nome = [p.brand, p.name].filter(Boolean).join(" ");
  const volume = p.volume_ml ? ` ${p.volume_ml} ml` : "";
  return `Olá! Vi no catálogo que o perfume ${nome}${volume} está indisponível no momento. Gostaria de encomendar. Pode me passar o prazo e o valor?`;
}

/** Perfume que o cliente procurou e não está no catálogo. */
export function searchOrderMessage(query: string): string {
  const q = query.trim().slice(0, 80);
  return q
    ? `Olá! Procurei pelo perfume "${q}" no catálogo e não encontrei. Vocês conseguem encomendar para mim?`
    : "Olá! Não encontrei o perfume que procuro no catálogo. Vocês conseguem encomendar para mim?";
}

export function instagramUrl(handle: string | null): string | null {
  if (!handle) return null;
  const h = normalizeInstagram(handle);
  return h ? `https://instagram.com/${h}` : null;
}
