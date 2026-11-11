/**
 * Chaves do Supabase. Aceita os nomes mais usados, inclusive os que a
 * integração Supabase da Vercel cria sozinha. Use só a chave PÚBLICA
 * (Publishable / anon). Nunca a Secret / service_role.
 *
 * Cada nome é escrito por extenso porque o Next.js só embute no site
 * variáveis NEXT_PUBLIC_ citadas literalmente.
 */
const clean = (v: string | undefined) => (v ?? "").trim().replace(/^["']|["']$/g, "").replace(/\/+$/, "");

export const SUPABASE_URL = clean(
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL,
);

/** Chave secreta (sb_secret_… ou JWT service_role) nunca pode ir para o navegador. */
function isSecretKey(key: string): boolean {
  if (key.startsWith("sb_secret_")) return true;
  const parts = key.split(".");
  if (parts.length === 3) {
    try {
      const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const json = JSON.parse(typeof atob === "function" ? atob(b64) : Buffer.from(b64, "base64").toString("utf8"));
      return json?.role === "service_role";
    } catch {
      return false;
    }
  }
  return false;
}

// Usa a primeira chave PÚBLICA encontrada; chaves secretas são ignoradas.
const candidates = [
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
  process.env.NEXT_PUBLIC_SUPABASE_KEY,
].map(clean);

export const SECRET_KEY_DETECTED = candidates.some((k) => !!k && isSecretKey(k));
export const SUPABASE_KEY = candidates.find((k) => !!k && !isSecretKey(k)) ?? "";

/** true quando as duas chaves foram cadastradas (local: .env.local · Vercel: Environment Variables). */
export function hasSupabaseEnv(): boolean {
  return !!SUPABASE_URL && !!SUPABASE_KEY;
}
