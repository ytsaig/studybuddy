import type { Note } from '../types';

type Props = {
  note: Note;
  onOpen: () => void;
  onDelete: () => void;
};

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const now = Date.now();
  const diff = now - then;
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < minute) return 'just now';
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  if (diff < 7 * day) return `${Math.floor(diff / day)}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function NoteListItem({ note, onOpen, onDelete }: Props) {
  const preview = note.body.trim().split('\n')[0] || '';
  return (
    <li className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white">
      <button
        type="button"
        onClick={onOpen}
        className="min-w-0 flex-1 px-4 py-3 text-left"
      >
        <div className="truncate font-medium text-neutral-900">
          {note.title || 'Untitled'}
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-neutral-500">
          <span className="shrink-0">{formatRelative(note.updatedAt)}</span>
          {preview && (
            <>
              <span aria-hidden="true">·</span>
              <span className="truncate">{preview}</span>
            </>
          )}
        </div>
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label="Delete note"
        className="mr-2 shrink-0 p-2 text-neutral-300 active:text-red-600"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path d="M4 7h16" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
          <path d="M6 7v13a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7" />
          <path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
        </svg>
      </button>
    </li>
  );
}
