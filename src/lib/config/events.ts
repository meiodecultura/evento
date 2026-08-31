export type QuestionOption = {
  id: string;
  label: string;
  emoji: string;
};

export type EventQuestion = {
  id: string;
  prompt: string;
  options: QuestionOption[];
};

export type EventConfig = {
  slug: string;
  eventName: string;
  welcomeTitle: string;
  welcomeSubtitle: string;
  ctaLabel: string;
  logo: string;
  questions: EventQuestion[];
};

// Os eventos em si vêm de eventos.yaml (na raiz do projeto), convertido
// automaticamente para events.generated.ts — veja scripts/build-events.mjs.
import { events } from './events.generated';
export { events };

export function getEvent(slug: string): EventConfig | undefined {
  return events[slug];
}
