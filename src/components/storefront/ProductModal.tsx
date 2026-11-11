"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/types";
import { formatBRL } from "@/lib/money";
import { productInterestMessage, productOrderMessage, waLink } from "@/lib/whatsapp";
import ProductImage from "./ProductImage";
import { WhatsAppIcon } from "./icons";
import AccordBars from "./AccordBars";

type Props = { product: Product; whatsapp: string | null; shareUrl: string; onClose: () => void };

export default function ProductModal({ product, whatsapp, shareUrl, onClose }: Props) {
  const [closing, setClosing] = useState(false);
  const [shared, setShared] = useState(false);
  const closeBtn = useRef<HTMLButtonElement>(null);

  const closingRef = useRef(false);
  const close = useCallback(() => {
    if (closingRef.current) return; // evita fechar duas vezes (clique duplo)
    closingRef.current = true;
    setClosing(true);
    setTimeout(onClose, 260);
  }, [onClose]);

  async function share() {
    const url = new URL(shareUrl, window.location.href).toString();
    const title = [product.brand, product.name].filter(Boolean).join(" ");
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2200);
    } catch {
      /* compartilhamento cancelado */
    }
  }

  useEffect(() => {
    closeBtn.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [close]);

  const canOrder = product.is_available && !!whatsapp;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center transition-opacity duration-300 sm:items-center sm:p-8 ${closing ? "opacity-0" : "opacity-100"}`}
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
    >
      <div className="absolute inset-0 animate-fade bg-ink/35 backdrop-blur-[3px]" onClick={close} />

      <div
        className={`relative flex max-h-[94dvh] w-full max-w-4xl animate-sheet flex-col overflow-hidden rounded-t-2xl bg-porcelain shadow-[0_30px_80px_-20px_rgb(22_25_29/0.35)] transition-transform duration-300 sm:flex-row sm:rounded-xl ${closing ? "translate-y-6" : ""}`}
      >
        <button
          ref={closeBtn}
          onClick={close}
          className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-ink shadow-sm transition hover:rotate-90 hover:bg-white"
          aria-label="Fechar"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.4" aria-hidden>
            <path d="M1 1l12 12M13 1L1 13" />
          </svg>
        </button>

        <div className="relative aspect-[4/3.6] w-full shrink-0 overflow-hidden bg-mist sm:aspect-auto sm:min-h-[560px] sm:w-[52%]">
          <div className="absolute inset-0 animate-settle bg-mist">
            <ProductImage product={product} sizes="(min-width: 640px) 460px, 100vw" priority pad="lg" />
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col overflow-y-auto px-6 pb-6 pt-7 sm:px-10 sm:pb-10 sm:pt-12">
          <p className="label-caps animate-rise text-bronze" style={{ animationDelay: "80ms" }}>{product.brand}</p>
          <h2 className="mt-2 animate-rise text-balance font-display text-[34px] leading-[1.08] sm:text-[42px]" style={{ animationDelay: "140ms" }}>
            {product.name}
          </h2>

          <div className="mt-5 flex animate-rise flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-2" style={{ animationDelay: "200ms" }}>
            {product.volume_ml && <span className="tabular-nums">{product.volume_ml} ml</span>}
            <Availability available={product.is_available} />
          </div>

          {product.price_cents != null && (
            <p className="mt-6 animate-rise font-display text-3xl tabular-nums" style={{ animationDelay: "250ms" }}>
              {formatBRL(product.price_cents)}
            </p>
          )}

          {product.accords?.length > 0 && (
            <div className="mt-7 border-t border-line pt-6">
              <AccordBars accords={product.accords} delay={320} />
            </div>
          )}

          {product.description && (
            <p className="mt-6 max-w-[52ch] animate-rise whitespace-pre-line border-t border-line pt-6 text-[15px] font-light leading-relaxed text-ink-2" style={{ animationDelay: "300ms" }}>
              {product.description}
            </p>
          )}

          <div className="mt-auto animate-rise pt-9" style={{ animationDelay: "360ms" }}>
            {!whatsapp ? (
              <button
                disabled
                className="flex w-full cursor-not-allowed items-center justify-center gap-3 rounded-md border border-line px-6 py-4 text-[14px] font-medium uppercase tracking-[0.12em] text-ink-3"
              >
                {product.is_available ? "WhatsApp não configurado" : "Indisponível no momento"}
              </button>
            ) : canOrder ? (
              <WhatsAppButton href={waLink(whatsapp, productInterestMessage(product))} label="Chamar no WhatsApp" />
            ) : (
              <WhatsAppButton href={waLink(whatsapp, productOrderMessage(product))} label="Encomendar pelo WhatsApp" outline />
            )}
            {whatsapp && (
              <p className="mt-3 text-center text-xs text-ink-3">
                {canOrder ? "A conversa abre com o nome do perfume já escrito." : "Sem estoque agora, mas podemos encomendar para você."}
              </p>
            )}
            <button
              type="button"
              onClick={share}
              className="mx-auto mt-4 flex items-center gap-2 text-[12px] tracking-wide text-ink-2 underline-offset-4 transition hover:text-ink hover:underline"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v14" />
              </svg>
              {shared ? "Link copiado!" : "Compartilhar este perfume"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WhatsAppButton({ href, label, outline }: { href: string; label: string; outline?: boolean }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group/wa flex w-full items-center justify-center gap-3 rounded-md px-6 py-4 text-[14px] font-medium uppercase tracking-[0.12em] transition duration-300 ${
        outline ? "border border-ink text-ink hover:bg-ink hover:text-porcelain" : "bg-ink text-porcelain hover:bg-ink/88"
      }`}
    >
      <span className="grid h-7 w-7 place-items-center rounded-full bg-[#25d366] text-white transition-transform duration-300 group-hover/wa:scale-110">
        <WhatsAppIcon className="h-4 w-4" />
      </span>
      {label}
    </a>
  );
}

export function Availability({ available }: { available: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 text-[12px] font-medium tracking-wide ${available ? "text-ok" : "text-ink-3"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${available ? "bg-ok" : "bg-ink-3/60"}`} />
      {available ? "Disponível" : "Indisponível"}
    </span>
  );
}
