import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Note } from '../types';
import { loadNotes, saveNotes, uid } from '../storage';
import { NoteListItem } from '../components/NoteListItem';
import { NoteEditor } from '../components/NoteEditor';

export function NotesTab() {
  const [notes, setNotes] = useState<Note[]>(() => loadNotes());
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  const sorted = useMemo(
    () =>
      notes.slice().sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)),
    [notes]
  );

  const openNote = openId ? notes.find((n) => n.id === openId) : null;

  const patchNote = useCallback(
    (id: string, patch: Partial<Note>) => {
      setNotes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, ...patch } : n))
      );
    },
    [setNotes]
  );

  function create() {
    const now = new Date().toISOString();
    const n: Note = {
      id: uid(),
      title: '',
      body: '',
      updatedAt: now,
    };
    setNotes((prev) => [n, ...prev]);
    setOpenId(n.id);
  }

  function remove(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }

  if (openNote) {
    return (
      <NoteEditor
        note={openNote}
        onChange={(patch) => patchNote(openNote.id, patch)}
        onBack={() => setOpenId(null)}
      />
    );
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-xl flex-col px-5 py-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Notes
        </h2>
        <button
          type="button"
          onClick={create}
          aria-label="New note"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-white active:bg-neutral-700"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
        </button>
      </div>

      {sorted.length === 0 ? (
        <p className="mt-8 text-center text-sm text-neutral-500">
          No notes yet. Tap + to create one.
        </p>
      ) : (
        <ul className="mt-6 space-y-2">
          {sorted.map((n) => (
            <NoteListItem
              key={n.id}
              note={n}
              onOpen={() => setOpenId(n.id)}
              onDelete={() => remove(n.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
