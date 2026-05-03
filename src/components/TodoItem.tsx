import { useRef, useState } from 'react';
import type { Priority, Todo } from '../types';

type Props = {
  todo: Todo;
  onChange: (patch: Partial<Todo>) => void;
  onDelete: () => void;
};

const PRIORITY_CYCLE: Priority[] = ['high', 'med', 'low'];

const PRIORITY_STYLE: Record<Priority, string> = {
  high: 'bg-red-600 text-white',
  med: 'bg-neutral-200 text-neutral-800',
  low: 'bg-neutral-100 text-neutral-500',
};

const PRIORITY_LABEL: Record<Priority, string> = {
  high: 'High',
  med: 'Med',
  low: 'Low',
};

function formatDue(dueDate: string): string {
  // dueDate is YYYY-MM-DD local-calendar. Avoid TZ shifts by parsing parts.
  const [y, m, d] = dueDate.split('-').map(Number);
  if (!y || !m || !d) return dueDate;
  const dt = new Date(y, m - 1, d);
  const weekday = dt.toLocaleDateString(undefined, { weekday: 'short' });
  return `${weekday} ${m}/${d}`;
}

export function TodoItem({ todo, onChange, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.text);
  const dateInputRef = useRef<HTMLInputElement>(null);

  function cyclePriority() {
    const i = PRIORITY_CYCLE.indexOf(todo.priority);
    const next = PRIORITY_CYCLE[(i + 1) % PRIORITY_CYCLE.length];
    onChange({ priority: next });
  }

  function openDatePicker() {
    const el = dateInputRef.current;
    if (!el) return;
    if ('showPicker' in el && typeof el.showPicker === 'function') {
      try {
        el.showPicker();
        return;
      } catch {
        // fallthrough
      }
    }
    el.focus();
    el.click();
  }

  function commitEdit() {
    const trimmed = draft.trim();
    if (!trimmed) {
      setDraft(todo.text);
    } else if (trimmed !== todo.text) {
      onChange({ text: trimmed });
    }
    setEditing(false);
  }

  return (
    <li className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white px-3 py-2">
      <button
        type="button"
        onClick={() => onChange({ done: !todo.done })}
        aria-label={todo.done ? 'Mark as not done' : 'Mark as done'}
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
          todo.done
            ? 'border-green-600 bg-green-600 text-white'
            : 'border-neutral-300 bg-white'
        }`}
      >
        {todo.done && (
          <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3.5 w-3.5"
            aria-hidden="true"
          >
            <path d="m5 10 3 3 7-7" />
          </svg>
        )}
      </button>

      <div className="min-w-0 flex-1">
        {editing ? (
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitEdit();
              if (e.key === 'Escape') {
                setDraft(todo.text);
                setEditing(false);
              }
            }}
            autoFocus
            className="w-full rounded border border-neutral-300 bg-white px-2 py-1 text-neutral-900 outline-none focus:border-neutral-500"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setDraft(todo.text);
              setEditing(true);
            }}
            className={`block w-full truncate text-left ${
              todo.done
                ? 'text-neutral-400 line-through'
                : 'text-neutral-900'
            }`}
          >
            {todo.text}
          </button>
        )}
        {todo.dueDate && (
          <button
            type="button"
            onClick={openDatePicker}
            className="mt-0.5 text-xs text-neutral-500 active:text-neutral-700"
          >
            {formatDue(todo.dueDate)}
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={cyclePriority}
        aria-label={`Priority: ${PRIORITY_LABEL[todo.priority]}. Tap to change.`}
        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${PRIORITY_STYLE[todo.priority]}`}
      >
        {PRIORITY_LABEL[todo.priority]}
      </button>

      <div className="relative shrink-0">
        <input
          ref={dateInputRef}
          type="date"
          value={todo.dueDate ?? ''}
          onChange={(e) =>
            onChange({ dueDate: e.target.value || undefined })
          }
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          aria-label="Due date"
        />
        <button
          type="button"
          onClick={openDatePicker}
          aria-label={todo.dueDate ? 'Change due date' : 'Set due date'}
          className="pointer-events-none text-neutral-400"
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
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M3 9h18" />
            <path d="M8 3v4" />
            <path d="M16 3v4" />
          </svg>
        </button>
      </div>

      <button
        type="button"
        onClick={onDelete}
        aria-label="Delete todo"
        className="shrink-0 text-neutral-300 active:text-red-600"
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
