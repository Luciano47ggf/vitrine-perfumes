/** true quando as chaves do Supabase foram cadastradas (local: .env.local · Vercel: Environment Variables). */
export function hasSupabaseEnv(): boolean {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}
