import { useState } from 'react';
import type { SessionStats } from '../types';
import { Markdown } from './Markdown';

type Props = {
  stats: SessionStats;
  onStudyAgain: () => void;
  onRetryMissed?: () => void;
  onBackToDecks: () => void;
};

function formatElapsed(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  const mm = Math.floor(totalSeconds / 60);
  const ss = totalSeconds % 60;
  return `${mm}:${ss.toString().padStart(2, '0')}`;
}

export function Results({
  stats,
  onStudyAgain,
  onRetryMissed,
  onBackToDecks,
}: Props) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  function toggle(i: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-xl flex-col px-5 py-8">
      <h2 className="text-3xl font-semibold tracking-tight text-neutral-900">
        Done!
      </h2>

      <dl className="mt-6 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl border border-neutral-200 bg-white px-3 py-4">
          <dt className="text-xs uppercase tracking-wide text-neutral-500">
            Time
          </dt>
          <dd className="mt-1 text-xl font-medium tabular-nums text-neutral-900">
            {formatElapsed(stats.elapsedMs)}
          </dd>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white px-3 py-4">
          <dt className="text-xs uppercase tracking-wide text-neutral-500">
            First-try
          </dt>
          <dd className="mt-1 text-xl font-medium tabular-nums text-neutral-900">
            {stats.firstTryCount}
          </dd>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white px-3 py-4">
          <dt className="text-xs uppercase tracking-wide text-neutral-500">
            Retries
          </dt>
          <dd className="mt-1 text-xl font-medium tabular-nums text-neutral-900">
            {stats.retryCount}
          </dd>
        </div>
      </dl>

      {stats.retriedCards.length > 0 && (
        <div className="mt-8 flex min-h-0 flex-1 flex-col">
          <h3 className="mb-2 text-sm font-medium uppercase tracking-wide text-neutral-500">
            Missed cards
          </h3>
          <ul className="flex-1 space-y-2 overflow-y-auto">
            {stats.retriedCards.map((c, i) => {
              const isOpen = expanded.has(i);
              return (
                <li
                  key={i}
                  className="rounded-lg border border-neutral-200 bg-white"
                >
                  <button
                    type="button"
                    onClick={() => toggle(i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left text-neutral-900"
                  >
                    <span className="min-w-0 flex-1">
                      <Markdown>{c.front}</Markdown>
                    </span>
                    <span
                      className={`mt-0.5 shrink-0 text-neutral-400 transition-transform ${
                        isOpen ? 'rotate-90' : ''
                      }`}
                      aria-hidden="true"
                    >
                      ›
                    </span>
                  </button>
                  {isOpen && (
                    <div className="border-t border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-800">
                      <Markdown>{c.back}</Markdown>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-3">
        {onRetryMissed && (
          <button
            type="button"
            onClick={onRetryMissed}
            className="w-full rounded-xl bg-neutral-900 px-6 py-4 text-lg font-medium text-white active:bg-neutral-700"
          >
            Retry missed ({stats.retriedCards.length})
          </button>
        )}
        <button
          type="button"
          onClick={onStudyAgain}
          className={`w-full rounded-xl px-6 py-4 text-lg font-medium ${
            onRetryMissed
              ? 'border border-neutral-300 bg-white text-neutral-900 active:bg-neutral-100'
              : 'bg-neutral-900 text-white active:bg-neutral-700'
          }`}
        >
          Study again
        </button>
        <button
          type="button"
          onClick={onBackToDecks}
          className="w-full rounded-xl border border-neutral-300 bg-white px-6 py-4 text-lg font-medium text-neutral-900 active:bg-neutral-100"
        >
          Back to decks
        </button>
      </div>
    </div>
  );
}
