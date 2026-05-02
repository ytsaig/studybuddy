import { useState } from 'react';
import { decks, findDeck } from './decks/loader';
import { DeckList } from './components/DeckList';
import { DeckCover } from './components/DeckCover';
import { Session } from './components/Session';
import { Results } from './components/Results';
import type { SessionStats } from './types';

type View =
  | { kind: 'list' }
  | { kind: 'cover'; deckId: string }
  | { kind: 'session'; deckId: string; nonce: number }
  | { kind: 'results'; deckId: string; stats: SessionStats };

export default function App() {
  const [view, setView] = useState<View>({ kind: 'list' });

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
    return (
      <Session
        key={view.nonce}
        deck={deck}
        onExit={() => setView({ kind: 'cover', deckId: deck.id })}
        onFinish={(stats) =>
          setView({ kind: 'results', deckId: deck.id, stats })
        }
      />
    );
  }

  // results
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
      onBackToDecks={() => setView({ kind: 'list' })}
    />
  );
}
