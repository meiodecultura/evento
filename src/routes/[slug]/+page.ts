import { error } from '@sveltejs/kit';
import { getEvent } from '$lib/config/events';
import type { PageLoad } from './$types';

// Cada slug é conhecido só em tempo de execução, então esta rota é servida
// via a página de fallback (SPA) em vez de ser pré-renderizada por evento.
export const prerender = false;

export const load: PageLoad = ({ params }) => {
  const event = getEvent(params.slug);
  if (!event) {
    error(404, 'Evento não encontrado');
  }
  return { event };
};
