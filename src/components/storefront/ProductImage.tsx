import Image from "next/image";
import { publicImageUrl } from "@/lib/storage";
import type { Product } from "@/lib/types";

type Props = {
  product: Pick<Product, "name" | "image_path" | "updated_at">;
  sizes: string;
  priority?: boolean;
  className?: string;
};

/** Foto otimizada (next/image) ou, sem foto, um frasco desenhado discreto. */
export default function ProductImage({ product, sizes, priority, className = "" }: Props) {
  const url = publicImageUrl(product.image_path);
  if (!url) {
    return (
      <div className={`absolute inset-0 grid place-items-center bg-gradient-to-b from-mist to-stone ${className}`}>
        <BottleMark />
      </div>
    );
  }
  return (
    <Image
      src={url}
      alt={product.name}
      fill
      sizes={sizes}
      priority={priority}
      className={`object-cover ${className}`}
    />
  );
}

function BottleMark() {
  return (
    <svg width="54" height="70" viewBox="0 0 54 70" fill="none" stroke="currentColor" strokeWidth="1.1" className="text-ink-3/70" aria-hidden>
      <rect x="19" y="2" width="16" height="10" rx="1" />
      <path d="M23 12v6M31 12v6" />
      <rect x="4" y="18" width="46" height="50" rx="4" />
      <path d="M14 40h26" />
    </svg>
  );
}
