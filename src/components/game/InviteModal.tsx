import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Copy, Users, Bot, Shuffle, Check } from 'lucide-react';
import { useGameStore, type AgentTemplate } from '@/store/gameStore';
import { toast } from 'sonner';

interface InviteModalProps {
  seatNumber: number;
  onClose: () => void;
  onInviteAgent: (agent: AgentTemplate) => void;
  onInviteLobbyUser: (username: string) => void;
}

const InviteModal = ({ seatNumber, onClose, onInviteAgent, onInviteLobbyUser }: InviteModalProps) => {
  const { lobbyUsers, agentTemplates } = useGameStore();
  const [tab, setTab] = useState<'humans' | 'agents'>('agents');
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('房间链接已复制');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRandomAgent = () => {
    const random = agentTemplates[Math.floor(Math.random() * agentTemplates.length)];
    onInviteAgent(random);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-void/80 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="relative glass-panel rounded-xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <h3 className="display-title text-lg text-foreground">
            邀请玩家 · {seatNumber}号位
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border shrink-0">
          <button
            onClick={() => setTab('agents')}
            className={`flex-1 py-2.5 text-sm font-medium flex items-center justify-center gap-1.5 transition-colors ${
              tab === 'agents'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Bot className="w-3.5 h-3.5" /> AI 智能体
          </button>
          <button
            onClick={() => setTab('humans')}
            className={`flex-1 py-2.5 text-sm font-medium flex items-center justify-center gap-1.5 transition-colors ${
              tab === 'humans'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> 大厅玩家
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 min-h-0">
          {tab === 'agents' ? (
            <div className="grid grid-cols-2 gap-2">
              {agentTemplates.map(agent => (
                <button
                  key={agent.id}
                  onClick={() => onInviteAgent(agent)}
                  className="text-left p-3 rounded-xl border border-border/40 bg-surface/50 hover:border-primary/40 hover:bg-primary/5 transition-all group"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-2xl">{agent.emoji}</span>
                    <span className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {agent.name}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {agent.description}
                  </p>
                  {agent.isCustom && (
                    <span className="inline-block mt-1.5 text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      自定义
                    </span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {lobbyUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">当前大厅没有在线玩家</p>
              ) : (
                lobbyUsers.map(user => (
                  <button
                    key={user}
                    onClick={() => onInviteLobbyUser(user)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/30 transition-colors text-left"
                  >
                    <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                      <span className="text-lg">👤</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{user}</p>
                      <p className="text-[11px] text-muted-foreground">在线 · 大厅</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="border-t border-border p-3 flex gap-2 shrink-0">
          <button
            onClick={handleCopyLink}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-alive" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? '已复制' : '复制链接'}
          </button>
          <button
            onClick={handleRandomAgent}
            className="flex-1 btn-ritual flex items-center justify-center gap-1.5 py-2 text-sm"
          >
            <Shuffle className="w-3.5 h-3.5" /> 一键邀请AI
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default InviteModal;
