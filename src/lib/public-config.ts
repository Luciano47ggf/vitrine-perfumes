/**
 * Configuração que o NAVEGADOR pode ver: URL do Supabase e a chave PÚBLICA.
 * É preenchida pelo servidor (layout.tsx → <PublicConfig>), que já descartou
 * qualquer chave secreta. Nenhum arquivo usado no navegador lê process.env,
 * então uma chave cadastrada por engano nunca vai parar no site.
 */
export type PublicConfig = { url: string; key: string };

let config: PublicConfig = { url: "", key: "" };

export function setPublicConfig(next: PublicConfig) {
  config = next;
}

export function publicConfig(): PublicConfig {
  return config;
}
