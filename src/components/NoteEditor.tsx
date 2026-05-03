import { useEffect, useRef, useState } from 'react';
import type { Note } from '../types';

type Props = {
  note: Note;
  onChange: (patch: Partial<Note>) => void;
  onBack: () => void;
};

export function NoteEditor({ note, onChange, onBack }: Props) {
  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.body);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      if (title !== note.title || body !== note.body) {
        onChange({
          title,
          body,
          updatedAt: new Date().toISOString(),
        });
      }
    }, 300);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [title, body, note.title, note.body, onChange]);

  return (
    <div className="mx-auto flex h-full w-full max-w-xl flex-col px-5 py-4">
      <div className="mb-3 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to notes"
          className="-ml-2 p-2 text-neutral-500 active:text-neutral-900"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
            aria-hidden="true"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="flex-1 bg-transparent text-lg font-medium text-neutral-900 outline-none placeholder:text-neutral-400"
        />
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Type or paste notes, links, anything…"
        className="min-h-0 flex-1 resize-none bg-transparent text-base leading-relaxed text-neutral-900 outline-none placeholder:text-neutral-400"
      />
    </div>
  );
}
