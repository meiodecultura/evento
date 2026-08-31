import { supabaseUrl, supabasePublishableKey } from './config/supabase';

/**
 * Salva as respostas de um questionário no Supabase — uma linha por pessoa,
 * sem nenhum dado que identifique quem respondeu. Chamada "best effort":
 * se o Supabase não estiver configurado, ou a rede falhar, o app segue
 * normalmente sem travar o fluxo de foto do usuário.
 *
 * Só o header `apikey` é enviado — a publishable key não é um JWT, e a
 * API do Supabase rejeita a requisição se ela também vier num header
 * `Authorization: Bearer` (tenta interpretar como JWT e falha).
 */
export async function saveResponse(eventSlug: string, answers: Record<string, string>): Promise<void> {
  if (!supabaseUrl || !supabasePublishableKey) return;

  try {
    await fetch(`${supabaseUrl}/rest/v1/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabasePublishableKey,
        Prefer: 'return=minimal'
      },
      body: JSON.stringify({ event_slug: eventSlug, answers })
    });
  } catch {
    // sem conexão ou Supabase fora do ar — não é crítico, ignora
  }
}
