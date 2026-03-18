import { useRef, useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scroll, ChevronDown, Skull, Swords, MessageCircle, Volume2, Star, Filter } from 'lucide-react';
import type { GameLog } from '@/store/gameStore';

type TabKey = 'all' | 'speech' | 'death' | 'vote';

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'all', label: '全部', icon: <Scroll className="w-3 h-3" /> },
  { key: 'speech', label: '发言', icon: <MessageCircle className="w-3 h-3" /> },
  { key: 'death', label: '死亡', icon: <Skull className="w-3 h-3" /> },
  { key: 'vote', label: '投票', icon: <Swords className="w-3 h-3" /> },
];

interface GameBulletinProps {
  logs: GameLog[];
  className?: string;
}

const GameBulletin = ({ logs, className = '' }: GameBulletinProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isAtBottom = useRef(true);
  const [hasNew, setHasNew] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('all');

  const filteredLogs = useMemo(() => {
    if (activeTab === 'all') return logs;
    if (activeTab === 'speech') return logs.filter(l => l.type === 'speech');
    if (activeTab === 'death') return logs.filter(l => l.type === 'death' || l.type === 'execution');
    if (activeTab === 'vote') return logs.filter(l => l.type === 'vote_result');
    return logs;
  }, [logs, activeTab]);

  useEffect(() => {
    if (scrollRef.current && isAtBottom.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    } else if (logs.length > 0) {
      setHasNew(true);
    }
  }, [logs]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    isAtBottom.current = scrollHeight - scrollTop - clientHeight < 40;
    if (isAtBottom.current) setHasNew(false);
  };

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    setHasNew(false);
  };

  // Count badges
  const counts = useMemo(() => ({
    all: logs.length,
    speech: logs.filter(l => l.type === 'speech').length,
    death: logs.filter(l => l.type === 'death' || l.type === 'execution').length,
    vote: logs.filter(l => l.type === 'vote_result').length,
  }), [logs]);

  return (
    <div className={`relative flex flex-col ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/40 bg-surface/50">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-7 h-7 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center">
            <Scroll className="w-3.5 h-3.5 text-gold" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="display-title text-sm text-gold tracking-wider block leading-tight">事件编年史</span>
            <span className="text-[9px] text-muted-foreground/60">Chronicle of Events</span>
          </div>
          <span className="text-[10px] text-muted-foreground tabular-nums bg-muted/50 px-2 py-0.5 rounded-full">
            {logs.length}
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-primary/15 text-primary border border-primary/25'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent'
              }`}
            >
              {tab.icon}
              {tab.label}
              {counts[tab.key] > 0 && (
                <span className={`text-[9px] tabular-nums px-1 py-px rounded-full ${
                  activeTab === tab.key ? 'bg-primary/20' : 'bg-muted/60'
                }`}>
                  {counts[tab.key]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-3 py-3"
      >
        {filteredLogs.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12 opacity-40">
            <Scroll className="w-8 h-8 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground display-title">暂无事件</p>
            <p className="text-[10px] text-muted-foreground/60 mt-1">
              {activeTab === 'all' ? '游戏开始后，事件将在此记录' : '暂无该类型的记录'}
            </p>
          </div>
        )}

        <div className="relative">
          {filteredLogs.length > 0 && (
            <div className="absolute left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-border/60 via-border/30 to-transparent" />
          )}

          <AnimatePresence initial={false}>
            {filteredLogs.map((log, i) => (
              <BulletinEntry key={log.id} log={log} index={i} isLast={i === filteredLogs.length - 1} />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Scroll indicator */}
      <AnimatePresence>
        {hasNew && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={scrollToBottom}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground rounded-full px-4 py-1.5 text-[11px] font-medium flex items-center gap-1.5 shadow-lg shadow-primary/20 z-20"
          >
            <ChevronDown className="w-3 h-3" /> 新事件
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ── Individual entry ── */
const BulletinEntry = ({ log, index, isLast }: { log: GameLog; index: number; isLast: boolean }) => {
  if (log.type === 'phase') {
    return (
      <motion.div
        initial={{ opacity: 0, scaleX: 0.7 }}
        animate={{ opacity: 1, scaleX: 1 }}
        className="relative flex items-center gap-3 my-4 pl-1"
      >
        <div className="w-[30px] flex justify-center shrink-0">
          <div className="w-3 h-3 rounded-full bg-gold/20 border-2 border-gold/50" />
        </div>
        <div className="flex-1 phase-banner text-[11px] rounded-lg">
          {log.content}
        </div>
      </motion.div>
    );
  }

  if (log.type === 'speech') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="relative flex gap-2.5 mb-3 pl-1 group"
      >
        <div className="w-[30px] flex justify-center shrink-0 pt-1">
          <div className="w-2 h-2 rounded-full bg-accent/40 group-hover:bg-accent/70 transition-colors ring-2 ring-background" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-full bg-surface-elevated border border-border/60 flex items-center justify-center text-xs shrink-0">
              {log.playerNumber}
            </div>
            <span className="text-[11px] font-semibold text-accent">{log.playerName}</span>
            <span className="text-[9px] text-muted-foreground/40 tabular-nums ml-auto">
              {new Date(log.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className="relative bg-surface-elevated/80 rounded-xl rounded-tl-sm px-3.5 py-2.5 text-[13px] text-secondary-foreground leading-relaxed border border-border/40 group-hover:border-accent/20 transition-all">
            <MessageCircle className="absolute -left-1.5 top-2.5 w-3 h-3 text-accent/30" />
            {log.content}
          </div>
        </div>
      </motion.div>
    );
  }

  const isDeath = log.type === 'death' || log.type === 'execution';
  const isGameEnd = log.type === 'game_end';
  const isVote = log.type === 'vote_result';

  const getConfig = () => {
    if (isDeath) return { icon: <Skull className="w-3.5 h-3.5" />, bg: 'bg-destructive/8', border: 'border-destructive/25 hover:border-destructive/40', text: 'text-destructive', dot: 'bg-destructive/50', iconBg: 'bg-destructive/10' };
    if (isGameEnd) return { icon: <Star className="w-3.5 h-3.5" />, bg: 'bg-gold/8', border: 'border-gold/25 hover:border-gold/40', text: 'text-gold', dot: 'bg-gold/50', iconBg: 'bg-gold/10' };
    if (isVote) return { icon: <Swords className="w-3.5 h-3.5" />, bg: 'bg-primary/8', border: 'border-primary/25 hover:border-primary/40', text: 'text-primary', dot: 'bg-primary/50', iconBg: 'bg-primary/10' };
    return { icon: <Volume2 className="w-3 h-3" />, bg: 'bg-transparent', border: 'border-transparent', text: 'text-muted-foreground', dot: 'bg-muted-foreground/30', iconBg: 'bg-muted/30' };
  };

  const config = getConfig();

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className="relative flex gap-2.5 mb-2.5 pl-1 group"
    >
      <div className="w-[30px] flex justify-center shrink-0 pt-2.5">
        <div className={`w-2 h-2 rounded-full ${config.dot} ring-2 ring-background`} />
      </div>
      <div className={`flex-1 min-w-0 ${config.bg} ${config.text} rounded-lg border ${config.border} px-3 py-2.5 transition-colors`}>
        <div className="flex items-start gap-2.5">
          <div className={`w-6 h-6 rounded-md ${config.iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
            {config.icon}
          </div>
          <p className={`text-[12px] leading-relaxed flex-1 ${isGameEnd ? 'display-title text-sm text-center' : ''}`}>
            {log.content}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default GameBulletin;
