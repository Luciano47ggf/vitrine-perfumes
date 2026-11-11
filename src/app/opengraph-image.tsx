import { ImageResponse } from "next/og";
import { supabasePublic } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";

// Imagem que aparece quando o link do site é enviado no WhatsApp / Instagram
export const alt = "Catálogo de perfumes";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 3600;

async function storeInfo() {
  const fallback = { name: "Rafael", tagline: "Perfumaria masculina" };
  if (!hasSupabaseEnv()) return fallback;
  try {
    const { data } = await supabasePublic().from("store_settings").select("store_name,tagline").eq("id", 1).maybeSingle();
    return { name: data?.store_name || fallback.name, tagline: data?.tagline || fallback.tagline };
  } catch {
    return fallback;
  }
}

export default async function OpengraphImage() {
  const { name, tagline } = await storeInfo();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#f6f6f3",
          color: "#16191d",
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 999,
            border: "2px solid #16191d",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 56,
          }}
        >
          {name.charAt(0).toUpperCase()}
        </div>
        <div style={{ marginTop: 36, fontSize: 96, letterSpacing: 2 }}>{name}</div>
        <div style={{ marginTop: 12, fontSize: 26, letterSpacing: 10, textTransform: "uppercase", color: "#8a6b45" }}>{tagline}</div>
        <div style={{ marginTop: 48, width: 80, height: 2, background: "#dddcd5" }} />
        <div style={{ marginTop: 28, fontSize: 28, color: "#5b6066", fontFamily: "sans-serif" }}>
          Fragrâncias de alto padrão · Pedidos pelo WhatsApp
        </div>
      </div>
    ),
    size,
  );
}
