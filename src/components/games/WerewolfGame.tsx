import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WerewolfLobby from './werewolf/WerewolfLobby';
import WerewolfAgents from './werewolf/WerewolfAgents';
import WerewolfGuide from './werewolf/WerewolfGuide';

const TABS = [
  { key: 'lobby', label: '大厅' },
  { key: 'agents', label: '智能体模板' },
  { key: 'guide', label: '游戏介绍' },
] as const;

type Tab = typeof TABS[number]['key'];

const WerewolfGame = () => {
  const [tab, setTab] = useState<Tab>('lobby');

  return (
    <div className="flex flex-col h-full">
      {/* Sub-navigation */}
      <div className="h-11 border-b border-border flex items-center px-4 gap-1 shrink-0 bg-card/30">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm rounded-md transition-all duration-200 ${
              tab === t.key
                ? 'bg-primary text-primary-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {tab === 'lobby' && <WerewolfLobby />}
        {tab === 'agents' && <WerewolfAgents />}
        {tab === 'guide' && <WerewolfGuide />}
      </div>
    </div>
  );
};

export default WerewolfGame;
