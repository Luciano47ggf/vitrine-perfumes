import type { Product } from "./types";

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/** Normaliza para 55DDDNUMERO. Aceita "(65) 99999-0000" ou "+55 65 99999-0000". */
export function normalizeBrazilPhone(value: string): string | null {
  let digits = onlyDigits(value);
  if (!digits) return null;
  if (digits.length === 10 || digits.length === 11) digits = `55${digits}`;
  if (digits.length < 12 || digits.length > 13) return null;
  return digits;
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
  if (handle.startsWith("http")) return handle;
  return `https://instagram.com/${handle.replace(/^@/, "")}`;
}
