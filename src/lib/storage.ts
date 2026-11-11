import { SUPABASE_URL } from "./env";

export const IMAGE_BUCKET = "product-images";

export function publicImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  const base = SUPABASE_URL;
  return `${base}/storage/v1/object/public/${IMAGE_BUCKET}/${path}`;
}
