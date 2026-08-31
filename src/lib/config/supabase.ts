/**
 * Preencha com os dados do seu projeto Supabase (Settings → API Keys):
 * - supabaseUrl: "Project URL"
 * - supabasePublishableKey: a "Publishable key" (começa com sb_publishable_...)
 *   — NUNCA use uma "Secret key" (sb_secret_...) aqui, essa é privada.
 *
 * A publishable key é feita para ser exposta no navegador — tem os mesmos
 * privilégios baixos da antiga "anon key", e quem protege os dados é a
 * política de Row Level Security (veja o SQL no README). Enquanto estes
 * dois campos estiverem vazios, o app funciona normalmente e simplesmente
 * não salva as respostas em lugar nenhum.
 */
export const supabaseUrl = 'https://zkftfedfheofiriekkih.supabase.co';
export const supabasePublishableKey = 'sb_publishable_9fWCR9dHN9ejNCQ5LyX5Aw_UTmE8jlZ';
