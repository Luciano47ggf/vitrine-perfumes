import { publicConfig } from "./public-config";

export const IMAGE_BUCKET = "product-images";

export function publicImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  return `${publicConfig().url}/storage/v1/object/public/${IMAGE_BUCKET}/${path}`;
}
