import type { Deck } from '../types';

type Props = {
  deck: Deck;
  onStart: () => void;
  onBack: () => void;
};

export function DeckCover({ deck, onStart, onBack }: Props) {
  return (
    <div className="mx-auto flex h-full w-full max-w-xl flex-col px-5 py-6">
      <button
        type="button"
        onClick={onBack}
        className="mb-8 self-start text-sm text-neutral-600 active:text-neutral-900"
      >
        ← Decks
      </button>
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <h2 className="text-4xl font-semibold tracking-tight text-neutral-900">
          {deck.name}
        </h2>
        <p className="mt-3 text-neutral-500">{deck.cards.length} cards</p>
      </div>
      <button
        type="button"
        onClick={onStart}
        className="mb-4 w-full rounded-xl bg-neutral-900 px-6 py-4 text-lg font-medium text-white active:bg-neutral-700"
      >
        Start studying
      </button>
    </div>
  );
}
