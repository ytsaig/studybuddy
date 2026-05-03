import type { Note, Todo } from './types';

const KEYS = {
  todos: 'todos:v1',
  notes: 'notes:v1',
} as const;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable; swallow — this is a single-user drill app.
  }
}

export function loadTodos(): Todo[] {
  return read<Todo[]>(KEYS.todos, []);
}

export function saveTodos(todos: Todo[]): void {
  write(KEYS.todos, todos);
}

export function loadNotes(): Note[] {
  return read<Note[]>(KEYS.notes, []);
}

export function saveNotes(notes: Note[]): void {
  write(KEYS.notes, notes);
}

export function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
