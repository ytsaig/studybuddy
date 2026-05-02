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
