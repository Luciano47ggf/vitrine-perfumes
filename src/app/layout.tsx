import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/env";
import PublicConfig from "@/components/PublicConfig";

// Fontes incluídas no projeto (≈40 KB no total): sem requisição externa, pré-carregadas e sem "pulo" de layout
const marcellus = localFont({
  src: "./fonts/marcellus.woff2",
  weight: "400",
  variable: "--font-marcellus",
  display: "swap",
  fallback: ["Times New Roman", "serif"],
});
const jost = localFont({
  src: "./fonts/jost-variable.woff2",
  weight: "300 600",
  variable: "--font-jost",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: "Perfumaria masculina — Catálogo",
  description: "Fragrâncias masculinas de alto padrão. Peça pelo WhatsApp.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f6f6f3",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${marcellus.variable} ${jost.variable}`}>
      <body className="min-h-dvh antialiased">
        {/* Só a URL e a chave pública seguem para o navegador */}
        <PublicConfig url={SUPABASE_URL} publicKey={SUPABASE_KEY}>
          {children}
        </PublicConfig>
      </body>
    </html>
  );
}
