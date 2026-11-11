"use client";

import { useState } from "react";
import Modal, { Spinner } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { supabaseBrowser } from "@/lib/supabase/client";
import { friendlyError } from "@/lib/errors";
import { normalizeBrazilPhone } from "@/lib/whatsapp";
import { SETTINGS_COLUMNS, type StoreSettings } from "@/lib/types";

type Props = { settings: StoreSettings; onClose: () => void; onSaved: (s: StoreSettings) => void };

function formatPhone(digits: string | null) {
  if (!digits) return "";
  const d = digits.replace(/^55/, "");
  return d.length === 11 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}` : d;
}

export default function SettingsModal({ settings, onClose, onSaved }: Props) {
  const toast = useToast();
  const [storeName, setStoreName] = useState(settings.store_name);
  const [tagline, setTagline] = useState(settings.tagline);
  const [whatsapp, setWhatsapp] = useState(formatPhone(settings.whatsapp));
  const [instagram, setInstagram] = useState(settings.instagram ? `@${settings.instagram}` : "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setError(null);
    if (!storeName.trim()) return setError("Informe o nome da loja.");
    const phone = whatsapp.trim() ? normalizeBrazilPhone(whatsapp) : null;
    if (whatsapp.trim() && !phone) return setError("WhatsApp inválido. Use DDD + número, ex.: (65) 99999-0000.");

    setSaving(true);
    const { data, error } = await supabaseBrowser()
      .from("store_settings")
      .update({ store_name: storeName.trim(), tagline: tagline.trim(), whatsapp: phone, instagram: instagram.trim().replace(/^@/, "") || null })
      .eq("id", 1)
      .select(SETTINGS_COLUMNS)
      .single();
    setSaving(false);
    if (error) return setError(friendlyError(error));
    onSaved(data as StoreSettings);
    toast("ok", "Configurações salvas.");
    onClose();
  }

  return (
    <Modal
      title="Configurações da loja"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>{saving && <Spinner />} Salvar</button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="label" htmlFor="s-name">Nome da loja</label>
          <input id="s-name" className="field" value={storeName} onChange={(e) => setStoreName(e.target.value)} maxLength={80} />
        </div>
        <div>
          <label className="label" htmlFor="s-tag">Frase curta abaixo do nome</label>
          <input id="s-tag" className="field" value={tagline} onChange={(e) => setTagline(e.target.value)} maxLength={60} placeholder="Perfumaria masculina" />
        </div>
        <div>
          <label className="label" htmlFor="s-wa">WhatsApp de atendimento</label>
          <input id="s-wa" className="field" inputMode="tel" placeholder="(65) 99999-0000" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
          <p className="mt-1.5 text-xs text-ink-3">O botão “Chamar no WhatsApp” abre conversa com este número.</p>
        </div>
        <div>
          <label className="label" htmlFor="s-ig">Instagram</label>
          <input id="s-ig" className="field" placeholder="@sualoja" value={instagram} onChange={(e) => setInstagram(e.target.value)} />
        </div>
        {error && <p className="rounded-md border border-danger/20 px-3 py-2 text-sm text-danger">{error}</p>}
      </div>
    </Modal>
  );
}
