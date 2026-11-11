"use client";

import { setPublicConfig, type PublicConfig as Config } from "@/lib/public-config";

/** Recebe do servidor a URL e a chave pública e deixa disponível para o navegador. */
export default function PublicConfig({ url, publicKey, children }: { url: string; publicKey: string; children: React.ReactNode }) {
  const next: Config = { url, key: publicKey };
  setPublicConfig(next); // antes dos filhos, no servidor e no navegador
  return <>{children}</>;
}
