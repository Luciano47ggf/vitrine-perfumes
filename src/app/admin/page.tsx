import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import AdminApp from "@/components/admin/AdminApp";
import { hasSupabaseEnv } from "@/lib/env";
import { SETTINGS_COLUMNS, type StoreSettings } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Painel — Produtos", robots: { index: false, follow: false } };

export default async function AdminPage() {
  if (!hasSupabaseEnv()) {
    return (
      <main className="grid min-h-dvh place-items-center px-6">
        <div className="max-w-md rounded-xl border border-line bg-white p-8">
          <p className="label-caps text-bronze">Configuração pendente</p>
          <h1 className="mt-2 font-display text-3xl">Conecte o Supabase</h1>
          <ol className="mt-5 list-decimal space-y-2 pl-5 text-[15px] text-ink-2">
            <li>Na Vercel, abra o projeto → <strong className="font-medium text-ink">Settings → Environment Variables</strong>.</li>
            <li>
              Adicione <code className="rounded bg-mist px-1">NEXT_PUBLIC_SUPABASE_URL</code> e{" "}
              <code className="rounded bg-mist px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> (Supabase → Project Settings → API).
            </li>
            <li>Em <strong className="font-medium text-ink">Deployments</strong>, clique em ⋯ → <strong className="font-medium text-ink">Redeploy</strong>.</li>
          </ol>
        </div>
      </main>
    );
  }

  const db = await supabaseServer();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: isAdmin } = await db.rpc("is_admin");
  if (!isAdmin) {
    return (
      <main className="grid min-h-dvh place-items-center px-6 text-center">
        <div>
          <h1 className="font-display text-3xl">Acesso não autorizado</h1>
          <p className="mt-2 text-ink-2">
            A conta {user.email} não está cadastrada como administradora. Veja o passo “Tornar-se admin” no README.
          </p>
          <form action="/admin/logout" method="post" className="mt-6">
            <button className="btn btn-ghost">Sair</button>
          </form>
        </div>
      </main>
    );
  }

  const { data: settings } = await db.from("store_settings").select(SETTINGS_COLUMNS).eq("id", 1).single();
  return <AdminApp initialSettings={settings as StoreSettings} />;
}
