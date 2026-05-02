import type { SessionStats } from '../types';
import { Markdown } from './Markdown';

type Props = {
  stats: SessionStats;
  onStudyAgain: () => void;
  onBackToDecks: () => void;
};

function formatElapsed(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  const mm = Math.floor(totalSeconds / 60);
  const ss = totalSeconds % 60;
  return `${mm}:${ss.toString().padStart(2, '0')}`;
}

export function Results({ stats, onStudyAgain, onBackToDecks }: Props) {
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
            Needed retries
          </h3>
          <ul className="flex-1 space-y-2 overflow-y-auto">
            {stats.retriedCards.map((c, i) => (
              <li
                key={i}
                className="rounded-lg border border-neutral-200 bg-white px-4 py-3 text-neutral-900"
              >
                <Markdown>{c.front}</Markdown>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-3">
        <button
          type="button"
          onClick={onStudyAgain}
          className="w-full rounded-xl bg-neutral-900 px-6 py-4 text-lg font-medium text-white active:bg-neutral-700"
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
