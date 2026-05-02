import type { Deck } from '../types';

const modules = import.meta.glob<{ default: Deck }>('./*.json', {
  eager: true,
});

export const decks: Deck[] = Object.values(modules)
  .map((m) => m.default)
  .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

export function findDeck(id: string): Deck | undefined {
  return decks.find((d) => d.id === id);
}
