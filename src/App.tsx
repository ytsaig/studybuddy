import { useCallback, useState } from 'react';
import { BottomNav } from './components/BottomNav';
import { FlashCardsTab } from './tabs/FlashCardsTab';
import { TodoTab } from './tabs/TodoTab';
import { NotesTab } from './tabs/NotesTab';
import type { Tab } from './types';

export default function App() {
  const [tab, setTab] = useState<Tab>('cards');
  const [sessionActive, setSessionActive] = useState(false);

  const handleSessionActiveChange = useCallback((active: boolean) => {
    setSessionActive(active);
  }, []);

  return (
    <div className="flex h-full flex-col">
      <main className="min-h-0 flex-1 overflow-y-auto">
        {tab === 'cards' && (
          <FlashCardsTab onSessionActiveChange={handleSessionActiveChange} />
        )}
        {tab === 'todo' && <TodoTab />}
        {tab === 'notes' && <NotesTab />}
      </main>
      {!sessionActive && <BottomNav tab={tab} onChange={setTab} />}
    </div>
  );
}
