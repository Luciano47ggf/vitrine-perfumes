"use client";

import { useEffect, useRef, useState } from "react";
import Modal, { Spinner, Switch } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { supabaseBrowser } from "@/lib/supabase/client";
import { friendlyError } from "@/lib/errors";
import { centsToInput, parseBRL } from "@/lib/money";
import { compressImage, extensionFor } from "@/lib/image";
import { IMAGE_BUCKET, publicImageUrl } from "@/lib/storage";
import { PRODUCT_COLUMNS, type Product } from "@/lib/types";
import { normalizeAccords, type Accord } from "@/lib/accords";
import AccordEditor from "./AccordEditor";

type Props = { product: Product | null; onClose: () => void; onSaved: (p: Product) => void };

const MAX_INPUT_BYTES = 20 * 1024 * 1024; // a foto é reduzida antes do envio

export default function ProductFormModal({ product, onClose, onSaved }: Props) {
  const db = supabaseBrowser();
  const toast = useToast();
  const [name, setName] = useState(product?.name ?? "");
  const [brand, setBrand] = useState(product?.brand ?? "");
  const [volume, setVolume] = useState(product?.volume_ml?.toString() ?? "");
  const [price, setPrice] = useState(centsToInput(product?.price_cents));
  const [description, setDescription] = useState(product?.description ?? "");
  const [available, setAvailable] = useState(product?.is_available ?? true);
  const [featured, setFeatured] = useState(product?.is_featured ?? false);
  const [accords, setAccords] = useState<Accord[]>(normalizeAccords(product?.accords));
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(publicImageUrl(product?.image_path));
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState<null | "image" | "data">(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function pickFile(f: File | undefined) {
    if (!f) return;
    if (!f.type.startsWith("image/")) return setError("Escolha um arquivo de imagem (JPG, PNG, WEBP ou HEIC convertido).");
    if (f.size > MAX_INPUT_BYTES) return setError("Imagem muito grande (máx. 20 MB).");
    setError(null);
    setFile(f);
  }

  async function save() {
    if (saving) return;
    setError(null);
    if (!name.trim()) return setError("Informe o nome do perfume.");
    const volumeNum = volume.trim() ? Number(volume) : null;
    if (volumeNum !== null && (!Number.isInteger(volumeNum) || volumeNum <= 0)) return setError("Volume deve ser um número inteiro em ml.");
    const priceCents = price.trim() ? parseBRL(price) : null;
    if (price.trim() && priceCents === null) return setError("Preço inválido. Ex.: 890,00");

    try {
      let imagePath = product?.image_path ?? null;
      if (file) {
        setSaving("image");
        const blob = await compressImage(file);
        const path = `products/${crypto.randomUUID()}.${extensionFor(blob.type)}`;
        const { error: upErr } = await db.storage.from(IMAGE_BUCKET).upload(path, blob, { contentType: blob.type, cacheControl: "31536000" });
        if (upErr) throw upErr;
        if (imagePath) await db.storage.from(IMAGE_BUCKET).remove([imagePath]);
        imagePath = path;
      }

      setSaving("data");
      const payload = {
        name: name.trim(),
        brand: brand.trim(),
        volume_ml: volumeNum,
        price_cents: priceCents,
        description: description.trim(),
        is_available: available,
        is_featured: featured,
        accords: normalizeAccords(accords),
        image_path: imagePath,
      };
      const { data, error } = product
        ? await db.from("products").update(payload).eq("id", product.id).select(PRODUCT_COLUMNS).single()
        : await db.from("products").insert(payload).select(PRODUCT_COLUMNS).single();
      if (error) throw error;

      onSaved(data as Product);
      toast("ok", product ? "Perfume atualizado." : "Perfume cadastrado.");
      onClose();
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setSaving(null);
    }
  }

  return (
    <Modal
      title={product ? "Editar perfume" : "Novo perfume"}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary min-w-28" onClick={save} disabled={!!saving}>
            {saving && <Spinner />} {saving === "image" ? "Enviando foto…" : saving === "data" ? "Salvando…" : "Salvar"}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            pickFile(e.dataTransfer.files[0]);
          }}
          className={`flex w-full items-center gap-4 rounded-lg border border-dashed p-3 text-left transition duration-300 ${dragging ? "border-ink bg-mist" : "border-line hover:border-ink"}`}
        >
          <div className="relative h-24 w-[76px] shrink-0 overflow-hidden rounded-[3px] bg-mist">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {preview && <img src={preview} alt="" className="h-full w-full animate-fade object-cover" />}
          </div>
          <div>
            <p className="text-sm font-medium">{preview ? "Trocar foto" : "Adicionar foto"}</p>
            <p className="mt-0.5 text-xs text-ink-3">Toque para escolher ou arraste aqui. A foto é reduzida automaticamente para a vitrine carregar rápido.</p>
          </div>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => pickFile(e.target.files?.[0])} />
        </button>

        <div>
          <label className="label" htmlFor="p-name">Nome do perfume *</label>
          <input id="p-name" className="field" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} placeholder="Bleu de Chanel Parfum" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="p-brand">Marca</label>
            <input id="p-brand" className="field" value={brand} onChange={(e) => setBrand(e.target.value)} maxLength={80} placeholder="Chanel" />
          </div>
          <div>
            <label className="label" htmlFor="p-vol">Volume (ml)</label>
            <input id="p-vol" className="field" inputMode="numeric" value={volume} onChange={(e) => setVolume(e.target.value.replace(/\D/g, ""))} placeholder="100" />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="p-price">Preço (opcional)</label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-ink-3">R$</span>
            <input id="p-price" className="field pl-10" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="890,00" />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="p-desc">Descrição</label>
          <textarea id="p-desc" className="field min-h-24" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={2000} placeholder="Notas de saída, coração e fundo, ocasião, fixação…" />
        </div>
        <div className="border-t border-line pt-4">
          <AccordEditor value={accords} onChange={setAccords} />
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-3 rounded-lg bg-mist/60 px-4 py-3.5">
          <Switch label="Disponível" checked={available} onChange={setAvailable} />
          <Switch label="Mostrar em Promoções" checked={featured} onChange={setFeatured} />
        </div>
        {error && <p className="rounded-md border border-danger/20 px-3 py-2 text-sm text-danger">{error}</p>}
      </div>
    </Modal>
  );
}
