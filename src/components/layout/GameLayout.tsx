import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PanelLeftClose, PanelLeft, LogOut, Settings, Key,
  Swords, MessageSquareText
} from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import ApiSettingsModal from '@/components/game/ApiSettingsModal';

interface GameDef {
  id: string;
  name: string;
  icon: React.ReactNode;
  emoji: string;
}

const GAMES: GameDef[] = [
  { id: 'werewolf', name: '狼人杀', icon: <Swords className="w-5 h-5" />, emoji: '🐺' },
  { id: 'undercover', name: '谁是卧底', icon: <MessageSquareText className="w-5 h-5" />, emoji: '🕵️' },
];

interface GameLayoutProps {
  activeGame: string;
  onGameChange: (id: string) => void;
  children: React.ReactNode;
}

const GameLayout = ({ activeGame, onGameChange, children }: GameLayoutProps) => {
  const navigate = useNavigate();
  const { currentUser, logout } = useGameStore();
  const [collapsed, setCollapsed] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Left Sidebar */}
      <aside
        className={`shrink-0 border-r border-sidebar-border bg-sidebar flex flex-col transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-56'
        }`}
      >
        {/* Logo / collapse toggle */}
        <div className="h-14 border-b border-sidebar-border flex items-center px-3 gap-2 shrink-0">
          {!collapsed && (
            <h1 className="display-title text-lg text-sidebar-foreground tracking-tight flex-1">
              GAMES
            </h1>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-md text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          >
            {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        {/* Game list */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {GAMES.map(game => {
            const isActive = activeGame === game.id;
            return (
              <button
                key={game.id}
                onClick={() => onGameChange(game.id)}
                className={`w-full flex items-center gap-3 rounded-lg transition-all duration-200 ${
                  collapsed ? 'justify-center p-3' : 'px-3 py-2.5'
                } ${
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                }`}
                title={collapsed ? game.name : undefined}
              >
                <span className="text-xl">{game.emoji}</span>
                {!collapsed && <span className="text-sm font-medium">{game.name}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom: user info */}
        <div className="border-t border-sidebar-border p-2 space-y-1 shrink-0">
          <button
            onClick={() => setShowApiModal(true)}
            className={`w-full flex items-center gap-3 rounded-lg text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors ${
              collapsed ? 'justify-center p-3' : 'px-3 py-2'
            }`}
            title="API 设置"
          >
            <Key className="w-4 h-4" />
            {!collapsed && <span className="text-sm">API 设置</span>}
          </button>
          <button
            onClick={() => navigate('/settings')}
            className={`w-full flex items-center gap-3 rounded-lg text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors ${
              collapsed ? 'justify-center p-3' : 'px-3 py-2'
            }`}
            title="账号设置"
          >
            <Settings className="w-4 h-4" />
            {!collapsed && <span className="text-sm">账号设置</span>}
          </button>

          <div className={`flex items-center gap-2 rounded-lg px-3 py-2 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-lg bg-sidebar-accent flex items-center justify-center text-sm font-bold text-sidebar-foreground shrink-0">
              {(currentUser?.username || '游')[0]}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {currentUser?.username || '游客'}
                </p>
              </div>
            )}
            <button
              onClick={() => { logout(); navigate('/'); }}
              className="p-1.5 rounded text-sidebar-foreground/40 hover:text-destructive transition-colors shrink-0"
              title="退出登录"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Right content */}
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>

      {showApiModal && <ApiSettingsModal onClose={() => setShowApiModal(false)} />}
    </div>
  );
};

export default GameLayout;
