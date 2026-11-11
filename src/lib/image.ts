"use client";

/**
 * Reduz a foto no próprio navegador antes do envio:
 * no máximo 1600 px no lado maior, convertida para WebP.
 * Uma foto de celular de 6 MB costuma virar ~200 KB, o que deixa a vitrine rápida.
 */
export async function compressImage(file: File, maxSide = 1600, quality = 0.86): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
  if (!blob) return file;
  return blob.size < file.size ? blob : file;
}

export function extensionFor(type: string): string {
  if (type === "image/webp") return "webp";
  if (type === "image/png") return "png";
  if (type === "image/avif") return "avif";
  return "jpg";
}
