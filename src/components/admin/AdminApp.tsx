"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { friendlyError, isAuthError } from "@/lib/errors";
import { formatBRL } from "@/lib/money";
import { IMAGE_BUCKET, publicImageUrl } from "@/lib/storage";
import { PRODUCT_COLUMNS, type Product, type StoreSettings } from "@/lib/types";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import Modal, { Spinner, Switch } from "@/components/ui/Modal";
import ProductFormModal from "./ProductFormModal";
import SettingsModal from "./SettingsModal";

const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

/** Login expirou: volta para a tela de entrar. */
function goToLogin() {
  window.location.href = "/admin/login";
}

/** Avisa a vitrine (que fica em cache) para mostrar as mudanças na hora. */
export function refreshStorefront() {
  fetch("/api/revalidate", { method: "POST" }).catch(() => {});
}

export default function AdminApp({ initialSettings }: { initialSettings: StoreSettings }) {
  return (
    <ToastProvider>
      <Panel initialSettings={initialSettings} />
    </ToastProvider>
  );
}

function Panel({ initialSettings }: { initialSettings: StoreSettings }) {
  const db = supabaseBrowser();
  const toast = useToast();
  const [settings, setSettings] = useState(initialSettings);
  const [showSettings, setShowSettings] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await db.from("products").select(PRODUCT_COLUMNS).order("updated_at", { ascending: false });
    if (error && isAuthError(error)) return goToLogin();
    if (error) setError(friendlyError(error));
    else {
      setError(null);
      setProducts(data as Product[]);
    }
    setLoading(false);
  }, [db]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return q ? products.filter((p) => normalize(`${p.name} ${p.brand}`).includes(q)) : products;
  }, [products, query]);

  const counts = useMemo(
    () => ({ total: products.length, available: products.filter((p) => p.is_available).length, featured: products.filter((p) => p.is_featured).length }),
    [products],
  );

  async function toggle(p: Product, field: "is_available" | "is_featured", value: boolean) {
    setBusyId(p.id);
    setProducts((list) => list.map((x) => (x.id === p.id ? { ...x, [field]: value } : x))); // resposta imediata
    const { error } = await db.from("products").update({ [field]: value }).eq("id", p.id);
    setBusyId(null);
    if (error) {
      setProducts((list) => list.map((x) => (x.id === p.id ? { ...x, [field]: !value } : x)));
      if (isAuthError(error)) return goToLogin();
      return toast("error", friendlyError(error));
    }
    refreshStorefront();
    toast("ok", field === "is_available" ? (value ? "Marcado como disponível." : "Marcado como indisponível.") : value ? "Adicionado às promoções." : "Removido das promoções.");
  }

  async function confirmDelete() {
    if (!deleting) return;
    const p = deleting;
    setBusyId(p.id);
    const { error } = await db.from("products").delete().eq("id", p.id);
    if (!error && p.image_path) await db.storage.from(IMAGE_BUCKET).remove([p.image_path]);
    setBusyId(null);
    setDeleting(null);
    if (error && isAuthError(error)) return goToLogin();
    if (error) return toast("error", friendlyError(error));
    setProducts((list) => list.filter((x) => x.id !== p.id));
    refreshStorefront();
    toast("ok", "Perfume excluído.");
  }

  return (
    <div className="min-h-dvh">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4 sm:px-8">
          <div className="min-w-0">
            <p className="truncate font-display text-xl tracking-[0.03em]">{settings.store_name}</p>
            <p className="label-caps mt-1 text-[9.5px] text-ink-3">Painel · Produtos</p>
          </div>
          <div className="flex items-center gap-2">
            <a href="/" target="_blank" className="btn btn-ghost px-3 py-2 text-xs">Ver site</a>
            <button onClick={() => setShowSettings(true)} className="btn btn-ghost px-3 py-2 text-xs" aria-label="Configurações da loja">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
              </svg>
              <span className="hidden sm:inline">Configurações</span>
            </button>
            <form action="/admin/logout" method="post">
              <button className="btn btn-ghost px-3 py-2 text-xs">Sair</button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-24 pt-8 sm:px-8 sm:pt-10">
        <div className="mb-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-4xl">Perfumes</h1>
            <p className="mt-1.5 text-sm text-ink-2 tabular-nums">
              {counts.total} cadastrados · {counts.available} disponíveis · {counts.featured} em promoção
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setEditing("new")}>+ Novo perfume</button>
        </div>

        <input
          type="search"
          className="field mb-4 sm:max-w-xs"
          placeholder="Pesquisar por nome ou marca"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Pesquisar perfumes"
        />

        {error && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-danger/20 bg-white px-4 py-3 text-sm text-danger">
            <span>{error}</span>
            <button className="btn btn-ghost px-3 py-1.5 text-xs" onClick={load}>Tentar de novo</button>
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-line bg-white">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-20 text-ink-2"><Spinner /> Carregando perfumes…</div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-ink-2">{products.length === 0 ? (error ? "Não foi possível carregar os perfumes." : "Nenhum perfume cadastrado ainda.") : "Nenhum perfume encontrado."}</p>
              {products.length === 0 && !error && (
                <button className="btn btn-primary mt-5" onClick={() => setEditing("new")}>Cadastrar o primeiro</button>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {filtered.map((p, i) => {
                const img = publicImageUrl(p.image_path);
                return (
                  <li key={p.id} className="flex animate-rise flex-wrap items-center gap-4 px-4 py-4 sm:flex-nowrap sm:px-5" style={{ animationDelay: `${Math.min(i, 10) * 35}ms` }}>
                    <div className="relative h-16 w-[52px] shrink-0 overflow-hidden rounded-[3px] bg-mist">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {img && <img src={img} alt="" loading="lazy" className="h-full w-full object-contain p-1 mix-blend-multiply" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="label-caps text-[9.5px] text-ink-3">{p.brand || "—"}</p>
                      <p className="truncate font-display text-lg leading-tight">{p.name}</p>
                      <p className="mt-0.5 text-xs text-ink-2 tabular-nums">
                        {[p.volume_ml ? `${p.volume_ml} ml` : null, p.price_cents != null ? formatBRL(p.price_cents) : "Sem preço"].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <div className="flex w-full flex-wrap items-center justify-between gap-x-5 gap-y-3 sm:w-auto sm:justify-end">
                      <div className="flex flex-wrap gap-x-5 gap-y-2">
                        <Switch label="Disponível" checked={p.is_available} disabled={busyId === p.id} onChange={(v) => toggle(p, "is_available", v)} />
                        <Switch label="Promoção" checked={p.is_featured} disabled={busyId === p.id} onChange={(v) => toggle(p, "is_featured", v)} />
                      </div>
                      <div className="flex gap-1.5">
                        <button className="btn btn-ghost px-3 py-1.5 text-xs" onClick={() => setEditing(p)}>Editar</button>
                        <button className="btn btn-danger px-3 py-1.5 text-xs" onClick={() => setDeleting(p)} disabled={busyId === p.id}>Excluir</button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>

      {editing && (
        <ProductFormModal
          product={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={(saved) => {
            setProducts((list) => (list.some((x) => x.id === saved.id) ? list.map((x) => (x.id === saved.id ? saved : x)) : [saved, ...list]));
            refreshStorefront();
          }}
        />
      )}

      {deleting && (
        <Modal
          title="Excluir perfume"
          size="sm"
          onClose={() => setDeleting(null)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setDeleting(null)}>Cancelar</button>
              <button className="btn bg-danger text-white hover:bg-danger/90" onClick={confirmDelete} disabled={busyId === deleting.id}>
                {busyId === deleting.id && <Spinner />} Excluir
              </button>
            </>
          }
        >
          <p className="text-[15px] text-ink-2">
            Excluir <strong className="font-medium text-ink">{deleting.name}</strong> do catálogo? A foto também será apagada.
          </p>
        </Modal>
      )}

      {showSettings && (
        <SettingsModal
          settings={settings}
          onClose={() => setShowSettings(false)}
          onSaved={(s) => {
            setSettings(s);
            refreshStorefront();
          }}
        />
      )}
    </div>
  );
}
