import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import AdminApp from "@/components/admin/AdminApp";
import { SECRET_KEY_DETECTED, hasSupabaseEnv } from "@/lib/env";
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
          {SECRET_KEY_DETECTED && (
            <p className="mt-4 rounded-md border border-danger/30 px-3 py-2 text-sm text-danger">
              Uma chave <strong>secreta</strong> foi cadastrada numa variável pública e foi ignorada. Apague essa chave no
              Supabase (API Keys) e use a <strong>Publishable key</strong> (sb_publishable_…).
            </p>
          )}
          <ol className="mt-5 list-decimal space-y-2 pl-5 text-[15px] text-ink-2">
            <li>Na Vercel, abra o projeto → <strong className="font-medium text-ink">Settings → Environment Variables</strong>.</li>
            <li>
              Adicione <code className="rounded bg-mist px-1">NEXT_PUBLIC_SUPABASE_URL</code> e{" "}
              <code className="rounded bg-mist px-1">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> com a Publishable key (Supabase → Project Settings → API Keys).
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
            A conta {user.email} ainda não é administradora. No Supabase, abra o SQL Editor e rode o comando
            “insert into public.admins …” do README com este e-mail.
          </p>
          <form action="/admin/logout" method="post" className="mt-6">
            <button className="btn btn-ghost">Sair</button>
          </form>
        </div>
      </main>
    );
  }

  const { data: settings } = await db.from("store_settings").select(SETTINGS_COLUMNS).eq("id", 1).maybeSingle();
  // Garantia: se a linha de configurações faltar, o painel abre com valores padrão em vez de quebrar
  const fallback: StoreSettings = { id: 1, store_name: "Rafael", tagline: "Perfumaria masculina", whatsapp: null, instagram: null };
  return <AdminApp initialSettings={(settings as StoreSettings | null) ?? fallback} />;
}
