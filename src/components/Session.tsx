import { useMemo, useRef, useState } from 'react';
import type { Card, SessionStats } from '../types';
import { CardView } from './CardView';

type Props = {
  cards: Card[];
  onExit: () => void;
  onFinish: (stats: SessionStats) => void;
};

type QueueItem = { cardIndex: number };

function shuffle<T>(arr: T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function Session({ cards, onExit, onFinish }: Props) {
  const total = cards.length;
  const [queue, setQueue] = useState<QueueItem[]>(() =>
    shuffle(cards.map((_, i) => ({ cardIndex: i })))
  );
  const [flipped, setFlipped] = useState(false);
  const seenRef = useRef<Set<number>>(new Set());
  const missedRef = useRef<Set<number>>(new Set());
  const passedRef = useRef<Set<number>>(new Set());
  const startedAtRef = useRef<number>(performance.now());

  const current = queue[0];
  const passed = passedRef.current.size;
  const pct = total === 0 ? 0 : Math.round((passed / total) * 100);

  const card = useMemo(
    () => (current ? cards[current.cardIndex] : null),
    [current, cards]
  );

  if (!card) {
    return null;
  }

  function markSeen(idx: number) {
    seenRef.current.add(idx);
  }

  function handleGot() {
    if (!current) return;
    markSeen(current.cardIndex);
    passedRef.current.add(current.cardIndex);
    const next = queue.slice(1);
    setFlipped(false);
    if (next.length === 0) {
      const elapsedMs = performance.now() - startedAtRef.current;
      const retriedCards = Array.from(missedRef.current).map(
        (i) => cards[i]
      );
      onFinish({
        totalCards: total,
        firstTryCount: total - missedRef.current.size,
        retryCount: missedRef.current.size,
        retriedCards,
        elapsedMs,
      });
      return;
    }
    setQueue(next);
  }

  function handleMissed() {
    if (!current) return;
    const idx = current.cardIndex;
    if (!seenRef.current.has(idx)) {
      missedRef.current.add(idx);
    }
    markSeen(idx);
    const next = queue.slice(1).concat({ cardIndex: idx });
    setFlipped(false);
    setQueue(next);
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-xl flex-col px-5 py-4">
      <div className="mb-4 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-200">
          <div
            className="h-full bg-neutral-900 transition-[width] duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-sm tabular-nums text-neutral-500">
          {passed} / {total}
        </span>
        <button
          type="button"
          onClick={onExit}
          aria-label="Exit session"
          className="text-2xl leading-none text-neutral-500 active:text-neutral-900"
        >
          ✕
        </button>
      </div>

      <CardView
        front={card.front}
        back={card.back}
        flipped={flipped}
        onFlip={() => setFlipped((f) => !f)}
      />

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleMissed}
          disabled={!flipped}
          className="rounded-xl bg-red-600 px-4 py-4 text-lg font-medium text-white active:bg-red-700 disabled:bg-neutral-200 disabled:text-neutral-400"
        >
          Missed it
        </button>
        <button
          type="button"
          onClick={handleGot}
          disabled={!flipped}
          className="rounded-xl bg-green-600 px-4 py-4 text-lg font-medium text-white active:bg-green-700 disabled:bg-neutral-200 disabled:text-neutral-400"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
