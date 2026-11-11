"use client";

import { useEffect, useMemo, useState } from "react";
import type { Product, StoreSettings } from "@/lib/types";
import { formatBRL } from "@/lib/money";
import { instagramUrl, searchOrderMessage, waLink } from "@/lib/whatsapp";
import ProductImage from "./ProductImage";
import ProductModal, { Availability, WhatsAppButton } from "./ProductModal";
import { ArrowIcon, InstagramIcon, SearchIcon } from "./icons";

type Props = { products: Product[]; settings: StoreSettings | null; loadError: boolean };

const normalize = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export default function Storefront({ products, settings, loadError }: Props) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const storeName = settings?.store_name ?? "Perfumaria";
  const insta = instagramUrl(settings?.instagram ?? null);
  const featured = useMemo(() => products.filter((p) => p.is_featured), [products]);
  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return q ? products.filter((p) => normalize(`${p.name} ${p.brand}`).includes(q)) : products;
  }, [products, query]);

  return (
    <div className="min-h-dvh">
      {/* Cabeçalho */}
      <header
        className={`sticky top-0 z-30 transition-[background-color,border-color,backdrop-filter] duration-500 ${
          scrolled ? "border-b border-line/80 bg-porcelain/85 backdrop-blur-md" : "border-b border-transparent bg-porcelain"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-8 sm:py-5">
          <a href="#" className="flex items-center gap-3.5" aria-label={storeName}>
            <span className="grid h-10 w-10 place-items-center rounded-full border border-ink/80 font-display text-lg">
              {storeName.charAt(0)}
            </span>
            <span className="leading-none">
              <span className="block font-display text-[22px] tracking-[0.04em]">{storeName}</span>
              {settings?.tagline && <span className="label-caps mt-1.5 block text-[9.5px] text-ink-3">{settings.tagline}</span>}
            </span>
          </a>
          {insta && (
            <a
              href={insta}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram da loja"
              className="flex items-center gap-2.5 rounded-full border border-line px-4 py-2.5 text-[13px] tracking-wide text-ink transition duration-300 hover:border-ink"
            >
              <InstagramIcon />
              <span className="hidden sm:inline">Instagram</span>
            </a>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-28 sm:px-8">
        {loadError && (
          <p className="mt-6 rounded-md border border-danger/20 bg-white px-4 py-3 text-sm text-danger">
            Não foi possível carregar o catálogo agora. Atualize a página em alguns instantes.
          </p>
        )}

        {featured.length > 0 && <Featured items={featured} onOpen={setSelected} />}

        {/* Catálogo */}
        <section className="pt-16 sm:pt-24" aria-labelledby="catalogo">
          <div className="mb-10 flex flex-col gap-6 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="label-caps text-bronze">A coleção</p>
              <h2 id="catalogo" className="mt-2 font-display text-4xl sm:text-5xl">Catálogo</h2>
            </div>
            <label className="relative block w-full sm:w-80">
              <span className="sr-only">Pesquisar perfume</span>
              <SearchIcon className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-ink-3" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Pesquisar perfume ou marca"
                className="w-full border-b border-line bg-transparent py-3 pl-7 pr-2 text-[15px] outline-none transition placeholder:text-ink-3 focus:border-ink"
              />
            </label>
          </div>

          {filtered.length === 0 ? (
            <div className="mx-auto max-w-md animate-rise py-16 text-center">
              <p className="font-display text-2xl">
                {products.length === 0 ? "Em breve, novas fragrâncias por aqui." : `Não encontramos “${query.trim()}”.`}
              </p>
              {settings?.whatsapp && (
                <>
                  <p className="mt-3 font-light text-ink-2">
                    {products.length === 0
                      ? "Procura algum perfume específico? Fale com a gente."
                      : "Não está no catálogo, mas podemos encomendar para você."}
                  </p>
                  <div className="mx-auto mt-7 max-w-sm">
                    <WhatsAppButton href={waLink(settings.whatsapp, searchOrderMessage(query))} label="Encomendar pelo WhatsApp" />
                  </div>
                </>
              )}
              {products.length > 0 && (
                <button onClick={() => setQuery("")} className="mt-5 text-sm text-ink-2 underline-offset-4 transition hover:text-ink hover:underline">
                  Ver todo o catálogo
                </button>
              )}
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
              {filtered.map((p, i) => (
                <li key={p.id} className="animate-rise" style={{ animationDelay: `${Math.min(i, 11) * 55}ms` }}>
                  <button onClick={() => setSelected(p)} className="group block w-full text-left">
                    <div className="sheen relative aspect-[4/5] overflow-hidden rounded-[3px] bg-mist">
                      <div className={`absolute inset-0 transition-transform duration-[1200ms] ease-[var(--ease-lux)] group-hover:scale-[1.05] ${p.is_available ? "" : "opacity-60 grayscale"}`}>
                        <ProductImage product={p} sizes="(min-width: 1024px) 270px, (min-width: 768px) 30vw, 46vw" priority={i < 4 && featured.length === 0} />
                      </div>
                      {p.is_featured && (
                        <span className="label-caps absolute left-3 top-3 rounded-full bg-porcelain/90 px-2.5 py-1 text-[9px] text-ink">Promoção</span>
                      )}
                      <span className="absolute inset-x-3 bottom-3 flex translate-y-2 items-center justify-between rounded-[3px] bg-porcelain/92 px-3 py-2 text-[12px] tracking-wide opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100 max-sm:hidden">
                        Ver detalhes <ArrowIcon />
                      </span>
                    </div>
                    <p className="label-caps mt-4 text-[10px] text-ink-3">{p.brand}</p>
                    <p className="mt-1 font-display text-[19px] leading-snug sm:text-xl">{p.name}</p>
                    <div className="mt-1.5">
                      <Availability available={p.is_available} />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-10 text-center sm:px-8">
          <p className="font-display text-xl tracking-[0.04em]">{storeName}</p>
          <p className="text-xs text-ink-3">© {new Date().getFullYear()} · Atendimento pelo WhatsApp</p>
        </div>
      </footer>

      {selected && <ProductModal product={selected} whatsapp={settings?.whatsapp ?? null} onClose={() => setSelected(null)} />}
    </div>
  );
}

/* ---------- Destaques / promoções ---------- */

const SLIDE_MS = 6500;

function Featured({ items, onOpen }: { items: Product[]; onOpen: (p: Product) => void }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const many = items.length > 1;
  const current = items[index] ?? items[0];

  // Quem desativa animações no sistema não tem troca automática
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // A barra de progresso comanda a troca: pausar a barra pausa o carrossel no ponto exato
  const next = () => setIndex((i) => (i + 1) % items.length);

  return (
    <section
      className="pt-6 sm:pt-10"
      aria-roledescription="carrossel"
      aria-label="Promoções"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="grid overflow-hidden rounded-md bg-white md:grid-cols-[1fr_1.15fr]">
        {/* Texto */}
        <div className="order-2 flex flex-col justify-between gap-8 p-6 sm:p-10 md:order-1 md:p-14">
          <div key={current.id}>
            <p className="label-caps animate-rise text-bronze">
              Promoção{many && <span className="ml-3 tabular-nums text-ink-3">{String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</span>}
            </p>
            <p className="label-caps mt-6 animate-rise text-ink-2" style={{ animationDelay: "90ms" }}>{current.brand}</p>
            <h1 className="mt-2 animate-rise text-balance font-display text-[40px] leading-[1.02] sm:text-[56px]" style={{ animationDelay: "150ms" }}>
              {current.name}
            </h1>
            {current.description && (
              <p className="mt-5 line-clamp-3 max-w-[42ch] animate-rise font-light leading-relaxed text-ink-2" style={{ animationDelay: "220ms" }}>
                {current.description}
              </p>
            )}
            <div className="mt-7 flex animate-rise flex-wrap items-center gap-5" style={{ animationDelay: "290ms" }}>
              <button onClick={() => onOpen(current)} className="group inline-flex items-center gap-3 rounded-md bg-ink px-6 py-3.5 text-[13px] font-medium uppercase tracking-[0.14em] text-porcelain transition hover:bg-ink/85">
                Ver detalhes <ArrowIcon className="transition-transform duration-300 group-hover:translate-x-1" />
              </button>
              {current.price_cents != null && <span className="font-display text-2xl tabular-nums">{formatBRL(current.price_cents)}</span>}
            </div>
          </div>

          {many && (
            <div className="flex gap-2.5" role="tablist" aria-label="Escolher promoção">
              {items.map((p, i) => (
                <button
                  key={p.id}
                  role="tab"
                  aria-selected={i === index}
                  aria-label={p.name}
                  onClick={() => setIndex(i)}
                  className="group relative h-14 w-11 shrink-0 overflow-hidden rounded-[3px] bg-mist"
                >
                  <ProductImage product={p} sizes="44px" className={`transition duration-500 ${i === index ? "" : "opacity-55 grayscale group-hover:opacity-90"}`} />
                  <span className="absolute inset-x-0 bottom-0 h-[2px] bg-ink/10">
                    {i === index &&
                      (reducedMotion ? (
                        <span className="block h-full bg-ink" />
                      ) : (
                        <span
                          key={index}
                          className="block h-full origin-left animate-progress bg-ink"
                          style={{ animationDuration: `${SLIDE_MS}ms`, animationPlayState: paused ? "paused" : "running" }}
                          onAnimationEnd={next}
                        />
                      ))}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Imagem com transição suave entre os slides */}
        <button onClick={() => onOpen(current)} className="relative order-1 aspect-[4/4.2] overflow-hidden bg-mist md:order-2 md:aspect-auto md:min-h-[600px]" aria-label={`Ver ${current.name}`}>
          {items.map((p, i) => (
            <div
              key={p.id}
              className={`absolute inset-0 transition-[opacity,transform] duration-[1400ms] ease-[var(--ease-lux)] ${
                i === index ? "scale-100 opacity-100" : "scale-[1.06] opacity-0"
              }`}
              aria-hidden={i !== index}
            >
              <ProductImage product={p} sizes="(min-width: 768px) 600px, 100vw" priority={i === 0} />
            </div>
          ))}
        </button>
      </div>
    </section>
  );
}
