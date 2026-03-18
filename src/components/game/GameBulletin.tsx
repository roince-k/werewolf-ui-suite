import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scroll, ChevronDown } from 'lucide-react';
import type { GameLog } from '@/store/gameStore';

interface GameBulletinProps {
  logs: GameLog[];
  className?: string;
}

const GameBulletin = ({ logs, className = '' }: GameBulletinProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isAtBottom = useRef(true);

  useEffect(() => {
    if (scrollRef.current && isAtBottom.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [logs]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    isAtBottom.current = scrollHeight - scrollTop - clientHeight < 40;
  };

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  };

  return (
    <div className={`relative flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/50">
        <Scroll className="w-4 h-4 text-gold" />
        <span className="display-title text-sm text-gold tracking-wider">公告板</span>
        <span className="text-[10px] text-muted-foreground ml-auto tabular-nums">{logs.length} 条记录</span>
      </div>

      {/* Log entries */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5"
      >
        <AnimatePresence initial={false}>
          {logs.map((log, i) => (
            <BulletinEntry key={log.id} log={log} index={i} />
          ))}
        </AnimatePresence>
      </div>

      {/* Scroll-to-bottom indicator */}
      {!isAtBottom.current && logs.length > 5 && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={scrollToBottom}
          className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-primary/90 text-primary-foreground rounded-full px-3 py-1 text-[10px] flex items-center gap-1 shadow-lg"
        >
          <ChevronDown className="w-3 h-3" /> 新消息
        </motion.button>
      )}
    </div>
  );
};

const BulletinEntry = ({ log, index }: { log: GameLog; index: number }) => {
  if (log.type === 'phase') {
    return (
      <motion.div
        initial={{ opacity: 0, scaleX: 0.6 }}
        animate={{ opacity: 1, scaleX: 1 }}
        className="phase-banner text-xs my-2 rounded-md"
      >
        {log.content}
      </motion.div>
    );
  }

  if (log.type === 'speech') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="flex gap-2.5 group"
      >
        <div className="w-7 h-7 rounded-full bg-surface border border-border flex items-center justify-center text-xs shrink-0 mt-0.5 tabular-nums font-medium text-muted-foreground group-hover:border-accent/40 transition-colors">
          {log.playerNumber}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-medium text-accent">{log.playerName}</span>
            <span className="text-[9px] text-muted-foreground/50 tabular-nums">
              {new Date(log.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <motion.div
            className="bg-surface-elevated rounded-lg rounded-tl-sm px-3 py-2 mt-1 text-sm text-secondary-foreground max-w-md border border-border/50 group-hover:border-accent/20 transition-colors"
            whileHover={{ scale: 1.01 }}
          >
            {log.content}
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // System / death / execution / vote / game_end
  const isDeath = log.type === 'death' || log.type === 'execution';
  const isGameEnd = log.type === 'game_end';
  const isVote = log.type === 'vote_result';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className={`text-sm px-3 py-2 rounded-md border transition-colors ${
        isDeath
          ? 'bg-destructive/5 text-destructive border-destructive/20 hover:border-destructive/40'
          : isGameEnd
          ? 'bg-gold/5 text-gold border-gold/20 text-center display-title text-base hover:bg-gold/10'
          : isVote
          ? 'bg-primary/5 text-primary border-primary/20 hover:border-primary/40'
          : 'text-muted-foreground border-transparent hover:bg-secondary/30'
      }`}
    >
      {isDeath && <span className="mr-1">†</span>}
      {isVote && <span className="mr-1">🗳️</span>}
      {isGameEnd && <span className="mr-1">◉</span>}
      {!isDeath && !isVote && !isGameEnd && log.type === 'system' && <span className="mr-1 text-muted-foreground/60">▸</span>}
      {log.content}
    </motion.div>
  );
};

export default GameBulletin;
