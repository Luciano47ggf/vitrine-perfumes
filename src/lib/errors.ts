/** Traduz erros do Supabase para mensagens claras em português. */
export function friendlyError(error: unknown): string {
  const e = error as { message?: string; code?: string } | null;
  const msg = e?.message ?? "";
  if (!msg) return "Algo deu errado. Tente novamente.";
  if (e?.code === "42501" || /permission denied|row-level security/i.test(msg))
    return "Sem permissão para esta ação. Entre novamente como administrador.";
  if (/Failed to fetch|NetworkError|Load failed/i.test(msg)) return "Sem conexão. Verifique a internet e tente de novo.";
  if (/Invalid login credentials/i.test(msg)) return "E-mail ou senha incorretos.";
  if (/violates check constraint.*whatsapp/i.test(msg)) return "Número de WhatsApp inválido. Use DDD + número.";
  if (/violates check constraint/i.test(msg)) return "Algum campo está com valor inválido. Revise o formulário.";
  if (/exceeded the maximum allowed size|Payload too large/i.test(msg)) return "Imagem muito grande (máx. 5 MB).";
  return msg;
}
