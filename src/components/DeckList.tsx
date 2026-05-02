import type { Deck } from '../types';

type Props = {
  decks: Deck[];
  onPick: (deckId: string) => void;
};

export function DeckList({ decks, onPick }: Props) {
  return (
    <div className="mx-auto flex h-full w-full max-w-xl flex-col px-5 py-8">
      <h1 className="mb-8 text-3xl font-semibold tracking-tight text-neutral-900">
        Studybuddy
      </h1>
      {decks.length === 0 ? (
        <p className="text-neutral-500">No decks yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {decks.map((deck) => (
            <li key={deck.id}>
              <button
                type="button"
                onClick={() => onPick(deck.id)}
                className="flex w-full items-center justify-between rounded-xl border border-neutral-200 bg-white px-5 py-4 text-left shadow-sm active:bg-neutral-100"
              >
                <span className="text-lg font-medium text-neutral-900">
                  {deck.name}
                </span>
                <span className="text-sm text-neutral-500">
                  {deck.cards.length} cards
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
