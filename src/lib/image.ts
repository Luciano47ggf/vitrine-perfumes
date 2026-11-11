"use client";

/** Formatos aceitos pelo armazenamento de fotos (ver bucket product-images). */
export const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export class ImageFormatError extends Error {}

/**
 * Prepara a foto no próprio navegador antes do envio:
 * no máximo 1600 px no lado maior, convertida para WebP (respeita a rotação da foto do celular).
 * Uma foto de celular de 6 MB costuma virar ~200 KB, o que deixa a vitrine rápida.
 */
export async function compressImage(file: File, maxSide = 1600, quality = 0.86): Promise<Blob> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    // Navegador não conseguiu ler (ex.: HEIC no Chrome). Só segue se o formato for aceito.
    if (ALLOWED_TYPES.includes(file.type)) return file;
    throw new ImageFormatError("Formato de foto não suportado. Use JPG, PNG ou WEBP (no iPhone: Ajustes → Câmera → Formatos → Mais Compatível).");
  }

  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    if (ALLOWED_TYPES.includes(file.type)) return file;
    throw new ImageFormatError("Não foi possível preparar a foto. Tente outra imagem.");
  }
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
  const converted = blob && ALLOWED_TYPES.includes(blob.type) ? blob : null;

  // Usa o arquivo original só se ele for menor E de um formato aceito
  if (converted && (converted.size < file.size || !ALLOWED_TYPES.includes(file.type))) return converted;
  if (ALLOWED_TYPES.includes(file.type)) return file;
  if (converted) return converted;
  throw new ImageFormatError("Formato de foto não suportado. Use JPG, PNG ou WEBP.");
}

export function extensionFor(type: string): string {
  if (type === "image/webp") return "webp";
  if (type === "image/png") return "png";
  if (type === "image/avif") return "avif";
  return "jpg";
}
