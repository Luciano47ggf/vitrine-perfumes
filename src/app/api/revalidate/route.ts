import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * A vitrine fica em cache (carrega instantaneamente).
 * Quando o administrador salva algo, o painel chama esta rota
 * e a vitrine é atualizada na hora.
 */
export async function POST() {
  const db = await supabaseServer();
  const { data: isAdmin } = await db.rpc("is_admin");
  if (!isAdmin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
