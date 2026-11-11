"use client";

import { useEffect } from "react";

type Props = {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md";
};

export default function Modal({ title, onClose, children, footer, size = "md" }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 animate-fade bg-ink/30 backdrop-blur-[2px]" onClick={onClose} />
      <div
        className={`relative flex max-h-[94dvh] w-full animate-sheet flex-col rounded-t-xl bg-white shadow-[0_30px_80px_-20px_rgb(22_25_29/0.35)] sm:rounded-xl ${
          size === "sm" ? "sm:max-w-sm" : "sm:max-w-lg"
        }`}
      >
        <div className="flex items-center justify-between border-b border-line py-3 pl-5 pr-3 sm:px-6 sm:py-4">
          <h2 className="font-display text-xl">{title}</h2>
          <button onClick={onClose} className="grid h-11 w-11 place-items-center rounded-full text-ink-2 transition hover:bg-mist" aria-label="Fechar">
            <svg width="12" height="12" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.5" aria-hidden>
              <path d="M1 1l12 12M13 1L1 13" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-line px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 [&>*]:max-sm:flex-1">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function Spinner() {
  return <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-label="Carregando" />;
}

export function Switch({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="group inline-flex min-h-11 items-center gap-2.5 text-[13px] text-ink-2 disabled:opacity-50"
    >
      <span className={`relative block h-[24px] w-[42px] shrink-0 rounded-full transition-colors duration-300 ${checked ? "bg-ink" : "bg-stone"}`}>
        <span
          className={`absolute left-0 top-[3px] block h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform duration-300 ease-[var(--ease-lux)] ${checked ? "translate-x-[21px]" : "translate-x-[3px]"}`}
        />
      </span>
      {label}
    </button>
  );
}
