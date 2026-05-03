import { useEffect, useState } from 'react';
import { decks, findDeck } from '../decks/loader';
import { DeckList } from '../components/DeckList';
import { DeckCover } from '../components/DeckCover';
import { Session } from '../components/Session';
import { Results } from '../components/Results';
import type { Card, SessionStats } from '../types';

type View =
  | { kind: 'list' }
  | { kind: 'cover'; deckId: string }
  | { kind: 'session'; deckId: string; nonce: number; cardSubset?: Card[] }
  | { kind: 'results'; deckId: string; stats: SessionStats };

type Props = {
  onSessionActiveChange: (active: boolean) => void;
};

export function FlashCardsTab({ onSessionActiveChange }: Props) {
  const [view, setView] = useState<View>({ kind: 'list' });

  useEffect(() => {
    onSessionActiveChange(view.kind === 'session');
  }, [view.kind, onSessionActiveChange]);

  if (view.kind === 'list') {
    return (
      <DeckList
        decks={decks}
        onPick={(deckId) => setView({ kind: 'cover', deckId })}
      />
    );
  }

  if (view.kind === 'cover') {
    const deck = findDeck(view.deckId);
    if (!deck) {
      setView({ kind: 'list' });
      return null;
    }
    return (
      <DeckCover
        deck={deck}
        onBack={() => setView({ kind: 'list' })}
        onStart={() =>
          setView({ kind: 'session', deckId: deck.id, nonce: Date.now() })
        }
      />
    );
  }

  if (view.kind === 'session') {
    const deck = findDeck(view.deckId);
    if (!deck) {
      setView({ kind: 'list' });
      return null;
    }
    const cards = view.cardSubset ?? deck.cards;
    return (
      <Session
        key={view.nonce}
        cards={cards}
        onExit={() => setView({ kind: 'cover', deckId: deck.id })}
        onFinish={(stats) =>
          setView({ kind: 'results', deckId: deck.id, stats })
        }
      />
    );
  }

  const deck = findDeck(view.deckId);
  if (!deck) {
    setView({ kind: 'list' });
    return null;
  }
  return (
    <Results
      stats={view.stats}
      onStudyAgain={() =>
        setView({ kind: 'session', deckId: deck.id, nonce: Date.now() })
      }
      onRetryMissed={
        view.stats.retriedCards.length > 0
          ? () =>
              setView({
                kind: 'session',
                deckId: deck.id,
                nonce: Date.now(),
                cardSubset: view.stats.retriedCards,
              })
          : undefined
      }
      onBackToDecks={() => setView({ kind: 'list' })}
    />
  );
}
