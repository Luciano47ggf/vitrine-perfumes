import type { Metadata } from "next";
import { supabasePublic } from "@/lib/supabase/server";
import Storefront from "@/components/storefront/Storefront";
import { PRODUCT_COLUMNS, SETTINGS_COLUMNS, type Product, type StoreSettings } from "@/lib/types";

// Página em cache: abre instantaneamente. O painel atualiza na hora ao salvar
// (/api/revalidate) e, por segurança, ela se renova sozinha a cada hora.
export const revalidate = 3600;

async function load() {
  const db = supabasePublic();
  const [products, settings] = await Promise.all([
    db.from("products").select(PRODUCT_COLUMNS).order("is_available", { ascending: false }).order("name"),
    db.from("store_settings").select(SETTINGS_COLUMNS).eq("id", 1).maybeSingle(),
  ]);
  return {
    products: (products.data ?? []) as Product[],
    settings: settings.data as StoreSettings | null,
    failed: !!products.error,
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await load();
  const name = settings?.store_name ?? "Perfumaria";
  const title = `${name} — ${settings?.tagline || "Catálogo"}`;
  const description = `Catálogo ${name}. Fragrâncias masculinas de alto padrão. Peça pelo WhatsApp.`;
  // Prévia do link quando compartilhado no WhatsApp / Instagram
  return {
    title,
    description,
    openGraph: { title, description, type: "website", locale: "pt_BR", siteName: name },
    twitter: { card: "summary", title, description },
  };
}

export default async function HomePage() {
  const { products, settings, failed } = await load();
  return <Storefront products={products} settings={settings} loadError={failed} />;
}
