export type Card = {
  front: string;
  back: string;
};

export type Deck = {
  id: string;
  name: string;
  createdAt: string;
  cards: Card[];
};

export type SessionStats = {
  totalCards: number;
  firstTryCount: number;
  retryCount: number;
  retriedCards: Card[];
  elapsedMs: number;
};

export type Priority = 'high' | 'med' | 'low';

export type Todo = {
  id: string;
  text: string;
  priority: Priority;
  dueDate?: string; // YYYY-MM-DD
  done: boolean;
  createdAt: string; // ISO timestamp
};

export type Note = {
  id: string;
  title: string;
  body: string;
  updatedAt: string; // ISO timestamp
};

export type Tab = 'cards' | 'todo' | 'notes';
