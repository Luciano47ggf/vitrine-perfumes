/** Traduz erros do Supabase para mensagens claras em português. */
export function friendlyError(error: unknown): string {
  const e = error as { message?: string; code?: string } | null;
  const msg = e?.message ?? "";
  if (!msg) return "Algo deu errado. Tente novamente.";
  if (e?.code === "42501" || /permission denied|row-level security/i.test(msg))
    return "Sem permissão para esta ação. Entre novamente como administrador.";
  if (/Failed to fetch|NetworkError|Load failed/i.test(msg)) return "Sem conexão. Verifique a internet e tente de novo.";
  if (/Invalid login credentials/i.test(msg)) return "E-mail ou senha incorretos.";
  if (/Email not confirmed/i.test(msg)) return "E-mail ainda não confirmado. No Supabase, confirme o usuário em Authentication → Users.";
  if (/secret API key/i.test(msg))
    return "O site está usando a chave secreta do Supabase. Na Vercel, troque pela Publishable key (sb_publishable_…) e faça um novo deploy.";
  if (/Unregistered API key|Invalid API key|No API key/i.test(msg))
    return "A chave do Supabase cadastrada na Vercel não é válida (apagada ou de outro projeto). Cole a Publishable key (sb_publishable_…) do mesmo projeto e faça um novo deploy.";
  if (/violates check constraint.*whatsapp/i.test(msg)) return "Número de WhatsApp inválido. Use DDD + número.";
  if (/violates check constraint/i.test(msg)) return "Algum campo está com valor inválido. Revise o formulário.";
  if (/exceeded the maximum allowed size|Payload too large/i.test(msg)) return "Imagem muito grande (máx. 5 MB).";
  return msg;
}
