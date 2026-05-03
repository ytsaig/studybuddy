import { useEffect, useMemo, useState } from 'react';
import type { Priority, Todo } from '../types';
import { loadTodos, saveTodos, uid } from '../storage';
import { TodoItem } from '../components/TodoItem';

const PRIORITY_ORDER: Record<Priority, number> = { high: 0, med: 1, low: 2 };

function sortOpen(a: Todo, b: Todo): number {
  const p = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
  if (p !== 0) return p;
  // Due date asc; undated last
  if (a.dueDate && b.dueDate) {
    if (a.dueDate !== b.dueDate) return a.dueDate < b.dueDate ? -1 : 1;
  } else if (a.dueDate) return -1;
  else if (b.dueDate) return 1;
  return a.createdAt < b.createdAt ? -1 : 1;
}

function sortDone(a: Todo, b: Todo): number {
  return a.createdAt < b.createdAt ? 1 : -1;
}

export function TodoTab() {
  const [todos, setTodos] = useState<Todo[]>(() => loadTodos());
  const [text, setText] = useState('');
  const [priority, setPriority] = useState<Priority>('med');
  const [dueDate, setDueDate] = useState('');
  const [doneOpen, setDoneOpen] = useState(true);

  useEffect(() => {
    saveTodos(todos);
  }, [todos]);

  const open = useMemo(
    () => todos.filter((t) => !t.done).sort(sortOpen),
    [todos]
  );
  const done = useMemo(
    () => todos.filter((t) => t.done).sort(sortDone),
    [todos]
  );

  function addTodo() {
    const trimmed = text.trim();
    if (!trimmed) return;
    const t: Todo = {
      id: uid(),
      text: trimmed,
      priority,
      dueDate: dueDate || undefined,
      done: false,
      createdAt: new Date().toISOString(),
    };
    setTodos((prev) => [...prev, t]);
    setText('');
    setPriority('med');
    setDueDate('');
  }

  function patch(id: string, changes: Partial<Todo>) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...changes } : t))
    );
  }

  function remove(id: string) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-xl flex-col px-5 py-6">
      <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
        Todo
      </h2>

      <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-3">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') addTodo();
          }}
          placeholder="Add an assignment…"
          className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-neutral-900 outline-none focus:border-neutral-500"
        />
        <div className="mt-2 flex items-center gap-2">
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            aria-label="Priority"
            className="rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-sm text-neutral-900"
          >
            <option value="high">High</option>
            <option value="med">Med</option>
            <option value="low">Low</option>
          </select>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            aria-label="Due date"
            className="flex-1 rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-sm text-neutral-900"
          />
          <button
            type="button"
            onClick={addTodo}
            disabled={!text.trim()}
            className="rounded-lg bg-neutral-900 px-4 py-1.5 text-sm font-medium text-white active:bg-neutral-700 disabled:bg-neutral-200 disabled:text-neutral-400"
          >
            Add
          </button>
        </div>
      </div>

      {open.length === 0 && done.length === 0 && (
        <p className="mt-8 text-center text-sm text-neutral-500">
          No todos yet. Add one above.
        </p>
      )}

      {open.length > 0 && (
        <ul className="mt-6 space-y-2">
          {open.map((t) => (
            <TodoItem
              key={t.id}
              todo={t}
              onChange={(changes) => patch(t.id, changes)}
              onDelete={() => remove(t.id)}
            />
          ))}
        </ul>
      )}

      {done.length > 0 && (
        <div className="mt-8">
          <button
            type="button"
            onClick={() => setDoneOpen((v) => !v)}
            aria-expanded={doneOpen}
            className="flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-neutral-500"
          >
            <span
              className={`inline-block transition-transform ${
                doneOpen ? 'rotate-90' : ''
              }`}
              aria-hidden="true"
            >
              ›
            </span>
            Done ({done.length})
          </button>
          {doneOpen && (
            <ul className="mt-3 space-y-2">
              {done.map((t) => (
                <TodoItem
                  key={t.id}
                  todo={t}
                  onChange={(changes) => patch(t.id, changes)}
                  onDelete={() => remove(t.id)}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
