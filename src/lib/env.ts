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

export const SUPABASE_KEY = clean(
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_KEY,
);

/** true quando as duas chaves foram cadastradas (local: .env.local · Vercel: Environment Variables). */
export function hasSupabaseEnv(): boolean {
  return !!SUPABASE_URL && !!SUPABASE_KEY;
}
