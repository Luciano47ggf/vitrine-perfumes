import { accordInfo, normalizeAccords, textOn, type Accord } from "@/lib/accords";

/**
 * Barras de "acordes principais": a largura mostra a intensidade
 * e cada barra cresce da esquerda, uma após a outra.
 */
export default function AccordBars({ accords, delay = 0 }: { accords: Accord[] | null | undefined; delay?: number }) {
  const list = normalizeAccords(accords);
  if (list.length === 0) return null;

  return (
    <div>
      <p className="label-caps text-[10px] text-ink-3">Acordes principais</p>
      <ul className="mt-3 space-y-[5px]" aria-label="Acordes principais, do mais marcante ao mais suave">
        {list.map((a, i) => {
          const info = accordInfo(a.key)!;
          const width = 30 + a.value * 0.7; // a barra mais fraca ainda cabe o nome
          return (
            <li key={a.key} className="h-[26px]">
              <span
                className="flex h-full animate-accord items-center overflow-hidden whitespace-nowrap rounded-r-full pl-3 text-[12.5px] font-medium tracking-[0.04em]"
                style={
                  {
                    "--w": `${width}%`,
                    width: `${width}%`,
                    backgroundColor: info.color,
                    color: textOn(info.color),
                    animationDelay: `${delay + i * 70}ms`,
                  } as React.CSSProperties
                }
              >
                <span className="animate-fade" style={{ animationDelay: `${delay + i * 70 + 250}ms` }}>
                  {info.label}
                </span>
                <span className="sr-only"> — intensidade {a.value} de 100</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
