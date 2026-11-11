"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { friendlyError } from "@/lib/errors";
import { Spinner } from "@/components/ui/Modal";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabaseBrowser().auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setError(friendlyError(error));
      setLoading(false);
      return;
    }
    router.replace("/admin");
    router.refresh();
  }

  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm animate-rise rounded-xl border border-line bg-white p-8">
        <p className="label-caps text-bronze">Área restrita</p>
        <h1 className="mb-7 mt-2 font-display text-3xl">Painel da loja</h1>
        <label className="label" htmlFor="email">E-mail</label>
        <input id="email" type="email" inputMode="email" autoCapitalize="none" autoCorrect="off" autoComplete="email" required className="field mb-4" value={email} onChange={(e) => setEmail(e.target.value)} />
        <label className="label" htmlFor="password">Senha</label>
        <input id="password" type="password" autoComplete="current-password" required className="field mb-6" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="mb-4 rounded-md border border-danger/20 px-3 py-2 text-sm text-danger">{error}</p>}
        <button className="btn btn-primary w-full" disabled={loading}>
          {loading && <Spinner />} Entrar
        </button>
        <a href="/" className="mt-6 block text-center text-sm text-ink-2 transition hover:text-ink">← Voltar ao catálogo</a>
      </form>
    </main>
  );
}
