"use client";

import { ACCORDS, MAX_ACCORDS, accordInfo, textOn, type Accord } from "@/lib/accords";

type Props = { value: Accord[]; onChange: (v: Accord[]) => void };

/**
 * Escolha dos acordes: toque num nome para adicionar e ajuste a intensidade
 * arrastando. A barra mostra exatamente como vai aparecer na vitrine.
 */
export default function AccordEditor({ value, onChange }: Props) {
  const chosen = new Set(value.map((a) => a.key));
  const full = value.length >= MAX_ACCORDS;

  function add(key: string) {
    if (full || chosen.has(key)) return;
    const last = value.length ? Math.min(...value.map((a) => a.value)) : 110;
    onChange([...value, { key, value: Math.max(30, last - 10) }]);
  }
  const update = (key: string, v: number) => onChange(value.map((a) => (a.key === key ? { ...a, value: v } : a)));
  const remove = (key: string) => onChange(value.filter((a) => a.key !== key));
  const sorted = () => onChange([...value].sort((a, b) => b.value - a.value));

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="label mb-0">Acordes principais</span>
        <span className="text-[11px] text-ink-3 tabular-nums">{value.length}/{MAX_ACCORDS}</span>
      </div>

      {value.length > 0 && (
        <ul className="mt-2.5 space-y-2" onPointerUp={sorted} onKeyUp={sorted}>
          {value.map((a) => {
            const info = accordInfo(a.key);
            if (!info) return null;
            return (
              <li key={a.key} className="flex items-center gap-2.5">
                <div className="relative h-[30px] flex-1 sm:h-[26px]">
                  <span
                    className="pointer-events-none absolute inset-y-0 left-0 flex items-center rounded-r-full pl-3 text-[12px] font-medium tracking-[0.04em] transition-[width] duration-150"
                    style={{ width: `${30 + a.value * 0.7}%`, backgroundColor: info.color, color: textOn(info.color) }}
                  >
                    {info.label}
                  </span>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    step={5}
                    value={a.value}
                    onChange={(e) => update(a.key, Number(e.target.value))}
                    aria-label={`Intensidade de ${info.label}`}
                    className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => remove(a.key)}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-3 transition hover:bg-mist hover:text-ink"
                  aria-label={`Remover ${info.label}`}
                >
                  <svg width="10" height="10" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                    <path d="M1 1l12 12M13 1L1 13" />
                  </svg>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-2 text-xs text-ink-3">
        {value.length ? "Arraste sobre a barra para ajustar a intensidade. A mais forte fica em cima." : "Toque nos acordes do perfume, do mais marcante ao mais suave."}
      </p>

      <div className="mt-3 flex flex-wrap gap-2 sm:gap-1.5">
        {ACCORDS.filter((a) => !chosen.has(a.key)).map((a) => (
          <button
            key={a.key}
            type="button"
            disabled={full}
            onClick={() => add(a.key)}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-line bg-white py-1 pl-2 pr-3 text-[13px] text-ink-2 sm:min-h-0 sm:pl-1.5 sm:pr-2.5 sm:text-[12px] transition hover:border-ink hover:text-ink disabled:opacity-40"
          >
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: a.color }} />
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}
